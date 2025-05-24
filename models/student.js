const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the student schema
const studentSchema = new Schema({
    enrollmentNumber: {
    type: String,
    required: true,
    unique: true,  // Ensures that each student has a unique enrollment number
  },
  AssignmentCompletionStatus: {
    type: Number,
    required: true,
    min: 0,
    max: 100,  // Validates percentage between 0 and 100
  },
  AvgAssignmentGrade: {
    type: Number,
    required: true,
    min: 0,
    max: 100,  // Validates grade percentage between 0 and 100
  },
  AvgSubmissionDelay: {
    type: Number,
    required: true,
    min: 0,  // Validates that delay is a positive number
  },
  QuizTestAvgGrade: {
    type: Number,
    required: true,
    min: 0,
    max: 100,  // Validates quiz/test grade percentage between 0 and 100
  },
  VirtualClassAttendance: {
    type: Number,
    required: true,
    min: 0,
    max: 100,  // Validates attendance percentage between 0 and 100
  },
  AdherenceToDeadlines: {
    type: Number,
    required: true,
    min: 0,
    max: 100,  // Validates adherence percentage between 0 and 100
  },
  answer:{
    type:Number,
    required: true
  }
});

// Create the model
const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
