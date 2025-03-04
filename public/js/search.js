// Variables to store current page and recipe name
let currentPage = new URLSearchParams(window.location.search).get('page') || 1;
let currentRecipeName = new URLSearchParams(window.location.search).get('q') || '';

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

// Event listener for when the html is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Fetch and render search results
    if (currentRecipeName) {
        fetchSearchResults(currentRecipeName, currentPage, true);
    }

    // The popstate event listener is to handle the back button and forward button and update the page accordingly
    window.addEventListener('popstate', (event) => {
        if (event.state) {
            currentPage = event.state.page || 1;
            currentRecipeName = event.state.recipeName || '';
            fetchSearchResults(currentRecipeName, currentPage, true);
        }
    });
});

// Function to fetch and render search results
async function fetchSearchResults(recipeName, page, isSearch = false) {
    if (document.getElementById('loader')) return;

    try {
        if (isSearch) {
            showLoading();
        }

        const response = await fetch(`/search?page=${page}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipeName })
        });

        const data = await response.json();

        if (data.recipes.length > 0) {
            renderRecipes(data.recipes);
            updatePagination(data.total, data.page, data.limit);
            window.scrollTo(0, 0);
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
                    <div class="dish-type">${recipe.dishType}</div>
                    <div class="recipe-name">${recipe.label}</div>
                    <p><b>Cooking Time:</b> ${recipe.totalTime} min</p>
                </div>
            </div>
        `;
    }).join('');

    // Event listener for when a recipe is clicked
    document.querySelectorAll('.recipe').forEach((recipeElement, index) => {
        recipeElement.addEventListener('click', () => {
            const recipe = recipes[index];
            localStorage.setItem('selectedRecipe', JSON.stringify(recipe));
            window.location.href = `/recipe?q=${encodeURIComponent(recipe.label)}`;
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
    const userID = localStorage.getItem('userID');

    if (!userID) {
        return [];
    }

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
    const userID = localStorage.getItem('userID');

    if (!userID) {
        window.location.href = '/login';
        return;
    }

    favouriteButton.classList.toggle('active');

    const recipe = recipes[index];

    const favouriteData = {
        user_id: userID,
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
        } else {
            await addFavourite(favouriteData);
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

// Function to update pagination buttons
function updatePagination(total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    renderPaginationControls(totalPages, page);
}

// Function to render pagination controls
function renderPaginationControls(totalPages, currentPage) {
    const paginationDiv = document.getElementById('pagination');  
    
    // Add "Previous" button
    let paginationHTML = `
        <button id="prev" class="${currentPage === 1 ? 'disabled' : ''}">Previous</button>
    `;

    // Generate numbered buttons 
    for (let i = 1; i <= totalPages; i++) {
        const active = i === currentPage ? 'active' : '';
        paginationHTML += `
            <button class="page-number ${active}" data-page="${i}">${i}</button>
        `;
    }

    // Add "Next" button
    paginationHTML += `
        <button id="next" class="${currentPage === totalPages ? 'disabled' : ''}">Next</button>
    `;

    // Render the pagination controls
    paginationDiv.innerHTML = paginationHTML;
    attachPaginationEventListeners(totalPages);
}

// Function to attach event listeners to pagination buttons
function attachPaginationEventListeners(totalPages) {
    // Event listeners for the "Next" buttons
    document.getElementById('next').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchSearchResults(currentRecipeName, currentPage);
        }
    });

    // Event listeners for the "Previous" buttons
    document.getElementById('prev').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchSearchResults(currentRecipeName, currentPage);
        }
    });

    // Event listeners for the numbered buttons
    document.querySelectorAll('.page-number').forEach(button => {
        button.addEventListener('click', (event) => {
            const page = parseInt(event.target.getAttribute('data-page'));
            if (page !== currentPage) {
                currentPage = page;
                fetchSearchResults(currentRecipeName, currentPage);
            }
        });
    });
}