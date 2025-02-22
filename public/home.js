// Run this function after the page has loaded
// This function fetches the random recipes from the server and renders them on the page
document.addEventListener('DOMContentLoaded', async () => {
    const resultsDiv = document.getElementById('results');
    try {
        const response = await fetch('/recipes');
        const recipes = await response.json();
        renderRecipes(recipes);
    } catch (error) {
        console.error('Error fetching random recipes:', error);
    }
});

// This function renders the recipes on the page
function renderRecipes(recipes) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = recipes.map(recipe => `
        <div class="recipe">
            <img src="${recipe.image}" alt="${recipe.label}">
            <div class="dish-type">${recipe.dishType}</div>
            <div class="recipe-name">${recipe.label}</div>
            <div class="text-info">
                <p><b>Calories:</b> ${Math.round(recipe.calories)}</p>
                <p><b>Cooking Time:</b> ${recipe.totalTime} min</p>
            </div>
        </div>
    `).join('');
}

// This function fetches the search results from the server and renders them on the page
document.querySelector('form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const recipeName = event.target.elements.recipeName.value;
    try {
        const response = await fetch('/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipeName })
        });
        const recipes = await response.json();
        renderRecipes(recipes);
    } catch (error) {
        console.error('Error fetching search results:', error);
    }
});