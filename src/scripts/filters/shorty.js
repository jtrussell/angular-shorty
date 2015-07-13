
/**
 * Pretty print key combo strings
 *
 * @package shorty
 * @copyright 2015 jtrussell
 */

angular.module('shorty').provider('shortyFilter', function() {
  'use strict';
  var self = this;

  // Many thanks to angular hotkeys!
  var map = {
    command: '⌘',
    shift: '⇧',
    left: '←',
    right: '→',
    up: '↑',
    down: '↓',
    'return': '↩',
    enter: '↩',
    backspace: '⌫'
  };

  // Using the "as array" feature will cause issues if we don't return the same
  // array instance for identical pretty print requests
  var prettyPrintCache = {};

  /**
   * Configure this provider by specifying your own pretty print mappings
   *
   * @param {Object} opts A map of combo str atom --> pretty printed version
   * @return {Object} This provider for chaining
   */
  this.setKeyMap = function(opts) {
    angular.forEach(opts, function(val, key) {
      map[key] = val;
    });
    return self;
  };

  this.$get = function() {

    /**
     * Get a 'pretty' version of a combo string
     *
     * Optionally pass `true` as the second parameter to get your combo string
     * as an array instead of a string. Note that this is `ngRepeat` safe.
     *
     * We refer to combo string "molecules" as any group of keys pressed
     * simultaneously, e.g. "shift+k" and "g" are both molecules while "shift",
     * "k", and "g" are all atoms.
     *
     * @param {String} comboStr The raw combo string as given to Mousetrap
     * @param {Boolean} asArray Optionally request an array of combo molecules
     * @return {String|Array} The prettified combo string
     */
    return function(comboStr, asArray) {
      if(asArray && prettyPrintCache.hasOwnProperty(comboStr)) {
        return prettyPrintCache[comboStr];
      }

      var _comboStr = comboStr
        .replace(/\s+/g, ' ')
        .split(' ')
        .map(function(molecule) {
          return molecule
            .split('+')
            .map(function(atom) {
              var _atom = atom.toLowerCase();
              if(map.hasOwnProperty(_atom)) {
                atom = map[_atom];
              }
              return atom;
            })
            .join('+');
        })
        .join(' ');

      if(asArray) {
        _comboStr = _comboStr.split(' ');
        prettyPrintCache[comboStr] = _comboStr;
      }

      return _comboStr;
    };
  };
});
