const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).send('Invalid credentials');
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, name: user.name }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' } // Unified expiry
        );

        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
        res.redirect('/');
    } catch (err) {
        res.status(500).send('Login error');
    }
});

module.exports = router;