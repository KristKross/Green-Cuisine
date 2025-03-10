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
        const username = localStorage.getItem('username');
        if (username) {
            loginName.textContent = `Hello, ${username}`;
            loginName.href = '/profile';
        }
    }
}