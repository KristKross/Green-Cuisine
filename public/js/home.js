document.addEventListener('DOMContentLoaded', async () => {
    const CACHE_EXPIRY_TIME = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

    const lastFetchTime = localStorage.getItem('lastFetchTime');
    const now = Date.now();

    const cachedFeaturedRecipes = localStorage.getItem('featuredRecipes');
    const cachedSeasonalRecipes = localStorage.getItem('seasonalRecipes');

    if (!lastFetchTime || now - lastFetchTime > CACHE_EXPIRY_TIME) {
        localStorage.setItem('lastFetchTime', now);

        // Fetch Featured Recipes
        try {
            const recipeQueries = [
                'http://www.edamam.com/ontologies/edamam.owl#recipe_da4a5ccd1498a3fb48eee56793ca4fbb',
                'http://www.edamam.com/ontologies/edamam.owl#recipe_b9db2fefe520aea1f481adbfc007b832',
                'http://www.edamam.com/ontologies/edamam.owl#recipe_2efb6c7072df4012bc84122481cc5ebd'
            ];
            const results = await Promise.all(
                recipeQueries.map(query =>
                    fetch(`/featured-search?q=${encodeURIComponent(query)}`)
                        .then(response => response.json())
                )
            );
            const singleRecipes = results.flatMap(result => result.recipes);
            localStorage.setItem('featuredRecipes', JSON.stringify(singleRecipes));
            renderFeaturedRecipes(singleRecipes);
        } catch (error) {
            console.error('Error fetching featured recipes:', error);
        }

        // Fetch Seasonal Recipes
        try {
            const response = await fetch('/seasonal-recipes');
            const data = await response.json();
            localStorage.setItem('seasonalRecipes', JSON.stringify(data.recipes));
            renderSeasonalRecipes(data.recipes);
        } catch (error) {
            console.error('Error fetching seasonal recipes:', error);
        }
    } else {
        // Use Cached Data
        if (cachedFeaturedRecipes) {
            renderFeaturedRecipes(JSON.parse(cachedFeaturedRecipes));
        }
        // Use Cached Seasonal Recipes
        if (cachedSeasonalRecipes) {
            renderSeasonalRecipes(JSON.parse(cachedSeasonalRecipes));
        }
    }
});

// Function to render featured recipes
function renderFeaturedRecipes(recipes) {
    const featuredContainer = document.getElementById('featured');
    const classes = ['sub-card left', 'main-card', 'sub-card right'];
    
    featuredContainer.innerHTML = `
        <div class="featured-container">
            ${recipes.slice(0, 3).map((recipe, index) => `
                <div class="featured-card ${classes[index]}" style="background-image: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent), url('${recipe.image}');">
                    <div class="time-container">
                        <div class="clock-image"></div>
                        <h4>${recipe.totalTime === 0 ? "N/A" : `${recipe.totalTime} min`}</h4>
                    </div>
                    <h3 class="recipe-name">${recipe.label}</h3>
                </div>
            `).join('')}
        </div>
    `;
    featuredContainer.querySelectorAll('.featured-card').forEach((recipeCard, index) => {
        recipeCard.addEventListener('click', () => {
            localStorage.setItem('selectedRecipe', JSON.stringify(recipes[index]));
            window.location.href = `/recipe?q=${encodeURIComponent(recipes[index].label)}`;
        });
    });
}

// Function to render seasonal recipes
function renderSeasonalRecipes(seasonalRecipes) {
    const mainContainer = document.getElementById('main-container');
    const sideContainer = document.getElementById('side-container');

    // Render main recipe
    if (seasonalRecipes) {
        const mainRecipe = seasonalRecipes[0];
        mainContainer.innerHTML = `
            <div class="seasonal-card" style="background-image: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent), url('${mainRecipe.image}');">
                <div class="text-container" style="display: ${mainRecipe.dishType ? 'block' : 'none'};">
                    <p class="dish-type">${mainRecipe.dishType}</p>
                </div>
                <div class="time-container">
                    <div class="clock-image"></div> 
                    <h4>${mainRecipe.totalTime === 0 ? "N/A" : `${mainRecipe.totalTime} min`}</h4>
                </div>
                <h3 class="recipe-name">${mainRecipe.label}</h3>
            </div>
        `;
        mainContainer.addEventListener('click', () => {
            localStorage.setItem('selectedRecipe', JSON.stringify(mainRecipe));
            window.location.href = `/recipe?q=${encodeURIComponent(mainRecipe.label)}`;
        });
    }
    
    // Render side recipes
    const sideRecipes = seasonalRecipes.slice(1, 3);
    sideContainer.innerHTML = sideRecipes.map(recipe => `
        <div class="seasonal-card" style="background-image: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent), url('${recipe.image}');">
                <div class="text-container" style="display: ${recipe.dishType ? 'block' : 'none'};">
                    <p class="dish-type">${recipe.dishType}</p>
                </div>
                <div class="time-container">
                    <div class="clock-image"></div> 
                    <h4>${recipe.totalTime === 0 ? "N/A" : `${recipe.totalTime} min`}</h4>
                </div>
                <h3 class="recipe-name">${recipe.label}</h3>
            </div>
    `).join('');
    sideRecipes.forEach(recipe => {
        const sideRecipeElement = sideContainer.querySelector(`.seasonal-card[style*="${recipe.image}"]`);
        sideRecipeElement.addEventListener('click', () => {
            localStorage.setItem('selectedRecipe', JSON.stringify(recipe));
            window.location.href = `/recipe?q=${encodeURIComponent(recipe.label)}`;
        });
    });
}

// Function to handle search form submission
const categoriesMap = {
    'main dishes': 'main course',
    'desserts': 'desserts',
    'appetisers': 'starter',
    'soups': 'soup',
    'salads': 'salad',
    'breakfast': 'breakfast'
};

// Function to handle category selection
document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
        const category = card.querySelector('h3').textContent.toLowerCase();
        if (['soups', 'salads', 'main dishes', 'appetisers', 'desserts'].includes(category)) {
            window.location.href = `/search?q=recipe&page=1&dishType=${encodeURIComponent(categoriesMap[category])}`;
        } else {
            window.location.href = `/search?q=recipe&page=1&mealType=${encodeURIComponent(categoriesMap[category])}`;
        }
    });
});

// Function to handle diet preference selection
const dietLabelMap = {
    'vegan': 'vegan',
    'vegetarian': 'vegetarian',
    'gluten-free': 'gluten-free',
    'low-carb': 'low-carb',
    'paleo': 'paleo',
    'keto': 'keto-friendly'
};

// Function to handle diet preference selection
document.querySelectorAll('.preference-card').forEach(card => {
    card.addEventListener('click', () => {
        const diet = card.querySelector('h3').textContent.trim().toLowerCase();

        window.location.href = `/search?q=recipe&page=1&health=${encodeURIComponent(dietLabelMap[diet])}`;
    });
});