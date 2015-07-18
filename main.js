
(function(ng) {
  'use strict';
  
  var app = ng.module('demo', ['shorty']);

  app.run(function($rootScope, shorty) {
    shorty
      .on('h e l l o', 'event_hello')
      .broadcastTo($rootScope);

    $rootScope.$on('event_hello', function() {
      alert('hello!');
    });
  });
}(angular));
