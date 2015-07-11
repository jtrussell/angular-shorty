
/**
 * The main shorty service
 *
 * @package shorty
 * @copyright 2015 jtrussell
 */

angular.module('shorty')
  .provider('shorty', function() {
    'use strict';

    var mousetrap;

    /**
     * Optionally provide your own mousetrap instance
     *
     * @see https://github.com/ccampbell/mousetrap
     * @param {Object} m A Mousetrap "global"
     */
    this.setMousetrap = function(m) {
      mousetrap = m;
    };

    this.$get = ['$window', '$log', 'shortySortFilter', 'shortyGroupFilter',
        function($window, $log, shortySortFilter, shortyGroupFilter) {
      var exports = {}
        , trap = mousetrap || $window.Mousetrap;

      var shortcutsBuffer = []
        , activeShortcuts = [];

      /**
       * Register a keyboard shortuct combo
       *
       * @param {String} keyCombo The Mousetrap key combo string
       * @param {String} eventName The event to broadcast
       * @param {String} desc A description of the shortcut for help text
       * @param {String} group A group for help text
       * @return {shorty} This service for chaining
       */
      exports.on = function(keyCombo, eventName, desc, group, global) {
        shortcutsBuffer.push({
          combo: keyCombo,
          event: eventName,
          group: group || '',
          desc: desc || '',
          global: angular.isDefined(global) ? global : false
        });
        return exports;
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
            if(angular.isDefined(trap.bindGlobal)) {
              bindFn = 'bindGlobal';
            } else {
              $log.debug('Mousetrap plugin "bindGlobal" not available. Falling back to regular bind');
            }
          }

          trap[bindFn](c.combo, function() {
            scope.$broadcast(c.event);
            scope.$apply();
          });

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
            trap.unbind(c.combo);
          });
        });

        // Clean the temp shortcuts buffer
        shortcutsBuffer.length = 0;

        // Sort the list of active shortcuts
        shortySortFilter(activeShortcuts);

        return exports;
      };

      exports.getActiveShortcuts = function(group) {
        return shortyGroupFilter(activeShortcuts, group);
      };

      return exports;
    }];
  });
