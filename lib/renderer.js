var phantom = require('./phantom.js');
var Jimp = require("jimp");

//

module.exports.render = function(url, filename, viewportSize) {

    var settings = ['--ignore-ssl-errors=yes', '--load-images=yes'];

    return phantom.create(settings).then(function(instance) {

        return phantom.createPage(instance).then(function(page) {

            var rendered = false;

            // EXCLUSION -------------------------------------------------------

            page.on('onResourceRequested', true, function(requestData, networkRequest, filename) {
                var exclusions = ['ember-cli-live-reload', 'livereload.js','bugsnag', 'pusher','google-analytics.com','facebook.net','intercom.io', 'intercomcdn', 'google'];
                for ( var i=0; i < exclusions.length; i += 1 ) {
                    if ( requestData.url.indexOf(exclusions[i]) !== -1 ) {
                       networkRequest.abort();
                    }
                }
            }, filename);

            // VIEWPORTSIZE -----------------------------------------------------

            if ( !viewportSize ) { viewportSize = { width:1360, height:800 }; }

            return phantom.property(page, 'viewportSize', viewportSize).then(function() {

                // JAVASCRIPT

                return phantom.property(page, 'localToRemoteUrlAccessEnabled', true).then(function() {

                    // URL

                    if ( url.indexOf('?') !== -1 ) { url = url + '&renderer=true'; } else { url = url + '?renderer=true'; }

                    return phantom.open(page, url).then(function(status) {

                        if ( status !== 'success' ) {

                            return Promise.reject({});

                        } else {

                            return image(instance, page, viewportSize, filename).then(function(result) {

                                page.close();
                                instance.exit();

                                return Promise.resolve(result);

                            });

                        }

                    });

                });

            }).catch(function(error) {

                page.close();

                return Promise.reject(error);

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

function image(instance, page, viewportSize, filename) {

    return listener(instance, page).then(function() {

        return phantom.evaluate(page, function() { return document.body.offsetHeight; }).then(function(height){

            return phantom.property(page, 'viewportSize', { width: viewportSize.width, height: height }).then(function() {

                return phantom.render(page, filename, { format: 'jpeg', quality: '100' } ).then(function() {

                    return analyse(filename).then(function() {

                        return Promise.resolve(filename);

                    });

                });

            });

        });

    });

}

function analyse(filename) {

    return new Promise(function(resolve, reject) {

        Jimp.read(filename, function (error, image) {

            if ( error ) {
                reject(error);
            } else {

                var sampeList = [ { x: 10, y:10 }, { x: 100, y:100 }, { x: 200, y:200 }];
                var counter = 0;

                for (var i = 0; i < sampeList.length; i++) {

                    var color = image.getPixelColor(sampeList[i].x, sampeList[i].y);

                    if ( color <= 10 ) {
                        counter = counter + 1;
                    }

                }

                if ( counter === sampeList.length ) {
                    reject({ message: 'only black' });
                } else {
                    resolve(filename);
                }

            }

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

function listener(instance, page) {

    return new Promise(function(resolve, reject) {

        var completed = false;

        setTimeout(function() {

            if ( completed === false ) {

                completed = true;

                reject({ message: 'timeout'} );
            }

        }, 10000);

        page.on('onConsoleMessage', function(msg){

            if ( msg === 'renderComplete') {

                if ( completed === false ) {

                    completed = true;
                    resolve();

                }

            }

        });

    });

}
