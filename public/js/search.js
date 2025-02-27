// Variables to store current page and recipe name
let currentPage = new URLSearchParams(window.location.search).get('page') || 1;
let currentRecipeName = new URLSearchParams(window.location.search).get('q') || '';

// Event listener for DOM content loaded
document.addEventListener('DOMContentLoaded', async () => {
    if (currentRecipeName) {
        fetchSearchResults(currentRecipeName, currentPage);
    }
    attachEventListeners();
    window.addEventListener('popstate', (event) => {
        if (event.state) {
            currentPage = event.state.page || 1;
            currentRecipeName = event.state.recipeName || '';
            fetchSearchResults(currentRecipeName, currentPage);
        }
    });
});

// Function to fetch and render search results
async function fetchSearchResults(recipeName, page) {
    removeError();
    try {
        hideElements([results, pagination]);
        showLoading();
        disableButtons();
        const response = await fetch(`/search?page=${page}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipeName })
        });
        const data = await response.json();
        updateURI(`/search?q=${recipeName}&page=${page}`, { page, recipeName });
        if (data.recipes.length > 0) {
            renderRecipes(data.recipes);
            updatePagination(data.total, data.page, data.limit);
            showElements([results, pagination]);
        } else {
            showError();
        }
    } catch (error) {
        console.error('Error fetching search results:', error);
        showError('Error fetching search results. Please try again later.');
    } finally {
        hideLoading();
        enableButtons();
    }
}

// Function to update pagination buttons
function updatePagination(total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    renderPaginationControls(totalPages, page);
}

function renderRecipes(recipes) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = recipes.map((recipe, index) => `
        <div class="recipe" data-index="${index}">
            <img src="${recipe.image}" alt="${recipe.label}">
            <div class="recipe-column">
                <div class="dish-type">${recipe.dishType}</div>
                <div class="recipe-name">${recipe.label}</div>
                <p><b>Cooking Time:</b> ${recipe.totalTime} min</p>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.recipe').forEach((recipeElement, index) => {
        recipeElement.addEventListener('click', () => {
            const recipe = recipes[index];
            localStorage.setItem('selectedRecipe', JSON.stringify(recipe));
            window.location.href = `/recipe?q=${encodeURIComponent(recipe.label)}`;
        });
    });
}

function renderPaginationControls(totalPages, currentPage) {
    const paginationDiv = document.getElementById('pagination');
    let paginationHTML = `
        <button id="prev" class="${currentPage === 1 ? 'disabled' : ''}">< Previous</button>
    `;

    // Generate numbered buttons
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `<button class="page-number ${i === currentPage ? 'active' : ''}" data-page="${i}" ${i === currentPage ? 'disabled' : ''}>${i}</button>`;
    }

    paginationHTML += `
        <button id="next" class="${currentPage === totalPages ? 'disabled' : ''}">Next ></button>
    `;

    paginationDiv.innerHTML = paginationHTML;
    attachPaginationEventListeners(totalPages);
}

function attachEventListeners() {
    document.querySelector('#search-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const recipeName = event.target.elements.recipeName.value;
        currentRecipeName = recipeName;
        currentPage = 1; // Reset to the first page for new search
        fetchSearchResults(currentRecipeName, currentPage);
    });
}

function attachPaginationEventListeners(totalPages) {
    document.getElementById('next').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchSearchResults(currentRecipeName, currentPage);
        }
    });

    document.getElementById('prev').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchSearchResults(currentRecipeName, currentPage);
        }
    });

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

// Function to update the URI without reloading the page
function updateURI(uri, state) {
    history.pushState(state, '', uri);
}

// Function to show loading indicator
function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loader';

    const form = document.getElementById('search-form');
    form.parentNode.insertBefore(loadingDiv, form.nextSibling);
}

// Function to hide loading indicator
function hideLoading() {
    const loader = document.getElementById('loader');
    if (loader) loader.remove();
}

function hideElements(elements) {
    elements.forEach(element => {
        element.style.display = 'none';
    });
}

function showElements(elements) {
    elements.forEach(element => {
        if (element.id === 'results') {
            element.style.display = 'grid';
        } else if (element.id === 'pagination') {
            element.style.display = 'flex';
        } else {
            element.style.display = 'block';
        }
    });
}

function showError(message) {
    const errorMessageDiv = document.createElement('div');
    errorMessageDiv.id = 'error-message';
    errorMessageDiv.innerHTML = `
        <div class="error-title">Whoops! This one's a bit undercooked.</div>
        <div class="error-message">${message || "The page you're looking for is unavailable. Please try again using our menu at the top."}</div>
    `;
    
    const form = document.getElementById('search-form');
    form.parentNode.insertBefore(errorMessageDiv, form.nextSibling);
}

// Function to hide error messages
function removeError() {
    const error = document.getElementById('error-message');
    if (error) error.remove();
}

// Function to disable buttons
function disableButtons() {
    document.querySelectorAll('button').forEach(button => {
        button.disabled = true;
    });
}

// Function to enable buttons
function enableButtons() {
    document.querySelectorAll('button').forEach(button => {
        button.disabled = false;
    });
}