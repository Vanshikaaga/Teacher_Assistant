const BASE_URL = 'http://127.0.0.1:5004';

// Function to upload the PDF timetable
async function uploadPDF() {
    const fileInput = document.getElementById('timetable-upload');
    const file = fileInput.files[0];
    const alertBox = document.getElementById('upload-alert');

    if (!file) {
        alertBox.style.display = 'block';
        alertBox.className = 'alert error';
        alertBox.innerText = "Please select a PDF file to upload.";
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${BASE_URL}/upload`, {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        if (response.ok) {
            alertBox.style.display = 'block';
            alertBox.className = 'alert success';
            alertBox.innerText = "Timetable uploaded successfully!";

            // Hide the success message after 5 seconds
            setTimeout(() => {
                alertBox.style.display = 'none';
            }, 5000);

        } else {
            alertBox.style.display = 'block';
            alertBox.className = 'alert error';
            alertBox.innerText = `Failed to upload: ${result.error}`;
        }
    } catch (error) {
        console.error("Error uploading file:", error);
        alertBox.style.display = 'block';
        alertBox.className = 'alert error';
        alertBox.innerText = "An error occurred while uploading the timetable.";
    }
}

// Fetch schedule based on selected day and time
async function fetchSchedule() {
    const day = document.getElementById('day-select').value;
    const scheduleDiv = document.getElementById('schedule');
    const timeAlert = document.getElementById('time-alert');

    if (!day) {
        alert("Please select a day.");
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/schedule?day=${day}`);
        const data = await response.json();

        if (data.error) {
            scheduleDiv.innerHTML = `<p>${data.error}</p>`;
            return;
        }

        // Display the schedule for the whole day
        const scheduleList = data.schedule
            .map(item => `<p>${item.Period}: ${item[day]}</p>`)
            .join("");
        scheduleDiv.innerHTML = `<h3>Schedule for ${day}</h3>${scheduleList}`;

        
    } catch (error) {
        console.error("Error fetching schedule:", error);
        scheduleDiv.innerHTML = `<p>Failed to fetch the schedule. Please try again.</p>`;
    }
}
