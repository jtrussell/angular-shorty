
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


