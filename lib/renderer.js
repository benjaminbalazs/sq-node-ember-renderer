var phantom = require('phantom');

module.exports.render = function(url, delay) {

    return new Promise(function(resolve, reject) {

        phantom.create(['--ignore-ssl-errors=yes', '--load-images=no']).then(function(instance) {

            instance.createPage().then(function(page) {

                _page = page;

                page.on('onResourceRequested', true, function(requestData, networkRequest) {

                    var exclusions = ['google-analytics.com','facebook.net', 'fonts.googleapis.com','fonts.gstatic.com','intercom.io', 'intercomcdn', 'google'];
                    //exclusions = ['google-analytics.com', 'facebook.net','fonts.googleapis.com'];

                    for ( var i=0; i < exclusions.length; i += 1 ) {
                        if ( requestData.url.indexOf(exclusions[i]) !== -1 ) {
                           networkRequest.abort();
                        }
                    }


                });

                //page.property('onResourceReceived', function(requestData, networkRequest) {
                  // console.log(requestData.url, _page);
                //});

                page.property('onConsoleMessage', function(msg, log) {
                });

                page.property('onLoadFinished', function(status) {
                    //console.log('onLoadFinished');
                });

                //

                page.property('viewportSize', { width:1280, height:640 });

                //

                page.open(url).then(function(status) {

                    if ( status === 'success' ) {

                        setTimeout(function() {

                            page.property('content').then(function(content) {

                                page.close();
                                instance.exit();

                                resolve(content);

                            });

                        }, delay);
                    } else {
                        reject(status);
                    }

                }).catch(function(error) {
                    reject(error);
                });
            }).catch(function(error) {
                reject(error);
            });
        }).catch(function(error) {
            reject(error);
        });

    });

};
