const uploadForm = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const fileLabel = document.getElementById('fileLabel');
const resultDiv = document.getElementById('result');
const errorDiv = document.getElementById('error');

fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        fileLabel.textContent = fileInput.files[0].name;
    } else {
        fileLabel.textContent = "Click to upload a file";
    }
});

uploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    resultDiv.textContent = '';
    errorDiv.textContent = '';

    const file = fileInput.files[0];
    if (!file) {
        errorDiv.textContent = 'Please upload a file first.';
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('http://127.0.0.1:5000/check-plagiarism', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            resultDiv.textContent = `Plagiarism Percentage: ${data.plagiarism_percentage.toFixed(2)}%`;
        } else {
            errorDiv.textContent = data.error || 'An error occurred while checking plagiarism.';
        }
    } catch (error) {
        errorDiv.textContent = 'Unable to connect to the server. Please try again later.';
    }
});
