// Fetch and display all classes on page load
document.addEventListener("DOMContentLoaded", fetchClasses);
// Function to toggle sidebar visibility
// Function to toggle sidebar visibility
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main');

    // Toggle the 'open' class on sidebar and adjust main content
    if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        mainContent.classList.remove('sidebar-open');
    } else {
        sidebar.classList.add('open');
        mainContent.classList.add('sidebar-open');
    }
}
document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('sidebar');
    const menuIcon = document.querySelector('.menu-icon');
    const mainContent = document.querySelector('.main');
    // Check if the click is outside the sidebar or the menu icon
    if (!sidebar.contains(event.target) && !menuIcon.contains(event.target) && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        mainContent.classList.remove('sidebar-open'); 
    }
});

async function fetchClasses() {
    const dashboard = document.getElementById("classDashboard");
    dashboard.innerHTML = ''; // Clear existing classes

    try {
        const response = await fetch("http://localhost:5000/api/classes/all");
        const classes = await response.json();

        if (response.ok) {
            classes.forEach((classItem) => {
                const classCard = document.createElement("div");
                classCard.classList.add("class-card");
                console.log(classItem.section)
                classCard.innerHTML = `
    <div class="card">
        <div class="card-header">
            <h1 class="class-subject-name">${classItem.className}</h1>
            <h2 class="section">${classItem.section}</h2>
            <h3 class="teacher-name">${classItem.instructorName}</h3>
            <span class="material-icons teacher-icon">person</span>
        </div>
        <div class="card-body">
            <!-- Optional content can be added here -->
        </div>
        <div class="card-footer">
            <span class="material-icons-outlined assignment-icon">assignment_ind</span>
            <span class="material-icons-outlined folder-icon">folder</span>
        </div>
    </div>
`;

         
                
                console.log(classItem._id); // Ensure this is logging the correct ID

                classCard.addEventListener('click', () => redirectToClassDetails(classItem._id));
                dashboard.appendChild(classCard);
            });
        } else {
            alert("Failed to load classes");
        }
    } catch (error) {
        console.error("Failed to fetch classes:", error);
    }
}

function redirectToClassDetails(classId) {
    // Redirect to class details page
    console.log("hiii")
    window.location.href = `http://localhost:5000/class-details.html?id=${classId}`;
    // Make sure the URL matches your backend route
}

// Function to handle form submission and add a new class
async function createClass(event) {
    event.preventDefault();

    const className = document.getElementById("className").value;
    const instructorName = document.getElementById("instructorName").value;
    const section=document.getElementById("section").value;

    try {
        const response = await fetch("http://localhost:5000/api/classes/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ className, instructorName,section }),
        });

        const result = await response.json();
        if (response.ok) {
            
            closeClassForm();
            fetchClasses(); // Refresh the list of classes
        } else {
            alert("Failed to create class");
        }
    } catch (error) {
        console.error("Error creating class:", error);
    }
}

// Modal functions to open and close the form
function openClassForm() {
    document.querySelector(".form-holder").style.display = "flex";
}

function closeClassForm() {
    document.querySelector(".form-holder").style.display = "none";}
