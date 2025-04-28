import _ from 'lodash';
import '../scss/main.scss';

document.addEventListener('DOMContentLoaded', () => {
    const loginName = document.querySelector('#login-name');
    setupLoginName(loginName);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
            document.body.classList.add('scrolled');
        } else {
            document.body.classList.remove('scrolled');
        }
    });

    const menuToggle = document.querySelector('.menu-toggle');

    menuToggle.addEventListener('click', () => {
        const menu = document.querySelector('.menu');
        menu.classList.toggle('show');
    });

    setupSearchPage();
});

function setupLoginName(loginName) {
    if (loginName) {
        fetch('/session-data')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    loginName.textContent = `Hello, ${data.username}`;
                    loginName.href = '/profile';
                }
            })
        .catch(error => console.error('Error fetching session data:', error));
    }
}

function setupSearchPage() {
    const categoryItems = document.querySelectorAll('.sub-menu p');

    categoryItems.forEach(item => {
        item.addEventListener('click', _.debounce(() => {
            const search = item.getAttribute('data-search');
            const filter = item.closest('ul')?.previousElementSibling?.getAttribute('data-filter');
            const category = item.getAttribute('data-category');

            const queryUrlParams = new URLSearchParams({
                q: search || 'recipe',
            });
    
            if (filter) {
                queryUrlParams.append(filter, category);
            }

            window.location.href = `/search?${queryUrlParams.toString()}`;
        }, 300));
    });
    
    
    let recipesMap = {
        "Non-Traditional Pasta Carbonara" : 'http://www.edamam.com/ontologies/edamam.owl#recipe_da4a5ccd1498a3fb48eee56793ca4fbb',
        "Classic American Burgers": 'http://www.edamam.com/ontologies/edamam.owl#recipe_b9db2fefe520aea1f481adbfc007b832',
        "Pan-Seared Ribeye Steak": 'http://www.edamam.com/ontologies/edamam.owl#recipe_2efb6c7072df4012bc84122481cc5ebd',
        "Classic French Ratatouille": 'http://www.edamam.com/ontologies/edamam.owl#recipe_082d4785f00436b464e5956c21da5551',
        "Indian Butter Chicken": 'http://www.edamam.com/ontologies/edamam.owl#recipe_820a30063d65927b942d592be2b1056b',
        "Authentic Mexican Tacos": 'http://www.edamam.com/ontologies/edamam.owl#recipe_e3f85c5e1b3a43699722f6b85bfc2f54',
    };
    
    document.querySelectorAll('.recipes > ul > li > p').forEach(recipe => {
        recipe.addEventListener('click', _.debounce(() => {
            const recipeName = recipe.textContent;
            const recipeURI = _.get(recipesMap, recipeName);
    
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
            };
        }, 300));
    });
}