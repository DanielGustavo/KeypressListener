function KeypressListener() {
  const keysState = {};
  const keypressObservers = [];
  const keyupObservers = [];
  let ableToPress = true;
  const verificationsPerSecond = 60;

  function notifyKeyupObservers(event) {
    keyupObservers.forEach((observer) => observer(event));
  }

  function notifyKeypressObservers(event) {
    keypressObservers.forEach((observer) => observer(event));
  }

  function handleContextMenuOut() {
    ableToPress = true;
    notifyKeyupObservers({ type: 'contextMenuOut' });
  }

  function initialize() {
    window.addEventListener('keydown', (event) => {
      keysState[event.key] = { pressed: true, event };
    });

    window.addEventListener('keyup', (event) => {
      if (event.key === 'Escape' && !ableToPress) {
        handleContextMenuOut();
        return;
      }

      keysState[event.key] = { pressed: false, event };
      notifyKeyupObservers(event);
    });

    window.addEventListener('contextmenu', () => {
      const keysStateEntries = Object.entries(keysState);

      keysStateEntries.forEach(([, currentKey]) => {
        currentKey.pressed = false;
      });

      ableToPress = false;

      function mouseDownCallback(event) {
        if (event.button !== 2 && !ableToPress) {
          handleContextMenuOut();
          removeEventListener('mousedown', mouseDownCallback);
        }
      }

      function windowBlurCallback() {
        if (!ableToPress) {
          handleContextMenuOut();
          removeEventListener('blur', windowBlurCallback);
        }
      }

      window.addEventListener('mousedown', mouseDownCallback);
      window.addEventListener('blur', windowBlurCallback);
    });
  }

  this.tick = () => {
    const keysStateEntries = Object.entries(keysState);

    keysStateEntries.forEach(([, state]) => {
      if (state.pressed && ableToPress) {
        notifyKeypressObservers(state.event);
      }
    });
  }

  this.startListening = () => {
    const intervalTime = 1000 / verificationsPerSecond;
    setInterval(this.tick, intervalTime);
  }

  this.onKeyPress = function(observer) {
    if (!observer) throw new Error('You must pass a observer function');
    else if (typeof observer !== 'function') {
      throw new Error('The observer function must be a function');
    }

    keypressObservers.push(observer);
  }

  this.onKeyUp = function(observer) {
    if (!observer) throw new Error('You must pass a observer function');
    else if (typeof observer !== 'function') {
      throw new Error('The observer function must be a function');
    }

    keyupObservers.push(observer);
  }

  initialize();
}
