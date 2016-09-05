var phantom = require('phantom');

module.exports.render = function(url, filename, viewportSize) {

    return new Promise(function(resolve, reject) {

        var rendered = false;

        var settings = ['--ignore-ssl-errors=yes', '--load-images=no'];

        if ( filename ) {
            settings = ['--ignore-ssl-errors=yes', '--load-images=yes'];
        }

        phantom.create().then(function(instance) {

            instance.createPage().then(function(page) {

                // ON RESOURCE REQUESTED

                page.on('onResourceRequested', true, function(requestData, networkRequest) {
                    var exclusions = ['pusher','google-analytics.com','facebook.net', 'fonts.googleapis.com','fonts.gstatic.com','intercom.io', 'intercomcdn', 'google'];
                    if ( filename ) {
                        exclusions = ['fonts.googleapis.com','fonts.gstatic.com','google'];
                    }
                    for ( var i=0; i < exclusions.length; i += 1 ) {
                        if ( requestData.url.indexOf(exclusions[i]) !== -1 ) {
                           networkRequest.abort();
                        }
                    }
                });

                // ON RESOURCE RECEIVED

                //page.property('onResourceReceived', function(requestData, networkRequest) {
                   //console.log("received", requestData.url);
                //});

                // ON CONSOLE MASSAGE

                page.on('onConsoleMessage', function(msg) {

                    if ( msg === 'renderComplete' ) {

                        setTimeout(function() {

                            if ( filename ) {

                                page.evaluate(function() {

                                    return document.body.offsetHeight;

                                }).then(function(height){

                                    page.property('viewportSize', { width: 1280, height: height }).then(function() {

                                        page.render(filename, { format: 'jpeg', quality: '100' } ).then(function() {

                                            rendered = true;

                                            page.close();
                                            instance.exit();

                                            resolve(filename);

                                        });

                                    }).catch(function(error) {
                                        reject(error);
                                    });

                                }).catch(function(error) {
                                    reject(error);
                                });

                            } else { // HTML OUTPUT ----------------------------

                                page.property('content').then(function(content) {

                                    rendered = true;

                                    if ( content.indexOf('<!-- SCRIPT !-->') !== -1 ) {
                                        var array = content.split('<!-- SCRIPT !-->');
                                        content = array[0].toString() + array[2].toString();
                                    }

                                    page.close();
                                    instance.exit();

                                    resolve(content);

                                }).catch(function(error) {
                                    reject(error);
                                });

                            }

                        }, 200);

                    }

                });

                //page.property('onLoadFinished', function(status) {

                //});

                //

                if ( !viewportSize ) {
                    viewportSize = { width:1280, height:640 };
                }

                page.property('viewportSize', viewportSize);
                page.property('localToRemoteUrlAccessEnabled', true);

                //

                if ( url.indexOf('?') !== -1 ) {
                    url = url + '&renderer=true';
                } else {
                    url = url + '?renderer=true';
                }

                page.open(url).then(function(status) {

                    if ( status !== 'success' ) {
                        reject(status);
                    }

                }).catch(function(error) {
                    reject(error);
                });

                setTimeout(function() {
                    if ( rendered === false ) {
                        try {
                            page.close();
                            instance.exit();
                            reject({ error: 'timeout' });
                        } catch (error) {
                            reject(error);
                        }
                    }
                }, 25000);

            }).catch(function(error) {
                reject(error);
            });
        }).catch(function(error) {
            reject(error);
        });

    });

};
