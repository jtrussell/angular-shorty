/*global jasmine */

describe('Service: shorty', function() {
  'use strict';

  var shorty
    , trap
    , scope;

  beforeEach(module('shorty', function(shortyProvider) {
    trap = {};
    trap.bind = jasmine.createSpy('bind');
    trap.unbind = jasmine.createSpy('unbind');
    shortyProvider.setMousetrap(trap);
  }));

  beforeEach(inject(function(_shorty_, $rootScope) {
    shorty = _shorty_;
    scope = $rootScope.$new();
  }));

  it('should register combos with mousetrap', function() {
    shorty
      .on('g i', 'event_goToInbox', 'Go to your inbox')
      .broadcastTo(scope);
    expect(trap.bind).toHaveBeenCalledWith('g i', jasmine.any(Function));
  });

  it('should unregister combos when a scope is destroyed', function() {
    shorty
      .on('g i', 'event_goToInbox', 'Go to your inbox')
      .broadcastTo(scope);
    scope.$destroy();
    expect(trap.unbind).toHaveBeenCalledWith('g i');
  });

  it('should broadcast events when mousetrap handlers are called', function() {
    var wasCalled = false;

    scope.$on('event_goToInbox', function() {
      wasCalled = true;
    });

    shorty
      .on('g i', 'event_goToInbox', 'Go to your inbox')
      .broadcastTo(scope);

    // Invoke the callback passed to mousetrap...
    trap.bind.calls.mostRecent().args[1]();

    expect(wasCalled).toBe(true);
  });
});
