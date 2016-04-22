window.addEventListener('message', function(event) {
  var message = event.data;
  if (message.type === 'parseDWR') {
    var request, response;
    try {
      request = eval(message.data.requestScript);
    } catch (e) {
      console.log(e);
    }
    try {
      response = eval(message.data.responseScript);
    } catch (e) {
      console.log(e);
    }
    window.parent.postMessage({
      type: 'parseDWRResult',
      data: {
        index: message.data.index,
        parsedRequest: request,
        parsedResponse: response
      }
    }, '*');
  }
});