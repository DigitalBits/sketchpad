(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["module"] = factory();
	else
		root["module"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Sketchpad = function () {
	  function Sketchpad(options) {
	    var _this = this;

	    _classCallCheck(this, Sketchpad);

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
	    ['width', 'height', 'color', 'penSize', 'readOnly'].forEach(function (attr) {
	      _this[attr] = options[attr] || _this.canvas.getAttribute('data-' + attr);
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
	    this.internalEvents = ['MouseDown', 'MouseUp', 'MouseOut'];
	    this.internalEvents.forEach(function (name) {
	      var lower = name.toLowerCase();
	      _this.events[lower] = [];

	      // Enforce context for Internal Event Functions
	      _this['on' + name] = _this['on' + name].bind(_this);

	      // Add DOM Event Listeners
	      _this.canvas.addEventListener(lower, function () {
	        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	          args[_key] = arguments[_key];
	        }

	        return _this.trigger(lower, args);
	      });
	    }, this);

	    this.reset();
	  }

	  /*
	   * Private API
	   */

	  _createClass(Sketchpad, [{
	    key: '_position',
	    value: function _position(event) {
	      var x = event.pageX - this.canvas.offsetLeft;
	      var y = event.pageY - this.canvas.offsetTop;

	      return [x, y];
	    }
	  }, {
	    key: '_stroke',
	    value: function _stroke(stroke) {
	      var _this2 = this;

	      if (stroke.type === 'clear') {
	        return this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	      }

	      stroke.lines.forEach(function (line) {
	        _this2._line(line[0], line[1], stroke.color, stroke.size);
	      }, this);
	    }
	  }, {
	    key: '_draw',
	    value: function _draw(start, end, color, size) {
	      this._line(start, end, color, size, 'source-over');
	    }
	  }, {
	    key: '_erase',
	    value: function _erase(start, end, color, size) {
	      this._line(start, end, color, size, 'destination-out');
	    }
	  }, {
	    key: '_line',
	    value: function _line(start, end, color, size, compositeOperation) {
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
	  }, {
	    key: '_lineToString',
	    value: function _lineToString(start, end) {
	      var str = 'M' + start[0] + ',' + start[1] + 'L' + end[0] + ',' + end[1];

	      return str;
	    }
	  }, {
	    key: '_lineToArray',
	    value: function _lineToArray(data) {
	      var result = [];
	      var group = data.split("M");

	      group.splice(0, 1);

	      group.forEach(function (element) {
	        var positions = element.split("L");
	        var lines = positions.map(function (line) {
	          return line.split(",");
	        });

	        result.push(lines);
	      });

	      return result;
	    }
	  }, {
	    key: '_strokesFormat',
	    value: function _strokesFormat(data) {
	      var _this3 = this;

	      var strokes = data.map(function (stroke) {
	        stroke.lines = _this3._lineToArray(stroke.lines);
	        return stroke;
	      });

	      return strokes;
	    }

	    /*
	     * Events/Callback
	     */

	  }, {
	    key: 'onMouseDown',
	    value: function onMouseDown(event) {
	      this._sketching = true;
	      this._lastPosition = this._position(event);
	      this._currentStroke = {
	        color: this.color,
	        size: this.penSize,
	        current: true,
	        lines: []
	      };

	      this.canvas.addEventListener('mousemove', this.onMouseMove);
	    }
	  }, {
	    key: 'onMouseUp',
	    value: function onMouseUp(event) {
	      if (this._sketching) {
	        this.strokes.push(this._currentStroke);
	        this._sketching = false;
	      }

	      this.canvas.removeEventListener('mousemove', this.onMouseMove);
	    }
	  }, {
	    key: 'onMouseOut',
	    value: function onMouseOut(event) {
	      this.onMouseUp(event);
	    }
	  }, {
	    key: 'onMouseMove',
	    value: function onMouseMove(event) {
	      var currentPosition = this._position(event);

	      this._draw(this._lastPosition, currentPosition, this.color, this.penSize);
	      this._currentStroke.lines.push([this._lastPosition, currentPosition]);
	      this._lastPosition = currentPosition;

	      this.trigger('mousemove', [event]);
	    }

	    /*
	     * Public API
	     */

	  }, {
	    key: 'toObject',
	    value: function toObject() {
	      return {
	        width: this.canvas.width,
	        height: this.canvas.height,
	        strokes: this.strokes,
	        undoHistory: this.undoHistory
	      };
	    }
	  }, {
	    key: 'toJSON',
	    value: function toJSON() {
	      var _this4 = this;

	      var data = JSON.parse(JSON.stringify(this.toObject()));

	      data.strokes = data.strokes.filter(function (stroke) {
	        return stroke.current;
	      }).map(function (stroke) {
	        var lines = '';

	        if (!stroke.lines) {
	          return false;
	        }

	        stroke.lines.forEach(function (line) {
	          lines += _this4._lineToString(line[0], line[1]);
	        });

	        stroke.lines = lines;
	        return stroke;
	      });

	      return data;
	    }
	  }, {
	    key: 'redo',
	    value: function redo() {
	      var stroke = this.undoHistory.pop();
	      if (stroke) {
	        this.strokes.push(stroke);
	        this._stroke(stroke);
	      }
	    }
	  }, {
	    key: 'undo',
	    value: function undo() {
	      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	      var stroke = this.strokes.pop();
	      this.redraw();

	      if (stroke) {
	        this.undoHistory.push(stroke);
	      }
	    }
	  }, {
	    key: 'toImage',
	    value: function toImage(url) {
	      var image = new Image();
	      var canvas = this.canvas;

	      image.src = canvas.toDataURL("image/png");
	      return image;
	    }
	  }, {
	    key: 'clear',
	    value: function clear() {
	      this.strokes.push({
	        type: 'clear'
	      });
	      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	    }
	  }, {
	    key: 'redraw',
	    value: function redraw() {
	      var _this5 = this;

	      this.strokes.forEach(function (stroke) {
	        _this5._stroke(stroke);
	      }, this);
	    }
	  }, {
	    key: 'reset',
	    value: function reset() {
	      var _this6 = this;

	      // Setup canvas
	      this.canvas.width = this.width;
	      this.canvas.height = this.height;
	      this.context = this.canvas.getContext('2d');

	      // Redraw image
	      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	      this.redraw();

	      // Remove all event listeners, this way readOnly option will be respected
	      // on the reset
	      this.internalEvents.forEach(function (name) {
	        return _this6.off(name.toLowerCase());
	      });

	      if (this.readOnly) {
	        return;
	      }

	      // Re-Attach all event listeners
	      this.internalEvents.forEach(function (name) {
	        return _this6.on(name.toLowerCase(), _this6['on' + name]);
	      });
	    }
	  }, {
	    key: 'cancelAnimation',
	    value: function cancelAnimation() {
	      this.animateIds = this.animateIds || [];
	      this.animateIds.forEach(function (id) {
	        clearTimeout(id);
	      });
	      this.animateIds = [];
	    }
	  }, {
	    key: 'animate',
	    value: function animate() {
	      var interval = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;

	      var _this7 = this;

	      var loop = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
	      var loopInterval = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

	      var delay = interval;

	      this.cancelAnimation();
	      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

	      this.strokes.forEach(function (stroke) {
	        if (stroke.type === 'clear') {
	          delay += interval;
	          return _this7.animateIds.push(setTimeout(function () {
	            _this7.context.clearRect(0, 0, _this7.canvas.width, _this7.canvas.height);
	          }, delay));
	        }

	        stroke.lines.forEach(function (line) {
	          delay += interval;
	          _this7.animateIds.push(setTimeout(function () {
	            _this7._draw(line.start, line.end, stroke.color, stroke.size);
	          }, delay));
	        });
	      });

	      if (loop) {
	        this.animateIds.push(setTimeout(function () {
	          _this7.animate(interval = 10, loop, loopInterval);
	        }, delay + interval + loopInterval));
	      }

	      this.animateIds(setTimeout(function () {
	        _this7.trigger('animation-end', [interval, loop, loopInterval]);
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

	  }, {
	    key: 'on',
	    value: function on(action, callback) {
	      // Tell the user if the action he has input was invalid
	      if (this.events[action] === undefined) {
	        return console.error('Sketchpad: No such action \'' + action + '\'');
	      }

	      this.events[action].push(callback);
	    }

	    /* Detach an event callback
	     *
	     * @param {String} action Which action will have event(s) detached
	     * @param {Function} callback Which function will be detached. If none is
	     *                            provided, all callbacks are detached
	     */

	  }, {
	    key: 'off',
	    value: function off(action, callback) {
	      if (callback) {
	        // If a callback has been specified delete it specifically
	        var index = this.events[action].indexOf(callback);
	        index !== -1 && this.events[action].splice(index, 1);
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

	  }, {
	    key: 'trigger',
	    value: function trigger(action) {
	      var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

	      // Fire all events with the given callback
	      this.events[action].forEach(function (callback) {
	        callback.apply(undefined, _toConsumableArray(args));
	      });
	    }
	  }]);

	  return Sketchpad;
	}();

	window.Sketchpad = Sketchpad;
	module.exports = Sketchpad;

/***/ })
/******/ ])
});
;