
/**
 * Main module declaration for shorty
 *
 * @package shorty
 * @copyright 2015 jtrussell
 */

angular.module('shorty', []);


/**
 * Filter shorctus to a specific group
 *
 * @package shorty
 * @copyright 2015 jtrussell
 */

angular.module('shorty').filter('shortyGroup', function() {
  'use strict';

  /**
   * If group is specified returns just those shortcuts assigned to the given
   * group. Returns all shortcuts otherwise.
   *
   * @param {Array} shortucts The list of shortcuts
   * @param {String} group (optional) The group to filter down to
   * @return {Array} The filtered list of shortcuts
   */
  return function(shortcuts, group) {
    if(!group || !shortcuts) { return shortcuts; }
    var groupShortcuts = [];
    angular.forEach(shortcuts, function(s) {
      if(group === s.group) {
        groupShortcuts.push(s);
      }
    });
    return groupShortcuts;
  };
});




/**
 * Default shortcut sorting service
 *
 * @package shorty
 * @copyright 2015 jtrussell
 */

angular.module('shorty').filter('shortySort', function() {
  'use strict';

  // Assumes combo uniqueness
  var shortySort = function(a, b) {
    if(a.group === b.group) {
      // Alpha ascending
      return a.combo < b.combo ? -1 : 1;
    }

    // Groups are different, send empty groups to back
    if('' === a.group) {
      return 1;
    }

    if('' === b.group) {
      return -1;
    }

    // Groups are non-empty and different
    return a.group < b.group ? -1 : 1;
  };

  /**
   * Sorts an array of shortcut objects in place and also returns the array
   *
   * Note that while this filter does return your array it must also sort the
   * list in place.
   *
   * Also, we assume shortcut combo uniqueness.
   *
   * @param {Array} shortcuts The array of shortcuts
   * @return {Array} The shortcuts
   */
  return function(shortcuts) {
    if(!shortcuts) { return shortcuts; }
    shortcuts.sort(shortySort);
    return shortcuts;
  };
});


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

    this.$get = ['$window', 'shortySortFilter', 'shortyGroupFilter',
        function($window, shortySortFilter, shortyGroupFilter) {
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
      exports.on = function(keyCombo, eventName, desc, group) {
        shortcutsBuffer.push({
          combo: keyCombo,
          event: eventName,
          group: group || '',
          desc: desc || ''
        });
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
          trap.bind(c.combo, function() {
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
