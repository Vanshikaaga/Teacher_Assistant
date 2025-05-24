const express = require('express');
const router = express.Router();
const Class = require('../models/class.js');


// Route to create a new class
router.post('/create', async (req, res) => {
    try {
        const newClass = new Class({
            className: req.body.className,
            instructorName: req.body.instructorName,
            section: req.body.section
        });
        await newClass.save();
        res.status(201).json({ message: 'Class created successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create class' });
    }
});

// Route to get all classes
router.get('/all', async (req, res) => {
    try {
        const classes = await Class.find();
        res.status(200).json(classes);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch classes' });
    }
});

module.exports = router;
