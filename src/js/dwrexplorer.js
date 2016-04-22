'use strict';

var app = angular.module('dwrexplorer', ['ngClipboard'])
  .run(['$rootScope', '$document', function ($rootScope, $document) {
    $rootScope.dwrs = [];

    var sandbox = $document[0].querySelector('#sandbox');

    var dwr2script = window.dwr2script;

    var isDwrRequest = function (req) {
      return (req && req.request && /\.dwr$/.test(req.request.url));
    };

    var parseDWR = function (request, response, name) {
      var message = {
        name: name
      };

      message.requestScript = dwr2script.transformRequest(request);
      message.responseScript = dwr2script.transformResponse(response);

      sandbox.contentWindow.postMessage(message, '*');
    };

    var getUrlKeyWord = function (url) {
      return url.substr(url.lastIndexOf('/') + 1);
    };

    chrome.devtools.network.onRequestFinished.addListener(function (req) {
      if (isDwrRequest(req)) {
        var name = getUrlKeyWord(req.request.url);
        req.getContent(function (content) {
          parseDWR(req.request.postData.text, content, name);
        });
      }
    });

    chrome.devtools.network.onNavigated.addListener(function () {
      $rootScope.$apply(function() {
        $rootScope.content = [];
        $rootScope.dwrs = [];
      });
    });

    window.addEventListener('message', function (event) {
      var data = event.data;
      $rootScope.$apply(function () {
        if (data.name) {
          $rootScope.dwrs.push({
            name: data.name,
            res: data.parsedResponse,
            req: data.parsedRequest
          });
        }
      });
    });
  }]);
