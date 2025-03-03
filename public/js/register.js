// Call function to set up the event listener of the search form
document.querySelector('#search-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const recipeName = event.target.elements.recipeName.value;;
    currentPage = 1;
    window.location.href = `/search?q=${recipeName}&page=${currentPage}`; 
});

document.querySelector('#register-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const jsonData = {};
    data.forEach((value, key) => (jsonData[key] = value));

    if (jsonData.password !== jsonData['confirm-password']) {
        alert('Password and confirm password do not match');
        return;
    }

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
        } else if (data.message === 'Email is already taken') {
            alert('Email is already taken, please choose another one.');
        } else {
            alert(data.message);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});
