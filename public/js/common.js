document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#search-form')) {
        const searchForm = document.querySelector('#search-form');
        setupSearchForm(searchForm);
    }
    if (document.querySelector('#login-name')) {
        const loginName = document.querySelector('#login-name');
        setupLoginName(loginName);
    }
    
    setupSearchPage();
});

function setupSearchForm(searchForm) {
    if (searchForm) {
        searchForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const recipeName = event.target.elements.recipeName.value;
            window.location.href = `/search?q=${recipeName}&page=1`;
        });
    }
}

function setupLoginName(loginName) {
    if (loginName) {
        fetch('/session-data')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
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

function setupSearchPage() {
    const categoriesMap = {
        'main dishes': 'main course',
        'desserts': 'desserts',
        'appetisers': 'starter',
        'soups': 'soup',
        'salads': 'salad',
        'breakfast': 'breakfast'
    };
    
    const categories = document.querySelectorAll('.categories > ul > li > p');
    categories.forEach(category => {
        category.addEventListener('click', () => {
            const categoryText = category.textContent.toLowerCase();
            currentCuisineType = '';
            const type = ['soups', 'salads', 'main dishes', 'appetisers', 'desserts'].includes(categoryText) ? 'dishType' : 'mealType';
            window.location.href = `/search?q=recipe&page=1&${type}=${encodeURIComponent(categoriesMap[categoryText])}`;
        });
    });

    if (document.querySelector('.cuisines')) {
        const cuisines = document.querySelectorAll('.cuisines > ul > li > p');
        cuisines.forEach(cuisine => {
            cuisine.addEventListener('click', () => {
                const cuisineText = cuisine.textContent.toLowerCase();
                window.location.href = `/search?q=recipe&page=1&cuisineType=${encodeURIComponent(cuisineText)}`;
            });
        });
    }
}