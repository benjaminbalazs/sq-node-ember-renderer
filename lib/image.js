var phantom = require('./phantom.js');

//

module.exports.render = function(url, filename, viewportSize) {

    var settings = ['--ignore-ssl-errors=yes', '--load-images=yes'];

    return phantom.create(settings).then(function(instance) {

        return phantom.createPage(instance).then(function(page) {

            return phantom.property(page, 'javascriptEnabled', false).then(function() {

                var rendered = false;

                // EXCLUSION -------------------------------------------------------

                page.on('onResourceRequested', true, function(requestData, networkRequest, filename) {

                    if ( requestData.url.indexOf('.js') !== -1 ) {
                        networkRequest.abort();
                    } else {
                        var exclusions = ['ember-cli-live-reload', 'livereload.js', 'bugsnag', 'pusher','google-analytics.com','facebook.net','intercom.io', 'intercomcdn', 'google'];
                        for ( var i=0; i < exclusions.length; i += 1 ) {
                            if ( requestData.url.indexOf(exclusions[i]) !== -1 ) {
                                networkRequest.abort();
                            }
                        }
                    }

                }, filename);

                // VIEWPORTSIZE -----------------------------------------------------

                if ( !viewportSize ) { viewportSize = { width:1280, height:640 }; }

                return phantom.property(page, 'viewportSize', viewportSize).then(function() {

                    // JAVASCRIPT

                    return phantom.property(page, 'localToRemoteUrlAccessEnabled', true).then(function() {

                        // URL

                        if ( url.indexOf('?') !== -1 ) { url = url + '&fastboot=true'; } else { url = url + '?fastboot=true'; }

                        return phantom.open(page, url).then(function(status) {

                            if ( status !== 'success' ) {

                                return Promise.reject({});

                            } else {

                                return phantom.evaluate(page, function() { return document.body.offsetHeight; }).then(function(height){

                                    return phantom.property(page, 'viewportSize', { width: viewportSize.width, height: height }).then(function() {

                                        return phantom.render(page, filename, { format: 'jpeg', quality: '100' } ).then(function() {

                                            page.close();
                                            instance.exit();

                                            return Promise.resolve(filename);

                                        });

                                    });

                                });

                            }

                        });

                    });

                }).catch(function(error) {

                    page.close();

                    return Promise.reject(error);

                });

            });

        }).catch(function(error) {

            instance.exit();

            return Promise.reject(error);

        });

    }).catch(function(error) {

        console.log(error);

        return Promise.reject(error);

    });

};
