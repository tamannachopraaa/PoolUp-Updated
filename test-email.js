require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('Testing Gmail Configuration...\n');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***hidden***' : 'NOT SET');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Test connection
transporter.verify((error, success) => {
    if (error) {
        console.error('\n❌ Connection Failed:');
        console.error(error.message);
        console.log('\n📋 Troubleshooting Steps:');
        console.log('1. Enable "Less secure app access": https://myaccount.google.com/lesssecureapps');
        console.log('2. OR use an App Password instead: https://myaccount.google.com/apppasswords');
        console.log('3. Make sure EMAIL_USER and EMAIL_PASS are correct in .env');
        process.exit(1);
    } else {
        console.log('\n✅ Connection Successful!');
        console.log('\nSending test email...');

        const testEmail = {
            from: `"PoolUp Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: 'PoolUp Email Service Test',
            html: `
                <h2>Test Email from PoolUp</h2>
                <p>If you received this email, your email configuration is working correctly!</p>
                <p><strong>From:</strong> ${process.env.EMAIL_USER}</p>
                <p><strong>Service:</strong> Gmail via Nodemailer</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            `
        };

        transporter.sendMail(testEmail, (error, info) => {
            if (error) {
                console.error('\n❌ Email Send Failed:');
                console.error(error.message);
                process.exit(1);
            } else {
                console.log('\n✅ Test email sent successfully!');
                console.log('Response:', info.response);
                console.log('\nCheck your inbox (and spam folder) for the test email.');
                process.exit(0);
            }
        });
    }
});
