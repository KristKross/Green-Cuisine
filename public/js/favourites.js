// Variables to store current page and recipe name
let currentPage = new URLSearchParams(window.location.search).get('page') || 1;

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
    fetch('/session-data')
        .then(response => response.json())
        .then(data => {
            userID = data.userID

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
        const response = await fetch(`/search-favourites`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userID })
        });
        const data = await response.json();

        if (data.success) {
            renderFavouriteRecipes(data.favourites);
        } else {
            console.error('Error fetching favourites:', data.message);
        }
    } catch (error) {
        console.error('Error fetching favourites:', error);
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

// Function to update pagination buttons
function updatePagination(total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    renderPaginationControls(totalPages, page);
}

// Function to render pagination controls
function renderPaginationControls(totalPages, currentPage) {
    const paginationDiv = document.getElementById('pagination');  

    // If pagination already exists, update only the active button
    if (paginationDiv.innerHTML.trim() !== '') {
        document.querySelectorAll('.page-number').forEach(button => {
            button.classList.toggle('active', parseInt(button.dataset.page) === currentPage);
        });
        return;
    }

    // Otherwise, generate new buttons
    let paginationHTML = `
        <button id="prev" class="${currentPage === 1 ? 'disabled' : ''}">Previous</button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        const active = i === currentPage ? 'active' : '';
        paginationHTML += `<button class="page-number ${active}" data-page="${i}">${i}</button>`;
    }

    paginationHTML += `<button id="next" class="${currentPage === totalPages ? 'disabled' : ''}">Next</button>`;

    paginationDiv.innerHTML = paginationHTML;
    attachPaginationEventListeners(totalPages);
}


// Function to attach event listeners to pagination buttons
function attachPaginationEventListeners(totalPages) {
    // Event listeners for the "Next" buttons
    document.getElementById('next').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchSearchResults(currentRecipeName, currentPage, currentMealType, currentDishType, currentDiet, currentHealth);
        }
    });

    // Event listeners for the "Previous" buttons
    document.getElementById('prev').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchSearchResults(currentRecipeName, currentPage, currentMealType, currentDishType, currentDiet, currentHealth);
        }
    });

    // Event listeners for the numbered buttons
    document.querySelectorAll('.page-number').forEach(button => {
        button.addEventListener('click', (event) => {
            const page = parseInt(event.target.getAttribute('data-page'));
            if (page !== currentPage) {
                currentPage = page;
                fetchSearchResults(currentRecipeName, currentPage, currentMealType, currentDishType, currentDiet, currentHealth);
            }
        });
    });
}
