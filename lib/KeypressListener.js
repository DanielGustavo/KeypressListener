'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function KeypressListener() {
  var _this = this;

  var keysState = {};
  var keypressObservers = [];
  var keyupObservers = [];
  var ableToClick = true;
  var verificationsPerSecond = 60;

  function notifyKeyupObservers(event) {
    keyupObservers.map(function (observer) {
      return observer(event);
    });
  }

  function notifyKeypressObservers(event) {
    keypressObservers.map(function (observer) {
      return observer(event);
    });
  }

  function handleContextMenuOut() {
    ableToClick = true;
    notifyKeyupObservers({ type: 'contextMenuOut' });
  }

  function initialize() {
    window.addEventListener('keydown', function (event) {
      keysState[event.key] = { pressed: true, event: event };
    });

    window.addEventListener('keyup', function (event) {
      if (event.key === 'Escape' && !ableToClick) {
        handleContextMenuOut();
        return;
      }

      keysState[event.key] = { pressed: false, event: event };
      notifyKeyupObservers(event);
    });

    window.addEventListener('contextmenu', function () {
      var keysStateEntries = Object.entries(keysState);

      keysStateEntries.map(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            currentKey = _ref2[1];

        currentKey.pressed = false;
      });

      ableToClick = false;

      function mouseDownCallback(event) {
        if (event.button !== 2 && !ableToClick) {
          handleContextMenuOut();
          removeEventListener('mousedown', mouseDownCallback);
        }
      }

      function windowBlurCallback() {
        if (!ableToClick) {
          handleContextMenuOut();
          removeEventListener('blur', windowBlurCallback);
        }
      }

      window.addEventListener('mousedown', mouseDownCallback);
      window.addEventListener('blur', windowBlurCallback);
    });
  }

  this.tick = function () {
    var keysStateEntries = Object.entries(keysState);

    keysStateEntries.map(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
          state = _ref4[1];

      if (state.pressed && ableToClick) {
        notifyKeypressObservers(state.event);
      }
    });
  };

  this.startListening = function () {
    var intervalTime = 1000 / verificationsPerSecond;
    setInterval(_this.tick, intervalTime);
  };

  this.onKeyPress = function (observer) {
    if (!observer) throw new Error('You must pass a observer function');else if (typeof observer !== 'function') {
      throw new Error('The observer function must be a function');
    }

    keypressObservers.push(observer);
  };

  this.onKeyUp = function (observer) {
    if (!observer) throw new Error('You must pass a observer function');else if (typeof observer !== 'function') {
      throw new Error('The observer function must be a function');
    }

    keyupObservers.push(observer);
  };

  initialize();
}