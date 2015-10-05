//

var phantom = require('phantom');

//

module.exports.render = function(url, options) {

    if ( !options ) {
        options = {};
    }

    return create()

    .then(function(ph) {

        return createPage(ph, options)

    .then(function(page) {

            //

            page.onResourceRequested(function(data, request, options) {
                if ( options.exclusions ) {
                    for ( var i=0; i < options.exclusions.length; i += 1 ) {
                       if ( data.url.indexOf(options.exclusions[i]) !== -1 ) {
                            request.abort();
                        }
                    }
                }
            }, function(request) { }, options );

            //

            page.set('onResourceReceived', function(response) {
                if ( response.url ) {
                }
            });

            page.set('onConsoleMessage', function (msg) {
            });

            page.set('onLoadFinished', function(status) {
            });

            //

            return render(ph, page, url);

        });

    });

};

// RENDER ----------------------------------------------------------------------

function render(ph, page, url) {

    return new Promise(function(resolve, reject) {

        page.open(url, function(status) {

            page.evaluate(function() {

                return document.documentElement.outerHTML;

            }, function(result) {

                if ( result.indexOf('assets') === -1 ) {
                    reject(result);
                } else {
                    resolve(result);
                }

                ph.exit();

            });

        });

    });

}

// CREATE ----------------------------------------------------------------------

function create() {

    return new Promise(function(resolve, reject) {
        phantom.create(function(ph) {
            if ( ph ) {
                resolve(ph);
            } else {
                reject({ error: "Phantomjs doesn't exist" });
            }
        });
    });
}

// CREATE PAGE -----------------------------------------------------------------

function createPage(ph, options) {

    var viewport;
    if ( !options.viewport ) {
        viewport = { width:640, height:480 };
    } else {
        viewport = options.viewport;
    }

    return new Promise(function(resolve, reject) {
        ph.createPage(function(page) {
            if ( page ) {
                page.set('settings.loadImages', false);
                page.set('viewportSize', viewport);
                resolve(page);
            } else {
                reject({ error: "Phantomjs doesn't exist" });
            }
        });
    });

}
