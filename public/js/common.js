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

    const cuisines = document.querySelectorAll('.cuisines > ul > li > p');
    cuisines.forEach(cuisine => {
        cuisine.addEventListener('click', () => {
            const cuisineText = cuisine.textContent.toLowerCase();
            window.location.href = `/search?q=recipe&page=1&cuisineType=${encodeURIComponent(cuisineText)}`;
        });
    });

    recipesMap = {
        "Non-Traditional Pasta Carbonara" : 'http://www.edamam.com/ontologies/edamam.owl#recipe_da4a5ccd1498a3fb48eee56793ca4fbb',
        "Classic American Burgers": 'http://www.edamam.com/ontologies/edamam.owl#recipe_b9db2fefe520aea1f481adbfc007b832',
        "Pan-Seared Ribeye Steak": 'http://www.edamam.com/ontologies/edamam.owl#recipe_2efb6c7072df4012bc84122481cc5ebd',
        "Classic French Ratatouille": 'http://www.edamam.com/ontologies/edamam.owl#recipe_082d4785f00436b464e5956c21da5551',
        "Indian Butter Chicken": 'http://www.edamam.com/ontologies/edamam.owl#recipe_820a30063d65927b942d592be2b1056b',
        "Authentic Mexican Tacos": 'http://www.edamam.com/ontologies/edamam.owl#recipe_e3f85c5e1b3a43699722f6b85bfc2f54',
    }

    document.querySelectorAll('.recipes > ul > li > p').forEach(recipe => {
        recipe.addEventListener('click', () => {
            const recipeName = recipe.textContent;
            const recipeURI = recipesMap[recipeName];
    
            if (recipeURI) {
                fetch(`/featured-search?q=${encodeURIComponent(recipeURI)}`)
                    .then(response => response.json())
                    .then(data => {
                        const recipes = data.recipes;
                        if (recipes && recipes.length > 0) {
                            const recipe = recipes[0];
                            localStorage.setItem('selectedRecipe', JSON.stringify(recipe));
                            window.location.href = `/recipe?q=${encodeURIComponent(recipe.label)}`;
                        } else {
                            console.error('Recipe not found in the data:', recipeName);
                        }
                    })
                .catch(error => console.error('Error fetching featured search:', error));
            }W
        });
    });
}