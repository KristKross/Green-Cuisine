import _ from 'lodash';

// Function to handle login form submission
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#login-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const data = new FormData(event.target);
        const jsonData = {};
        data.forEach((value, key) => (jsonData[key] = value));

        // Send login data to the server
        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData)
        })
        .then(response => response.json())
        .then((data) => {
            if (data.success) {   
                window.location.href = '/';
            } else {
                alert(data.message);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });
});
