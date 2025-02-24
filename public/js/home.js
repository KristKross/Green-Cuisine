let currentPage = 1;
let totalRecipes = 0;
let currentRecipeName = '';

// Function to fetch the total count of recipes
async function fetchTotalRecipes() {
    try {
        const response = await fetch('/recipes/total');
        const data = await response.json();
        totalRecipes = data.total;
    } catch (error) {
        console.error('Error fetching total recipes:', error);
    }
}

// Function to fetch and render recipes
async function fetchRecipes(page) {
    try {
        const response = await fetch(`/recipes?page=${page}`);
        const data = await response.json();
        renderRecipes(data.recipes);
        updatePagination(data.total, data.page, data.limit);
        updateURI(`/home/recipes/page/${page}`);
        scrollToTop();
    } catch (error) {
        console.error('Error fetching recipes:', error);
    }
}

// Function to fetch and render search results
async function fetchSearchResults(recipeName, page) {
    try {
        const response = await fetch(`/search?page=${page}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipeName })
        });
        const data = await response.json();
        renderRecipes(data.recipes);
        updatePagination(data.total, data.page, data.limit);
        updateURI(`recipes/search/recipeName/${recipeName}/page/${page}`);
        scrollToTop();
    } catch (error) {
        console.error('Error fetching search results:', error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await fetchTotalRecipes();
    fetchRecipes(currentPage);
});

// Function to update pagination buttons
function updatePagination(total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    document.getElementById('prev').disabled = page <= 1;
    document.getElementById('next').disabled = page >= totalPages;
    document.getElementById('pagination-info').textContent = `Page ${page} of ${totalPages}`;
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
    renderPaginationControls();
    attachEventListeners();
}

function renderPaginationControls() {
    const paginationDiv = document.getElementById('pagination');
    paginationDiv.innerHTML = `
        <button id="prev">Previous</button>
        <span id="pagination-info">Page ${currentPage}</span>
        <button id="next">Next</button>
    `;
}

function attachEventListeners() {
    document.getElementById('next').addEventListener('click', () => {
        currentPage++;
        if (currentRecipeName) {
            fetchSearchResults(currentRecipeName, currentPage);
        } else {
            fetchRecipes(currentPage);
        }
    });

    document.getElementById('prev').addEventListener('click', () => {
        currentPage--;
        if (currentRecipeName) {
            fetchSearchResults(currentRecipeName, currentPage);
        } else {
            fetchRecipes(currentPage);
        }
    });

    document.querySelector('form').addEventListener('submit', (event) => {
        event.preventDefault();
        const recipeName = event.target.elements.recipeName.value;
        currentRecipeName = recipeName;
        currentPage = 1; // Reset to the first page for new search
        fetchSearchResults(recipeName, currentPage);
    });
}

// Function to update the URI without reloading the page
function updateURI(uri) {
    history.pushState(null, '', uri);
}

// Function to scroll to the top of the page
function scrollToTop() {
    window.scrollTo({
        top: 0,
    });
}