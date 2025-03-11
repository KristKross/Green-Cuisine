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
                <p class="dish-type">${mainRecipe.dishType}</p>
                    <p><b>Cooking Time:</b> ${mainRecipe.totalTime} min</p>
                    <p class="recipe-name">${mainRecipe.label}</p>
            </div>
        `;
    }
    
    const sideRecipes = seasonalRecipes.slice(1, 3);
    sideContainer.innerHTML = sideRecipes.map(recipe => `
        <div class="seasonal-card" style="background-image: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent), url('${recipe.image}');">
                <p class="dish-type">${recipe.dishType}</p>
                <p><b>Cooking Time:</b> ${recipe.totalTime} min</p>
                <p class="recipe-name">${recipe.label}</p>
            </div>
    `).join('');
}