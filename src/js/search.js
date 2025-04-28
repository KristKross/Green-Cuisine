import _ from 'lodash';
import { showLoading, removeLoading, showError } from './utils/uiHelpers.js';
import clockIconPath from '../assets/icons/clock-black-icon.png';

// Variables to store and recipe name
let currentRecipeName = new URLSearchParams(window.location.search).get('q') || '';
let currentPage = parseInt(new URLSearchParams(window.location.search).get('page')) || 1;
let currentMealType = new URLSearchParams(window.location.search).get('mealType') || '';
let currentDishType = new URLSearchParams(window.location.search).get('dishType') || '';
let currentDiet = new URLSearchParams(window.location.search).get('diet') || '';
let currentHealth = new URLSearchParams(window.location.search).get('health') || '';
let currentCuisineType = new URLSearchParams(window.location.search).get('cuisineType') || '';

const maxPages = 5; // Maximum number of pages to display
let pageHistory = [];
let nextPageURL = '';

const filters = {
    recipeName: currentRecipeName,
    mealType: currentMealType,
    dishType: currentDishType,
    dietLabel: currentDiet,
    healthLabel: currentHealth,
    cuisineType: currentCuisineType,
    isSearch: true
};

// Event listener for when the HTML is loaded
document.addEventListener('DOMContentLoaded', async () => {
    if (currentRecipeName) {
        if (currentPage > pageHistory.length + 1) {
            showError();
            return;
        }
        
        fetchSearchResults({ ...filters, page: 1, limit: 5 });
    }

    // Listen for popstate event
    window.addEventListener('popstate', async (event) => {
        if (event.state) {
            currentPage = event.state.page || 1;
            currentRecipeName = event.state.recipeName || '';
        }
        const urlParams = new URLSearchParams(window.location.search);
        const page = parseInt(urlParams.get('page')) || 1;

        if (pageHistory.length >= page) {
            try {
                const previousPageData = pageHistory[page - 1];

                if (!previousPageData) return showError();  

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

async function fetchSearchResults({
    recipeName,
    mealType = '',
    dishType = '',
    dietLabel = '',
    healthLabel = '',
    cuisineType = '',
    isSearch = false
    }) {

    if (document.getElementById('loader')) return showError();

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
    if (!nextPageURL) return showError();

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
    if (pageHistory.length <= 1) return showError();

    try {
        pageHistory.pop();

        const previousPage = pageHistory[pageHistory.length - 1];
        if (!previousPage) return showError();

        renderRecipes(previousPage.data.recipes);
        renderPaginationControls();
        window.scrollTo(0, 0);
        
        nextPageURL = previousPage.data.nextPage || '';

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
    }
}

async function renderRecipes(recipes) {
    const favouriteRecipes = await fetchFavouritesFromDatabase();
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = recipes.map((recipe, index) => {
        const isFavourited = favouriteRecipes.some(fav => fav.uri === recipe.uri);

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
                        <img src="${clockIconPath}" class="clock-image" alt="Clock">
                        <h4 class="cooking-time">${recipe.totalTime === 0 ? "N/A" : `${recipe.totalTime} min`}</h4>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Add event listener for recipe click
    document.querySelectorAll('.recipe').forEach((recipeElement, index) => {
        recipeElement.addEventListener('click', _.debounce((event) => {
            if (event.target.classList.contains('favourite-button')) return;
            
            const recipe = recipes[index];
            localStorage.setItem('selectedRecipe', JSON.stringify(recipe));
            window.location.href = `/recipe?q=${_.lowerCase(recipe.label)}`;
        }, 300));
    });

    // Add event listener for favourite button click
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

    if (addResponse.error) {
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

    if (removeResponse.error) {
        console.error('Error removing favourite:', await removeResponse.json().error);
    }
}

function renderPaginationControls(currentPage) {
    const paginationDiv = document.getElementById('pagination');
    let paginationHTML = '';

    const current = currentPage ? currentPage : pageHistory.length;

    paginationHTML += `
        <button id="prev" class="${pageHistory.length > 1 ? '' : 'hidden'}"></button>
        <div class="page">Page ${current}</div>
        <button id="next" class="${pageHistory.length < maxPages && nextPageURL ? '' : 'hidden'}"></button>
    `;

    paginationDiv.innerHTML = paginationHTML;
    attachPaginationEventListeners();
}

// Function to attach event listeners for pagination buttons
function attachPaginationEventListeners() {
    const nextButton = document.getElementById('next');
    const prevButton = document.getElementById('prev');

    if (nextButton) {
        nextButton.addEventListener('click', _.debounce(() => {
            fetchNextPage({
                q: currentRecipeName,
                cuisine: currentCuisineType,
                diet: currentDiet,
                health: currentHealth,
                dishType: currentDishType,
                mealType: currentMealType
            });
        }, 500));
    }

    if (prevButton) {
        prevButton.addEventListener('click', _.debounce(() => {
            fetchPreviousPage({
                q: currentRecipeName,
                cuisine: currentCuisineType,
                diet: currentDiet,
                health: currentHealth,
                dishType: currentDishType,
                mealType: currentMealType
            });
        }, 500));
    }
}