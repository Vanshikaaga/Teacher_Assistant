const express = require('express');
const firebaseAdmin = require('firebase-admin');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const { SpeechClient } = require('@google-cloud/speech');
const path = require('path');
const fs = require('fs');
const classesRoutes = require('./routes/classes');
// Initialize the app
const app = express();
app.use(cors({
  origin: [
    "http://localhost:3000",            // local frontend (if React/Vite/Next runs on 3000)
    "http://127.0.0.1:5500",            // local if opening with Live Server in VS Code
    "http://localhost:5000",            // local backend (optional if calling directly)
    "https://teacher-assistant-pans.onrender.com"  // deployed frontend
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(bodyParser.json());
 // Serve files from the "uploads" folder
const Student = require('./models/student');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public'))); 
// MongoDB Connection
const client = new SpeechClient();
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.log('Failed to connect to MongoDB', err));

// Import the Assignment model
const Assignment = require('./models/assignment');
const Class = require('./models/class');
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL: 'https://faceattendacerealtime-85c07-default-rtdb.firebaseio.com/'
});

const db = firebaseAdmin.database();
// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads'); // Store uploaded files in the "uploads" folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Store file with a unique name
    }
});
app.get('/class-detail.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'class-details.html'));
});
const upload = multer({ storage: storage });


// Routes

// Create a new assignment (with file upload)
app.post('/assignments', upload.single('file'), async (req, res) => {
    const { title, description, dueDate, classId } = req.body;
    const fileUrl = req.file ? '/uploads/' + req.file.filename : null;
    const filename = req.file.filename;
    if (!mongoose.Types.ObjectId.isValid(classId)) {
        return res.status(400).json({ message: 'Invalid Class ID' });
    }
    const newAssignment = new Assignment({
        title,
        description,
        dueDate,
        fileUrl,
        classId,
        studentsSubmitted: []
    });

    try {
        await newAssignment.save();
        res.status(201).json(newAssignment);
    } catch (err) {
        res.status(500).json({ message: 'Error creating assignment' });
    }
});

// Get all assignments
app.get('/assignments', async (req, res) => {
    const { classId } = req.query;
    try {
        if (!classId) {
            return res.status(400).json({ error: 'Class ID is required' });
        }

        const assignments = await Assignment.find({ classId: classId }); // Make sure assignments are filtered by classId
        res.json(assignments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch assignments' });
    }
});

// Add student submission to an assignment
app.post('/assignments/:id/submit', async (req, res) => {
    const { studentName } = req.body;
    const assignmentId = req.params.id;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
    }

    assignment.studentsSubmitted.push(studentName);
    await assignment.save();
    res.status(200).json(assignment);
});
// Get specific assignment details including students who have submitted their assignments
app.get('/assignments/:id', async (req, res) => {
    const assignmentId = req.params.id;

    // Check if the provided ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
        return res.status(400).json({ message: 'Invalid Assignment ID' });
    }

    try {
        // Find the assignment by its ID
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Send the assignment details and the list of students who completed it
        res.status(200).json({
            assignment: assignment,
            students: assignment.studentsSubmitted
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error, please try again later.' });
    }
});
app.get('/class/:id', async (req, res) => {
    const classId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(classId)) {
        return res.status(400).json({ message: 'Invalid Class ID' });
    }
    try {
        // Update the students array for the class
        const updatedClass = await Class.findByIdAndUpdate(
            classId,
            {
                students: [
                    { name: "Alice Johnson", enrollmentNumber: "22101001" },
                    { name: "Bob Smith", enrollmentNumber: "22101002" }
                   
                ]
            },
            { new: true, useFindAndModify: false }
        );

        // Check if class was found and updated
        if (!updatedClass) {
            return res.status(404).json({ message: 'Class not found' });
        }

        console.log("Class with new students set:", updatedClass);

        // Fetch assignments or any other related data for the class
        const assignments = await Assignment.find({ classId });

        // Send the updated class details with assignments
        res.json({
            classDetails: updatedClass,
            assignments
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ message: 'Server error, please try again later.' });
    }
});

app.get('/students/:enrollmentNumber', async (req, res) => {
    const enrollmentNumber = req.params.enrollmentNumber;
    
    try {
       
        const student = await Student.findOne({ enrollmentNumber });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json(student);
    } catch (err) {
        console.error('Error fetching student:', err);
        res.status(500).json({ message: 'Server error, please try again later.' });
    }
});
app.get('/student/:id', async (req, res) => {
    const studentId = req.params.id; // Extract student ID from the request

    try {
        const studentRef = db.ref(`Students/${studentId}`);
        const snapshot = await studentRef.get(); // Fetch data from Firebase
        const student_mongo = await Student.findOne({ enrollmentNumber: studentId });
        if (student_mongo) {
            console.log("Is student_mongo an object?", typeof student_mongo);
            console.log("Answer:", student_mongo.answer);  // Extracting the 'answer' field
            console.log("Full Student Data:", student_mongo);  // Logging the entire student document
          } else {
            console.log("Student not found.");
          }
        if (snapshot.exists()) {
            const studentData = snapshot.val();

            // Calculate VirtualClassAttendance
            const totalClasses = studentData.total_classes || 0;
            const totalAttendance = studentData.total_attendence || 0;
            const student = {
                VirtualClassAttendance: 0.0,
                AvgSubmissionDelay: 2.0,
                AvgAssignmentGrade: 0.0,
                enrollmentNumber: "00000000",
                Name: "John Doe"
            };
            
            if (totalClasses > 0) {
                const virtualAttendance = ((totalAttendance) / totalClasses) * 100;
                student.VirtualClassAttendance = virtualAttendance.toFixed(2); // Round to 2 decimal places
            } else {
                student.VirtualClassAttendance = 'N/A'; // Handle division by zero
            }
            student.enrollmentNumber=studentId;
            student.Name=studentData.name;
            student.AvgAssignmentGrade=student_mongo.answer;
            console.log(student)
            res.json(student); // Send the updated data as JSON response
        } else {
            res.status(404).send({ message: 'Student not found' });
        }
    } catch (error) {
        console.error('Error fetching student data:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

app.use(express.static('public'));
app.use('/api/classes', classesRoutes);
app.get('/api/classes/all', async (req, res) => {
    try {
        const classes = await Class.find(); // Assuming you're using Mongoose to fetch data
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching classes' });
    }
});

app.post('/transcribe', upload.single('audio'), async (req, res) => {
    try {console.log(req.file);

        if (!req.file) {
            return res.status(400).json({ error: 'No audio file uploaded.' });
        }

        // Read the audio file from disk
        const audioBytes = fs.readFileSync(req.file.path).toString('base64');

        // Configure audio and recognition settings
        const audio = { content: audioBytes };
        const config = {
            encoding: 'LINEAR16',
            sampleRateHertz: 48000,
            languageCode: 'en-US',
        };

        // Perform speech recognition
        const [response] = await client.recognize({ audio, config });

        // Extract transcription from response
        const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join(' ');

        res.json({ transcription });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to transcribe audio.' });
    } finally {
        // Optional: Clean up the uploaded file
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Failed to delete file:', err);
            });
        }
    }
});


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
