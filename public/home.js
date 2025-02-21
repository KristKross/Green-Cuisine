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

function renderRecipes(recipes) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = recipes.map(recipe => `
        <div class="recipe">
            <img src="${recipe.image}" alt="${recipe.label}">
            <h3>${recipe.dishType}</h3>
            <h2>${recipe.label}</h2>
            <div class="text-info">
                <p><b>Calories:</b> ${Math.round(recipe.calories)}</p>
                <p><b>Cooking Time:</b> ${recipe.totalTime} min</p>
            </div>
        </div>
    `).join('');
}

document.querySelector('form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const recipeName = event.target.elements.recipeName.value;
    const resultsDiv = document.getElementById('results');
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