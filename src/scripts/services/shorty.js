
/**
 * The main shorty service
 *
 * @package shorty
 * @copyright 2015 jtrussell
 */

angular.module('shorty')
  .factory('shorty', ['$log', 'shortyMousetrap', 'shortySortFilter', 'shortyGroupFilter',
      function($log, shortyMousetrap, shortySortFilter, shortyGroupFilter) {
    'use strict';

    var Trap = shortyMousetrap.get()
      , shortcutsBuffer = []
      , activeShortcuts = []
      , boundingElement = null;

    function exports($el) {
      boundingElement = $el;
      return exports;
    }

    /**
     * Register a keyboard shortuct combo
     *
     * @param {String} keyCombo The Mousetrap key combo string
     * @param {String} eventName The event to broadcast
     * @param {String} desc A description of the shortcut for help text
     * @param {String} group A group for help text
     * @param {Boolean} global Whether or not to register a global shortut
     * @param {String} keyboardEvent The specific keyboard event to listen for
     * @return {shorty} This service for chaining
     */
    exports.on = function(keyCombo, eventName, desc, group, global, keyboardEvent) {
      shortcutsBuffer.push({
        combo: keyCombo,
        event: eventName,
        group: group || '',
        desc: desc || '',
        global: angular.isDefined(global) ? global : false,
        keyboardEvent: keyboardEvent || false
      });
      return exports;
    };

    /**
     * Like `on` but just for `keypress` keyboard events
     *
     * @param {String} keyCombo The Mousetrap key combo string
     * @param {String} eventName The event to broadcast
     * @param {String} desc A description of the shortcut for help text
     * @param {String} group A group for help text
     * @return {<type>}
     */
    exports.onKeyPress = function(keyCombo, eventName, desc, group) {
      return exports.on(keyCombo, eventName, desc, group, false, 'keypress');
    };


    /**
     * Like `on` but just for `keydown` keyboard events
     *
     * @param {String} keyCombo The Mousetrap key combo string
     * @param {String} eventName The event to broadcast
     * @param {String} desc A description of the shortcut for help text
     * @param {String} group A group for help text
     * @return {shorty} This service for chaining
     */
    exports.onKeyDown = function(keyCombo, eventName, desc, group) {
      return exports.on(keyCombo, eventName, desc, group, false, 'keydown');
    };


    /**
     * Like `on` but just for `keyup` keyboard events
     *
     * @param {String} keyCombo The Mousetrap key combo string
     * @param {String} eventName The event to broadcast
     * @param {String} desc A description of the shortcut for help text
     * @param {String} group A group for help text
     * @return {shorty} This service for chaining
     */
    exports.onKeyUp = function(keyCombo, eventName, desc, group) {
      return exports.on(keyCombo, eventName, desc, group, false, 'keyup');
    };

    /**
     * Register a global keyboard shortuct combo
     *
     * @param {String} keyCombo The Mousetrap key combo string
     * @param {String} eventName The event to broadcast
     * @param {String} desc A description of the shortcut for help text
     * @param {String} group A group for help text
     * @return {shorty} This service for chaining
     */
    exports.onGlobal = function(keyCombo, eventName, desc, group) {
      return exports.on(keyCombo, eventName, desc, group, true);
    };

    /**
     * Like `onGlobal` but just for `keypress` keyboard events
     *
     * @param {String} keyCombo The Mousetrap key combo string
     * @param {String} eventName The event to broadcast
     * @param {String} desc A description of the shortcut for help text
     * @param {String} group A group for help text
     * @return {shorty} This service for chaining
     */
    exports.onGlobalKeyPress = function(keyCombo, eventName, desc, group) {
      return exports.on(keyCombo, eventName, desc, group, true, 'keypress');
    };

    /**
     * Like `onGlobal` but just for `keydown` keyboard events
     *
     * @param {String} keyCombo The Mousetrap key combo string
     * @param {String} eventName The event to broadcast
     * @param {String} desc A description of the shortcut for help text
     * @param {String} group A group for help text
     * @return {shorty} This service for chaining
     */
    exports.onGlobalKeyDown = function(keyCombo, eventName, desc, group) {
      return exports.on(keyCombo, eventName, desc, group, true, 'keydown');
    };

    /**
     * Like `onGlobal` but just for `keyup` keyboard events
     *
     * @param {String} keyCombo The Mousetrap key combo string
     * @param {String} eventName The event to broadcast
     * @param {String} desc A description of the shortcut for help text
     * @param {String} group A group for help text
     * @return {shorty} This service for chaining
     */
    exports.onGlobalKeyUp = function(keyCombo, eventName, desc, group) {
      return exports.on(keyCombo, eventName, desc, group, true, 'keyup');
    };

    /**
     * De-register a keyboard shortcut
     *
     * @param {String} keyCombo The Mousetrap key combo string
     * @return {shorty} This service for chaining
     */
    exports.off = function(keyCombo) {
      Trap.unbind(keyCombo);
      return exports;
    };

    /**
     * Close a shortcut registration chain by binding to a scope
     *
     * @param {$scope} scope An angular scope to broadcast to
     * @return {shorty} This service for chaining
     */
    exports.broadcastTo = function(scope) {

      // Register events, setup destroy handlers, add to list of active
      // shortcuts
      angular.forEach(shortcutsBuffer, function(c) {
        var bindFn = 'bind';
        if(c.global) {
          if(angular.isDefined(Trap.bindGlobal)) {
            bindFn = 'bindGlobal';
          } else {
            $log.debug('Mousetrap plugin "bindGlobal" not available. Falling back to regular bind');
          }
        }

        var args = [c.combo, function() {
          scope.$broadcast(c.event);
          scope.$apply();
        }];

        if(c.keyboardEvent) {
          args.push(c.keyboardEvent);
        }

        Trap[bindFn].apply(Trap, args);

        // Add to list or active shortcuts. First we must make sure there
        // doesn't already exist a shortuct with this key combo... if so kill
        // it (it may have a different group and/or description). Then, insert
        // this shortcut in the appropriate spot... could use some
        // optimization.
        var ix;
        for(ix = activeShortcuts.length; ix--;) {
          if(c.combo === activeShortcuts[ix].combo) {
            activeShortcuts.splice(ix, 1);
            ix = 0;
          }
        }
        activeShortcuts.push(c); // We'll do all our sorting at the end.

        // To optimize... one $destroy handler
        scope.$on('$destroy', function() {
          Trap.unbind(c.combo);
        });
      });

      // Clean the temp shortcuts buffer
      shortcutsBuffer.length = 0;

      // Subsequent calls to `broadcastTo` should be reset to listening for
      // events on the whole page
      boundingElement = null;

      // Sort the list of active shortcuts
      shortySortFilter(activeShortcuts);

      return exports;
    };

    exports.getActiveShortcuts = function(group) {
      return shortyGroupFilter(activeShortcuts, group);
    };

    return exports;
  }]);
