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
          var valueProperty = getValueProperty(value);

          $scope.tree.items.push({
            key: key,
            value: valueProperty.text,
            hasItems: valueProperty.hasItems,
            items: [],
            ref: $scope.data[key]
          });
        });
      }
    }
  });

  $scope.getChildNodes = function (item) {
    angular.forEach(item.ref, function (value, key) {
      var valueProperty = getValueProperty(value);

      item.items.push({
        key: key,
        value: valueProperty.text,
        hasItems: valueProperty.hasItems,
        items: [],
        ref: item.ref[key]
      });
    });
  };

  $scope.toggleItem = function (event, item) {
    event.stopPropagation();

    if (!item.hasItems) {
      return false;
    }
    
    if (item.hasItems && item.items.length === 0) {
      $scope.getChildNodes(item);
    }
    
    item.expanded = !item.expanded;
  };

  var getValueProperty = function (value) {
    var property = {
      text: '',
      hasItems: false
    };

    switch (typeof value) {
      case 'function':
        property.text = 'Function';
        property.hasItems = true;
        break;

      case 'object':
        if (value === null) {
          property.text = 'null';
        } else if (Array.isArray(value)) {
          if (value.length === 0) {
            property.text = '[]';
          } else {
            property.text = 'Array[' + value.length + ']';
            property.hasItems = true;
          }
        } else {
          if (Object.keys(value).length === 0) {
            property.text = '{}';
          } else {
            property.text = 'Object';
            property.hasItems = true;
          }
        }
        break;

      case 'undefined':
        property.text = 'undefined';
        break;

      default:
        property.text = value.toString();
        break;
    }

    return property;
  };
}]);