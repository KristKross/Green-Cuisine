// Function to show loading indicator
function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loader';

    const main = document.querySelector('main');
    main.appendChild(loadingDiv);
}

// Function to remove loading indicator
function removeLoading() {
    const loadingDiv = document.getElementById('loader');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// Function to update the URI without reloading the page
function updateURI(uri, state) {
    history.pushState(state, '', uri);
}

// Function to show error message
function showError() {
    const errorMessageDiv = document.createElement('div');
    errorMessageDiv.id = 'error-message';
    errorMessageDiv.innerHTML = `
        <div class="error-title">Whoops! This one's a bit undercooked.</div>
        <div class="error-message">The page you're looking for is unavailable. Please try again using our menu at the top.</div>
    `;
    
    const main = document.querySelector('main');
    main.appendChild(errorMessageDiv);
}

// Variables to store and recipe name
let currentRecipeName = new URLSearchParams(window.location.search).get('q') || '';
let currentPage = parseInt(new URLSearchParams(window.location.search).get('page')) || 1;
let currentMealType = new URLSearchParams(window.location.search).get('mealType') || '';
let currentDishType = new URLSearchParams(window.location.search).get('dishType') || '';
let currentDiet = new URLSearchParams(window.location.search).get('diet') || '';
let currentHealth = new URLSearchParams(window.location.search).get('health') || '';
let currentCuisineType = new URLSearchParams(window.location.search).get('cuisineType') || '';

const maxPages = 5; // Maximum number of pages to display

// Event listener for when the HTML is loaded
document.addEventListener('DOMContentLoaded', async () => {
    if (currentRecipeName) {
        if (currentPage > pageHistory.length + 1) {
            showError();
            return;
        }
        
        fetchSearchResults(currentRecipeName, currentMealType, currentDishType, currentDiet, currentHealth, currentCuisineType, true);
    }

    // Listen for popstate event
    window.addEventListener('popstate', async (event) => {
        const urlParams = new URLSearchParams(window.location.search);
        const page = parseInt(urlParams.get('page')) || 1;

        if (pageHistory.length >= page) {
            try {
                const previousPageData = pageHistory[page - 1];

                if (!previousPageData) return;  

                renderRecipes(previousPageData.data.recipes);
                renderPaginationControls(page);
                nextPageURL = previousPageData.data.nextPage || '';
                window.scrollTo(0, 0);

            } catch (error) {
                console.error('Error restoring page state:', error);
                showError();
            }
        }
    });
});

let pageHistory = [];
let nextPageURL = '';

async function fetchSearchResults(recipeName, mealType = '', dishType = '', dietLabel = '', healthLabel = '', cuisineType = '', isSearch = false) {
    if (document.getElementById('loader')) return;

    try {
        if (isSearch) {
            showLoading();
            pageHistory = [];
        }

        const queryParams = new URLSearchParams({ q: recipeName });
        if (mealType) queryParams.append('mealType', mealType);
        if (dishType) queryParams.append('dishType', dishType);
        if (dietLabel) queryParams.append('diet', dietLabel);
        if (healthLabel) queryParams.append('health', healthLabel);
        if (cuisineType) queryParams.append('cuisineType', cuisineType);

        const response = await fetch(`/search?${queryParams.toString()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipeName, mealType, dishType, dietLabel, healthLabel, cuisineType })
        });

        if (!response.ok) throw new Error(`Error: ${response.status} - ${response.statusText}`);

        const data = await response.json();
        
        if (isSearch || pageHistory.length === 0) {
            pageHistory.push({ 
                url: '', 
                data, 
                recipeName, 
                mealType, 
                dishType, 
                dietLabel, 
                healthLabel,
                cuisineType
            });
        }

        nextPageURL = data.nextPage || '';

        if (data.recipes.length > 0) {
            renderRecipes(data.recipes);
            renderPaginationControls();
        } else {
            showError();
        }

    } catch (error) {
        console.error('Error fetching search results:', error);
        showError();
    } finally {
        removeLoading();
    }
}

async function fetchNextPage(filters) {
    if (!nextPageURL) return;

    try {
        const response = await fetch(`/next?nextPageURL=${encodeURIComponent(nextPageURL)}`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);

        const data = await response.json();
        pageHistory.push({ url: nextPageURL, data }); 
        nextPageURL = data.nextPage || '';

        renderRecipes(data.recipes);
        renderPaginationControls();
        window.scrollTo(0, 0);

        const currentPage = pageHistory.length;
        const state = { nextPageURL, ...filters };

        const queryParams = new URLSearchParams();
        queryParams.set('q', filters.recipeName);
        queryParams.set('page', currentPage);
        Object.entries(filters).forEach(([key, value]) => {
            if (value && key !== 'recipeName') {
                queryParams.set(key, value);
            }
        });

        history.pushState(state, '', `/search?${queryParams.toString()}`);

    } catch (error) {
        showError();
        console.error('Error fetching next page:', error);
    }
}


async function fetchPreviousPage(filters) {
    if (pageHistory.length <= 1) return;

    try {
        pageHistory.pop();

        const previousPage = pageHistory[pageHistory.length - 1];

        if (!previousPage) return;

        renderRecipes(previousPage.data.recipes);
        renderPaginationControls();
        
        nextPageURL = previousPage.data.nextPage || ''; // Ensure next page URL is restored

        window.scrollTo(0, 0);

        const currentPage = pageHistory.length;
        const state = { nextPageURL, ...filters };

        const queryParams = new URLSearchParams();
        queryParams.set('q', filters.recipeName);
        queryParams.set('page', currentPage);
        Object.entries(filters).forEach(([key, value]) => {
            if (value && key !== 'recipeName') {
                queryParams.set(key, value);
            }
        });

        history.pushState(state, '', `/search?${queryParams.toString()}`);

    } catch (error) {
        console.error('Error loading previous page:', error);
    } finally {
        removeLoading();
    }
}

async function renderRecipes(recipes) {
    const favouriteRecipes = await fetchFavouritesFromDatabase();
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = recipes.map((recipe, index) => {
        // Check if the current recipe is favourited by matching both RecipeName and RecipeURI
        const isFavourited = favouriteRecipes.some(fav => fav.name === recipe.label && fav.uri === recipe.uri);
        return `
            <div class="recipe" data-index="${index}">
                <div class="recipe-image-container">
                    <img src="${recipe.image}" alt="${recipe.label}">
                    <button class="favourite-button ${isFavourited ? 'active' : ''}" data-index="${index}"></button>
                </div>
                <div class="recipe-column">
                    <h4 class="dish-type">${recipe.dishType}</h4>
                    <h3 class="recipe-name">${recipe.label}</h3>
                    <div class="time-container">
                        <div class="clock-image"></div> 
                        <h4 class="cooking-time">${recipe.totalTime === 0 ? "N/A" : `${recipe.totalTime} min`}</h4>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Event listener for when a recipe is clicked
    document.querySelectorAll('.recipe').forEach((recipeElement, index) => {
        recipeElement.addEventListener('click', () => {
            const recipe = recipes[index];
            localStorage.setItem('selectedRecipe', JSON.stringify(recipe));
            window.location.href = `/recipe?q=${encodeURIComponent(recipe.label.toLowerCase())}`;
        });
    });

    // Add event listener for favourite buttons
    const favouriteButtons = document.querySelectorAll('.favourite-button');
    favouriteButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const index = event.target.dataset.index;
            handleFavouriteButtonClick(recipes, index);
        });
    });
}

// Function to fetch favourites from the database
async function fetchFavouritesFromDatabase() {
    const sessionResponse = await fetch('/session-data');
    const sessionData = await sessionResponse.json();

    if (!sessionData.success || !sessionData.userID) {
        return [];
    }

    const userID = sessionData.userID;

    try {
        const response = await fetch(`/favourites/${userID}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
            console.error('Error fetching favourites:', result.message);
            return [];
        }

        // Ensure you're getting both the RecipeName and RecipeURI as an array of objects
        return result.favourites.map(fav => ({
            name: fav.RecipeName,
            uri: fav.RecipeURI
        }));

    } catch (error) {
        console.error('Error fetching favourites:', error);
        return [];
    }
}
// Function to handle favourite button click
async function handleFavouriteButtonClick(recipes, index) {
    const favouriteButton = document.querySelectorAll('.favourite-button')[index];
    const sessionResponse = await fetch('/session-data');
    const sessionData = await sessionResponse.json();

    if (!sessionData.success || !sessionData.userID) {
        window.location.href = '/login';
        return;
    }

    const recipe = recipes[index];

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

function renderPaginationControls(currentPage) {
    const paginationDiv = document.getElementById('pagination');
    let paginationHTML = '';

    const current = currentPage ? currentPage : pageHistory.length;

    if (pageHistory.length > 1) {
        paginationHTML += `<button id="prev">Previous</button>`;
    }

    paginationHTML += `<p>Page ${current}`;

    if (pageHistory.length < maxPages && nextPageURL) {
        paginationHTML += `<button id="next">Next</button>`;
    }

    paginationDiv.innerHTML = paginationHTML;
    attachPaginationEventListeners();
}


// Function to attach event listeners for pagination buttons
function attachPaginationEventListeners() {
    const nextButton = document.getElementById('next');
    const prevButton = document.getElementById('prev');

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            fetchNextPage({
                q: currentRecipeName,
                cuisine: currentCuisineType,
                diet: currentDiet,
                health: currentHealth,
                dishType: currentDishType,
                mealType: currentMealType
            });
        });
    }

    if (prevButton) {
        prevButton.addEventListener('click', () => {
            fetchPreviousPage({
                q: currentRecipeName,
                cuisine: currentCuisineType,
                diet: currentDiet,
                health: currentHealth,
                dishType: currentDishType,
                mealType: currentMealType
            });
        });
    }
}
