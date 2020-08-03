const nodemailer = require('nodemailer');

exports.sendMail = (res) => {
    // Email Styling
    const htmlEmail = `
        <h3>Daily Scan Results</h3>
        <p>Discounts found: ${res.discounts}</p>
        <p>Games scanned: ${res.gamesScanned}</p>
        <p>Scan duration: ${res.duration[0]}s ${res.duration[1] / 1000000}ms</p>
        <br/>
        <h4>Scan Issues</h2>
        <p>Games not scanned: ${res.scanErrors}</p>
    `

    // Mail Authentication
    var transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
            user: process.env.USER,
            pass: process.env.PASS
        }
    });

    transporter.verify((error, success) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Server is ready to take messages');
        }
    });

    var mail = {
        from: process.env.EMAIL,
        to: 'benedict.marien@gmail.com',
        subject: 'Gamescount Daily Scan',
        html: htmlEmail
    }

    transporter.sendMail(mail, (err, data) => {
        if (err) {
            return console.log(err);
        } else {
            console.log('Message sent!');
        }
    });
}