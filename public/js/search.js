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
        showLoading();
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
        } else {
            showError();
        }
    } catch (error) {
        console.error('Error fetching search results:', error);
        showError('Error fetching search results. Please try again later.');
    } finally {
        hideLoading();
    }
}

// Function to show loading indicator
function showLoading() {
    hideClasses(['results', 'pagination']);

    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loader';
    const form = document.getElementById('search-form');
    form.parentNode.insertBefore(loadingDiv, form.nextSibling);
}

// Function to update pagination buttons
function updatePagination(total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    renderPaginationControls(totalPages, page);
}

function renderRecipes(recipes) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = recipes.map(recipe => `
        <div class="recipe">
            <img src="${recipe.image}" alt="${recipe.label}">
            <div class="recipe-column">
                <div class="dish-type">${recipe.dishType}</div>
                <div class="recipe-name">${recipe.label}</div>
                <p><b>Cooking Time:</b> ${recipe.totalTime > 0 ? `${recipe.totalTime} min` : 'N/A'}</p>
            </div>
        </div>
    `).join('');
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

// Function to hide loading indicator
function hideLoading() {
    const resultsDiv = document.getElementById('results');
    resultsDiv.style.display = 'grid'; 

    const paginationDiv = document.getElementById('pagination');
    paginationDiv.style.display = 'flex';

    const loader = document.getElementById('loader');
    loader.remove();
}

// Function to hide elements by class names
function hideClasses(elements) {
    elements.forEach(element => {
        const el = document.getElementById(element);
        if (el) {
            el.style.display = 'none';
        }
    });
}

// Function to show error messages
function showError(message) {
    hideClasses(['results', 'pagination']);

    const resultsDiv = document.getElementById('results');
    const paginationDiv = document.getElementById('pagination');
    resultsDiv.innerHTML = '';
    paginationDiv.innerHTML = '';

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