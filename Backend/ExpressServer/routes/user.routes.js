const express = require('express');
const router = express.Router();

router.post('/users/register', (req, res) => {
    // Registration logic here
    res.send('User registered');
})

module.exports = router;