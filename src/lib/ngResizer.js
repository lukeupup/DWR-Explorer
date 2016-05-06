angular.module('ngResizer', []).directive('ngResizer', function($document) {

  var $ = function () {
    return angular.element(document.querySelectorAll.apply(document, arguments));
  };

  return function($scope, $element, $attrs) {
    var initStyle;
    if ($attrs.ngResizer === 'vertical') {
      initStyle = {
        width: $attrs.ngResizerWidth + 'px',
        top: '0',
        bottom: '0',
        left: $($attrs.ngResizerLeft)[0].clientWidth + 'px'
      };
    } else {
      initStyle = {
        height: $attrs.ngResizerWidth + 'px',
        left: '0',
        right: '0',
        top: $($attrs.ngResizerTop)[0].clientHeight + 'px'
      }
    }

    $element.css(initStyle);

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

        if ($attrs.ngResizerLeftMin && x < $attrs.ngResizerLeftMin) {
          x = parseInt($attrs.ngResizerLeftMin);
        }

        $element.css({
          left: Math.floor(x - $attrs.ngResizerWidth / 2) + 'px'
        });

        $($attrs.ngResizerLeft).css({
          width: x + 'px'
        });
        $($attrs.ngResizerRight).css({
          left: x + 'px'
        });

      } else {
        // Handle horizontal resizer
        // Horizontal resizer is unreliable for now
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