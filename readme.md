# sublet [![Build Status](https://badgen.net/travis/lukeed/sublet)](https://travis-ci.org/lukeed/sublet)

> Reactive leases for data subscriptions

With `sublet` you can directly attach functions to the data they care about.

You marry a function with its relevant data. They become bound to one another, a "reactive" pair.<br>
When the data changes, the function automatically gets triggered, receiving the latest snapshot of that data.

Their "reactive marriage" is also exposed to the outside world in the form of a proxied `data` object.<br>
This allows external reads _and writes_ into `data` object. Because the function is bound, it will still always be triggered, regardless of who/what caused those updates!

Whenever the binding updates, the original `data` source receives the updates, too.<br>
This means that when new reactive pairs source their data from other bindings (or pieces of them), any updates to the "child" binding propagate to the "parent" binding. In turn, both of their partner functions are triggered.

So, `sublet` _sort of_ behaves like a store, but its dispatchers are normal variable assignments!<br>
Instead, `sublet` allows you to get back to JavaScript's basic building blocks while keeping your sanity.

## Modes

There are two "versions" of `sublet`, accommodating different [browser support](#browser-support) targets:

#### "proxy"
> **Size (gzip):** 194 bytes<br>
> **Availability:** [UMD](https://unpkg.com/sublet), [CommonJS](https://unpkg.com/sublet/dist/index.js), [ES Module](https://unpkg.com/sublet?module)<br>
> **Requires:** [`Proxy`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy#Browser_compatibility)

The more modern build of `sublet` as it relies on the `Proxy` class.<br>
Because of this, the "modern" version of `sublet` can work with Objects and Arrays, neither of which require the `input` to have a predefined shape. This means that your Objects can receive new keys at any point, or your Arrays can mutate in any which way, and your `callback` subscriber will always be made aware of those changes.

#### "legacy"
> **Size (gzip):** 263 bytes<br>
> **Availability:** [UMD](https://unpkg.com/sublet/legacy), [ES Module](https://unpkg.com/sublet/legacy/index.mjs)<br>
> **Requires:** [`Array.isArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray#Browser_compatibility), [`Object.defineProperty`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#Browser_compatibility)

The "legacy" version is bound by `Object.defineProperty`'s limitations:

1) the `input` must be an Object (no Arrays);
2) the `input` Object must have its keys defined ahead of time, before `sublet` instantiation.

Unlike the `Proxy`-based solution, any new, dynamically added keys are _unknown_ and _uninitialized_, which means they cannot and will never be able to trigger the `callback` when they show up or change.


## Install

```sh
$ npm install --save sublet
```

Also available on [unpkg.com](https://unpkg.com):

```html
<!-- Mode: "proxy" -->
<script src="https://unpkg.com/sublet"></script>

<!-- Mode: "legacy" -->
<script src="https://unpkg.com/sublet/legacy"></script>
```

## Usage

```js
// Mode: "proxy"
import sublet from 'sublet';
// Mode: "legacy"
import sublet from 'sublet/legacy';

const user = {}; // <~ "proxy" can be lazy
const user = { firstName:null, lastName:null }; // <~ "legacy" is explicit

const view = sublet(user, state => {
  if (state.firstName) {
    console.log(`Hello, ${state.firstName} ${state.lastName}`);
  } else {
    console.log('Howdy stranger~!');
  }
});
//=> "Howdy stranger~!"

view.firstName = 'Nicolas';
view.lastName = 'Cage';
//=> "Hello, Nicolas Cage"
```


## API

### sublet(input, callback)

Returns: `T<input>`

A wrapped (aka, proxied) form of your `input` is returned.<br>
This is the reactive interface and should be used to update state.<br>
This interface is also passed to `callback` as its only argument.

Any updates through this `T` interface will propagate new value(s) to the original `input`, too.<br>
Similarly, all read operations pull from the current `input` object. This means that any updates to `input` directly (outside of the `T` interface) **will not** trigger the `callback` subscription; however, those values _will_ appear when read through `T` and/or in the next `callback` invocation.

> **Note:** In "proxy" mode, the `T` is a `Proxy` instance and in "legacy" mode, it is an `Object`.<br>However, these are functionally equivalent since a `Proxy` can't be detected anwyay.

#### input
Type: `Object`

The original state data to observe.

> ***Important:*** Modes operate differently!
>
> ***Mode: "proxy"***
> * `Array` types are permitted
> * When an `Object`, the keys _do not_ need to be declared upfront
>
> ***Mode: "legacy"***
>
> * `Array` types are **not** permitted<br>
>     _The original `input` is immediately returned, without `callback` attachment._
> * The `Object` must have predefined keys!<br>
>     _Reactivity can **only** be established for known keys._<br>
>     _You must define your default or empty state._<br>

#### callback
Type: `Function`

The callback to run whenever the paired reactive data updates.<br>
This function receives the reactive data (`T<input>`) as its only argument.

The callback will run immediately when setting up a `sublet` instance.<br>
This means that your callback should be capable of handling "setup" vs "update" usage. Alternatively, you can separate those actions and attach the "update" function as your `sublet` subscriber.

After initializing, the `callback` will only be _queued_ to run if an updated value was not _strictly equal_ to its previous value.<br>
Similarly, any updates to the `T<input>` argument _will_ enqueue a new update cycle.

Finally, the `callback` is debounced. This means that multiple `T<input>` updates will re-run the `callback` once.

```js
import sublet from 'sublet';

let num = 0;
const view = sublet({}, () => console.log(`Render #${++num}`));
//=> Render #1

view.foo = 123;
// Render #2

await sleep(10); //~> 10ms later

view.foo = 123;
// (no render, value identical)

await sleep(10); //~> 10ms later

view.foo = 1;
view.bar = 2;
view.baz = 3;
//=> Render #3
```


## Browser Support

The "legacy" version works just about everywhere.<br>
The "proxy" version works anywhere that was considered "modern" in the last 4 years.

|  | Chrome | Safari | Firefox | Edge | Opera | IE | Node.js
| - | - | - | - | - | - | - | - |
| "proxy"  | 49 | 10 | 18 | 12 | 36 | :x: | 6.0.0
| "legacy"  | 5 | 5.1 | 4 | 12 | 11.6 | 9 | :white_check_mark:


## Prior Art

There are 101 observable/reactive libraries and patterns out there – it would be impossible to name them all.

However, the [reactivity of Svelte 3.x](https://svelte.dev/examples#reactive-assignments), specifically, inspired me.

## License

MIT © [Luke Edwards](https://lukeed.com)
