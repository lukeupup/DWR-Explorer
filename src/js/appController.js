'use strict';

var app = angular.module('dwrexplorer', ['ngClipboard', 'ngResizer', 'ngObject']);

app.controller('AppController', ['$scope', '$document', function($scope, $document) {

  var sandbox = $document[0].querySelector('#sandbox');
  var dwrTempStorage = {};
  var dwrIndex = 0;

  var dwr2script = window.dwr2script;

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
  };

  var isDwrRequest = function (req) {
    return (req && req.request && /\.dwr$/.test(req.request.url));
  };

  var parseDWR = function (request, response, index) {
    var message = {
      type: 'parseDWR',
      data: {
        index: index,
        // todo: error handler
        requestScript: dwr2script.transformRequest(request),
        responseScript: dwr2script.transformResponse(response)
      }
    };

    sandbox.contentWindow.postMessage(message, '*');
  };

  var getUrlKeyWord = function (url) {
    return url.substr(url.lastIndexOf('/') + 1);
  };

  chrome.devtools.network.onRequestFinished.addListener(function (req) {
    if (isDwrRequest(req)) {
      req.getContent(function (content) {
        var dwr = {
          har: req,
          name: getUrlKeyWord(req.request.url),
          request: req.request.postData.text,
          response: content
        };
        dwrTempStorage[++dwrIndex] = dwr;
        // todo: it's better to implement using promise.
        // like: parseDWR(dwr).done(function(){...});
        parseDWR(req.request.postData.text, content, dwrIndex);
      });
    }
  });

  chrome.devtools.network.onNavigated.addListener(function () {
    $scope.$apply(function() {
      // $scope.content = [];
      $scope.selectedDWR = null;
      $scope.dwrs = [];
    });
  });

  window.addEventListener('message', function (event) {
    var message = event.data;
    if (message.type === 'parseDWRResult') {
      var dwr = dwrTempStorage[message.data.index];
      dwr.parsedRequest = message.data.parsedRequest;
      dwr.parsedResponse = message.data.parsedResponse;
      $scope.$apply(function () {
        $scope.dwrs.push(dwr);
      });
      delete dwrTempStorage[message.data.index];
    }
  });

}]);
