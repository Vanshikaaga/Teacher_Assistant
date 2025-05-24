// Function to extract the studentId from the URL
function getStudentIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('studentId');
  }

  // Function to fetch and display student data
  function fetchStudentData() {
    const studentId = getStudentIdFromUrl();
    if (!studentId) {
      document.getElementById("studentData").innerHTML = "<p>Error: No student ID found in the URL.</p>";
      return;
    }
    const classId='673c90f789f447502a7c8531'

    fetch(`http://localhost:5000/students/${studentId}`)
      .then(response => response.json())
      .then(data1 => {
        if (data1.error) {
          document.getElementById("studentData").innerHTML = `<p>Error: ${data1.error}</p>`;
        } else {
          console.log(data1.enrollmentNumber)
          fetch(`http://localhost:5000/student/${data1.enrollmentNumber}`)
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
        } else {
          console.log(data);
          document.getElementById("Name").innerHTML+=`
                <h4><strong>  Name: ${data.Name}</strong></h4>`
                document.getElementById("Enroll").innerHTML+=`
                <h4>  Enrollment: ${data.enrollmentNumber}</h4>`
          document.getElementById("studentData").innerHTML = `
            <p><strong>Virtual Attendance:</strong> ${data.VirtualClassAttendance}</p>
            <p><strong>Accuracy of previously submitted assignment:</strong> ${data.AvgAssignmentGrade}</p>
            <p><strong>Delay:</strong> ${data.AvgSubmissionDelay}</p>
          `;
          const predictionData = {
            "Virtual Attendance": data.VirtualClassAttendance,
            "Accuracy of previously submitted assignment": data.AvgAssignmentGrade,
            "Delay": data.AvgSubmissionDelay,
          };
          const formattedData = {
            studentId: studentId,
            features: Object.values(predictionData)
          };
          
          // Log the result to verify
          console.log(formattedData);
          fetch("http://127.0.0.1:5002/predict", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(formattedData)
          })
          .then(response => response.json())
          .then(prediction => {
            document.getElementById("result").innerHTML = 
              `<p>Predicted Final Grade: ${prediction.prediction}</p>`;

          })
          .catch(error => {
            console.error("Error:", error);
            document.getElementById("result").innerHTML = 
              `<p>Something went wrong. Please try again.</p>`;
          });
        }
      })
      .catch(error => {
        console.error('Error fetching student data:', error);
        document.getElementById("result").innerHTML = 
          `<p>Failed to fetch student data. Please try again.</p>`;
      });
          
        }
      })
      .catch(error => {
        console.error('Error fetching student data:', error);
        document.getElementById("studentData").innerHTML = 
          "<p>Error: Failed to fetch student data. Please try again.</p>";
      });
  }


  function goBack() {
    window.history.back(); // Navigates to the previous page
  }
  
  // Function to make the prediction
  function makePrediction() {
    const studentId = getStudentIdFromUrl();

    fetch(`http://localhost:5000/student/22103275`)
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
        } else {
          console.log(data);
          document.getElementById("Name").innerHTML+=`
                <h4><strong>  Name: ${data.Name}</strong></h4>`
                document.getElementById("Enroll").innerHTML+=`
                <h4>  Enrollment: ${data.enrollmentNumber}</h4>`
          document.getElementById("studentData").innerHTML = `
            <p><strong>Virtual Attendance:</strong> ${data.VirtualClassAttendance}</p>
            <p><strong>Accuracy of previously submitted assignment:</strong> ${data.AvgAssignmentGrade}</p>
            <p><strong>Delay:</strong> ${data.AvgSubmissionDelay}</p>
          `;
          const predictionData = {
            "Virtual Attendance": data.VirtualClassAttendance,
            "Accuracy of previously submitted assignment": data.AvgAssignmentGrade,
            "Delay": data.AvgSubmissionDelay,
          };
          const formattedData = {
            studentId: studentId,
            features: Object.values(predictionData)
          };
          
          // Log the result to verify
          console.log(formattedData);
          fetch("http://127.0.0.1:5002/predict", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(formattedData)
          })
          .then(response => response.json())
          .then(prediction => {
            document.getElementById("result").innerHTML = 
              `<p>Predicted Final Grade: ${prediction.prediction}</p>`;

          })
          .catch(error => {
            console.error("Error:", error);
            document.getElementById("result").innerHTML = 
              `<p>Something went wrong. Please try again.</p>`;
          });
        }
      })
      .catch(error => {
        console.error('Error fetching student data:', error);
        document.getElementById("result").innerHTML = 
          `<p>Failed to fetch student data. Please try again.</p>`;
      });
  }

  // Fetch student data on page load
  fetchStudentData();