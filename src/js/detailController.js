'use strict';

app.controller('DetailController', ['$scope', 'ngClipboard', function ($scope, ngClipboard) {

  var STRING_MAX_LEN = 50;
  $scope.templates = {
    tree: '../pages/tree.html'
  };

  $scope.enableAddOn = false;
  $scope.copyValue = function (event, item) {
    var itemStr;
    try {
      itemStr = JSON.stringify(item.ref);
    } catch (e) {
      itemStr = JSON.stringify(JSON.decycle(item.ref));
    }
    ngClipboard.toClipboard(itemStr);
  };

  $scope.$watch('content', function (newVal) {
    $scope.data = newVal;

    $scope.tree = {
      items: []
    };

    if (typeof $scope.data === 'object') {
      angular.forEach($scope.data, function (value, key) {
        var valueProperty = getValueProperty(value);

        $scope.tree.items.push({
          key: key + ':',
          value: valueProperty.text,
          hasItems: valueProperty.hasItems,
          type: valueProperty.type,
          items: [],
          ref: $scope.data[key],
          originalValue: valueProperty.originalText
        });
      });
    } else {
      $scope.tree.items.push({
        key: '',
        value: newVal,
        hasItems: false,
        type: ''
      });
    }
  });

  $scope.getChildNodes = function (item) {
    angular.forEach(item.ref, function (value, key) {
      var valueProperty = getValueProperty(value);

      item.items.push({
        key: key + ':',
        value: valueProperty.text,
        hasItems: valueProperty.hasItems,
        type: valueProperty.type,
        items: [],
        ref: item.ref[key],
        originalValue: valueProperty.originalText
      });
    });
  };

  $scope.toggleItem = function (event, item) {
    if (event.target.classList.contains('itemAddOn')) {
      return;
    }
    event.stopPropagation();

    if (!item.hasItems) {
      return false;
    }

    if (item.hasItems && item.items.length === 0) {
      $scope.getChildNodes(item);
    }

    item.expanded = !item.expanded;
  };

  $scope.getValueStyleClass = function (type) {
    if (!this._valueStyleClassMap) {
      this._valueStyleClassMap = {
        string: 'value-string',
        number: 'value-number',
        boolean: 'value-boolean',
        'undefined': 'value-undefined'
      }
    }

    return this._valueStyleClassMap[type] || '';
  };

  var getValueProperty = function (value) {
    var property = {
      text: '',
      type: '',
      hasItems: false
    };

    property.type = (typeof value);

    switch (typeof value) {
      case 'function':
        property.text = 'Function';
        property.hasItems = true;
        break;

      case 'object':
        if (value === null) {
          property.text = 'null';
          property.type = 'undefined';
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

      case 'string':
        if (value.length > STRING_MAX_LEN) {
          property.text = '"' + value.substring(0, STRING_MAX_LEN) + '"...';
          property.originalText = '"' + value + '"';
        } else {
          property.text = '"' + value + '"';
        }
        break;

      default:
        property.text = value.toString();
        break;
    }

    return property;
  };
}]);