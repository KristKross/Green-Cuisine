let recipeName = new URLSearchParams(window.location.search).get('q');

// Function to attach event listeners
function attachEventListeners() {
    document.querySelector('#search-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const recipeName = event.target.elements.recipeName.value;
        currentRecipeName = recipeName;
        currentPage = 1;
        window.location.href = `/search?q=${encodeURIComponent(recipeName)}&page=${currentPage}`;
    });
}

// Call attachEventListeners to set up the event listeners
attachEventListeners();

// Function to show error messages
function showError(message) {
    const errorMessageDiv = document.createElement('div');
    errorMessageDiv.id = 'error-message';
    errorMessageDiv.innerHTML = `
        <div class="error-title">Whoops! This one's a bit undercooked.</div>
        <div class="error-message">${message || "The page you're looking for is unavailable. Please try again using our menu at the top."}</div>
    `;

    const main = document.querySelector('main');
    main.appendChild(errorMessageDiv);
}

if (recipeName) {
    try {
        const decodedRecipeName = decodeURIComponent(recipeName);
        const recipeData = JSON.parse(localStorage.getItem('selectedRecipe'));
        console.log('Recipe data:', recipeData);

        // Check if the recipe data is valid and matches the decoded recipe name
        if (!recipeData || recipeData.label !== decodedRecipeName) {
            showError('Invalid recipe name in the URL.');
        } else {
            const recipeContainer = document.getElementById('recipe');

            // Create the inner HTML for the recipe
            recipeContainer.innerHTML = `
                <h1 class="recipe-name">${recipeData.label}</h1>
                <img class="recipe-image" src="${recipeData.image}" alt="${recipeData.label}">
                <div class="recipe-details">
                    <p class="recipe-dish-type">${recipeData.dishType}</p>
                    <p class="recipe-cooking-time">Cooking Time: ${recipeData.totalTime} min</p>
                    <p class="recipe-ingredients">Ingredients:
                        <ul>
                            ${recipeData.ingredientLines.map(ingredient => `
                                <li>${ingredient}</li>
                            `).join('')}
                        </ul>
                    </p>
                </div>
            `;
        }
    } catch (error) {
        showError('Error decoding recipe name from the URL.');
    }
} else {
    showError('No recipe name found in the URL.');
}
