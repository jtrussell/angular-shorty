
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

### `shorty.broadcastTo(scope)`

This method binds all key combinations passed to `shorty.on` since the last call
to `shorty.broadcast` to the angular scope `scope`. I.e.:

```javascript
// Every scope under $rootScope will hear about event1
shorty.on('g 1', 'event1', 'Event one').broadcastTo($rootScope);

// Only scopes under $scope will hear about event2
shorty.on('g 2', 'event2', 'Event two').broadcastTo($scope);
```

### `shorty.getActiveShortcuts([group])`

Returns an array of currently registered shortcuts. Useful e.g. for displaying a
keyboard shortcut cheatsheet to your users. You may optionally provide a group
to filter the returned array to just those shortcuts registred with the given
group name.

```javascript
var combos = shorty.getActiveShortcuts();
console.log(combos);
// -->
[{
  combo: 'g i',
  event: 'event_goToInbox',
  group: 'Navigation',
  desc: 'Go to your inbox'
},{
  combo: 'g g',
  event: 'event_goToTop',
  group: 'Navigation',
  desc: 'Scroll to the top of the page'
}]
```

The returned array of shortcuts will be sorted alphabetically by group and
combination.


## Testing

Use `npm test` to run the full suite of linting, style checks, and unit tests.

Or, run each individually:

- Use `grunt jshint` for linting
- Use `grunt jscs` for coding style checks
- Use `grunt jasmine` to unit tests

For ease of development the `grunt watch` task will run each of the above as
needed when you make changes to source files.


## Changelog

*(nothing yet)*


## License

MIT

[mousetrap]: https://craig.is/killing/mice
