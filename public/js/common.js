document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#search-form')) {
        const searchForm = document.querySelector('#search-form');
        setupSearchForm(searchForm);
    }
    if (document.querySelector('#login-name')) {
        const loginName = document.querySelector('#login-name');
        setupLoginName(loginName);
    }
});

function setupSearchForm(searchForm) {
    if (searchForm) {
        searchForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const recipeName = event.target.elements.recipeName.value;
            currentPage = 1;
            window.location.href = `/search?q=${recipeName}&page=${currentPage}`;
        });
    }
}

function setupLoginName(loginName) {
    if (loginName) {
        fetch('/session-data')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.username) {
                    loginName.textContent = `Hello, ${data.username}`;
                    loginName.href = '/profile';
                } else {
                    loginName.textContent = 'Log In';
                    loginName.href = '/login';
                }
            })
        .catch(error => console.error('Error fetching session data:', error));
    }
}

