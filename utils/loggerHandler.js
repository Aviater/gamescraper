const { loggers } = require("winston")

const { Logger } = require('./logger');

const handler = (req, res, next) => {
    console.log('HANDLED');
    next();
    // try {
    //     Logger.warn('Logging started');
    //     func(req, res, logger);
    // } catch(e) {
    //     Logger.error('Logging failed!');
    //     res.send('Something went wrong...')
    // }
}

module.exports = handler;