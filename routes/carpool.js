const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Carpool = require('../models/Carpool');
const User = require('../models/User');
const { sendAdminNotification, sendBookingConfirmation, sendDriverNotification } = require('../utils/mailer');

// Create Carpool
router.post('/', auth, async (req, res) => {
    const { carName, time, location, price, gender, totalSeats } = req.body;
    try {
        const newCarpool = new Carpool({
            userId: req.user.id,
            carName, time, location, price, 
            gender, // Fixed from genderPreference to gender
            totalSeats,
            bookedSeats: 0
        });
        await newCarpool.save();
        await sendAdminNotification(newCarpool); // Email Admin
        res.redirect('/');
    } catch (err) {
        res.status(500).send('Error creating carpool');
    }
});

// Atomic Booking Logic
router.post('/:id/book', auth, async (req, res) => {
    const seats = parseInt(req.body.seats || 1);
    try {
        const carpool = await Carpool.findOneAndUpdate(
            { 
                _id: req.params.id,
                userId: { $ne: req.user.id }, // Cannot book own ride
                $expr: { $lte: [{ $add: ["$bookedSeats", seats] }, "$totalSeats"] }
            },
            { 
                $inc: { bookedSeats: seats },
                $push: { bookedBy: { user: req.user.id, seats } } 
            },
            { new: true }
        ).populate('userId', 'email name');

        if (!carpool) return res.status(400).send('Booking failed: Ride full or invalid.');
        
        // Get booking user and driver details
        const bookingUser = await User.findById(req.user.id);
        const driver = await User.findById(carpool.userId);
        
        console.log('🔔 Booking confirmed, sending emails...');
        console.log('📧 Passenger email:', bookingUser?.email);
        console.log('🚗 Driver email:', driver?.email);
        
        // Send confirmation email to passenger
        if (bookingUser && bookingUser.email) {
            console.log(`📨 Sending booking confirmation to ${bookingUser.email}`);
            await sendBookingConfirmation(bookingUser.email, bookingUser.name, carpool, seats);
        } else {
            console.log('⚠️ Booking user email not found');
        }
        
        // Send notification email to driver
        if (driver && driver.email) {
            console.log(`📨 Sending driver notification to ${driver.email}`);
            await sendDriverNotification(driver.email, driver.name, carpool, bookingUser.name, seats);
        } else {
            console.log('⚠️ Driver email not found');
        }
        
        res.redirect('/');
    } catch (err) {
        console.error('❌ Booking error:', err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;