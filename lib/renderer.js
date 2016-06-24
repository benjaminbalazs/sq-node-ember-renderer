//

var phantom = require('phantom');

//

module.exports.render = function(url, options) {

    if ( !options ) {
        options = {};
    }

    return phantom.create(['--ignore-ssl-errors=yes', '--load-images=no']).then(function(instance) {

        return instance.createPage().then(function(page) {

            page.on('onResourceRequested', true, function(requestData, networkRequest) {

                if ( options.exclusions ) {

                    for ( var i=0; i < options.exclusions.length; i += 1 ) {
                       if ( requestData.url.indexOf(options.exclusions[i]) !== -1 ) {
                            networkRequest.abort();
                        }
                    }
                }
            });
            
            page.property('onResourceReceived', function(requestData, networkRequest) {
                console.log(requestData.url);
            });

            page.property('onConsoleMessage', function(msg) {
                //console.log(msg);
            });

            page.property('onLoadFinished', function(status) {
                console.log('onLoadFinished');
            });

            return page.open(url).then(function(status) {

                return page.property('content').then(function(content) {

                    var em = content;

                    page.close();
                    instance.exit();
                    console.log(em);
                    return Promise.resolve(em);

                });

            });

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
