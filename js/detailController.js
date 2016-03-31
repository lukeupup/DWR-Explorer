'use strict';

app.controller('DetailController', ['$scope', function ($scope) {
  $scope.templates = {
    tree: '../pages/tree.html'
  };

  $scope.$watch('content', function (newVal) {
    if (newVal) {
      $scope.data = newVal;

      $scope.tree = {
        items: []
      };

      if (typeof $scope.data === 'object') {
        angular.forEach($scope.data, function (value, key) {
          $scope.tree.items.push({
            key: key,
            value: switchValueType(value),
            hasItems: hasItems(value),
            items: [],
            ref: $scope.data[key]
          });
        });
      }
    }
  });

  $scope.getChildNodes = function (item) {
    angular.forEach(item.ref, function (value, key) {
      item.items.push({
        key: key,
        value: switchValueType(value),
        hasItems: hasItems(value),
        items: [],
        ref: item.ref[key]
      });
    });
  };

  $scope.toggleItem = function (item) {
    if (item.hasItems && item.items.length === 0) {
      $scope.getChildNodes(item);
    }
  };

  var switchValueType = function (value) {
    switch (typeof value) {
      case 'function':
        return 'Function';

      case 'object':
        if (value === null) {
          return 'null';
        }

        if (Array.isArray(value)) {
          return 'Array[' + value.length + ']';
        }
        return 'Object';

      case 'undefined':
        return 'undefined';

      default:
        return value.toString();
    }
  };

  var hasItems = function (value) {
    switch (typeof value) {
      case 'object':
      case 'function':
        return true;
      default:
        return false;
    }
  };
}]);