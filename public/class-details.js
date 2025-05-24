// Get the query string from the URL (everything after the '?')
const urlParams = new URLSearchParams(window.location.search);

// Get the value of the 'id' parameter
const classId = urlParams.get('id');
function redirectToHome() {
    window.location.href = "d.html"; 
}
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

// Add even
// Log the class ID to the console or use it as needed
console.log("Class ID:", classId);

// Fetch class details from the backend
async function fetchClassDetails() {
    try {
        // Validate the DOM elements
        const classNameElement = document.getElementById('className');
        const teacherNameElement = document.getElementById('teacherName');
        const studentCountElement = document.getElementById('studentCount');
        const studentListElement = document.getElementById('studentList'); // Corrected to match HTML

        if (!teacherNameElement || !studentCountElement || !studentListElement) {
            console.error("One or more required DOM elements are missing.");
            return;
        }

        // Fetch class details from the backend
        const response = await fetch(`http://localhost:5000/class/${classId}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log(data);  // Log data to check structure

            // Access nested structure for classDetails and students
            if (data.classDetails && Array.isArray(data.classDetails.students)) {
                teacherNameElement.innerHTML = '';
                const teacherContainer = document.createElement('div'); // Container for initial and name
                teacherContainer.className = 'teacher-container';
                const teacherInitial = document.createElement('div');
                teacherInitial.className = 'teacher-initial';
                teacherInitial.innerText = data.classDetails.instructorName.charAt(0).toUpperCase();

                const teacherName = document.createElement('span');
                teacherName.className = 'teacher-name';
                teacherName.innerText = data.classDetails.instructorName || 'N/A';

                // Append the initial and name to the container
                // Append the initial and name to the container
                teacherContainer.appendChild(teacherInitial);
                teacherContainer.appendChild(teacherName);

                // Append the container to the teacherNameElement
                teacherNameElement.appendChild(teacherContainer);


                studentCountElement.innerText = `${data.classDetails.students.length} students`;
                // Populate students list
                studentListElement.innerHTML = ''; // Clear any existing data
                data.classDetails.students.forEach(student => {
                    const studentItem = document.createElement('li');
                    studentItem.className = 'student-item';

                    const initial = document.createElement('div');
                    initial.className = 'student-initial';
                    initial.innerText = student.name.charAt(0).toUpperCase();

                    const details = document.createElement('div');
                    details.className = 'student-details';

                    const name = document.createElement('span');
                    name.className = 'student-name';
                    name.innerText = student.name;

                    const id = document.createElement('span');
                    id.className = 'student-id';
                    id.innerText = student.enrollmentNumber;

                    details.appendChild(name);
                    details.appendChild(id);

                    const messageButton = document.createElement('button');
                    messageButton.className = 'message-button';
                    
                    const iconImage = document.createElement('img');
                    iconImage.src = 'grade_prediction_icon.png';
                    iconImage.alt = 'Grade Prediction'; 
                    iconImage.className = 'button-icon';
                    messageButton.appendChild(iconImage);
                     // Add click event listener to redirect to grade prediction page
                    messageButton.addEventListener('click', () => {
                        // Redirect to the grade prediction page with the student's ID as a query parameter
                        window.location.href = `/gp.html?studentId=${student.enrollmentNumber}`;
                    });
                    studentItem.appendChild(initial);
                    studentItem.appendChild(details);
                    studentItem.appendChild(messageButton);

                    studentListElement.appendChild(studentItem);
                });
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

// Call fetchClassDetails when the page loads
document.addEventListener('DOMContentLoaded', fetchClassDetails);
