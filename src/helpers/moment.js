const Handlebars = require('Handlebars');
const moment = require('moment');

const helpers = {};

helpers.moment = timestamp => moment(timestamp).format('DD/MMM/YY-LT');

helpers.time = timestamp => moment(timestamp).format('LT');

// Funcion de prueba para uso de condicionales en handlebars
helpers.when = function(operand_1, operator, operand_2, options) {
    let operators = {
     eq: (a,b) => a == b,
     noteq: (a,b) => a != b,
     gt: (a,b) => Number(a) > Number(b),
     or: (a,b) => a || b,
     and: (a,b) => a && b,
     '%': (a,b) => (a % b) === 0
    }
    let result = operators[operator];
    result(operand_1,operand_2);

    // console.log('inicio', operand_1, 'fin');
    if (result) return options.fn(this);
    else  return options.inverse(this);
}

module.exports = helpers;

