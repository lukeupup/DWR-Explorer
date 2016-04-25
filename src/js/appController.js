'use strict';

app.controller('AppController', ['$scope', function($scope) {
  $scope.filterPattern = '';
  $scope.selectEntry = function (event, dwr) {
    event.preventDefault();
    $scope.currentTab = 'RESPONSE';
    $scope.selectedDWR = dwr;
  };
  $scope.clearItems = function() {
    $scope.dwrs = [];
    $scope.selectedDWR = null;
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
  $scope.switchTab  = function (tab) {
    $scope.currentTab = tab;
  };
  $scope.isCurrentTab = function (tab) {
    return $scope.currentTab === tab;
  }
}]);
