
/**
 * Main module declaration for shorty
 *
 * @package shorty
 * @copyright 2015 jtrussell
 */

angular.module('shorty', []);


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

    this.$get = ['$window', function($window) {
      var exports = {}
        , trap = mousetrap || $window.Mousetrap;

      var combosBuffer = [];

      /**
       * Register a keyboard shortuct combo
       *
       * @param {String} keyCombo The Mousetrap key combo string
       * @param {String} eventName The event to broadcast
       * @param {String} desc A description of the combo for help text
       * @return {shorty} This service for chaining
       */
      exports.on = function(keyCombo, eventName, desc) {
        combosBuffer.push([keyCombo, eventName, desc]);
        return exports;
      };

      /**
       * Close a shortcut registration chain by binding to a scope
       *
       * @param {$scope} scope An angular scope to broadcast to
       * @return {shorty} This service for chaining
       */
      exports.broadcastTo = function(scope) {
        angular.forEach(combosBuffer, function(c) {
          trap.bind(c[0], function() {
            scope.$broadcast(c[1]);
          });

          // To optimize... one $destroy handler
          scope.$on('$destroy', function() {
            trap.unbind(c[0]);
          });
        });

        combosBuffer.length = 0;

        return exports;
      };

      return exports;
    }];
  });
