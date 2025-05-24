// const generateOutlineBtn = document.getElementById('generate-outline');
// const newCourseBtn = document.getElementById('new-course');
// const generatedContent = document.getElementById('generated-content');
// const actionsDiv = document.getElementById('actions');
// const loadingOverlay = document.getElementById('loading-overlay');
// let refineCount = 0; 
// // Function to handle generating the complete course
// function setLoading(isLoading) {
//     if (isLoading) {
//         loadingOverlay.classList.add('active');
//     } else {
//         loadingOverlay.classList.remove('active');
//     }
// }

// async function generateCompleteCourse() {
//     const outlineDiv = document.querySelector('#course-outline, #course-outline1');
//     if (!outlineDiv) {
//         alert("Please generate a course outline first.");
//         return;
//     }

//     const refinedOutline = outlineDiv.innerText.trim();
//     setLoading(true);

//     try {
//         const response = await fetch('http://127.0.0.1:5001/generate-course-content', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ refined_outline: refinedOutline }),
//         });

//         if (!response.ok) {
//             throw new Error('Failed to fetch complete course content');
//         }

//         const data = await response.json();

//         if (data.course_content) {
//             const content = data.course_content.replace(/```/g, "");

//             const formattedContent = content
//                 .split("\n")
//                 .map(line => {
//                     if (line.startsWith("**")) return `<br><strong>${line.replace(/\*\*/g, "")}</strong><br>`;
//                     if (line.startsWith("* ")) return `&nbsp;&nbsp;&bull; ${line.replace("* ", "")}<br>`;
//                     if (line.startsWith("    * ")) return `&nbsp;&nbsp;&nbsp;&nbsp;&bull; ${line.replace("    * ", "")}<br>`;
//                     return line.trim() ? `${line}<br>` : `<br>`;
//                 })
//                 .join("");

//             generatedContent.innerHTML += `
//                 <h3 id="complete-course-header">Course Content</h3>
//                 <div id="complete-course-content" style="display: none;">
//                     ${formattedContent}
//                 </div>
//                 <button id="quiz-questions-content1" >Generate quiz questions</button>
//                 <button id="modify-course" data-outline-id="complete-course-content">Modify Course Content</button>
//             `;
//         } else {
//             generatedContent.innerHTML += `<p>Error: ${data.error || 'Unable to generate complete course content'}</p>`;
//         }
//     } catch (error) {
//         generatedContent.innerHTML += `<p>Error: ${error.message}</p>`;
//     }finally {
//         setLoading(false); // Hide loading spinner
//     }
// }

// // Function to generate a course outline
// generateOutlineBtn.addEventListener('click', async () => {
//     const courseName = document.getElementById('course-name').value;
//     const targetAudience = document.getElementById('target-audience').value;
//     const difficultyLevel = document.getElementById('difficulty-level').value;
//     const modules = document.getElementById('modules').value;
//     const duration = document.getElementById('duration').value;
//     const credit = document.getElementById('credit').value;

//     if (!courseName || !targetAudience || !difficultyLevel || !modules || !duration || !credit) {
//         alert('Please fill out all fields');
//         return;
//     }

//     // generatedContent.innerHTML = '<p>Generating course outline...</p>';
//     setLoading(true);
//     try {
//         const response = await fetch('http://127.0.0.1:5001/generate-outline', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 course_name: courseName,
//                 target_audience_edu_level: targetAudience,
//                 difficulty_level: difficultyLevel,
//                 num_modules: modules,
//                 course_duration: duration,
//                 course_credit: credit,
//             }),
//         });

//         if (!response.ok) {
//             throw new Error('Failed to fetch course outline');
//         }

//         const data = await response.json();

//         if (data.outline) {
//             const outline = data.outline.replace(/```/g, "");

//             const formattedContent = outline
//                 .split("\n")
//                 .map(line => {
//                     if (line.startsWith("**")) return `<strong>${line.replace(/\*\*/g, "")}</strong><br>`;
//                     if (line.startsWith("* ")) return `&nbsp;&nbsp;&bull; ${line.replace("* ", "")}<br>`;
//                     if (line.startsWith("    * ")) return `&nbsp;&nbsp;&nbsp;&nbsp;&bull; ${line.replace("    * ", "")}<br>`;
//                     return `${line}<br>`;
//                 })
//                 .join("");

//             generatedContent.innerHTML = `
//                 <h3 id="course-outline-header">Course Outline</h3>
//                 <div id="course-outline" style="display: none;">
//                     ${formattedContent}
//                 </div>
//                 <button id="complete-course">Generate Complete Course</button>
//                 <button id="modify-course" data-outline-id="course-outline">Modify Course Outline</button>
//             `;

//             actionsDiv.style.display = 'block';
//             newCourseBtn.style.display = 'block';
//         } else {
//             generatedContent.innerHTML = `<p>Error: ${data.error || 'Unable to generate course outline'}</p>`;
//         }
//     } catch (error) {
//         generatedContent.innerHTML = `<p>Error: ${error.message}</p>`;
//     }
//     finally {
//         setLoading(false); // Hide loading spinner
//     }
// });

// // Function to modify content
// async function modifyCourse(id) {
//     const courseOutlineDiv = document.getElementById(id);
//     if (!courseOutlineDiv) {
//         alert("Please generate a course outline first.");
//         return;
//     }

//     const currentOutline = courseOutlineDiv.innerText.trim();
//     const feedback = prompt("Enter your feedback for modification:");
//     if (!feedback) {
//         alert("Feedback is required.");
//         return;
//     }

//     setLoading(true);

//     try {
//         const response = await fetch('http://127.0.0.1:5001/refine-content', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 content: currentOutline,
//                 feedback: feedback.trim(),
//             }),
//         });

//         if (!response.ok) {
//             throw new Error('Failed to fetch refined course outline');
//         }

//         const data = await response.json();

//         if (data.refined_content) {
//             const refinedOutline = data.refined_content.replace(/```/g, "");

//             const formattedContent = refinedOutline
//                 .split("\n")
//                 .map(line => {
//                     if (line.startsWith("**")) return `<strong>${line.replace(/\*\*/g, "")}</strong><br>`;
//                     if (line.startsWith("* ")) return `&nbsp;&nbsp;&bull; ${line.replace("* ", "")}<br>`;
//                     if (line.startsWith("    * ")) return `&nbsp;&nbsp;&nbsp;&nbsp;&bull; ${line.replace("    * ", "")}<br>`;
//                     return `${line}<br>`;
//                 })
//                 .join("");

//             refineCount++; // Increment counter to create unique IDs
//             const newId = `course-outline-${refineCount}`;
            
//             // Check if `id` is 'complete-course-content'
//             if (id === "complete-course-content") {
//                 generatedContent.innerHTML += `
//                     <h3 id="${newId}-header" class="refined-outline-header">Refined Course Outline</h3>
//                     <div id="${newId}" class="refined-outline" style="display: none;">
//                         ${formattedContent}
//                     </div>
//                     <button id="quiz-questions-content1" >Generate Quiz questions</button>
//                     <button id="modify-course" data-outline-id="complete-course-content">Modify Course Outline</button>
//                 `;
//             } else {
//                 generatedContent.innerHTML += `
//                     <h3 id="${newId}-header" class="refined-outline-header">Refined Course Outline</h3>
//                     <div id="${newId}" class="refined-outline" style="display: none;">
//                         ${formattedContent}
//                     </div>
//                     <button id="complete-course">Generate Complete Course</button>
//                     <button id="modify-course" data-outline-id="${newId}">Modify Course Outline</button>
//                 `;
//             }
//         } else {
//             generatedContent.innerHTML += `<p>Error: ${data.error || 'Unable to refine course outline'}</p>`;
//         }
//     } catch (error) {
//         generatedContent.innerHTML += `<p>Error: ${error.message}</p>`;
//     }finally {
//         setLoading(false); // Hide loading spinner
//     }
// }

// // Function to generate quiz questions
// async function generateQuizQuestions() {
    
//     const courseContentDiv = document.getElementById('complete-course-content');
//     if (!courseContentDiv) {
//         alert("Please generate course content first.");
//         return;
//     }

//     const courseContent = courseContentDiv.innerText.trim();
//     if (!courseContent) {
//         alert("Course content is empty.");
//         return;
//     }

//     setLoading(true);

//     try {
//         const response = await fetch('http://127.0.0.1:5001/generate-quiz', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ course_content: courseContent }),
//         });

//         if (!response.ok) {
//             throw new Error('Failed to generate quiz questions');
//         }

//         const data = await response.json();

//         if (data.quiz_content) {
//             const quizContent = data.quiz_content.replace(/```/g, "");

//             const formattedQuizContent = quizContent
//                 .split("\n")
//                 .map(line => {
//                     if (line.startsWith("**")) return `<strong>${line.replace(/\*\*/g, "")}</strong><br>`;
//                     if (line.startsWith("* ")) return `&nbsp;&nbsp;&bull; ${line.replace("* ", "")}<br>`;
//                     return `${line}<br>`;
//                 })
//                 .join("");

//             generatedContent.innerHTML += `
//                 <h3 id="quiz-questions-header">Quiz Questions</h3>
//                 <div id="quiz-questions-content" style="display: none;">
//                     ${formattedQuizContent}
//                 </div>
//                 <button id="save-pdf">Save PDF</button>
//             `;
//         } else {
//             generatedContent.innerHTML += `<p>Error: ${data.error || 'Unable to generate quiz questions'}</p>`;
//         }
//     } catch (error) {
//         generatedContent.innerHTML += `<p>Error: ${error.message}</p>`;
//     }finally {
//         setLoading(false); // Hide loading spinner
//     }
// }
// async function savePdf() {
//     const courseContentDiv = document.getElementById('quiz-questions-content');
    
//     if (!courseContentDiv) {
//         alert("No content available to save as PDF.");
//         return;
//     }

//     const content = courseContentDiv.innerHTML.trim();

//     if (!content) {
//         alert("Content is empty.");
//         return;
//     }

//     // Prepare the data to send
//     const data = {
//         content: content,  // The content to be saved as PDF
//         filename: "course-content.pdf"  // Optionally set a custom filename
//     };

//     try {
//         const response = await fetch('http://127.0.0.1:5001/save-pdf', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(data),
//         });

//         if (!response.ok) {
//             throw new Error('Failed to save PDF');
//         }

//         const result = await response.json();
//         alert(result.message || 'PDF saved successfully!');
//     } catch (error) {
//         alert("Error");
//     }
// }

    
// // Event delegation for dynamically added elements
// if (!generatedContent.hasAttribute('listener-attached')) {
//     generatedContent.addEventListener('click', (event) => {
//         if (event.target && event.target.classList.contains('refined-outline-header')) {
//             const contentId = event.target.id.replace('-header', '');
//             const contentDiv = document.getElementById(contentId);
//             contentDiv.style.display = contentDiv.style.display === 'none' ? 'block' : 'none';
//         }
//         if (event.target && event.target.id === 'course-outline-header') {
//             const courseOutlineDiv = document.getElementById('course-outline');
//             courseOutlineDiv.style.display = courseOutlineDiv.style.display === 'none' ? 'block' : 'none';
//         }
//         if (event.target && event.target.id === 'quiz-questions-header') {
//             const quizContentDiv = document.getElementById('quiz-questions-content');
//             console.log(quizContentDiv);
//             quizContentDiv.style.display = quizContentDiv.style.display === 'none' ? 'block' : 'none';
//         } 

//         if (event.target && event.target.id === 'complete-course') {
//             generateCompleteCourse();
//         }
//         if (event.target && event.target.id === 'quiz-questions-content1') {
//             generateQuizQuestions();
//         }

//         if (event.target && event.target.id === 'modify-course') {
//             const id = event.target.getAttribute('data-outline-id') || "course-outline";
//             modifyCourse(id);
//         }
//         if (event.target && event.target.id === 'save-pdf') {
//             console.log("hiiiii");
//             savePdf();
//         }
        
//         if (event.target && event.target.id === 'complete-course-header') {
//             const courseContentDiv = document.getElementById('complete-course-content');
//             courseContentDiv.style.display = courseContentDiv.style.display === 'none' ? 'block' : 'none';
//         }
//     });

//     generatedContent.setAttribute('listener-attached', 'true');
// }
const generateOutlineBtn = document.getElementById('generate-outline');
const newCourseBtn = document.getElementById('new-course');
const generatedContent = document.getElementById('generated-content');
const actionsDiv = document.getElementById('actions');
const loadingOverlay = document.getElementById('loading-overlay');
let refineCount = 0; 
// Function to handle generating the complete course
function setLoading(isLoading) {
    if (isLoading) {
        loadingOverlay.classList.add('active');
    } else {
        loadingOverlay.classList.remove('active');
    }
}

async function generateCompleteCourse() {
    const outlineDiv = document.querySelector('#course-outline, #course-outline1');
    if (!outlineDiv) {
        alert("Please generate a course outline first.");
        return;
    }

    const refinedOutline = outlineDiv.innerText.trim();
    setLoading(true);

    try {
        const response = await fetch('http://127.0.0.1:5001/generate-course-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refined_outline: refinedOutline }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch complete course content');
        }

        const data = await response.json();

        if (data.course_content) {
            const content = data.course_content.replace(/```/g, "");

            const formattedContent = content
                .split("\n")
                .map(line => {
                    if (line.startsWith("**")) return `<br><strong>${line.replace(/\*\*/g, "")}</strong><br>`;
                    if (line.startsWith("* ")) return `&nbsp;&nbsp;&bull; ${line.replace("* ", "")}<br>`;
                    if (line.startsWith("    * ")) return `&nbsp;&nbsp;&nbsp;&nbsp;&bull; ${line.replace("    * ", "")}<br>`;
                    return line.trim() ? `${line}<br>` : `<br>`;
                })
                .join("");

            generatedContent.innerHTML += `
                <h3 id="complete-course-header">Course Content</h3>
                <div id="complete-course-content" style="display: none;">
                    ${formattedContent}
                </div>
                <button id="quiz-questions-content1" >Generate quiz questions</button>
                <button id="modify-course" data-outline-id="complete-course-content">Modify Course Content</button>
            `;
        } else {
            generatedContent.innerHTML += `<p>Error: ${data.error || 'Unable to generate complete course content'}</p>`;
        }
    } catch (error) {
        generatedContent.innerHTML += `<p>Error: ${error.message}</p>`;
    }finally {
        setLoading(false); // Hide loading spinner
    }
}

// Function to generate a course outline
generateOutlineBtn.addEventListener('click', async () => {
    const courseName = document.getElementById('course-name').value;
    const targetAudience = document.getElementById('target-audience').value;
    const difficultyLevel = document.getElementById('difficulty-level').value;
    const modules = document.getElementById('modules').value;
    const duration = document.getElementById('duration').value;
    const credit = document.getElementById('credit').value;

    if (!courseName || !targetAudience || !difficultyLevel || !modules || !duration || !credit) {
        alert('Please fill out all fields');
        return;
    }

    // generatedContent.innerHTML = '<p>Generating course outline...</p>';
    setLoading(true);
    try {
        const response = await fetch('http://127.0.0.1:5001/generate-outline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                course_name: courseName,
                target_audience_edu_level: targetAudience,
                difficulty_level: difficultyLevel,
                num_modules: modules,
                course_duration: duration,
                course_credit: credit,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch course outline');
        }

        const data = await response.json();

        if (data.outline) {
            const outline = data.outline.replace(/```/g, "");

            const formattedContent = outline
                .split("\n")
                .map(line => {
                    if (line.startsWith("**")) return `<strong>${line.replace(/\*\*/g, "")}</strong><br>`;
                    if (line.startsWith("* ")) return `&nbsp;&nbsp;&bull; ${line.replace("* ", "")}<br>`;
                    if (line.startsWith("    * ")) return `&nbsp;&nbsp;&nbsp;&nbsp;&bull; ${line.replace("    * ", "")}<br>`;
                    return `${line}<br>`;
                })
                .join("");

            generatedContent.innerHTML = `
                <h3 id="course-outline-header">Course Outline</h3>
                <div id="course-outline" style="display: none;">
                    ${formattedContent}
                </div>
                <button id="complete-course">Generate Complete Course</button>
                <button id="modify-course" data-outline-id="course-outline">Modify Course Outline</button>
            `;

            actionsDiv.style.display = 'block';
            newCourseBtn.style.display = 'block';
        } else {
            generatedContent.innerHTML = `<p>Error: ${data.error || 'Unable to generate course outline'}</p>`;
        }
    } catch (error) {
        generatedContent.innerHTML = `<p>Error: ${error.message}</p>`;
    }
    finally {
        setLoading(false); // Hide loading spinner
    }
});

// Function to modify content
async function modifyCourse(id) {
    const courseOutlineDiv = document.getElementById(id);
    if (!courseOutlineDiv) {
        alert("Please generate a course outline first.");
        return;
    }

    const currentOutline = courseOutlineDiv.innerText.trim();
    const feedback = prompt("Enter your feedback for modification:");
    if (!feedback) {
        alert("Feedback is required.");
        return;
    }

    setLoading(true);

    try {
        const response = await fetch('http://127.0.0.1:5001/refine-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: currentOutline,
                feedback: feedback.trim(),
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch refined course outline');
        }

        const data = await response.json();

        if (data.refined_content) {
            const refinedOutline = data.refined_content.replace(/```/g, "");

            const formattedContent = refinedOutline
                .split("\n")
                .map(line => {
                    if (line.startsWith("**")) return `<strong>${line.replace(/\*\*/g, "")}</strong><br>`;
                    if (line.startsWith("* ")) return `&nbsp;&nbsp;&bull; ${line.replace("* ", "")}<br>`;
                    if (line.startsWith("    * ")) return `&nbsp;&nbsp;&nbsp;&nbsp;&bull; ${line.replace("    * ", "")}<br>`;
                    return `${line}<br>`;
                })
                .join("");

            refineCount++; // Increment counter to create unique IDs
            const newId = `course-outline-${refineCount}`;
            
            // Check if `id` is 'complete-course-content'
            if (id === "complete-course-content") {
                generatedContent.innerHTML += `
                    <h3 id="${newId}-header" class="refined-outline-header">Refined Course Outline</h3>
                    <div id="${newId}" class="refined-outline" style="display: none;">
                        ${formattedContent}
                    </div>
                    <button id="quiz-questions-content1" >Generate Quiz questions</button>
                    <button id="modify-course" data-outline-id="complete-course-content">Modify Course Outline</button>
                `;
            } else {
                generatedContent.innerHTML += `
                    <h3 id="${newId}-header" class="refined-outline-header">Refined Course Outline</h3>
                    <div id="${newId}" class="refined-outline" style="display: none;">
                        ${formattedContent}
                    </div>
                    <button id="complete-course">Generate Complete Course</button>
                    <button id="modify-course" data-outline-id="${newId}">Modify Course Outline</button>
                `;
            }
        } else {
            generatedContent.innerHTML += `<p>Error: ${data.error || 'Unable to refine course outline'}</p>`;
        }
    } catch (error) {
        generatedContent.innerHTML += `<p>Error: ${error.message}</p>`;
    }finally {
        setLoading(false); // Hide loading spinner
    }
}

// Function to generate quiz questions
async function generateQuizQuestions() {
    
    const courseContentDiv = document.getElementById('complete-course-content');
    if (!courseContentDiv) {
        alert("Please generate course content first.");
        return;
    }

    const courseContent = courseContentDiv.innerText.trim();
    if (!courseContent) {
        alert("Course content is empty.");
        return;
    }

    setLoading(true);

    try {
        const response = await fetch('http://127.0.0.1:5001/generate-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ course_content: courseContent }),
        });

        if (!response.ok) {
            throw new Error('Failed to generate quiz questions');
        }

        const data = await response.json();

        if (data.quiz_content) {
            const quizContent = data.quiz_content.replace(/```/g, "");

            const formattedQuizContent = quizContent
                .split("\n")
                .map(line => {
                    if (line.startsWith("**")) return `<strong>${line.replace(/\*\*/g, "")}</strong><br>`;
                    if (line.startsWith("* ")) return `&nbsp;&nbsp;&bull; ${line.replace("* ", "")}<br>`;
                    return `${line}<br>`;
                })
                .join("");

            generatedContent.innerHTML += `
                <h3 id="quiz-questions-header">Quiz Questions</h3>
                <div id="quiz-questions-content" style="display: none;">
                    ${formattedQuizContent}
                </div>
                <button id="save-pdf">Save PDF</button>
            `;
        } else {
            generatedContent.innerHTML += `<p>Error: ${data.error || 'Unable to generate quiz questions'}</p>`;
        }
    } catch (error) {
        generatedContent.innerHTML += `<p>Error: ${error.message}</p>`;
    }finally {
        setLoading(false); // Hide loading spinner
    }
}
async function savePdf() {
    const courseContentDiv = document.getElementById('quiz-questions-content');
    
    if (!courseContentDiv) {
        alert("No content available to save as PDF.");
        return;
    }

    const content = courseContentDiv.innerHTML.trim();

    if (!content) {
        alert("Content is empty.");
        return;
    }

    // Prepare the data to send
    const data = {
        content: content,  // The content to be saved as PDF
        filename: "course-content.pdf"  // Optionally set a custom filename
    };

    try {
        const response = await fetch('http://127.0.0.1:5001/save-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Failed to save PDF');
        }

        const result = await response.json();
        alert(result.message || 'PDF saved successfully!');
    } catch (error) {
        alert("Error");
    }
}

    
// Event delegation for dynamically added elements
if (!generatedContent.hasAttribute('listener-attached')) {
    generatedContent.addEventListener('click', (event) => {
        if (event.target && event.target.classList.contains('refined-outline-header')) {
            const contentId = event.target.id.replace('-header', '');
            const contentDiv = document.getElementById(contentId);
            contentDiv.style.display = contentDiv.style.display === 'none' ? 'block' : 'none';
        }
        if (event.target && event.target.id === 'course-outline-header') {
            const courseOutlineDiv = document.getElementById('course-outline');
            courseOutlineDiv.style.display = courseOutlineDiv.style.display === 'none' ? 'block' : 'none';
        }
        if (event.target && event.target.id === 'quiz-questions-header') {
            const quizContentDiv = document.getElementById('quiz-questions-content');
            console.log(quizContentDiv);
            quizContentDiv.style.display = quizContentDiv.style.display === 'none' ? 'block' : 'none';
        } 

        if (event.target && event.target.id === 'complete-course') {
            generateCompleteCourse();
        }
        if (event.target && event.target.id === 'quiz-questions-content1') {
            generateQuizQuestions();
        }

        if (event.target && event.target.id === 'modify-course') {
            const id = event.target.getAttribute('data-outline-id') || "course-outline";
            modifyCourse(id);
        }
        if (event.target && event.target.id === 'save-pdf') {
            console.log("hiiiii");
            savePdf();
        }
        
        if (event.target && event.target.id === 'complete-course-header') {
            const courseContentDiv = document.getElementById('complete-course-content');
            courseContentDiv.style.display = courseContentDiv.style.display === 'none' ? 'block' : 'none';
        }
    });

    generatedContent.setAttribute('listener-attached', 'true');
}
