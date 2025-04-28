import _ from 'lodash';
import { showLoading, removeLoading, showError } from './utils/uiHelpers.js';
import clockIconPath from '../assets/icons/clock-black-icon.png';
let userID = '';

// Variables to store current page and recipe name
let currentPage = new URLSearchParams(window.location.search).get('page') || 1;

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
                    fetchFavourites(userID);
                } else {
                    fetchFavourites(userID);
                }
            });

            window.addEventListener('pageshow', function (event) {
                if (event.persisted) {
                    window.location.reload();
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
                        <img src="${clockIconPath}" alt="Clock" class="clock-image"> 
                        <h4 class="cooking-time">${recipe.totalTime === 0 ? "N/A" : `${recipe.totalTime} min`}</h4>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    document.querySelectorAll('.recipe').forEach((recipeElement, index) => {
        recipeElement.addEventListener('click', _.debounce(() => {
            const recipe = favourites[index];
            recipe.label = recipe.label.toLowerCase();
            localStorage.setItem('selectedRecipe', JSON.stringify(recipe));
            window.location.href = `/recipe?q=${encodeURIComponent(recipe.label)}`;
        }, 300));
    });
}