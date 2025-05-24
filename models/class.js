const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    className: String,
    instructorName: String,
    section:String,
    subject:String,
    
});

module.exports = mongoose.model('Class', classSchema);
