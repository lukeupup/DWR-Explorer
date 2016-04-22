angular.module('ngResizer', []).directive('ngResizer', function($document) {

  var $ = function () {
    return angular.element(document.querySelectorAll.apply(document, arguments));
  };

  return function($scope, $element, $attrs) {

    $element.on('mousedown', function(event) {
      event.preventDefault();

      $document.on('mousemove', mousemove);
      $document.on('mouseup', mouseup);
    });

    function mousemove(event) {

      if ($attrs.ngResizer == 'vertical') {
        // Handle vertical resizer
        var x = event.pageX;

        if ($attrs.ngResizerMax && x > $attrs.ngResizerMax) {
          x = parseInt($attrs.ngResizerMax);
        }

        // if ($attrs.ngResizerLeftMin && x < $attrs.ngResizerLeftMin) {
        //   x = parseInt
        // }

        $element.css({
          left: x - 3 + 'px'
        });

        $($attrs.ngResizerLeft).css({
          width: x + 'px'
        });
        $($attrs.ngResizerRight).css({
          left: x + 'px'
        });

      } else {
        // Handle horizontal resizer
        var y = window.innerHeight - event.pageY;

        $element.css({
          bottom: y + 'px'
        });

        $($attrs.ngResizerTop).css({
          bottom: (y + parseInt($attrs.ngResizerHeight)) + 'px'
        });
        $($attrs.ngResizerBottom).css({
          height: y + 'px'
        });
      }
    }

    function mouseup() {
      $document.unbind('mousemove', mousemove);
      $document.unbind('mouseup', mouseup);
    }
  };
});