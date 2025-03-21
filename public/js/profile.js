document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#username')) {
        const userName = document.querySelector('#username');
        showUsername(userName);
    }

    const setActivePage = (button) => {
        document.querySelectorAll('.active').forEach(activeButton => {
            activeButton.classList.remove('active');
        });
        button.classList.add('active');

        const mainContainer = document.getElementById('main-container');
        mainContainer.innerHTML = ''; // Clear current contents

        if (button.textContent.includes('Personal Info')) {
            showPersonalInfo(mainContainer);

        } else if (button.textContent.includes('Profile Settings')) {
            showProfileSettings(mainContainer);

        } else if (button.textContent.includes('Favourites')) {
            showFavourites(mainContainer);
        }
    };

    document.querySelectorAll('.nav-item').forEach(button => {
        button.addEventListener('click', (event) => {
            const clickedButton = event.target.closest('.nav-item');
            setActivePage(clickedButton);
        });
    });

    // Render the active page on DOMContentLoaded
    const activeButton = document.querySelector('.nav-item.active');
    if (activeButton) {
        setActivePage(activeButton);
    }
});

// Event listener for logout button
document.querySelector('#logout-button').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '/login';
});

// Function to show username
function showUsername(userName) {
    const username = localStorage.getItem('username');
    if (username) {
        userName.textContent = `Hi, ${username}`;
    }
}

function showPersonalInfo(mainContainer) {
    const userID = localStorage.getItem('userID');
    fetch(`/read-user/${userID}`) // Include userID in the route
        .then(response => response.json())
        .then(data => {
            mainContainer.innerHTML = `
                <h2>Personal Info</h2>
                <label for="username">Username:</label>
                <input type="email" id="username" name="username" value="${localStorage.getItem('username')}" readonly>
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" value="${data.email}" readonly>
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" value="${data.password}" readonly>
            `;
        })
    .catch(error => console.error('Error:', error));
}   


function showProfileSettings(mainContainer) {
    const userID = localStorage.getItem('userID');
    fetch(`/read-user/${userID}`)
        .then(response => response.json())
        .then(data => {
            mainContainer.innerHTML = `
                <h2>Profile Settings</h2>
                <form id="profile-settings-form">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" value="${data.email}">
                    <label for="username">Username:</label>
                    <input type="text" id="username" name="username" value="${data.username}">
                    <label for="password">New Password:</label>
                    <input type="password" id="password" name="password">
                    <button type="submit">Save Changes</button>
                </form>
            `;

            const profileSettingsForm = document.getElementById('profile-settings-form');
            profileSettingsForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const newEmail = document.getElementById('email').value;
                const newUsername = document.getElementById('username').value;
                const newPassword = document.getElementById('password').value;

                fetch(`/update-user/${userID}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ newEmail, newUsername, newPassword })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Profile updated successfully');
                    } else {
                        alert(data.message);
                    }
                })
                .catch(error => console.error('Error:', error));
            });
        })
    .catch(error => console.error('Error:', error));
}

function showFavourites(mainContainer) {
    mainContainer.innerHTML = `
        <h2>Favourites</h2>
        <div id="favourites"></div>
    `;
}

// Function to fetch favourite recipes
// async function fetchFavourites(userID) {
//     try {
//         const response = await fetch(`/search-favourites`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ userID })
//         });
//         const data = await response.json();

//         if (data.success) {
//             renderFavouriteRecipes(data.favourites);
//         } else {
//             console.error('Error fetching favourites:', data.message);
//         }
//     } catch (error) {
//         console.error('Error fetching favourites:', error);
//     }
// }

// // Function to render favourite recipes
// function renderFavouriteRecipes(favourites) {
//     const favouritesContainer = document.getElementById('favourites');
//     favouritesContainer.innerHTML = favourites.map((recipe, index) => {
//         return `
//             <div class="recipe" data-index="${index}">
//                 <div class="recipe-image-container">
//                     <img src="${recipe.image}" alt="${recipe.label}">
//                 </div>
//                 <div class="recipe-column">
//                     <div class="dish-type">${recipe.dishType}</div>
//                     <div class="recipe-name">${recipe.label}</div>
//                     <div class="time-container">
//                         <div class="clock-image"></div> 
//                         <h4 class="cooking-time">${recipe.totalTime} min</h4>
//                     </div>
//                 </div>
//             </div>
//         `;
//     }).join('');

//     document.querySelectorAll('.recipe').forEach((recipeElement, index) => {
//         recipeElement.addEventListener('click', () => {
//             const recipe = favourites[index];
//             recipe.label = recipe.label.toLowerCase();
//             localStorage.setItem('selectedRecipe', JSON.stringify(recipe));
//             window.location.href = `/recipe?q=${encodeURIComponent(recipe.label)}`;
//         });
//     });
// }

// Fetch favourites on page load
const userID = localStorage.getItem('userID');
if (userID) {
    fetchFavourites(userID);
} else {
    console.error('Error: User is not logged in or userID is not set in localStorage.');
}
