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
            const emailInput = document.querySelector('#email');
            const emailError = document.querySelector('#email-error');

            const passwordInput = document.querySelector('#password');
            const passwordError = document.querySelector('#password-error');

            if (data.success) {   
                emailInput.classList.remove('error');
                emailError.textContent = '';

                passwordInput.classList.remove('error');
                passwordError.textContent = '';

                window.location.href = '/';
            } else {
                emailInput.classList.add('error');
                emailError.textContent = data.message || 'Invalid email or password';

                passwordInput.classList.add('error');
                passwordError.textContent = data.message || 'Invalid email or password';
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });
});
