const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify transporter connection and only report failures.
transporter.verify((error) => {
    if (error) {
        console.error('Email transporter error:', error.message);
    }
});

const sendAdminNotification = async (carpool) => {
    const mailOptions = {
        from: `"PoolUp Notification" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: 'New Carpool Offer Created',
        html: `
            <h3>New Carpool Details</h3>
            <p><strong>Car:</strong> ${carpool.carName}</p>
            <p><strong>From/To:</strong> ${carpool.location}</p>
            <p><strong>Time:</strong> ${carpool.time}</p>
            <p><strong>Price:</strong> ₹${carpool.price}</p>
            <p><strong>Seats Available:</strong> ${carpool.totalSeats}</p>
            <p><strong>Gender Pref:</strong> ${carpool.gender}</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (err) {
        console.error('Admin email error:', err.message);
        return false;
    }
};

const sendBookingConfirmation = async (userEmail, userName, carpool, seatsBooked) => {
    const totalPrice = carpool.price * seatsBooked;
    
    const mailOptions = {
        from: `"PoolUp" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: '✅ Booking Confirmed - PoolUp',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50;">Booking Confirmed! 🎉</h2>
                <p>Hi <strong>${userName}</strong>,</p>
                <p>Your ride booking has been successfully confirmed. Here are your booking details:</p>
                
                <div style="background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #2c3e50; margin-top: 0;">Ride Details</h3>
                    <p><strong>Car:</strong> ${carpool.carName}</p>
                    <p><strong>Route:</strong> ${carpool.location}</p>
                    <p><strong>Departure Time:</strong> ${carpool.time}</p>
                    <p><strong>Seats Booked:</strong> ${seatsBooked}</p>
                    <p><strong>Price per Seat:</strong> ₹${carpool.price}</p>
                    <p style="font-size: 18px; color: #27ae60;"><strong>Total Amount:</strong> ₹${totalPrice}</p>
                </div>
                
                <p style="color: #7f8c8d;"><strong>Note:</strong> Please arrive 5-10 minutes before the departure time.</p>
                
                <p>Thank you for using PoolUp! Have a safe journey! 🚗</p>
                
                <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 20px 0;">
                <p style="color: #95a5a6; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (err) {
        console.error('Booking email error:', err.message);
        return false;
    }
};

const sendDriverNotification = async (driverEmail, driverName, carpool, passengerName, seatsBooked) => {
    const mailOptions = {
        from: `"PoolUp" <${process.env.EMAIL_USER}>`,
        to: driverEmail,
        subject: `New Booking Alert - ${seatsBooked} seat(s) booked`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50;">New Booking Notification 📢</h2>
                <p>Hi <strong>${driverName}</strong>,</p>
                <p><strong>${passengerName}</strong> has booked <strong>${seatsBooked}</strong> seat(s) in your ride.</p>
                
                <div style="background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #2c3e50; margin-top: 0;">Booking Summary</h3>
                    <p><strong>Passenger:</strong> ${passengerName}</p>
                    <p><strong>Seats:</strong> ${seatsBooked}</p>
                    <p><strong>Route:</strong> ${carpool.location}</p>
                    <p><strong>Departure Time:</strong> ${carpool.time}</p>
                    <p><strong>Revenue:</strong> ₹${carpool.price * seatsBooked}</p>
                </div>
                
                <p>Thank you for using PoolUp! 🎉</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (err) {
        console.error('Driver notification email error:', err.message);
        return false;
    }
};

module.exports = { 
    sendAdminNotification, 
    sendBookingConfirmation, 
    sendDriverNotification 
};