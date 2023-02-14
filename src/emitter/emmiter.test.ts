import Emitter from './emitter';

describe('Emitter', () => {
  test(`Can create emitter`, () => {
    expect(() => {
      new Emitter();
    }).not.toThrowError();
  });
  test(`should throw error when max amount of listeners reached`, () => {
    const listeners = Array(Emitter.DEFAULT_MAX_LISTENERS + 1)
      .fill(0)
      .map(() => jest.fn());

    const emitter = new Emitter();
    expect(() => {
      listeners.forEach((listener) => {
        emitter.on('test', listener);
      });
    }).toThrowError();

    emitter.removeAllListeners();
  });
  test(`should not throw error when listeners are removed`, () => {
    const listeners = Array(Emitter.DEFAULT_MAX_LISTENERS + 1)
      .fill(0)
      .map(() => jest.fn());

    const emitter = new Emitter();
    expect(() => {
      listeners.forEach((listener) => {
        emitter.on('test', listener);
        emitter.off('test', listener);
      });
    }).not.toThrowError();
  });
  test(`should trigger listener when event emitted`, () => {
    const listener = jest.fn();
    const emitter = new Emitter();
    emitter.on('test', listener);
    emitter.emit('test');
    expect(listener).toBeCalledTimes(1);
  });
  test(`should not trigger unsubscribed listener when event emitted`, () => {
    const listener = jest.fn();
    const emitter = new Emitter();
    emitter.on('test', listener);
    emitter.off('test', listener);
    emitter.emit('test');
    expect(listener).toBeCalledTimes(0);
  });
  test(`should trigger listener once`, () => {
    const listener = jest.fn();
    const emitter = new Emitter();
    emitter.once('test', listener);

    emitter.emit('test');
    emitter.emit('test');

    expect(listener).toBeCalledTimes(1);
  });
  test(`should not throw when removing not existing listener`, () => {
    const emitter = new Emitter();
    expect(() => {
      emitter.off('test', () => {});
    }).not.toThrowError();
  });
  test(`should not throw when emitting event without listener`, () => {
    const emitter = new Emitter();
    expect(() => {
      emitter.emit('test');
    }).not.toThrowError();
  });
  test(`should execute prepended listener first`, () => {
    const listener1 = jest.fn();
    const listener2 = jest.fn();
    const emitter = new Emitter();
    emitter.on('test', listener1);
    emitter.prependListener('test', listener2);

    emitter.emit('test');
    expect(listener2.mock.invocationCallOrder[0]).toBeLessThan(
      listener1.mock.invocationCallOrder[0],
    );

    emitter.off('test', listener1);
    emitter.off('test', listener2);
  });
  test(`should remove all listeners`, () => {
    const listeners = Array(5)
      .fill(0)
      .map(() => jest.fn());
    const emitter = new Emitter();

    listeners.forEach((listener, index) => {
      emitter.on(`test${index}`, listener);
    });
    emitter.removeAllListeners();
    emitter.emit('test');

    listeners.forEach((listener) => {
      expect(listener).not.toBeCalled();
    });
  });
  test(`should remove all listeners for event`, () => {
    const listeners = Array(5)
      .fill(0)
      .map(() => jest.fn());
    const emitter = new Emitter();

    listeners.forEach((listener) => {
      emitter.on('test', listener);
    });
    emitter.removeAllListeners('test');
    emitter.emit('test');

    listeners.forEach((listener) => {
      expect(listener).not.toBeCalled();
    });
  });
  test(`should remove specific event listener`, () => {
    const listeners = Array(5)
      .fill(0)
      .map(() => jest.fn());
    const emitter = new Emitter();
    const targetListenerIdx = 0;

    listeners.forEach((listener) => {
      emitter.on('test', listener);
    });
    emitter.removeListener('test', listeners[targetListenerIdx]);
    emitter.emit('test');

    listeners.forEach((listener, idx) => {
      if (idx === targetListenerIdx) {
        expect(listener).not.toBeCalled();
      } else {
        expect(listener).toBeCalled();
      }
    });
  });
  test(`should return event names`, () => {
    const expectedResults = ['test1', 'test2'];
    const emitter = new Emitter();

    expectedResults.forEach((eventName) => {
      emitter.on(eventName, jest.fn());
    });
    const actualResult = emitter.eventNames();

    expect(actualResult).toEqual(expectedResults);
  });
  test(`should count proper listener count: 5`, () => {
    const listeners = Array(5)
      .fill(0)
      .map(() => jest.fn());
    const emitter = new Emitter();

    listeners.forEach((listener) => {
      emitter.on('test', listener);
    });
    const expectedResult = listeners.length;
    const actualResult = emitter.listenerCount('test');

    expect(actualResult).toBe(expectedResult);
  });
  test(`should count proper listener count: 0`, () => {
    const emitter = new Emitter();

    const expectedResult = 0;
    const actualResult = emitter.listenerCount('test');

    expect(actualResult).toBe(expectedResult);
  });
  test(`should return listener list`, () => {
    const listeners = Array(5)
      .fill(0)
      .map(() => jest.fn());
    const emitter = new Emitter();

    listeners.forEach((listener) => {
      emitter.on('test', listener);
    });
    const actualResult = emitter.listeners('test');

    expect(actualResult).toEqual(listeners);
  });
  test(`should return 10 max listeners by default`, () => {
    const expectedResult = 10;
    const emitter = new Emitter();

    const actualResult = emitter.getMaxListeners();

    expect(actualResult).toEqual(expectedResult);
  });
  test(`should update max listeners`, () => {
    const expectedResult = 12;
    const emitter = new Emitter();

    emitter.setMaxListeners(expectedResult);
    const actualResult = emitter.getMaxListeners();

    expect(actualResult).toEqual(expectedResult);
  });
});
