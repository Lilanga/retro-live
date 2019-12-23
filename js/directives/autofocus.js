'use strict';

angular.module('retro').directive('focus', function($timeout) {
    return function(scope, element) {
       scope.$watch('editing',
         function () {
            $timeout(function() {
                element[0].focus();
            }, 0, false);
         });
      };
});
