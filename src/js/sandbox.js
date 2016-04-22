window.addEventListener('message', function(event) {
  var request, response;
  try {
    request = eval(event.data.requestScript);
  } catch (e) {
    console.log(e);
  }
  try {
    response = eval(event.data.responseScript);
  } catch (e) {
    console.log(e);
  }
  window.parent.postMessage({
    parsedRequest: request,
    parsedResponse: response,
    name: event.data.name
  }, '*');
});