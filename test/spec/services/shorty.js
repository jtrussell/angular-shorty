/*global jasmine, spyOn */

describe('Service: shorty', function() {
  'use strict';

  var shorty
    , trap
    , scope;

  var makeMockTrap = function() {
    var t = {};
    t.bind = jasmine.createSpy('bind');
    t.unbind = jasmine.createSpy('unbind');
    return t;
  };

  beforeEach(module('shorty', function(shortyMousetrapProvider) {
    trap = makeMockTrap();
    shortyMousetrapProvider.setMousetrap(trap);
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

  it('should register combos with an element specific mousetrap', inject(function(shortyMousetrap) {
    var el = 'I am an element'
      , trap2 = makeMockTrap();
    spyOn(shortyMousetrap, 'getAttachedTo').and.callFake(function(_el) {
      return _el === el ? trap2 : trap;
    });
    shorty
      .on('g i', 'event_goToInbox', 'Go to your inbox')
      .broadcastTo(scope, el);
    expect(trap2.bind).toHaveBeenCalledWith('g i', jasmine.any(Function));
  }));

  it('should register combos with mousetrap on keypress', function() {
    shorty
      .onKeyPress('g i', 'event_goToInbox', 'Go to your inbox')
      .broadcastTo(scope);
    expect(trap.bind).toHaveBeenCalledWith('g i', jasmine.any(Function), 'keypress');
  });

  it('should register combos with mousetrap on keyup', function() {
    shorty
      .onKeyUp('g i', 'event_goToInbox', 'Go to your inbox')
      .broadcastTo(scope);
    expect(trap.bind).toHaveBeenCalledWith('g i', jasmine.any(Function), 'keyup');
  });

  it('should register combos with mousetrap on keydown', function() {
    shorty
      .onKeyDown('g i', 'event_goToInbox', 'Go to your inbox')
      .broadcastTo(scope);
    expect(trap.bind).toHaveBeenCalledWith('g i', jasmine.any(Function), 'keydown');
  });

  it('should register combos with mousetrap', function() {
    shorty
      .on('g i', 'event_goToInbox', 'Go to your inbox')
      .broadcastTo(scope);
    expect(trap.bind).toHaveBeenCalledWith('g i', jasmine.any(Function));
  });

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

  it('should have a way to unregister combos', function() {
    shorty
      .on('g i', 'event_goToInbox', 'Go to your inbox')
      .broadcastTo(scope);
    shorty.off('g i');
    expect(trap.unbind).toHaveBeenCalledWith('g i');
  });

  it('should have a way to unregister combos from a given mousetrap instance', function() {
    var t = {};
    t.unbind = jasmine.createSpy('unbind');
    shorty.off('g i', t);
    expect(t.unbind).toHaveBeenCalledWith('g i');
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

  describe('#onGlobal', function() {
    it('should register global bindings with moustrap if possible', function() {
      trap.bindGlobal = jasmine.createSpy('bindGlobal');
      shorty
        .onGlobal('down', 'event_nextResult', 'Go to next result')
        .broadcastTo(scope);
      expect(trap.bindGlobal)
        .toHaveBeenCalledWith('down', jasmine.any(Function));
    });

    it('should register combos with mousetrap on keypress', function() {
      trap.bindGlobal = jasmine.createSpy('bindGlobal');
      shorty
        .onGlobalKeyPress('down', 'event_nextResult', 'Go to next result')
        .broadcastTo(scope);
      expect(trap.bindGlobal)
        .toHaveBeenCalledWith('down', jasmine.any(Function), 'keypress');
    });

    it('should register combos with mousetrap on keyup', function() {
      trap.bindGlobal = jasmine.createSpy('bindGlobal');
      shorty
        .onGlobalKeyUp('down', 'event_nextResult', 'Go to next result')
        .broadcastTo(scope);
      expect(trap.bindGlobal)
        .toHaveBeenCalledWith('down', jasmine.any(Function), 'keyup');
    });

    it('should register combos with mousetrap on keydown', function() {
      trap.bindGlobal = jasmine.createSpy('bindGlobal');
      shorty
        .onGlobalKeyDown('down', 'event_nextResult', 'Go to next result')
        .broadcastTo(scope);
      expect(trap.bindGlobal)
        .toHaveBeenCalledWith('down', jasmine.any(Function), 'keydown');
    });

    it('should fall back to using regular bindings', function() {
      shorty
        .onGlobal('down', 'event_nextResult', 'Go to next result')
        .broadcastTo(scope);
      expect(trap.bind)
        .toHaveBeenCalledWith('down', jasmine.any(Function));
    });

    it('should warn the developer when falling back', inject(function($log) {
      spyOn($log, 'debug');
      shorty
        .onGlobal('down', 'event_nextResult', 'Go to next result')
        .broadcastTo(scope);
      expect($log.debug).toHaveBeenCalled();
    }));
  });

  describe('#getActiveShortcuts', function() {
    it('should know which shortcuts have been registered', function() {
      shorty
        .on('g c', 'event_goToContacts', 'Go to your contacts list', 'Navigation')
        .onKeyUp('g i', 'event_goToInbox', 'Go to your inbox', 'Navigation')
        .broadcastTo(scope);
      var shortcuts = shorty.getActiveShortcuts();
      expect(shortcuts).toEqual([{
        combo: 'g c',
        event: 'event_goToContacts',
        group: 'Navigation',
        desc: 'Go to your contacts list',
        global: false,
        keyboardEvent: false
      }, {
        combo: 'g i',
        event: 'event_goToInbox',
        group: 'Navigation',
        desc: 'Go to your inbox',
        global: false,
        keyboardEvent: 'keyup'
      }]);
    });

    it('should not know about shortcuts restricted to an element', inject(function(shortyMousetrap) {
      var el = 'I am an element'
        , trap2 = makeMockTrap();
      spyOn(shortyMousetrap, 'getAttachedTo').and.callFake(function(_el) {
        return _el === el ? trap2 : trap;
      });
      shorty
        .on('g i', 'event_goToInbox', 'Go to your inbox')
        .broadcastTo(scope, el);
      var shortcuts = shorty.getActiveShortcuts();
      expect(shortcuts.length).toBe(0);
    }));

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

    it('should sort ungrouped shortcuts last', function() {
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

    it('should unregister active shortcuts when a scope is destroyed', function() {
      shorty
        .on('g i', 'event_goToInbox', 'Go to your inbox')
        .broadcastTo(scope);
      scope.$destroy();
      var shortcuts = shorty.getActiveShortcuts();
      expect(shortcuts.length).toBe(0);
    });

  });
});
