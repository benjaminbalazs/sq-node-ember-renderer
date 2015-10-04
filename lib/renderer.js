//

var phantom = require('phantom');

//

module.exports.render = function(url, options) {

    if ( options ) {
        options = {};
    }

    //

    var exclusions;
    if ( !options.exclusions ) {
        exclusions = [];
    } else {
        exclusions = options.exclusions;
    }

    var inclusions;
    if ( !options.inclusions ) {
        inclusions = [];
    } else {
        inclusions = options.inclusions;
    }

    var viewport;
    if ( !options.viewport ) {
        viewport = { width:640, height:480 };
    } else {
        viewport = options.viewport;
    }

    //

    return new Promise(function(resolve, reject) {

        phantom.create(function(ph) {
            if ( !ph ) {
                reject({ error: "phantomjs doesn't exist" });
            } else {

                ph.createPage(function(page) {

                    page.set('settings.loadImages', false);
                    page.set('viewportSize', viewport);

                    // EXCLUSIONS
                    page.onResourceRequested(function(data, request) {
                        if ( excluded( data.url, exclusions ) ) {
                            request['abort()']();
                        }
                        if ( inclusions.length !== 0 ) {
                            if ( included( data.url, inclusions ) === false ) {
                                request['abort()']();
                            }
                        }
                    });

                    page.set('onResourceReceived', function(response) {
                        if ( response.url ) {
                            console.log(response.url);
                        }
                    });

                    //page.set('onLoadStarted', function () {
                    //    console.log("Loading started");
                    //});

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

                            ph.exit();

                            resolve(result);

                        });

                    });

                });

            }
        });




    });

};

function excluded(url, list) {

    for ( var i=0; i < list.length; i += 1 ) {
        if ( url.indexOf(list[i]) !== -1 ) {
            return true;
        }
    }
    return false;

}

function included(url, list) {

    for ( var i=0; i < list.length; i += 1 ) {
        if ( url.indexOf(list[i]) ) {
            return true;
        }
    }
    return false;

}
