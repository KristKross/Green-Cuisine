document.querySelector('form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const recipeName = event.target.elements.recipeName.value;
    const response = await fetch('/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeName })
    });
    const recipes = await response.json();
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = recipes.map(recipe => `
        <div class="recipe">
            <img src="${recipe.image}" alt="${recipe.label}">
            <h3>${recipe.dishType.join(', ')}</h3>
            <h2>${recipe.label}</h2>
        </div>
    `).join('');
});