/*global jasmine */

describe('Filter: shorty', function() {
  'use strict';

  var shortyFilter;

  describe('defaults', function() {
    beforeEach(module('shorty'));

    beforeEach(inject(function(_shortyFilter_) {
      shortyFilter = _shortyFilter_;
    }));

    it('should replace special characters', function() {
      var upActual = shortyFilter('up')
        , shiftActual = shortyFilter('shift+j');
      expect(upActual).toBe('↑');
      expect(shiftActual).toBe('⇧+j');
    });

    it('should optionally return an array of shortut molecules', function() {
      var actual = shortyFilter('g g', true)
        , expected = ['g', 'g'];
      expect(actual).toEqual(expected);
    });

    it('should return the same array on redundant calls for arrays', function() {
      var first = shortyFilter('g g', true)
        , second = shortyFilter('g g', true);
      expect(first).toBe(second);
    });
  });

  describe('custom maps', function() {
    it('should allow custom key mappings', function() {
      module('shorty', function(shortyFilterProvider) {
        shortyFilterProvider.setKeyMap({
          up: 'FOO',
          shift: 'BAR'
        });
      });

      inject(function(_shortyFilter_) {
        shortyFilter = _shortyFilter_;
      });

      var upActual = shortyFilter('up')
        , shiftActual = shortyFilter('shift+j');
      expect(upActual).toBe('FOO');
      expect(shiftActual).toBe('BAR+j');
    });
  });
});
