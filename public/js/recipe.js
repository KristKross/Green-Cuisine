let recipeName = new URLSearchParams(window.location.search).get('q');
if (recipeName) {
    const decodedRecipeName = decodeURIComponent(recipeName);
    const recipeData = JSON.parse(localStorage.getItem('selectedRecipe'));

    if (recipeData && recipeData.label === decodedRecipeName) {
        const elements = {
            recipeImage: document.getElementById('recipe-image'),
            recipeNameElement: document.getElementById('recipe-name'),
            recipeDishType: document.getElementById('recipe-dish-type'),
            recipeCookingTime: document.getElementById('recipe-cooking-time'),
            recipeIngredients: document.getElementById('recipe-ingredients'),
            recipeInstructions: document.getElementById('recipe-instructions')
        };

        if (Object.values(elements).every(el => el)) {
            elements.recipeImage.src = recipeData.image;
            elements.recipeImage.alt = recipeData.label;
            elements.recipeNameElement.textContent = recipeData.label;
            elements.recipeDishType.textContent = `Dish Type: ${recipeData.dishType}`;
            elements.recipeCookingTime.textContent = `Cooking Time: ${recipeData.totalTime > 0 ? `${recipeData.totalTime} min` : 'N/A'}`;
            elements.recipeIngredients.textContent = `Ingredients: ${recipeData.ingredientLines.join(', ')}`;
            elements.recipeInstructions.innerHTML = `Instructions: <a href="${recipeData.url}" target="_blank">View full instructions</a>`;
        } else {
            showError();
        }
    } else {
        showError();
    }
} else {
    showError();
}

function showError() {
    document.getElementById('recipe-details').innerHTML = '<p>Error: No recipe data found.</p>';
}