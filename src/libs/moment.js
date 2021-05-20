var moment = require('moment');

const helpers = {};

helpers.moment = (timestamp) => {
    return moment(timestamp).format('DD/MMM/YY-LT');
};

module.exports = helpers;