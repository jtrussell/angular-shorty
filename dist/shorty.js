
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


/**
 * Provider to allow supplying your own mousetrap instance
 *
 * @package shorty
 * @copyright 2015 jtrussell
 */

angular.module('shorty')
  .provider('shortyMousetrap', function() {
    'use strict';

    var Mousetrap;

    /**
     * Optionally provide your own mousetrap instance
     *
     * @see https://github.com/ccampbell/mousetrap
     * @param {Object} m A Mousetrap "global"
     */
    this.setMousetrap = function(M) {
      Mousetrap = M;
    };

    this.$get = ['$window', function($window) {
      var Trap = Mousetrap || $window.Mousetrap;

      var exports = {};

      /**
       * Get the registered mousetrap instance
       *
       * @return {Object} A Mousetrap instance
       */
      exports.get = function() {
        return Trap;
      };

      /**
       * Get a mousetrap instance attached to the given element
       *
       * Will clean up bindings when the scope attached to this element is
       * drestroyed.
       *
       * @see https://craig.is/killing/mice#wrapping
       * @param {Object} $el An angular element
       * @return {Object} A Mousetrap instance
       */
      exports.getAttachedTo = function($el) {
        var trap = new Trap($el[0]);

        //var $s = $el.scope();
        //$s.$on('$destroy', function() {
        //  /**
        //   * @todo clean up bindings? Necessary?
        //   */
        //});

        return trap;
      };

      return exports;
    }];
  });



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
     * You may optionally provide a mousetrap instance to unbind `keyCombo`
     * from.
     *
     * @param {String} keyCombo The Mousetrap key combo string
     * @param {Mousetrap} trap An optional Mousetrap instance
     * @return {shorty} This service for chaining
     */
    exports.off = function(keyCombo, trap) {
      trap = trap || Trap;
      trap.unbind(keyCombo);
      return exports;
    };

    /**
     * Close a shortcut registration chain by binding to a scope
     *
     * @param {$scope} scope An angular scope to broadcast to
     * @param {$element} el An angular element to restrict bindings to
     * @return {shorty} This service for chaining
     */
    exports.broadcastTo = function(scope, el) {
      var t = el ? shortyMousetrap.getAttachedTo(el) : Trap;

      // Register events, setup destroy handlers, add to list of active
      // shortcuts
      angular.forEach(shortcutsBuffer, function(c) {
        var bindFn = 'bind';
        if(c.global) {
          if(angular.isDefined(t.bindGlobal)) {
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

        t[bindFn].apply(t, args);

        // Add to list of active shortcuts. First we must make sure there
        // doesn't already exist a shortuct with this key combo... if so kill
        // it (it may have a different group and/or description). Then, insert
        // this shortcut in the appropriate spot... could use some
        // optimization.
        //
        // Shortcuts restricted to an element are assumed to be i.e. "widget"
        // shortuts and shouldn't pollute the global list of active shortcuts.
        if(!el) {
          var ix;
          for(ix = activeShortcuts.length; ix--;) {
            if(c.combo === activeShortcuts[ix].combo) {
              activeShortcuts.splice(ix, 1);
              ix = 0;
            }
          }
          activeShortcuts.push(c); // We'll do all our sorting at the end.
        }

        // To optimize... one $destroy handler
        scope.$on('$destroy', function() {
          t.unbind(c.combo);
          if(!el) {
            var ix;
            for(ix = activeShortcuts.length; ix--;) {
              if(c.combo === activeShortcuts[ix].combo) {
                activeShortcuts.splice(ix, 1);
                ix = 0;
              }
            }
          }
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
