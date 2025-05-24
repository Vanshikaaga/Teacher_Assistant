// click_to_convert.addEventListener('click', function(){
//     var speech = true;
//     window.SpeechRecognition = window.webkitSpeechRecognition;
//     const recognition =new SpeechRecognition();
//     recognition.interimResults = true;

//     recognition.addEventListener('result', e => {
//         const transcript = Array.from(e.results)
//         .map(result => result[0])
//         .map(result => result.transcript)

//         convert_text.innerHTML = transcript
//     })

//     if(speech == true){
//         recognition.start();
//     }
// })

// Button to trigger speech recognition
click_to_convert.addEventListener('click', function() {
    var speech = true; // You can toggle this to stop/start speech recognition
    window.SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.interimResults = true;  // Get intermediate results

    // Elements for displaying speech and sending text
    const convert_text = document.getElementById("convert_text"); // Adjust the ID to your HTML
    const status_message = document.getElementById("status_message"); // Optional: Display status like "Listening..."

    recognition.addEventListener('start', () => {
        status_message.innerHTML = "Listening..."; // Show the status
    });

    recognition.addEventListener('end', () => {
        status_message.innerHTML = "Stopped Listening"; // Indicate when recognition stops
    });

    recognition.addEventListener('result', (e) => {
        const transcript = Array.from(e.results) // Gather all speech results
            .map(result => result[0])
            .map(result => result.transcript)
            .join("");  // Join to form a full sentence

        // Display live transcript
        convert_text.innerHTML = transcript;

        // If speech has ended and is final, send to backend
        if (e.results[0].isFinal) {
            sendToBackend(transcript); // Send the transcribed text to your backend
        }
    });

    // Start recognition if speech is true
    if (speech) {
        recognition.start();
    }
});

// Function to send the transcript to your backend (Gemini or other APIs)
async function sendToBackend(transcript) {
    try {
        const response = await fetch('http://localhost:5000/api/gemini', {  // Update with your endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: transcript }),
        });

        const data = await response.json();
        console.log("hi")
        console.log(data)
        handleGeminiResponse(data.reply); // Handle response from Gemini
    } catch (error) {
        console.error('Error sending to backend:', error);
    }
}

// Function to handle response from Gemini or any backend
function handleGeminiResponse(response) {
    const responseText = document.getElementById("response_text"); // Display the Gemini response
    responseText.innerHTML = response;
    const intent = extractIntent(response);
    const entities = extractEntities(response);
    
    // Display extracted intent and entities
    //mark-attendance , give grades list

    speak(response);  // Optional: Voice feedback
}
function extractIntent(response) {
    // Example: Parsing the response string to find the intent
    const intentPattern = /Intent:\s*(.*?)(?=\n|$)/;
    const match = response.match(intentPattern);
    return match ? match[1] : "No intent detected";
}

// Function to extract entities from the response
function extractEntities(response) {
    // Example: Parsing the response string to find entities
    const entitiesPattern = /Entities:\s*(.*?)(?=\n|$)/;
    const match = response.match(entitiesPattern);
    if (match) {
        // Assuming entities are separated by commas
        return match[1].split(",").map(entity => entity.trim());
    }
    return [];
}
// Function to provide voice feedback using Speech Synthesis
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
}
