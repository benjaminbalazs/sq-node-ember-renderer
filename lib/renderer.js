

var phantom = require('phantom');

//

module.exports.render = function(url, filename, viewportSize) {

    var settings = ['--ignore-ssl-errors=yes', '--load-images=no'];
    if ( filename ) { settings = ['--ignore-ssl-errors=yes', '--load-images=yes']; }

    return phantom.create(settings).then(function(instance) {

        return instance.createPage().then(function(page) {

            var rendered = false;

            // EXCLUSION -------------------------------------------------------

            page.on('onResourceRequested', true, function(requestData, networkRequest, filename) {
                var exclusions = ['ember-cli-live-reload', 'livereload.js','bugsnag', 'pusher','google-analytics.com','facebook.net','fonts.googleapis.com','fonts.gstatic.com','intercom.io', 'intercomcdn', 'google'];
                if ( filename ) {
                    exclusions = ['ember-cli-live-reload', 'livereload.js','bugsnag', 'pusher','google-analytics.com','facebook.net','intercom.io', 'intercomcdn', 'google'];
                }
                for ( var i=0; i < exclusions.length; i += 1 ) {
                    if ( requestData.url.indexOf(exclusions[i]) !== -1 ) {
                       networkRequest.abort();
                    }
                }
            }, filename);

            // ON RESOURCE RECEIVED --------------------------------------------

            page.property('onResourceReceived', function(requestData, networkRequest) {
               //console.log("Phantom: ", requestData.url);
            });

            // VIEWPORTSIZE -----------------------------------------------------

            if ( !viewportSize ) { viewportSize = { width:1280, height:640 }; }

            return page.property('viewportSize', viewportSize).then(function() {

                // JAVASCRIPT

                return page.property('localToRemoteUrlAccessEnabled', true).then(function() {

                    // URL

                    if ( url.indexOf('?') !== -1 ) { url = url + '&renderer=true'; } else { url = url + '?renderer=true'; }

                    return page.open(url).then(function(status) {

                        if ( status !== 'success' ) {

                            return Promise.reject({});

                        } else {

                            if ( filename ) {

                                return image(page, viewportSize, filename).then(function(result) {

                                    page.close();
                                    instance.exit();

                                    return Promise.resolve(result);

                                });

                            } else {

                                return html(page).then(function(result) {

                                    page.close();
                                    instance.exit();

                                    return Promise.resolve(result);

                                });

                            }

                        }

                    });

                });

            });

        });

    }).catch(function(error) {

        console.log(error);

        return Promise.reject(error);

    });

};

function image(page, viewportSize, filename) {

    return listener(page).then(function() {

        return page.evaluate(function() { return document.body.offsetHeight; }).then(function(height){

            return page.property('viewportSize', { width: viewportSize.width, height: height }).then(function() {

                return page.render(filename, { format: 'jpeg', quality: '100' } ).then(function() {

                    return Promise.resolve(filename);

                });

            }).catch(function(error) {

                return Promise.reject(error);

            });

        }).catch(function(error) {

            return Promise.reject(error);

        });

    });

}

function html(page) {

    return listener(page).then(function() {

        return page.property('content').then(function(content) {

            content = clean(content, '<!-- SCRIPT !-->');
            content = clean(content, '<!-- DATA !-->');

            content = clean(content, '<!-- EMBEDS !-->');

            return Promise.resolve(content);

        }).catch(function(error) {

            return Promise.reject(error);

        });

    });

}

function clean(content, tag) {

    if ( content.indexOf(tag) !== -1 ) {
        var array = content.split(tag);
        content = array[0] + array[2];
    }

    return content;

}

function listener(page) {

    return new Promise(function(resolve, reject) {

        var completed = false;
        
        page.on('onConsoleMessage', function(msg){

            setTimeout(function() {

                completed = true;
                reject({ message: 'timeout console'} );

            }, 5000);

            if ( msg === 'renderComplete') {

                if ( completed === false ) {

                    completed = true;
                    resolve();

                }

            }

        });

    });

}
