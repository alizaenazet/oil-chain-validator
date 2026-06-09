// routes/authRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Hardcoded admin credential sederhana sesuai dengan skema tim kalian
    if (username === 'admin' && password === 'adminoilchain') {
        const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
        return res.status(200).json({ success: true, token: `Bearer ${token}` });
    }

    return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Wrong credentials." } });
});

module.exports = router;