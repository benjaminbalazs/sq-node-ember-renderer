var phantom = require('phantom');

module.exports.render = function(url, delay) {

    return new Promise(function(resolve, reject) {

        var rendered = false;

        phantom.create(['--ignore-ssl-errors=yes', '--load-images=no', '--user-agent=sq-node-ember-renderer']).then(function(instance) {

            instance.createPage().then(function(page) {

                // ON RESOURCE REQUESTED

                page.on('onResourceRequested', true, function(requestData, networkRequest) {
                    var exclusions = ['pusher','google-analytics.com','facebook.net', 'fonts.googleapis.com','fonts.gstatic.com','intercom.io', 'intercomcdn', 'google'];
                    for ( var i=0; i < exclusions.length; i += 1 ) {
                        if ( requestData.url.indexOf(exclusions[i]) !== -1 ) {
                           networkRequest.abort();
                        }
                    }
                });

                // ON RESOURCE RECEIVED

                page.property('onResourceReceived', function(requestData, networkRequest) {
                   console.log("received", requestData.url);
                });

                // ON CONSOLE MASSAGE

                page.on('onConsoleMessage', function(msg) {
                    console.log(msg);
                    if ( msg === 'renderComplete' ) {

                        setTimeout(function() {

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

                        }, 100);

                    }

                });

                page.property('onLoadFinished', function(status) {
                    console.log('onLoadFinished');
                });

                //

                page.property('viewportSize', { width:1280, height:640 });

                //page.property('userAgent', 'sq-node-ember-renderer');
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
