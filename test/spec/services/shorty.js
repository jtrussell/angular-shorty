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

  describe('#getActiveShortcuts', function() {
    it('should know which shortcuts have been registered', function() {
      shorty
        .on('g c', 'event_goToContacts', 'Go to your contacts list', 'Navigation')
        .on('g i', 'event_goToInbox', 'Go to your inbox', 'Navigation')
        .broadcastTo(scope);
      var shortcuts = shorty.getActiveShortcuts();
      expect(shortcuts).toEqual([{
        combo: 'g c',
        event: 'event_goToContacts',
        group: 'Navigation',
        desc: 'Go to your contacts list'
      }, {
        combo: 'g i',
        event: 'event_goToInbox',
        group: 'Navigation',
        desc: 'Go to your inbox'
      }]);
    });

    it('should sort shortcuts by group first', function() {
      shorty
        .on('g c', 'event_goToContacts', 'Go to your contacts list', 'b')
        .on('g i', 'event_goToInbox', 'Go to your inbox', 'a')
        .broadcastTo(scope);
      var shortcuts = shorty.getActiveShortcuts();
      expect(shortcuts[0].event).toBe('event_goToInbox');
      expect(shortcuts[1].event).toBe('event_goToContacts');
    });

    it('should sort shortcuts by combo second', function() {
      shorty
        .on('g i', 'event_goToInbox', 'Go to your inbox', 'a')
        .on('g c', 'event_goToContacts', 'Go to your contacts list', 'a')
        .broadcastTo(scope);
      var shortcuts = shorty.getActiveShortcuts();
      expect(shortcuts[0].event).toBe('event_goToContacts');
      expect(shortcuts[1].event).toBe('event_goToInbox');
    });

    it('should short ungrouped shortcuts last', function() {
      shorty
        .on('g i', 'event_goToInbox', 'Go to your inbox', 'a')
        .on('g e', 'event_goToEnd', 'Go to your end')
        .on('g c', 'event_goToContacts', 'Go to your contacts list', 'a')
        .broadcastTo(scope);
      var shortcuts = shorty.getActiveShortcuts();
      expect(shortcuts[2].event).toBe('event_goToEnd');
    });

    it('should enforce uniqueness on key combinations', function() {
      shorty
        .on('g i', 'event_goToInbox', 'Go to your inbox', 'a')
        .on('g c', 'event_goToContacts', 'Go to your contacts list', 'a')
        .on('g i', 'event_goToInbox', 'Go to your inbox', 'a')
        .broadcastTo(scope);
      var shortcuts = shorty.getActiveShortcuts();
      expect(shortcuts.length).toBe(2);
    });

    it('should allow filtering by group', function() {
      shorty
        .on('g i', 'event_goToInbox', 'Go to your inbox', 'a')
        .on('g c', 'event_goToContacts', 'Go to your contacts list', 'b')
        .on('g d', 'event_goToDen', 'Go to your den', 'a')
        .broadcastTo(scope);
      var shortcuts = shorty.getActiveShortcuts('b');
      expect(shortcuts.length).toBe(1);
    });
  });
});
