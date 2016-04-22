'use strict';

app.controller('AppController', ['$scope', '$rootScope', function ($scope, $rootScope) {
  $scope.filterPattern = '';
  $scope.selectEntry = function (event, dwr) {
    event.preventDefault();
    $rootScope.selectedDWR = dwr;
  };
  $scope.clearItems = function () {
    $rootScope.dwrs = [];
    $rootScope.selectedDWR = null;
  };
  $scope.isVisible = function (dwr) {
    var regExp;
    if ($scope.filterPattern === '') {
      regExp = new RegExp('.*');
    } else {
      regExp = new RegExp($scope.filterPattern);
    }
    return dwr.name.search(regExp) >= 0;
  };
}]);