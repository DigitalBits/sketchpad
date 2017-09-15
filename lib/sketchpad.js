class Sketchpad {
  constructor(options) {
    // Support both old api (element) and new (canvas)
    options.canvas = options.canvas || options.element;
    if (!options.canvas) {
      console.error('[SKETCHPAD]: Please provide an element/canvas:');
      return;
    }

    if (typeof options.canvas === 'string') {
      options.canvas = document.querySelector(options.canvas);
    }

    this.canvas = options.canvas;

    // Try to extract 'width', 'height', 'color', 'penSize' and 'readOnly'
    // from the options or the DOM element.
    ['width', 'height', 'color', 'penSize', 'readOnly'].forEach((attr) => {
      this[attr] = options[attr] || this.canvas.getAttribute('data-' + attr);
    }, this);

    // Setting default values
    this.width = this.width || 0;
    this.height = this.height || 0;

    this.color = this.color || '#000';
    this.penSize = this.penSize || 5;

    this.readOnly = this.readOnly || false;

    // Sketchpad History settings
    this.strokes = options.strokes ? this._strokesFormat(options.strokes) : [];

    this.undoHistory = options.undoHistory || [];

    // Enforce context for Moving Callbacks
    this.onMouseMove = this.onMouseMove.bind(this);

    this.canvas.style.cursor = 'crosshair';

    // Setup Internal Events
    this.events = {};
    this.events['mousemove'] = [];
    this.internalEvents = ['MouseDown', 'MouseUp', 'MouseOut', 'DrawEnd'];
    this.internalEvents.forEach((name) => {
      let lower = name.toLowerCase();
      this.events[lower] = [];

      // Enforce context for Internal Event Functions
      this['on' + name] = this['on' + name].bind(this);

      // Add DOM Event Listeners
      this.canvas.addEventListener(lower, (...args) => this.trigger(lower, args));
    }, this);

    this.reset();
  }

  /*
   * Private API
   */

  _position(event) {
    const x = event.offsetX;
    const y = event.offsetY;

    return [x, y];
  }

  _stroke(stroke) {
    if (stroke.type === 'clear') {
      return this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    stroke.lines.forEach(line => {
      this._line(line[0], line[1], stroke.color, stroke.size);
    }, this);
  }

  _draw(start, end, color, size) {
    this._line(start, end, color, size, 'source-over');
  }

  _erase(start, end, color, size) {
    this._line(start, end, color, size, 'destination-out');
  }

  _line(start, end, color, size, compositeOperation) {
    this.context.save();
    this.context.lineJoin = 'round';
    this.context.lineCap = 'round';
    this.context.strokeStyle = color;
    this.context.lineWidth = size;
    this.context.globalCompositeOperation = compositeOperation;
    this.context.beginPath();
    this.context.moveTo(start[0], start[1]);
    this.context.lineTo(end[0], end[1]);
    this.context.closePath();
    this.context.stroke();
    this.context.restore();
  }

  _lineToString(start, end) {
    const str = `M${start[0]},${start[1]}L${end[0]},${end[1]}`;

    return str;
  }

  _lineToArray(data) {
    let result = [];
    let group = data.split("M");

    group.splice(0, 1);

    group.forEach(element => {
      const positions = element.split("L");
      let lines = positions.map(line => line.split(","));

      result.push(lines);
    });

    return result;
  }

  _strokesFormat(data) {
    const strokes = data.map(stroke => {
      stroke.lines = this._lineToArray(stroke.lines);
      return stroke;
    });

    return strokes;
  }

  /*
   * Events/Callback
   */

  onMouseDown(event) {
    this._sketching = true;
    this._lastPosition = this._position(event);
    this._currentStroke = {
      color: this.color,
      size: this.penSize,
      current: true,
      lines: [],
    };

    this.canvas.addEventListener('mousemove', this.onMouseMove);
  }

  onMouseUp(event) {
    if (this._sketching) {
      this.strokes.push(this._currentStroke);
      this._sketching = false;
      this.dispatch('drawend', {});
    }

    this.canvas.removeEventListener('mousemove', this.onMouseMove);
  }

  onMouseOut(event) {
    this.onMouseUp(event);
  }

  onMouseMove(event) {
    let currentPosition = this._position(event);

    this._draw(this._lastPosition, currentPosition, this.color, this.penSize);
    this._currentStroke.lines.push([this._lastPosition, currentPosition]);
    this._lastPosition = currentPosition;

    this.trigger('mousemove', [event]);
  }

  onDrawEnd() {
  }

  /*
   * Public API
   */

  toObject() {
    return {
      width: this.canvas.width,
      height: this.canvas.height,
      strokes: this.strokes,
      undoHistory: this.undoHistory,
    };
  }

  toJSON() {
    let data = JSON.parse(JSON.stringify(this.toObject()));

    data.strokes = data.strokes
      .filter((stroke) => stroke.current)
      .map(stroke => {
        let lines = '';

        if (!stroke.lines) {
          return false;
        }

        stroke.lines.forEach(line => {
          lines += this._lineToString(line[0], line[1]);
        });

        stroke.lines = lines;
        return stroke;
      })

    return data;
  }

  redo() {
    var stroke = this.undoHistory.pop();
    if (stroke) {
      this.strokes.push(stroke);
      this._stroke(stroke);
    }
    this.dispatch('drawend', {});
  }

  undo() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    var stroke = this.strokes.pop();
    this.redraw();

    if (stroke) {
      this.undoHistory.push(stroke);
    }
    this.dispatch('drawend', {});
  }

  toImage(url) {
    let image = new Image();
    let canvas = this.canvas;

    image.src = canvas.toDataURL("image/png");
    return image;
  }

  clear() {
    this.strokes.push({
      type: 'clear',
    });
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.dispatch('drawend', {});
  }

  redraw() {
    this.strokes.forEach(stroke => {
      this._stroke(stroke);
    }, this);
    this.dispatch('drawend', {});
  }

  reset() {
    // Setup canvas
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.context = this.canvas.getContext('2d');

    // Redraw image
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.redraw();

    // Remove all event listeners, this way readOnly option will be respected
    // on the reset
    this.internalEvents.forEach(name => this.off(name.toLowerCase()));

    if (this.readOnly) {
      return;
    }

    // Re-Attach all event listeners
    this.internalEvents.forEach(name => this.on(name.toLowerCase(), this['on' + name]));
  }

  cancelAnimation() {
    this.animateIds = this.animateIds || [];
    this.animateIds.forEach(id => {
      clearTimeout(id);
    });
    this.animateIds = [];
  }

  animate(interval = 10, loop = false, loopInterval = 0) {
    let delay = interval;

    this.cancelAnimation();
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.strokes.forEach(stroke => {
      if (stroke.type === 'clear') {
        delay += interval;
        return this.animateIds.push(setTimeout(() => {
          this.context.clearRect(0, 0, this.canvas.width,
            this.canvas.height);
        }, delay));
      }

      stroke.lines.forEach(line => {
        delay += interval;
        this.animateIds.push(setTimeout(() => {
          this._draw(line.start, line.end, stroke.color, stroke.size);
        }, delay));
      });
    });

    if (loop) {
      this.animateIds.push(setTimeout(() => {
        this.animate(interval = 10, loop, loopInterval);
      }, delay + interval + loopInterval));
    }

    this.animateIds(setTimeout(() => {
      this.trigger('animation-end', [interval, loop, loopInterval]);
    }, delay + interval));
  }

  /*
   * Event System
   */

  /* Attach an event callback
   *
   * @param {String} action Which action will have a callback attached
   * @param {Function} callback What will be executed when this event happen
   */
  on(action, callback) {
    // Tell the user if the action he has input was invalid
    if (this.events[action] === undefined) {
      return console.error(`Sketchpad: No such action '${action}'`);
    }

    this.events[action].push(callback);
  }

  /* Detach an event callback
   *
   * @param {String} action Which action will have event(s) detached
   * @param {Function} callback Which function will be detached. If none is
   *                            provided, all callbacks are detached
   */
  off(action, callback) {
    if (callback) {
      // If a callback has been specified delete it specifically
      var index = this.events[action].indexOf(callback);
      (index !== -1) && this.events[action].splice(index, 1);
      return index !== -1;
    }

    // Else just erase all callbacks
    this.events[action] = [];
  }

  /* Trigger an event
   *
   * @param {String} action Which event will be triggered
   * @param {Array} args Which arguments will be provided to the callbacks
   */
  trigger(action, args = []) {
    // Fire all events with the given callback
    this.events[action].forEach((callback) => {
      callback(...args);
    });
  }

  /**
   * Invokes a named trigger event.
   * 
   * param: <string> name The name of the event to invoke.
   * param: <object> parameters Parameters to pass to the event.
  */

  dispatch(action, parameters) {
    const callbacks = this.events[action];

    if (!callbacks) {
      throw new Error();
    }

    for(var index = 0; index < callbacks.length; index++) {
      callbacks[index].apply(this, [this, parameters]);
    }
  }    

}

window.Sketchpad = Sketchpad;
module.exports = Sketchpad;