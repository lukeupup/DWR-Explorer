window.addEventListener('message', function(event) {
  var message = event.data;
  if (message.type === 'evalScript') {
    var result, error;
    try {
      result = eval(message.data.script);
    } catch (e) {
      error = e.toString();
    }
    window.parent.postMessage({
      type: 'evalScriptResult',
      data: {
        index: message.data.index,
        result: result,
        error: error
      }
    }, '*');
  }
});