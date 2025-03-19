// Event listener for logout button
document.querySelector('#logout-button').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '/login';
});

// Function to fetch favourite recipes
async function fetchFavourites(userID) {
    try {
        const response = await fetch(`/search-favourites`, { // 
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
    const favouritesContainer = document.getElementById('favourites');
    favouritesContainer.innerHTML = favourites.map((recipe, index) => {
        return `
            <div class="recipe" data-index="${index}">
                <div class="recipe-image-container">
                    <img src="${recipe.image}" alt="${recipe.label}">
                </div>
                <div class="recipe-column">
                    <div class="dish-type">${recipe.dishType}</div>
                    <div class="recipe-name">${recipe.label}</div>
                    <p><b>Cooking Time:</b> ${recipe.totalTime} min</p>
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

// Fetch favourites on page load
const userID = localStorage.getItem('userID');
if (userID) {
    fetchFavourites(userID);
} else {
    console.error('Error: User is not logged in or userID is not set in localStorage.');
}
