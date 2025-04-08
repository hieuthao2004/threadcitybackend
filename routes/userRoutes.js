const express = require('express');
const router = express.Router();

router.get('/users', (req, res) => {
    res.send('Get all users');
});

// POST route
router.post('/users', (req, res) => {
    res.send('Create a new user');
});

// PUT route
router.put('/users/:id', (req, res) => {
    const userId = req.params.id;
    res.send(`Update user with ID: ${userId}`);
});

// DELETE route
router.delete('/users/:id', (req, res) => {
    const userId = req.params.id;
    res.send(`Delete user with ID: ${userId}`);
});

module.exports = router;
