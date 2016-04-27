angular.module('ngClipboard', [])

    .factory('ngClipboard', function($compile,$rootScope,$document) {
        var entityMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': '&quot;',
            "'": '&#39;',
            "/": '&#x2F;'
        };
        function escapeHtml(string) {
            return String(string).replace(/[&<>"'\/]/g, function (s) {
                return entityMap[s];
            });
        }
        return {
            toClipboard: function(element){
            element = escapeHtml(element).replace(/\n\r?/g, '<br>').replace(/ /g, '&nbsp;');
            var copyElement = angular.element('<span id="ngClipboardCopyId">'+element+'</span>');
            var body = $document.find('body').eq(0);
            body.append($compile(copyElement)($rootScope));
            
            var ngClipboardElement = angular.element(document.getElementById('ngClipboardCopyId'));
            console.log(ngClipboardElement);
            var range = document.createRange();

            range.selectNode(ngClipboardElement[0]);

            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);

            var successful = document.execCommand('copy');

            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Copying text command was ' + msg);
            window.getSelection().removeAllRanges();

            copyElement.remove();
        }
    }
    })

    .directive('ngCopyable', function() {
        return {
            restrict: 'A',
            link:link
        };
        function link(scope, element, attrs) {
            element.bind('click',function(){

                var range = document.createRange();
                range.selectNode(element[0]);
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(range);
                var successful = document.execCommand('copy');

                var msg = successful ? 'successful' : 'unsuccessful';
                console.log('Copying text command was ' + msg);
                window.getSelection().removeAllRanges();
            });
        }

    });
