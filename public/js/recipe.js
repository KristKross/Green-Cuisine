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
function showError() {
    const errorMessageDiv = document.createElement('div');
    errorMessageDiv.id = 'error-message';
    errorMessageDiv.innerHTML = `
        <div class="error-title">Whoops! This one's a bit undercooked.</div>
        <div class="error-message">The page you're looking for is unavailable. Please try again using our menu at the top.</div>
    `;

    const main = document.querySelector('main');
    main.appendChild(errorMessageDiv);

    errorMessageDiv.style.display = 'block';
}


// Get the recipe name from the URL
let recipeName = new URLSearchParams(window.location.search).get('q');
if (recipeName) {
    try {
        const decodedRecipeName = decodeURIComponent(recipeName);
        const recipeData = JSON.parse(localStorage.getItem('selectedRecipe'));

        // Check if the recipe data is valid and matches the decoded recipe name
        if (!recipeData || recipeData.label !== decodedRecipeName) {
            showError();
        } else {
            const elements = {
                recipeImage: document.getElementById('recipe-image'),
                recipeNameElement: document.getElementById('recipe-name'),
                recipeCookingTime: document.getElementById('recipe-cooking-time'),
                recipeIngredients: document.getElementById('recipe-ingredients'),
            };

            // Check if all elements are present
            if (!Object.values(elements).every(el => el)) {
                showError();
            } else {
                elements.recipeImage.src = recipeData.image;
                elements.recipeImage.alt = recipeData.label;
                elements.recipeNameElement.textContent = recipeData.label;
                elements.recipeCookingTime.textContent = `Cooking Time: ${recipeData.totalTime} min`;
                elements.recipeIngredients.innerHTML = `Ingredients:
                    <ul>
                        ${recipeData.ingredientLines.map(ingredient => `
                            <li>${ingredient}</li>
                        `).join('')}
                    </ul>
                `;
            }
        }
    } catch (error) {
        showError('Invalid recipe name in the URL.');
    }
} else {
    showError();
}
