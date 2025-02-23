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

// This function renders the recipes on the page
function renderRecipes(recipes) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = recipes.map(recipe => `
        <div class="recipe">
            <img src="${recipe.image}" alt="${recipe.label}">
            <div class="column">
                <div class="dish-type">${recipe.dishType}</div>
                <div class="recipe-name">${recipe.label}</div>
                <p><b>Cooking Time:</b> ${recipe.totalTime > 0 ? `${recipe.totalTime} min` : 'N/A'}</p>
            </div>
        </div>
    `).join('');
}