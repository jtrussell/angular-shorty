
# shorty

[![Build Status](https://secure.travis-ci.org/jtrussell/angular-shorty.png?branch=master)](https://travis-ci.org/jtrussell/angular-shorty)

> Evented keyboard shortcuts for AngularJS apps.


## Installation

Install with bower:

```
bower install --save angular-shorty
```


## Usage

Add this module as a dependency to your app:

```javascript
angular.module('myApp', ['shorty']);
```

Tell shorty which key combinations you would like to be notified of:

```javascript
angular.module('myApp').run(function($rootScope, shorty) {
  shorty
    .on('g g', 'event_scrollToTop', 'Scroll to the top of the page')
    .on('g shift+g', 'event_scrollToBottom', 'Scroll to the bottom of the page')
    .broadcastTo($rootScope);
});
```

There are a couple things to note here:

1. You must make a call to `shorty.broadcastTo` at some point after calling
   `shorty.on` or your key combinations will not actually be passed along to
   Mousetrap.
2. Events are only `$broadcast` downward from the scope you pass to
   `shorty.broadcastTo`. Use `$rootScope` if you want to register app wide
   shortcuts.


### `shorty.on(keyCombo, eventName[, desc[, group]])`

This method queues up shorty to send notifications whenever the user
enters the key combination defined by the `keyCombo`, where `keyCombo` is a
string in the format expected by [Mousetrap][mousetrap]. When the shortcut is
triggered `eventName` will be `$broadcast`ed to your app.

The `desc` and `group` parameters are optional, they exist maily to help with
organization and display (i.e. cheatsheets) of your registered shortcuts. See
`shorty.getActiveShortcuts`.

`shorty.on` returns the shorty service for chaining.

### `shorty.onGlobal(keyCombo, eventName[, desc[, group]])`

Identical to `shorty.on` but the shortcut will trigger regardless of whether or
not an input element has the focus. Note that this requires Mousetrap's global
bindings plugin, it will fall back on `shorty.on` if the extension is not
available.


### `shorty.on[Global]Key(Up|Down|Press)`

For certain shortcuts you may wish to specify which keyboard events should be
listened for (e.g. keyup vs. keydown). This is typically handed internally but
you may use the following methods to only consider the corresponding keyboard
events, they otherwise behave like `shorty.on` and `shorty.onGlobal`
respectively:

- `shorty.onKeyPress`
- `shorty.onKeyUp`
- `shorty.onKeyDown`
- `shorty.onGlobalKeyPress`
- `shorty.onGlobalKeyUp`
- `shorty.onGlobalKeyDown`


### `shorty.broadcastTo(scope[, el])`

This method binds all key combinations passed to `shorty.on` since the last call
to `shorty.broadcast` to the angular scope `scope`. I.e.:

```javascript
// Every scope under $rootScope will hear about event1
shorty.on('g 1', 'event1', 'Event one').broadcastTo($rootScope);

// Only scopes under $scope will hear about event2
shorty.on('g 2', 'event2', 'Event two').broadcastTo($scope);
```

By default, shortcuts are picked up regardless of where in your appliation they
are triggered. Sometimes it may be desireable to restrict your shortcuts to a
specific element, e.g. you may want to create widget/directive specific
shortcuts. To do this, supply an angular element as the second argument to
`shorty.broadcastTo`. A new mousetrap instance for your element
(so widgets don't clobber each others' shortcuts) and the shortuts will be
registerd with it.

```javascript
// Typically $scope will be attached to myElement
shorty.on('g 2', 'event2', 'Event two').broadcastTo($scope, myElement);
```

Note: at present only a single shortcut chain per element is supported:

```javascript
// OK so far...
shorty
  .on('g 1', 'event1', 'Event one')
  .on('g 2', 'event2', 'Event two')
  .broadcastTo($scope, myElement);

// Oh no! We clobbered the two shortcuts above! This `on(...)` should be added
// to the chain above.
shorty
  .on('g 3', 'event3', 'Event three')
  .broadcastTo($scope, myElement);
```

Note: at present you will not be able to deregister element specific shortcuts
manually. They will be cleaned up with their associated scope is destroyed.

### `shorty.off(keyCombo)`

Use this method to un-register a shortcut. Note that shortcuts are automatically
"cleaned up" as their associated scopes are destroyed, you only need to use this
if you want to remove a shortcut whose scope is still living.

### `shorty.getActiveShortcuts([group])`

Returns an array of currently registered shortcuts. Useful e.g. for displaying a
keyboard shortcut cheatsheet to your users. You may optionally provide a group
to filter the returned array to just those shortcuts registred with the given
group name.

```javascript
var combos = shorty.getActiveShortcuts();
console.log(combos);
// -->
// [{
//   combo: 'g i',              // The key combination
//   event: 'event_goToInbox',  // The event to be broadcasted
//   group: 'Navigation',       // The shortcut group
//   desc: 'Go to your inbox',  // The shortcut description
//   global: false,             // Whether or not this is a global shortcut
//   keyboardEvent: false       // User specified keyboard event (see e.g. onKeyUp) if any, false otherwise
// },{
//   combo: 'g g',
//   event: 'event_goToTop',
//   group: 'Navigation',
//   desc: 'Scroll to the top of the page',
//   global: false,
//   keyboardEvent: 'keypress'
// }]
```

The returned array of shortcuts will be sorted alphabetically by group and
combination.


## The `shorty` Filter

This filter is intended to be used in combination with
`shoryt.getActiveShortcuts` to help you create pretty keyboard shortcut "cheat
sheets" for your users by mapping Mousetrap key names to prettified versions of
the same, e.g.:

```html
<!-- In -->
<span>{{"up down" | shorty}}</span>

<!-- Out -->
ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ
```

It is possible to configure this filter to provide your own custom pretty print
mappings:

```javascript
app.config(function(shortyFilterProvider) {
  shortyFilterProvider.setKeyMap({
    up: '^',
    down: 'v'
  });
});
```

As a convenience, the filter can optionally return your combo string as an
array (note that is is `ng-repeat` safe), just pass `true` as the last
parameter:

```html
<!-- In -->
<ul>
  <li ng-repeat="'g g g' | shorty:true">
  </li>
</ul>

<!-- Out -->
 - g
 - g
 - g 
```


## Configuration

By default we look for `Mousetrap` in the global scope but if you want to
provider your own mousetrap instance or constructor you can do so using the
`shortyMousetrapProvider`:

```
app.config(function(shortyMousetrapProvider) {
  shortyMousetrapProvider.setMousetrap(MyMousetrap);
});
```

Subsequenty you can use the `shortyMousetrap` service to retrieve the active
Mousetrap with `shortyMousetrap.get()`.


## Testing

Use `npm test` to run the full suite of linting, style checks, and unit tests.

Or, run each individually:

- Use `grunt jshint` for linting
- Use `grunt jscs` for coding style checks
- Use `grunt jasmine` to unit tests

For ease of development the `grunt watch` task will run each of the above as
needed when you make changes to source files.


## Changelog

- 2015-11-30 v0.6.0 Add element specific shortcuts
- 2015-07-20 v0.5.0 Add `onKeyPress` and company
- 2015-07-20 v0.4.0 Add ability to unregister shortcuts
- 2015-07-13 v0.3.0 Add pretty print filter


## License

MIT

[mousetrap]: https://craig.is/killing/mice
