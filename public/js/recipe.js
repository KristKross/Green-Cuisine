let recipeName = new URLSearchParams(window.location.search).get('q');

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

// Function to render nutrient information
function renderNutrient(name, nutrient) {
    return nutrient ? `
        <div>
            <div class="text-container">
                <p>${name}</p>
                <p class="nutrition-value">${Math.round(nutrient.quantity)}${nutrient.unit}</p>
            </div>
        </div>
    ` : '';
}

function renderSubNutrient(name, nutrient) {
    return nutrient ? `
        <li>
            <p>${name}</p>
            <p class="nutrition-value">${Math.round(nutrient.quantity)}${nutrient.unit}</p>
        </li>
    ` : '';
}

// Function to fetch favourites from the database
async function fetchFavouritesFromDatabase() {
    const sessionResponse = await fetch('/session-data');
    const sessionData = await sessionResponse.json();

    if (!sessionData.success || !sessionData.userID) {
        return [];
    }

    try {
        const response = await fetch(`/favourites/${sessionData.userID}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
            console.error('Error fetching favourites:', result.message);
            return [];
        }

        return result.favourites.map(fav => ({
            name: fav.RecipeName,
            uri: fav.RecipeURI
        }));

    } catch (error) {
        console.error('Error fetching favourites:', error);
        return [];
    }
}

async function handleFavouriteButtonClick(recipe) {
    const favouriteButton = document.querySelector('.favourite-button');
    const sessionResponse = await fetch('/session-data');
    const sessionData = await sessionResponse.json();

    if (!sessionData.success || !sessionData.userID) {
        window.location.href = '/login';
        return;
    }

    const favouriteData = {
        user_id: sessionData.userID,
        recipe_name: recipe.label, 
        recipe_uri: recipe.uri
    };

    try {
        const isFavouritedResponse = await fetch('/check-favourite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(favouriteData)
        });

        const isFavouritedResult = await isFavouritedResponse.json();

        if (isFavouritedResult.isFavourited) {
            await removeFavourite(favouriteData);
            favouriteButton.classList.remove('active');
        } else {
            await addFavourite(favouriteData);
            favouriteButton.classList.add('active'); 
        }
    } catch (error) {
        console.error('Error handling favourite:', error);
    }
}


// Function to add a favourite recipe to the database
async function addFavourite(favouriteData) {
    const addResponse = await fetch('/add-favourite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(favouriteData)
    });

    if (addResponse.ok) {
        console.log('Recipe added to favourites:', favouriteData.recipe_name);
    } else {
        console.error('Error adding favourite:', await addResponse.json().error);
    }
}

// Function to remove a favourite recipe from the database
async function removeFavourite(favouriteData) {
    const removeResponse = await fetch('/remove-favourite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(favouriteData)
    });

    if (removeResponse.ok) {
        console.log('Recipe removed from favourites:', favouriteData.recipe_name);
    } else {
        console.error('Error removing favourite:', await removeResponse.json().error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    if (recipeName) {
        renderRecipes(recipeName);
    }
});

async function renderRecipes(recipeName) {
    try {
        const decodedRecipeName = decodeURIComponent(recipeName);
        const recipeData = JSON.parse(localStorage.getItem('selectedRecipe'));

        // Check if the recipe data is valid and matches the decoded recipe name
        if (!recipeData || recipeData.label !== decodedRecipeName) {
            showError('Invalid recipe name in the URL.');
        } else {
            const recipeContainer = document.getElementById('recipe');
            const favouriteRecipes = await fetchFavouritesFromDatabase();
            console.log('Favourite recipes:', favouriteRecipes);
            console.log('Recipe data:', recipeData.label, recipeData.uri);
            const isFavourited = favouriteRecipes.some(fav => fav.name === recipeData.label && fav.uri === recipeData.uri);
            console.log('Is recipe favourited?', isFavourited);

            // Create the inner HTML for the recipe
            recipeContainer.innerHTML = `
                <div class="top-container">
                    <div class="button-container">
                        <div class="back-button-image"></div>
                        <div id="back-button">Back to overview</div>
                    </div>
                    <h2 class="recipe-name">${recipeData.label}</h2>
                    <h3>See full recipe on: <a href="${recipeData.url}" target="_blank" rel="noopener noreferrer">${recipeData.source}</a></h3>
                </div>
                <div class="recipe-image" style="background-image: url('${recipeData.image}')">
                    <div class="description-overlay">    
                        <div class="favourite-button ${isFavourited ? 'active' : ''}"></div>
                        <div class="recipe-description">
                            <div class="category-container">
                                <img src="/images/cooking-pot.png" alt="Cooking Pot">
                                <div>
                                    <h4>Category</h4>
                                    <p>${recipeData.dishType}</p>
                                </div>
                            </div>
                            <div class="calorie-container">
                                <img src="/images/tableware.png" alt="Tableware">
                                <div>
                                    <h4>Cuisine</h4>
                                    <p>${recipeData.cuisineType}</p>
                                </div>
                            </div>
                            <div class="time-container">
                                <img src="/images/clock.png" alt="Clock">
                                <div>
                                    <h4>Time</h4>
                                    <p>${recipe.totalTime === 0 ? "N/A" : `${recipe.totalTime} minutes`}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="information-overlay">
                    <div class="column-container">
                        <div class="recipe-ingredients">
                            <h3>Ingredients:</h3>
                            <ul>
                            ${recipeData.ingredients.map(ingredient => {
                                // Add quantity and measure if available
                                let ingredientText = ingredient.food;
                            
                                // If quantity is not 0
                                if (ingredient.quantity && ingredient.quantity !== 0) {
                                    let quantityText;

                                    const fractionMap = { 0.5: '½', 0.33: '⅓', 0.25: '¼', 0.13: '⅛', 0.75: '¾' };

                                    // Check if the quantity is a fraction and use the corresponding symbol
                                    quantityText = ingredient.quantity in fractionMap ? fractionMap[ingredient.quantity] : 
                                    (ingredient.quantity % 1 === 0 ? ingredient.quantity : ingredient.quantity.toFixed(2));

                                    // Add measure if it exists
                                    if (ingredient.measure && ingredient.measure !== '\u003Cunit\u003E') {
                                        ingredientText = `${quantityText} ${ingredient.measure} ${ingredientText}`;
                                    } else {
                                        ingredientText = `${quantityText} ${ingredientText}`;
                                    }
                                } else {
                                    // Default case: Only the ingredient name
                                    ingredientText = `${ingredientText}`;
                                }
                            
                                return `<li>${ingredientText}</li>`; // Return formatted HTML
                            }).join('')}
                            </ul>
                        </div>
                        <div class="preparation-container">
                            <h3>Preparation</h3>
                            <p>Instructions on <a href="${recipeData.url}" target="_blank" rel="noopener noreferrer">${recipeData.source}</a></p>
                        </div>
                    </div>
                    <div class="recipe-information">
                        <h2>Nutrition</h2>
                        <div class="information-container">
                            <div>
                                <h3>${Math.round(recipeData.calories)}</h3>
                                <h4>CALORIES</h4>
                            </div>
                            <div>
                                <h3>${recipe.totalTime === 0 ? "N/A" : `${recipe.totalTime} min`}</h3>                       
                                <h4>TIME</h4>
                            </div>
                             <div>
                                <h3>${recipeData.yield}</h3>
                                <h4>SERVINGS</h4>
                            </div>
                        </div>
                        <div class="dietary-container">
                            <div class="labels-container">
                                ${recipeData.healthLabels.map(label => `<p class="health-label">${label}</p>`).join('')}
                            </div>
                        </div>
                        <div class="recipe-nutrition">
                            <div class="nutrition-container">
                                <div>
                                    <div class="text-container">
                                        <div class="fat"></div>
                                        <p>Fat</p>
                                        <p class="nutrition-value">${Math.round(recipeData.totalNutrients.FAT.quantity)}${recipeData.totalNutrients.FAT.unit}</p>
                                    </div>
                                    <ul>
                                        ${renderSubNutrient('Saturated', recipeData.totalNutrients.FASAT)}
                                        ${renderSubNutrient('Trans', recipeData.totalNutrients.FATRN)}
                                        ${renderSubNutrient('Monounsaturated', recipeData.totalNutrients.FAMS)}
                                        ${renderSubNutrient('Polyunsaturated', recipeData.totalNutrients.FAPU)}
                                    </ul>
                                </div>
                                <div>
                                    <div class="text-container">
                                        <div class="carbs"></div>
                                        <p>Carbs</p>
                                        <p class="nutrition-value">${Math.round(recipeData.totalNutrients.CHOCDF.quantity)}${recipeData.totalNutrients.CHOCDF.unit}</p>
                                    </div>
                                    <ul>
                                        ${renderSubNutrient('Net Carbohydrates', recipeData.totalNutrients["CHOCDF.net"])}
                                        ${renderSubNutrient('Fiber', recipeData.totalNutrients.FIBTG)}
                                        ${renderSubNutrient('Sugars', recipeData.totalNutrients.SUGAR)}
                                    </ul>
                                </div>
                                <div>
                                    <div class="text-container">
                                        <div class="protein"></div>
                                        <p>Protein</p>
                                        <p class="nutrition-value">${Math.round(recipeData.totalNutrients.PROCNT.quantity)}${recipeData.totalNutrients.PROCNT.unit}</p>    
                                    </div>   
                                </div>             
                                ${renderNutrient('Cholesterol', recipeData.totalNutrients.CHOLE)}
                                ${renderNutrient('Sodium', recipeData.totalNutrients.NA)}
                                ${renderNutrient('Calcium', recipeData.totalNutrients.CA)}
                                ${renderNutrient('Magnesium', recipeData.totalNutrients.MG)}
                                ${renderNutrient('Potassium', recipeData.totalNutrients.K)}
                                ${renderNutrient('Iron', recipeData.totalNutrients.FE)}
                                ${renderNutrient('Vitamin C', recipeData.totalNutrients.VITC)}
                                ${renderNutrient('Vitamin D', recipeData.totalNutrients.VITD)}
                                ${renderNutrient('Vitamin K', recipeData.totalNutrients.VITK1)}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.querySelector('#back-button').addEventListener('click', () => {
                window.location.href = '/';
            });

            const favButton = document.querySelector('.favourite-button');
            if (favButton) {
                favButton.addEventListener('click', async () => {
                    handleFavouriteButtonClick(recipeData);
                });
            }

            document.querySelectorAll('.health-label').forEach(label => {
                label.addEventListener('click', () => {
                    window.location.href = `/search?q=recipes&page=1&health=${encodeURIComponent(label.textContent.toLowerCase())}`;
                });
            });
        }
    } catch (error) {
        console.error(error);
        showError('Error decoding recipe name from the URL.');
    }
}
