const urlParams = new URLSearchParams(window.location.search);
const classId = urlParams.get('id'); 

const API_BASE = window.location.hostname.includes('localhost') 
                 ? 'http://localhost:5000'  // Local backend
                 : 'https://teacher-assistant-pans.onrender.com';

const apiUrl = `${API_BASE}/assignments?classId=${classId}`;

document.getElementById('peopleButton').onclick = () => {
    window.location.href = `/class-details.html?id=${classId}`;
};
document.getElementById('streamLink').onclick = () => {
    window.location.href = `/new.html?id=${classId}`;
};
document.getElementById('classworkLink').onclick=()=>{
    window.location.href = `/index.html?id=${classId}`;
};
document.getElementById('attendanceButton').onclick = () => {
    window.location.href = 'http://127.0.0.1:5003';
};
// Fetch and display assignments from the backend
async function getAssignments() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch assignments: ${response.status}`);
        }

        const assignments = await response.json();
        displayAssignments(assignments);
    } catch (error) {
        console.error('Error fetching assignments:', error);
        alert('Failed to load assignments.');
    }
}
async function fetchClassDetails() {
    try {
        // // Validate the DOM elements
        // const classNameElement = document.getElementById('className');
        // const teacherNameElement = document.getElementById('teacherName');
        // const studentCountElement = document.getElementById('studentCount');
        // const studentListElement = document.getElementById('studentList'); // Corrected to match HTML

        // if (!teacherNameElement || !studentCountElement || !studentListElement) {
        //     console.error("One or more required DOM elements are missing.");
        //     return;
        // }

        // Fetch class details from the backend
        const response = await fetch(`${API_BASE}/class/${classId}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log(data);  // Log data to check structure

            // Access nested structure for classDetails and students
            if (data.classDetails && Array.isArray(data.classDetails.students)) {
              
                 
            } else {
                console.error('Unexpected data structure:', data);
                teacherNameElement.innerText = 'Error loading teacher';
                studentCountElement.innerText = 'Error loading students';
            }
        } else {
            console.error('Failed to fetch class details. Status:', response.status);
            teacherNameElement.innerText = 'Error loading teacher';
            studentCountElement.innerText = 'Error loading students';
        }
    } catch (error) {
        console.error('Error fetching class details:', error);
        const teacherNameElement = document.getElementById('teacherName');
        const studentCountElement = document.getElementById('studentCount');
        if (teacherNameElement) teacherNameElement.innerText = 'Error loading teacher';
        if (studentCountElement) studentCountElement.innerText = 'Error loading students';
    }
}
// Display assignments on the page
function displayAssignments(assignments) {
    const assignmentsList = document.getElementById('assignments-list');
    assignmentsList.innerHTML = '';

    if (assignments.length === 0) {
        assignmentsList.innerHTML = '<p>No assignments available for this class.</p>';
        return;
    }

    assignments.reverse().forEach(function(assignment) {
        const assignmentElement = document.createElement('div');
        assignmentElement.style.cursor = 'pointer'; // Change cursor to pointer for clickable effect
        assignmentElement.onclick = () => {
            window.location.href = `assignment-details.html?id=${assignment._id}`;
        };

        assignmentElement.classList.add('assignment');
        assignmentElement.innerHTML = `
            <div style="display: flex; justify-content: center;background-color: #ffffff;">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; border-bottom: 1px solid #e0e0e0; padding: 10px 0;">
                    <div style="display: flex; align-items: center;">
                        <div style="width: 40px; height: 40px; border-radius: 50%; background-color: ${assignment.isCompleted ? '#4CAF50' : '#d3d3d3'}; display: flex; justify-content: center; align-items: center; margin-right: 15px;">
                            <img src="assignment.png" alt="Icon" style="width: 20px; height: 20px;">
                        </div>
                        <span style="font-size: 16px; color: #333333;">${assignment.title}</span>
                    </div>
                    <p style="margin: 0; font-size: 14px; color: #6c757d;">Due ${new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
            </div>
        `;
        assignmentsList.appendChild(assignmentElement);
    });
}

function redirectToHome() {
    window.location.href = "d.html"; 
}

function viewAssignmentDetails(assignmentId) {
    window.location.href = `assignment-details.html?id=${assignmentId}`;
}

// Submit a student for an assignment
async function submitAssignment(assignmentId) {
    const studentName = document.getElementById(`student-name-${assignmentId}`).value;

    if (!studentName) {
        alert('Please enter a student name.');
        return;
    }

    const response = await fetch(`${apiUrl}/${assignmentId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName })
    });

    if (response.ok) {
        getAssignments();
    } else {
        alert('Error submitting assignment.');
    }
}

// Event listener for adding a new assignment
document.getElementById('add-assignment-btn').addEventListener('click', function() {
    openModal();
});

// Event listener for canceling the modal
document.getElementById('cancel-btn').addEventListener('click', function() {
    closeModal();
});

// Event listener for submitting the form
document.getElementById('assignment-form-data').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('title', document.getElementById('title').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('dueDate', document.getElementById('due-date').value);
    formData.append('file', document.getElementById('file').files[0]);
    const urlParams = new URLSearchParams(window.location.search);
    const classId = urlParams.get('id');
    formData.append('classId', classId)

    try {
        const response = await fetch('${API_BASE}/assignments', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (response.ok) {
            // Optionally reset the form or update the UI
            getAssignments();
            document.addEventListener('DOMContentLoaded', fetchClassDetails);
            closeModal();
        } else {
            alert('Failed to add assignment');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred');
    }
});


// Open and close modal functions
function openModal() {
    document.getElementById('assignment-form').style.display = 'flex';
}

function closeModal() {
    document.getElementById('assignment-form').style.display = 'none';
}

// Initialize by fetching assignments
getAssignments();
document.addEventListener('DOMContentLoaded', fetchClassDetails);
