// Variables to store current page and recipe name
let currentPage = new URLSearchParams(window.location.search).get('page') || 1;

// Function to update the URI without reloading the page
function updateURI(uri, state) {
    history.pushState(state, '', uri);
}

// Function to show error message
function showError(title, message) {
    const errorMessageDiv = document.createElement('div');
    errorMessageDiv.id = 'error-message';
    errorMessageDiv.innerHTML = `
        <div class="error-title">${title ? title : "Whoops! This one's a bit undercooked."}</div>
        <div class="error-message">${message ? message : "The page you're looking for is unavailable. Please try again using our menu at the top."}</div>
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
    fetch('/session-data')
        .then(response => response.json())
        .then(data => {
            userID = data.userID

            if (!data.success) {
                window.location.href = '/login';
                return 
            }
            
            fetchFavourites(userID)

            window.addEventListener('popstate', (event) => {
                if (event.state) {
                    currentPage = event.state.page || 1;
                    currentRecipeName = event.state.recipeName || '';
                    fetchFavourites(userID)
                }
            });
        })
    .catch(error => console.error('Error fetching session data:', error));
});

// Function to fetch and render search results
async function fetchFavourites(userID) {
    try {
        showLoading();

        const response = await fetch(`/search-favourites`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userID })
        });
        const data = await response.json();

        if (data.success) {
            const favouritesContainer = document.getElementById('results');
            if (data.favourites.length === 0) {
                showError('No Favourites Yet!', 'It looks like you haven\'t added any favourites here.');
                favouritesContainer.style.display = 'none';
            
            } else {
                renderFavouriteRecipes(data.favourites);
                renderPaginationControls(currentPage);
            }
        } else {
            console.error('Error fetching favourites:', data.message);
        }
    } catch (error) {
        console.error('Error fetching favourites:', error);
    } finally {
        removeLoading();
    }
}

// Function to render favourite recipes
function renderFavouriteRecipes(favourites) {
    const favouritesContainer = document.getElementById('results');
    favouritesContainer.innerHTML = favourites.map((recipe, index) => {
        return `
            <div class="recipe" data-index="${index}">
                <div class="recipe-image-container">
                    <img src="${recipe.image}" alt="${recipe.label}">
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

    document.querySelectorAll('.recipe').forEach((recipeElement, index) => {
        recipeElement.addEventListener('click', () => {
            const recipe = favourites[index];
            recipe.label = recipe.label.toLowerCase();
            localStorage.setItem('selectedRecipe', JSON.stringify(recipe));
            window.location.href = `/recipe?q=${encodeURIComponent(recipe.label)}`;
        });
    });
}

function renderPaginationControls(currentPage) {
    const paginationDiv = document.getElementById('pagination');
    let paginationHTML = '';

    if (pageHistory.length > 1) {
        paginationHTML += `<button id="prev">Previous</button>`;
    }

    paginationHTML += `<p>Page ${currentPage ? currentPage : pageHistory.length} of ${maxPages}</p>`;

    if (pageHistory.length < maxPages) {
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
        nextButton.addEventListener('click', fetchNextPage);
    }

    if (prevButton) {
        prevButton.addEventListener('click', fetchPreviousPage);
    }
}
