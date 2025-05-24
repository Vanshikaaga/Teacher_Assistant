document.addEventListener('DOMContentLoaded', () => {
    // Fetch class details when the page is loaded
    const urlParams = new URLSearchParams(window.location.search);
    const classId = urlParams.get('id');  // Get the class ID from the URL query parameter
    fetchClassDetails(classId);  // Fetch details for the class
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
    // Add event listener for the "Post" button
    document.getElementById("post-button").addEventListener("click", postAnnouncement);
});

// Function to fetch and display class details
async function fetchClassDetails(classId) {
    try {
        const response = await fetch(`http://localhost:5000/class/${classId}`);

        if (response.ok) {
            const data = await response.json();
            console.log(data);  // Log the data structure to see the result

            // Get class details and update DOM
            const classNameElement = document.getElementById('className');
            // const studentCountElement = document.getElementById('studentCount');
            // const studentListElement = document.getElementById('studentList');
            // const assignmentListElement = document.getElementById('assignmentList');

            classNameElement.innerText = `${data.classDetails.className}`;
            // studentCountElement.innerText = `Total Students: ${data.classDetails.students.length}`;

            // Populate student list dynamically
            // studentListElement.innerHTML = '';
            // data.classDetails.students.forEach(student => {
            //     const studentItem = document.createElement('li');
            //     studentItem.innerText = `${student.name} (${student.enrollmentNumber})`;
            //     studentListElement.appendChild(studentItem);
            // });

            // // Populate assignments list dynamically
            // assignmentListElement.innerHTML = '';
            // data.assignments.forEach(assignment => {
            //     const assignmentItem = document.createElement('li');
            //     assignmentItem.innerText = assignment.title;
            //     assignmentListElement.appendChild(assignmentItem);
            // });

        } else {
            console.error('Failed to fetch class details');
        }
    } catch (error) {
        console.error('Error fetching class details:', error);
    }
}
function redirectToPeople() {
  // Replace with logic to dynamically fetch classId
    const url = `/class-details/${classId}`;
    window.location.href = url;
}
function redirectToHome() {
    window.location.href = "d.html"; 
}
// Function to handle posting an announcement
function postAnnouncement() {
    console.log("Post button clicked");

    // Get the value from the textarea
    const announcementText = document.getElementById("announcement-text").value;
    console.log("Announcement Text:", announcementText);

    // Check if the textarea is empty
    if (announcementText.trim() === "") {
        alert("Please write something before posting.");
        return;
    }
    document.getElementById("upcoming-section").style.display = 'none';
    // document.getElementById("post-section").style.display = 'block';
    // Create a new post element
    const newPost = document.createElement("div");
    newPost.classList.add("post");

    // Create post header
    const postHeader = document.createElement("div");
    postHeader.classList.add("post-header");

    const teacherName = document.createElement("span");
    teacherName.classList.add("teacher-name");
    teacherName.textContent = "You"; // Replace "You" with a dynamic user name if needed
    postHeader.appendChild(teacherName);

    const postDate = document.createElement("span");
    postDate.classList.add("post-date");
    const currentDate = new Date();
    postDate.textContent = currentDate.toLocaleDateString();
    postHeader.appendChild(postDate);

    newPost.appendChild(postHeader);

    // Add the announcement text content to the post
    const postContent = document.createElement("p");
    postContent.textContent = announcementText;
    newPost.appendChild(postContent);

    // Append the new post to the content area
    const announcementContainer= document.querySelector(".announcement");
    if (announcementContainer) {
        announcementContainer.appendChild(newPost);  // Append below the textarea
        console.log("New post added:", newPost);
    } else {
        console.error("Announcement container not found.");
    }
    // Clear the textarea after posting
    document.getElementById("announcement-text").value = "";
}
