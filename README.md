# Event Decorator

[![node](https://img.shields.io/node/v/event-decorator.svg)]()
[![Build Status](https://travis-ci.org/ghermeto/event-decorator.svg?branch=master)](https://travis-ci.org/ghermeto/event-decorator)
[![npm](https://img.shields.io/npm/v/event-decorator.svg)](https://www.npmjs.com/package/event-decorator)
[![GitHub](https://img.shields.io/github/license/ghermeto/event-decorator.svg)](https://github.com/ghermeto/event-decorator/blob/master/LICENSE)
[![David](https://img.shields.io/david/ghermeto/event-decorator.svg)](https://david-dm.org/ghermeto/event-decorator)
[![David](https://img.shields.io/david/dev/ghermeto/event-decorator.svg)](https://david-dm.org/ghermeto/event-decorator?type=dev)

Decorates EventEmitter with handy methods when working with multiple events

## Install

```sh
$ npm install --save event-decorator
```

## API

```javascript
    const { onceAny, onceAll, decorate } = require('event-decorator');
```

### onceAny(emitter, eventNames, handler)

Will subscribe to all events is `evantNames` from `emitter` and will execute `handler` **once** for 
the **first** event that occurs. When handler is executed, it will immediately unsubscribe from all 
events.

Returns a function to unsubscribe from the events.

```javascript
const { onceAny } = require('event-decorator');

const unsubscribe = onceAny(emitter, ['one', 'two', 'three'], (trigger, ...arguments) => {
    console.info(`first event was ${trigger}`);
});
```
   
#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| emitter | `EventEmitter`  |  |
| eventNames | `Array`  | defaults to empty array `[]` |
| handler | `Function`  | user provider handler |

#### Returns

`unsubscriber: function()` calling this function before the handler is executed will unsubscribe 
from all the events. Calling it after the handler is executed has no effect. 

### onceAll(emitter, eventNames, handler)

Will subscribe to all events is `evantNames` from `emitter` and will execute `handler` **once** for 
the **last** event that occurs. When handler is executed, it will immediately unsubscribe from all 
events.

Returns a function to unsubscribe from the events.

```javascript
const { onceAll } = require('event-decorator');

const unsubscribe = onceAll(emitter, ['one', 'two', 'three'], (argumentsArray) => {
    console.info(`the last event was ${trigger}`);
});
```
   
#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| emitter | `EventEmitter`  |  |
| eventNames | `Array`  | defaults to empty array `[]` |
| handler | `Function`  | user provider handler |

#### Returns

`unsubscriber: function()` calling this function before the handler is executed will unsubscribe 
from all the events. Calling it after the handler is executed has no effect. 

### decorate(emitter)

Decorates the `EventEmitter` with the `onceAny` and `onceAll` methods. It won't modify the `emitter`.
The new methods will have similar API to the ones described above, but omitting the first parameter.

Returns a [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
for the `emitter`.

```javascript
const { decorate } = require('event-decorator');

const decorated = decorate(emitter);

const unsub1 = decorated.onceAny(['one', 'two', 'three'], (trigger, ...arguments) => {
    console.info(`first event was ${trigger}`);
});

const unsub2 = decorated.onLast(['one', 'two', 'three'], (trigger, ...arguments) => {
    console.info(`the last event was ${trigger}`);
});
```
   
#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| emitter | `EventEmitter`  |  |

#### Returns

`decorated: Proxy<EventEmitter>` 

## Examples

To count the in-flight requests on a express server:

```js
const { onceAny } = require('event-decorator');

let inflightRequests = 0;
app.use((req, res, next) => {
    inflightRequests++;
    onceAny(res, ['error', 'finish', 'close'], () => {
        inflightRequests--;
    });
    next();
});
```

To log the response time for each request: 

```js
const { onceAny } = require("event-decorator");

app.use((req, res, next) => {
    // hrtime.bigint is available on Node v10.7+
    const start = process.hrtime.bigint();
    onceAny(res, ['finish', 'close'], () => {
        const end = process.hrtime.bigint();
        console.log(`response took ${end - star} nanosecods`);
    });
    next();
});
```
---

MIT © [Guilherme Hermeto](http://github.com/ghermeto)