
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
