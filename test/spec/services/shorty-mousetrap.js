/*global jasmine, spyOn */

describe('Provider: shortyMousetrap', function() {
  'use strict';

  it('should default to the mousetrap attached to $window', function() {
    module('shorty');

    var trojanTrap = 'WOWZA';

    module(function($provide) {
      $provide.value('$window', {
        Mousetrap: trojanTrap
      });
    });

    inject(function(shortyMousetrap) {
      var trap = shortyMousetrap.get();
      expect(trap).toBe(trojanTrap);
    });
  });

  it('should allow folks to supply their own mousetrap', function() {
    var trojanTrap = 'BLARGUS';

    module('shorty', function(shortyMousetrapProvider) {
      shortyMousetrapProvider.setMousetrap(trojanTrap);
    });

    inject(function(shortyMousetrap) {
      var trap = shortyMousetrap.get();
      expect(trap).toBe(trojanTrap);
    });
  });

  it('should allow folks to create a new mousetrap attached to an element', function() {
    // Mimic and angular element which "looks" like an array
    var $trojanEl = ['ITS A TRAP'];

    function ShortySpy($el) {
      this.$attached = $el;
    }

    module('shorty', function(shortyMousetrapProvider) {
      shortyMousetrapProvider.setMousetrap(ShortySpy);
    });

    inject(function(shortyMousetrap) {
      var trap = shortyMousetrap.getAttachedTo($trojanEl);
      expect(trap.$attached).toBe($trojanEl[0]);
    });
  });
});
