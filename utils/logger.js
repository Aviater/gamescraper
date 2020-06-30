const { createLogger, format, transports } = require('winston');

const Logger = createLogger({
    level: 'silly',
    format: format.combine(
        // format.timestamp({
        //     format: 'YYYY-MM-DD HH:mm:ss'
        // }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    transports: [
        //
        // - Write to all logs with level `info` and below to `quick-start-combined.log`.
        // - Write all logs error (and below) to `quick-start-error.log`.
        //
        new transports.File({ filename: './logs/error.log', level: 'error' }),
        new transports.File({ filename: './logs/combined.log' })
    ]
});
  
//
// If we're not in production then **ALSO** log to the `console`
// with the colorized simple format.
//
if (process.env.NODE_ENV !== 'production') {
    Logger.add(new transports.Console({
        format: format.combine(
            format.colorize(),
            format.simple()
        )
    }));
}

exports.Logger =  Logger;