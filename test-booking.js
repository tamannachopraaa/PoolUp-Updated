require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Carpool = require('./models/Carpool');

async function testBooking() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/poolup');
        console.log('✅ Connected to MongoDB');

        // Create or find test driver
        let driver = await User.findOne({ email: 'driver-test@test.com' });
        if (!driver) {
            driver = new User({
                name: 'Test Driver',
                email: 'driver-test@test.com',
                password: 'hashedpassword123',
                role: 'user'
            });
            await driver.save();
            console.log('✅ Created test driver');
        } else {
            console.log('✅ Using existing test driver');
        }

        // Create or find test passenger
        let passenger = await User.findOne({ email: 'passenger-test@test.com' });
        if (!passenger) {
            passenger = new User({
                name: 'Test Passenger',
                email: 'passenger-test@test.com',
                password: 'hashedpassword123',
                role: 'user'
            });
            await passenger.save();
            console.log('✅ Created test passenger');
        } else {
            console.log('✅ Using existing test passenger');
        }

        // Create a test carpool
        let carpool = new Carpool({
            from: 'Home',
            to: 'University',
            carName: 'Toyota Camry',
            location: 'Central Station',
            time: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            totalSeats: 4,
            bookedSeats: 0,
            price: 50,
            gender: 'any',
            userId: driver._id,
            bookedBy: []
        });
        await carpool.save();
        console.log('✅ Created test carpool:', carpool._id);

        // Simulate booking
        console.log('\n📝 Testing booking...\n');
        carpool = await Carpool.findOneAndUpdate(
            { 
                _id: carpool._id,
                userId: { $ne: passenger._id },
                $expr: { $lte: [{ $add: ["$bookedSeats", 1] }, "$totalSeats"] }
            },
            { 
                $inc: { bookedSeats: 1 },
                $push: { bookedBy: { user: passenger._id, seats: 1 } } 
            },
            { new: true }
        ).populate('userId', 'email name');

        if (!carpool) {
            console.log('❌ Booking failed');
            process.exit(1);
        }

        console.log('✅ Booking saved to database\n');

        // Get the sendBookingConfirmation and sendDriverNotification functions
        const { sendBookingConfirmation, sendDriverNotification } = require('./utils/mailer');

        // Send emails
        console.log('📧 Sending emails...\n');
        
        if (passenger && passenger.email) {
            try {
                console.log(`📨 Sending booking confirmation to ${passenger.email}`);
                await sendBookingConfirmation(passenger.email, passenger.name, carpool, 1);
                console.log('✅ Passenger email sent');
            } catch (err) {
                console.error('❌ Failed to send passenger email:', err.message);
            }
        }

        if (driver && driver.email) {
            try {
                console.log(`📨 Sending driver notification to ${driver.email}`);
                await sendDriverNotification(driver.email, driver.name, carpool, passenger.name, 1);
                console.log('✅ Driver email sent');
            } catch (err) {
                console.error('❌ Failed to send driver email:', err.message);
            }
        }

        console.log('\n✅ Test completed!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

testBooking();
