var phantom = require('phantom');

module.exports.create = function(settings) {

    return new Promise(function(resolve, reject) {

        phantom.create(settings).then(function(result) {
            resolve(result);
        }).catch(function(error) {
            reject(error);
        });

    });

};

module.exports.createPage = function(instance) {

    return new Promise(function(resolve, reject) {

        instance.createPage().then(function(result) {
            resolve(result);
        }).catch(function(error) {
            reject(error);
        });

    });

};

module.exports.property = function(page, name, object) {

    return new Promise(function(resolve, reject) {

        page.property(name, object).then(function(result) {
            resolve(result);
        }).catch(function(error) {
            reject(error);
        });

    });

};

module.exports.open = function(page, url) {

    return new Promise(function(resolve, reject) {

        page.open(url).then(function(result) {
            resolve(result);
        }).catch(function(error) {
            reject(error);
        });

    });

};

module.exports.evaluate = function(page, func) {

    return new Promise(function(resolve, reject) {

        page.evaluate(func).then(function(result) {
            resolve(result);
        }).catch(function(error) {
            reject(error);
        });

    });

};

module.exports.render = function(page, filename, settings) {

    return new Promise(function(resolve, reject) {

        page.render(filename, settings).then(function(result) {
            resolve(result);
        }).catch(function(error) {
            reject(error);
        });

    });

};

module.exports.property = function(page, name, settings) {

    return new Promise(function(resolve, reject) {

        page.property(name, settings).then(function(result) {
            resolve(result);
        }).catch(function(error) {
            reject(error);
        });

    });

};
