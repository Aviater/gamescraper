const { Logger } = require('./logger');

const handler = (req, res, next) => {
    Logger.verbose(`Client navigation event detected`);
    next();
}

module.exports = handler;