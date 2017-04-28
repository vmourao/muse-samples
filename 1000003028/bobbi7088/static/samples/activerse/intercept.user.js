
(function() {
  // URL Inteceptor + redirector

  console.log('Activities - Interceptor')
  targetUrl = "/files/muse-static/samples/activerse/index_vue.html" + location.search + location.hash;
  
  console.log("Replacing activities with: " + targeturl);
  
  location.replace(targetUrl);
  
})();
