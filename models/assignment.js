const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true },
    fileUrl: {type:String},
    studentsSubmitted: [
        {
          enrollmentNumber: { type: String, required: true }, // Student's enrollment number
          fileUrl: { type: String, required: true }, // URL of the file submitted by the student
        },
      ],
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true }
   
});

module.exports = mongoose.model('Assignment', assignmentSchema);
