import _ from 'lodash';

// Event listener for when the html is loaded
document.querySelector('#register-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const jsonData = {};

    // Send login data to the server
    data.forEach((value, key) => (jsonData[key] = value));

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonData)
    })
    .then(response => response.json())
    .then((data) => {
        if (data.success) {
            window.location.href = '/login';
        } else {
            alert(data.message);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

