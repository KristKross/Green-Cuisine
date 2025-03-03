// Call function to set up the event listener of the search form
document.querySelector('#search-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const recipeName = event.target.elements.recipeName.value;;
    currentPage = 1;
    window.location.href = `/search?q=${recipeName}&page=${currentPage}`; 
});

// Call function to set up the event listener of the login form
document.querySelector('#login-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const jsonData = {};
    data.forEach((value, key) => (jsonData[key] = value));

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
    }
);