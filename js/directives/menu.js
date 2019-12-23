'use strict';

angular.module('retro').directive('menu', ['VoteService', function(voteService) {
    return {
      templateUrl : 'components/menu.html',
      link: function($scope) {
        $scope.voteService = voteService;
      }
    };
  }]
);
