// Event listener for when the html is loaded
document.querySelector('#register-form').addEventListener('submit', (event) => {
    event.preventDefault();

    ['email', 'username', 'password', 'confirm-password'].forEach(field => {
        document.querySelector(`#${field}`).classList.remove('error');
        const errorEl = document.querySelector(`#${field}-error`);
        if (errorEl) errorEl.textContent = '';
    });

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
            const field = data.field;
            const message = data.message;

            if (field) {
                document.querySelector(`#${field}`).classList.add('error');
                document.querySelector(`#${field}-error`).textContent = message;
            } else {
                alert(message);
            }
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

