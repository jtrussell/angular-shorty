
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

