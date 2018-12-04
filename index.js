const EventEmitter = require('events');
const assert = require('assert').strict;

/**
 * @typedef {function(): void} Unsubscriber
 */

/**
 * asserts parameters
 * @private
 * @param {EventEmitter} emitter
 * @param {Array<string>} eventNames
 * @param {Function} handler
 */
function assertParams(emitter, eventNames, handler) {
    assert.ok(emitter instanceof EventEmitter, 'emitter must be an instance of EventEmitter');
    assert.ok(Array.isArray(eventNames), 'eventNames must be an array');
    assert.ok(typeof handler === 'function', 'handler must be a function');
}

/**
 * removes all listeners for given events
 * @private
 * @param {EventEmitter} emitter
 * @param {Array<string>} eventNames
 * @param {Object<string, function()>} handlerMap wrapper for the handler function
 */
function removeListeners(emitter, eventNames, handlerMap) {
    eventNames.forEach(name => emitter.removeListener(name, handlerMap[name]));
}

/**
 * triggers handler execution only on the first event is emitted
 * and removes listeners for all events
 * @param {EventEmitter} emitter
 * @param {Array<string>} eventNames
 * @param {Function} handler
 * @return {Unsubscriber} unsubscriber
 */
function onceAny(emitter, eventNames, handler) {
    assertParams(emitter, eventNames, handler);

    const handlerMap = eventNames.reduce((map, name) => {
        map[name] = wrapper(name);
        emitter.once(name, map[name]);
        return map;
    }, {});

    function wrapper(name) {
        return function handlerWrapper(...args) {
            removeListeners(emitter, eventNames, handlerMap);
            handler(name, ...args);
        };
    }

    return () => removeListeners(emitter, eventNames, handlerMap);
}

/**
 * triggers handler only after all events are emitted
 * and remove all listeners
 * @param {EventEmitter} emitter
 * @param {Array<string>} eventNames
 * @param {Function} handler
 * @return {Unsubscriber} unsubscriber
 */
function onceAll(emitter, eventNames, handler) {
    assertParams(emitter, eventNames, handler);

    const argumentsMap = {};
    const handlerMap = eventNames.reduce((map, name) => {
        map[name] = wrapper(name);
        emitter.once(name, map[name]);
        return map;
    }, {});

    function wrapper(name) {
        return function handlerWrapper(...args) {
            // only takes arguments for the first emission
            if (eventNames.includes(name) && !(name in argumentsMap)) {
                argumentsMap[name] = args;
            }

            const argumentValues = Object.values(argumentsMap);
            if (argumentValues.length === eventNames.length) {
                removeListeners(emitter, eventNames, handlerMap);
                handler(Object.keys(argumentsMap), argumentValues);
            }
        };
    }

    return () => removeListeners(emitter, eventNames, handlerMap);
}

/**
 * decorates emitter with methods to handle multiple events
 * @param {EventEmitter} emitter
 * @return {EventEmitter} decorated EventEmitter
 */
function decorate(emitter) {
    return new Proxy(emitter, {
        get(obj, prop) {
            switch (prop) {
                case 'onceAny': return (eventNames, handler) => onceAny(emitter, eventNames, handler);
                case 'onceAll': return (eventNames, handler) => onceAll(emitter, eventNames, handler);
                default: return obj[prop];
            }
        }
    });
}

module.exports = { onceAny, onceAll, decorate };