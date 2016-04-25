'use strict';

app.controller('AppController', ['$scope', '$rootScope', function($scope, $rootScope) {
  $scope.filterPattern = '';
  $rootScope.targetObjectName = 'response';
  $scope.showDetail = function(event, res) {
    event.preventDefault();
    $rootScope.targetObject = res;
  };
  $scope.clearItems = function() {
    $rootScope.dwrs = [];
    $rootScope.targetObject = '';
  };
  $scope.isVisible = function(dwr) {
    var regExp;
    if ($scope.filterPattern === '') {
      regExp = new RegExp('.*');
    } else {
      regExp = new RegExp($scope.filterPattern);
    }
    return dwr.name.search(regExp) >= 0;
  };
}]);
