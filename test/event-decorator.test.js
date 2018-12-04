/* eslint no-underscore-dangle: off */

const { expect } = require('chai');
const EventEmitter = require('events');
const { onceAny, onceAll, decorate } = require('../index');

describe('onceAny', () => {
    let emitter;

    beforeEach(() => {
        emitter = new EventEmitter();
    });

    it('should pass event name', (done) => {
        onceAny(emitter, ['one', 'two'], (name) => {
            expect(name).to.equal('two');
            done();
        });

        emitter.emit('three', 1, 2);
        emitter.emit('two', 3, 4);
        emitter.emit('one', 5, 6);
    });

    it('should remove all listeners', (done) => {
        onceAny(emitter, ['one', 'two'], (name) => {
            expect(name).to.equal('two');
            expect(emitter.listenerCount('two')).to.equal(0);
            expect(emitter.listenerCount('one')).to.equal(0);
            done();
        });

        emitter.emit('three', 1, 2);
        emitter.emit('two', 3, 4);
    });

    it('should pass arguments', (done) => {
        onceAny(emitter, ['one', 'two'], (name, ...args) => {
            expect(name).to.equal('two');
            expect(args[0]).to.equal(3);
            expect(args[1]).to.equal(4);
            done();
        });

        emitter.emit('three', 1, 2);
        emitter.emit('two', 3, 4);
    });

    it('should return unsubscriber', () => {
        const unsubscriber = onceAny(emitter, ['one', 'two'], () => {});
        expect(Object.keys(emitter._events).length).to.equal(2);
        unsubscriber();
        expect(Object.keys(emitter._events).length).to.equal(0);
    });
});

describe('onceAll', () => {
    let emitter;

    beforeEach(() => {
        emitter = new EventEmitter();
    });

    it('should pass events name', (done) => {
        onceAll(emitter, ['one', 'two'], (names) => {
            expect(names).with.lengthOf(2);
            done();
        });

        emitter.emit('three', 1, 2);
        emitter.emit('two', 3, 4);
        emitter.emit('one', 5, 6);
    });

    it('should pass events name in emission order', (done) => {
        onceAll(emitter, ['one', 'two'], (names) => {
            expect(names).to.deep.equal(['two', 'one']);
            done();
        });

        emitter.emit('three', 1, 2);
        emitter.emit('two', 3, 4);
        emitter.emit('one', 5, 6);
    });

    it('should remove all listeners', (done) => {
        onceAll(emitter, ['one', 'two'], (names) => {
            expect(names).with.lengthOf(2);
            expect(emitter.listenerCount('two')).to.equal(0);
            expect(emitter.listenerCount('one')).to.equal(0);
            done();
        });

        emitter.emit('three', 1, 2);
        emitter.emit('two', 3, 4);
        emitter.emit('one', 5, 6);
    });

    it('should pass arguments array', (done) => {
        onceAll(emitter, ['one', 'two'], (names, argsArray) => {
            expect(names).with.lengthOf(2);
            expect(argsArray[0]).to.deep.equal([3, 4]);
            expect(argsArray[1]).to.deep.equal([5, 6]);
            done();
        });

        emitter.emit('three', 1, 2);
        emitter.emit('two', 3, 4);
        emitter.emit('one', 5, 6);
    });

    it('should never call handler', () => {
        onceAll(emitter, ['one', 'two'], () => {
            expect.fail('should never be called');
        });

        emitter.emit('three', 1, 2);
        emitter.emit('two', 3, 4);
    });

    it('should return unsubscriber', () => {
        const unsubscriber = onceAll(emitter, ['one', 'two'], () => {});
        expect(Object.keys(emitter._events).length).to.equal(2);
        unsubscriber();
        expect(Object.keys(emitter._events).length).to.equal(0);
    });
});

describe('decorate', () => {
    let emitter;

    beforeEach(() => {
        emitter = new EventEmitter();
    });

    it('should a instance of EventEmitter', () => {
        const decorated = decorate(emitter);
        expect(emitter).to.be.an.instanceof(EventEmitter);
        expect(decorated).to.be.an.instanceof(EventEmitter);
    });

    it('should trap a onceAny method', () => {
        const decorated = decorate(emitter);
        expect(decorated.onceAny).to.be.an.instanceof(Function);
    });

    it('should trap a onceAll method', () => {
        const decorated = decorate(emitter);
        expect(decorated.onceAll).to.be.an.instanceof(Function);
    });

    it('should scope onceAny to emitter', (done) => {
        const decorated = decorate(emitter);
        decorated.onceAny(['one', 'two'], (name) => {
            expect(name).to.equal('two');
            done();
        });

        emitter.emit('two', 3, 4);
    });

    it('should scope onceAll to emitter', (done) => {
        const decorated = decorate(emitter);
        decorated.onceAll(['one', 'two'], (names) => {
            expect(names).with.lengthOf(2);
            done();
        });

        emitter.emit('two', 3, 4);
        emitter.emit('one', 5, 6);
    });
});