'use strict';

var app = angular.module('dwrexplorer', ['ngClipboard'])
  .run(['$rootScope', '$document', function ($rootScope, $document) {
    $rootScope.dwrs = [];

    var sandbox = $document[0].querySelector('#sandbox');

    var isDwrRequest = function (req) {
      return (req && req.request && /\.dwr$/.test(req.request.url));
    };

    var parseResponseContent = function (content, name) {
      var message = {
        name: name
      };

      message.dwrContent = content
        .replace(/throw.*\r/, '')
        .replace(/dwr\.engine\.(_remoteHandleCallback|_remoteHandleException)\(('\d+'),('\d+'),(.*)\)/, 'result = $4');

      sandbox.contentWindow.postMessage(message, '*');
    };

    var getUrlKeyWord = function (url) {
      return url.substr(url.lastIndexOf('/') + 1);
    };

    chrome.devtools.network.onRequestFinished.addListener(function (req) {
      if (isDwrRequest(req)) {
        var name = getUrlKeyWord(req.request.url);
        req.getContent(function (content) {
          parseResponseContent(content, name);
        });
      }
    });

    chrome.devtools.network.onNavigated.addListener(function () {
      $rootScope.$apply(function() {
        $rootScope.content = []
        $rootScope.dwrs = [];
      });
    });

    window.addEventListener('message', function (event) {
      var data = event.data;
      $rootScope.$apply(function () {
        if (data.name) {
          $rootScope.dwrs.push({
            name: data.name,
            res: data.dwrObject
          });
        }
      });
    });
  }]);
