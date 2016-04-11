'use strict';

app.controller('AppController', ['$scope', function ($scope) {
  $scope.showDetail = function (event, res) {
    event.preventDefault();
    $scope.content = res;
  };
}]);