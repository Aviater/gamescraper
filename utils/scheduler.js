const schedule = require('node-schedule');
const mailer = require('./mailer');
const { Logger } = require('./logger');

exports.scheduleScan = (minute, doScan, socket) => {
    const rule = new schedule.RecurrenceRule();
    rule.minute = minute;

    schedule.scheduleJob(rule, () => {
        Logger.info(`Started cron job`);
        doScan(true)
            .then(res => {
                console.log('Scan results:', res);
                mailer.sendMail(res);
                socket.emit('scan-results', res);
            })
            .catch(err => {
                Logger.error(`Automatic scan error: ${err}`)
            });
    });
}