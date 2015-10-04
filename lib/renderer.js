var phantom = require('phantom');

phantom.create({parameters: {'load-images': 'no'}}, function(ph) {

    ph.createPage(function(page) {

        page.set('settings.loadImages', false);
        page.set('viewportSize', {width:640,height:480});

        page.onResourceRequested(function(data, request) {

            if ( data['url'].indexOf('socket.io') !== -1 || data['url'].indexOf('facebook') !== -1 || data['url'].indexOf('intercom') !== -1 || data['url'].indexOf('google') !== -1 ) {
                request['abort()']();
            }

        });

        page.set('onResourceReceived', function(response) {
            if ( response.url ) {
                console.log(response.url);
            }
        });

        page.set('onLoadStarted', function () {
            console.log("Loading started");
        });

        page.set('onConsoleMessage', function (msg) {
            console.log("Phantom Console: " + msg);
        });

    //document.addEventListener('XContentReady', function() {
    //    console.log('ready')
    //});

        page.set('onLoadFinished', function(status) {

            if ( status === 'fail' ) {

            } else if ( status === 'success' ) {

            }

            console.log("Loading finished, the page is " + status);

        });

        page.open("http://saluq.dev/account/", function(status) {

            //console.log(status);

            page.evaluate(function() { return document.documentElement.outerHTML; }, function(result) {

                console.log(result);

                ph.exit();

            });

        });

    });

});
