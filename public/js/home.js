let currentPage = 1;
let currentRecipeName = '';

document.addEventListener('DOMContentLoaded', async () => {
    fetchRecipes(currentPage);
});

// Function to fetch and render recipes
async function fetchRecipes(page) {
    try {
        const response = await fetch(`/recipes?page=${page}`);
        const data = await response.json();
        renderRecipes(data.recipes);
        updatePagination(data.total, data.page, data.limit);
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
    } catch (error) {
        console.error('Error fetching search results:', error);
    }
}

// Function to update pagination buttons
function updatePagination(total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    renderPaginationControls(totalPages, page);
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
    scrollToTop();
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
    attachEventListeners();
}

function attachEventListeners() {
    document.getElementById('next').addEventListener('click', () => {
        if (currentPage < currentPage < 5) {
            currentPage++;
            if (currentRecipeName) {
                fetchSearchResults(currentRecipeName, currentPage);
            } else {
                fetchRecipes(currentPage);
            }
            scrollToTop();
        }
    });

    document.getElementById('prev').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            if (currentRecipeName) {
                fetchSearchResults(currentRecipeName, currentPage);
            } else {
                fetchRecipes(currentPage);
            }
            scrollToTop();
        }
    });

    document.querySelectorAll('.page-number').forEach(button => {
        button.addEventListener('click', (event) => {
            const page = parseInt(event.target.getAttribute('data-page'));
            if (page !== currentPage) {
                currentPage = page;
                if (currentRecipeName) {
                    fetchSearchResults(currentRecipeName, currentPage);
                } else {
                    fetchRecipes(currentPage);
                }
                scrollToTop();
            }
        });
    });

    document.querySelector('form').addEventListener('submit', (event) => {
        event.preventDefault();
        const recipeName = event.target.elements.recipeName.value;
        currentRecipeName = recipeName;
        currentPage = 1; // Reset to the first page for new search
        fetchSearchResults(recipeName, currentPage);
        scrollToTop();
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
        behavior: 'smooth'
    });
}