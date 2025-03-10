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
                console.log(data);
                if (data.success) { // Check if login was successful    
                    localStorage.setItem('username', data.username);
                    localStorage.setItem('userID', data.userID);
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
