'use strict';

var app = angular.module('dwrexplorer', ['ngClipboard', 'ngResizer', 'ngObject']);

app.controller('AppController', ['$scope', '$document', '$timeout', function($scope, $document, $timeout) {
  $scope.filterPattern = '';
  $scope.dwrs = [];
  $scope.selectEntry = function (dwr, event) {
    if (event) {
      event.preventDefault();
    }
    $scope.selectedDWR = dwr;
  };
  $scope.clearItems = function() {
    $scope.dwrs = [];
    $scope.selectedDWR = null;
  };
  $scope.isVisible = function(dwr) {
    var regExp;
    if ($scope.filterPattern === '') {
      regExp = new RegExp('.*', 'i');
    } else {
      regExp = new RegExp($scope.filterPattern, 'i');
    }
    return dwr.har.request.url.search(regExp) >= 0;
  };
  $scope.switchTab  = function (tab) {
    $scope.currentTab = tab;
  };
  $scope.isCurrentTab = function (tab) {
    return $scope.currentTab === tab;
  };
  $scope.toggleRequestHintDetail = function () {
    $scope.showRequestHintDetail = !$scope.showRequestHintDetail;
  };
  $scope.getShowRequestHintDetail = function () {
    return !!$scope.showRequestHintDetail;
  };

  $scope.switchTab('RESPONSE');

  var sandbox = $document[0].querySelector('#sandbox');
  var dwr2script = window.dwr2script;
  var messageIndex = 0;
  var evalScriptResolvers = {};

  var isDwrRequest = function (req) {
    return (req && req.request && /\.dwr$/.test(req.request.url));
  };

  var getUrlKeyWord = function (url) {
    return url.substr(url.lastIndexOf('/') + 1);
  };

  var parseDWR = function (type, dwrBody) {
    messageIndex += 1;
    var promise = new Promise(function (resolve, reject) {
      var script = dwr2script[type === 'request' ? 'transformRequest' : 'transformResponse'](dwrBody);
      sandbox.contentWindow.postMessage({
        type: 'evalScript',
        data: {
          index: messageIndex,
          script: script
        }
      }, '*');
      evalScriptResolvers[messageIndex] = {
        resolve: resolve,
        reject: reject
      };
    });
    return promise;
  };

  var getResponse = function (req) {
    var promise = new Promise(function (resolve, reject) {
      req.getContent(function (content) {
        resolve(content);
      });
    });
    return promise;
  };

  /**
   * Try to get the parameters' name from the inspected window.
   * 
   * The request url must be like:
   * .../someControllerProxy.someMethod.dwr
   * and we must have a javascript method:
   * window.someControllerASProxy.someMethod
   * Otherwise we can't get the parameter's name.
   * 
   * And if this controller is defined in a frame window, we can't get the
   * parameters, either.
   */
  var getRequestParamName = function (url) {
    var promise = new Promise(function (resolve, reject) {
      var urlMatch = url.match(/.*?(\w+)(Proxy)\.(\w+)\.dwr$/);
      if (urlMatch) {
        var functionName = urlMatch[1] + 'AS' + urlMatch[2] + '.' + urlMatch[3];
      }
      chrome.devtools.inspectedWindow.eval(functionName + '.toString()', function (result, exceptionInfo) {
        if (exceptionInfo) {
          reject();
        } else {
          var methodMatch = result.match(/dwr\.engine\._execute\(([^\)]*)\)/);
          if (!methodMatch) {
            reject();
          } else {
            // pick up the param name from the 4th param to the last but one.
            try {
              var paramList = methodMatch[1].split(',').slice(3,-1).map(function (param) {
                return param.trim()
              });
            } catch (e) {
              reject();
            }
            resolve(paramList);
          }
        }
      });
    });
    return promise;
  };

  var addEntry = function (req) {
    if (!isDwrRequest(req)) {
      return;
    }
    var dwr = {
      har: req,
      name: getUrlKeyWord(req.request.url),
      request: req.request.postData.text
    };
    $scope.$apply(function () {
      $scope.dwrs.push(dwr);
      if (!$scope.selectedDWR) {
        $scope.selectEntry(dwr);
      }
    });

    parseDWR('request', req.request.postData.text).then(function (result) {
      $scope.$apply(function () {
        dwr.parsedRequest = result;
      });
    }).catch(function (error) {
      // TODO
    });

    getRequestParamName(req.request.url).then(function (params) {
      $scope.$apply(function () {
        dwr.requestParameters = params;
      });
    });

    getResponse(req).then(function (response) {
      $scope.$apply(function () {
        dwr.response = response;
      });
      return parseDWR('response', response);
    }).then(function (result) {
      $scope.$apply(function () {
        dwr.parsedResponse = result;
      });
    }).catch(function (error) {
      // TODO
    });

    $timeout(function () {
      var container = $document[0].querySelector('.J_EntriesContainer');
      container.scrollTop = container.scrollHeight;
    }, 0, false);
  };

  window.addEventListener('message', function (event) {
    var message = event.data;
    if (message.type === 'evalScriptResult') {
      var resolvers = evalScriptResolvers[message.data.index];
      if (message.data.error) {
        resolvers.reject(message.data.error);
      } else {
        resolvers.resolve(message.data.result);
      }
    }
  });

  chrome.devtools.network.onRequestFinished.addListener(function (req) {
    addEntry(req);
  });

  chrome.devtools.network.onNavigated.addListener(function () {
    $scope.$apply(function() {
      $scope.selectedDWR = null;
      $scope.dwrs = [];
    });
  });

  chrome.devtools.network.getHAR(function (hars) {
    hars.entries.forEach(function (req) {
      addEntry(req);
    });
  });

}]);
