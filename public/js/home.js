document.addEventListener('DOMContentLoaded', () => {
    fetch('/seasonal-recipes')
        .then(response => response.json())
        .then(data => {
            const seasonalRecipes = data.recipes;
            renderSeasonalRecipes(seasonalRecipes);
        })
        .catch(error => console.error('Error fetching season:', error));
});

function renderSeasonalRecipes(seasonalRecipes) {
    const mainContainer = document.getElementById('main-container');
    const sideContainer = document.getElementById('side-container');

    if (seasonalRecipes.length > 0) {
        const mainRecipe = seasonalRecipes[0];
        mainContainer.innerHTML = `
            <div class="seasonal-card" style="background-image: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent), url('${mainRecipe.image}');">
                <div class="text-container" style="display: ${mainRecipe.dishType ? 'block' : 'none'};">
                    <p class="dish-type">${mainRecipe.dishType}</p>
                </div>
                <div class="time-container">
                    <div class="clock-image"></div> 
                    <p>${mainRecipe.totalTime} min</p>
                </div>
                <p class="recipe-name">${mainRecipe.label}</p>
            </div>
        `;
        mainContainer.addEventListener('click', () => {
            localStorage.setItem('selectedRecipe', JSON.stringify(mainRecipe));
            window.location.href = `/recipe?q=${encodeURIComponent(mainRecipe.label)}`;
        });
    }
    
    const sideRecipes = seasonalRecipes.slice(1, 3);
    sideContainer.innerHTML = sideRecipes.map(recipe => `
        <div class="seasonal-card" style="background-image: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent), url('${recipe.image}');">
                <div class="text-container" style="display: ${recipe.dishType ? 'block' : 'none'};">
                    <p class="dish-type">${recipe.dishType}</p>
                </div>
                <div class="time-container">
                    <div class="clock-image"></div> 
                    <p>${recipe.totalTime} min</p>
                </div>
                <p class="recipe-name">${recipe.label}</p>
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

document.addEventListener('DOMContentLoaded', () => {
    const categories = {
        'main-dishes': 'main course',
        'desserts': 'desserts',
        'appetisers': 'starter',
        'soups': 'soups',
        'salads': 'salad',
        'breakfast': 'breakfast'
    };

    Object.keys(categories).forEach(categoryId => {
        const categoryCard = document.getElementById(categoryId);
        if (categoryCard) {
            categoryCard.addEventListener('click', () => {
                searchRecipes(categories[categoryId]);
            });
        }
    });
});

function searchRecipes(category) {
    event.preventDefault();
    if (['soups', 'salad', 'main course', 'starter', 'desserts'].includes(category)) {
        window.location.href = `/search?q=recipe&dishType=${encodeURIComponent(category)}&page=1`;
    } else {
        window.location.href = `/search?q=recipe&mealType=${encodeURIComponent(category)}&page=1`;
    }
}
