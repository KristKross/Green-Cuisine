import { showPopupMessage, removePopupMessage } from "./utils/uiHelpers";

function showUsername(userNameID, username) {
    userNameID.textContent = `Hi, ${username}`;
}

function createPersonalInfoHTML(email, username) {
    return `
        <h2>Personal Info</h2>
        <form id="personal-info-form">
            <label for="email">Email Address</label>
            <input type="email" id="email" name="email" value="${email}" readonly>
            <label for="username">Username</label>
            <input type="text" id="username" name="username" value="${username}" readonly>
        </form>    
        <div class="button-container">
            <button id="logout-button">Log Out</button>
            <button id="delete-button">Delete Account</button>
        </div>   
    `;
}

function createProfileSettingsHTML(email, username) {
    return `
        <h2>Update Your Account Information</h2>
        <div class="update-section">
            <label>Email Address:</label>
            <div class="input-container"> 
                <p id="email-display" class="display">${email}</p>
                <button class="edit-button" data-field="email">Edit</button>
            </div>
            <div class="edit-field hidden" id="email-field">
                <input type="email" id="email-input" placeholder="Enter new email address"">
                <button class="save-button" data-field="email">Save</button>
                <button class="cancel-button" data-field="email">Cancel</button>
            </div>
            <p id="email-error" class="error-message hidden"></p>
        </div>

        <div class="update-section">
            <label>Username:</label>
            <div class="input-container">
                <p id="username-display" class="display">${username}</p>
                <button class="edit-button" data-field="username">Edit</button>
            </div>
            <div class="edit-field hidden" id="username-field">
                <input type="text" id="username-input" class="input" placeholder="Enter new username">
                <button class="save-button" data-field="username">Save</button>
                <button class="cancel-button" data-field="username">Cancel</button>
            </div>
            <p id="username-error" class="error-message hidden"></p>
        </div>

        <div class="update-section">
            <label>Password:</label>
            <div class="input-container">
                <p id="password-display" class="display">
                    ${Array(15).fill('\u2022').join('')}
                </p>
                <button class="edit-button" data-field="password">Edit</button>
            </div>
            <div class="edit-field hidden" id="password-field">
                <input type="password" id="password-input" placeholder="Enter new password">
                <button class="save-button" data-field="password">Save</button>
                <button class="cancel-button" data-field="password">Cancel</button>
            </div>
            <p id="password-error" class="error-message hidden"></p>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    fetch('/session-data')
        .then(response => response.json())
        .then(data => {
            if (!data.success) return;

            // Show username if element exists
            const usernameEl = document.querySelector('#username');
            if (usernameEl) {
                showUsername(usernameEl, data.username);
            }

            // Function to switch content area based on nav button
            const setActivePage = (button) => {
                // Remove 'active' from all nav items
                document.querySelectorAll('.active').forEach(el => {
                    el.classList.remove('active');
                });

                // Activate the clicked button
                button.classList.add('active');

                // Clear and update main container
                const mainContainer = document.getElementById('main-container');
                mainContainer.innerHTML = '';

                const label = button.textContent;

                if (label.includes('Personal Info')) {
                    showPersonalInfo(mainContainer, data.userID);
                    
                } else if (label.includes('Profile Settings')) {
                    showProfileSettings(mainContainer, data.userID);

                } else if (label.includes('Favourites')) {
                    window.location.href = '/favourites';
                }
            };

            // Set up click listeners for all nav items
            document.querySelectorAll('.nav-item').forEach(button => {
                button.addEventListener('click', (event) => {
                    const clicked = event.target.closest('.nav-item');
                    setActivePage(clicked);
                });
            });

            // Set default active page to the first nav item
            const firstNavItem = document.querySelector('.nav-item');
            if (firstNavItem) {
                setActivePage(firstNavItem);
            }

            // Handle back/forward browser navigation
            window.addEventListener('pageshow', (event) => {
                if (event.persisted) {
                    const firstNavItem = document.querySelector('.nav-item');
                    if (firstNavItem) {
                        setActivePage(firstNavItem);
                    }
                }
            });
        })
    .catch(error => console.error('Error fetching session data:', error));
});

function showPersonalInfo(mainContainer, userID) {
    fetch(`/read-user/${userID}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch user data');
            return response.json();
        })
        .then(data => {
            mainContainer.innerHTML = createPersonalInfoHTML(data.email, data.username);

            document.querySelector('#logout-button').addEventListener('click', () => {
                fetch('/logout', {
                    method: 'POST'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        window.location.href = '/login';
                    } else {
                        console.error('Error logging out:', data.message);
                    }
                })
                .catch(error => console.error('Error:', error));
            });

            document.querySelector('#delete-button').addEventListener('click', () => {
                showPopupMessage();
                  
                document.getElementById('cancel-button').addEventListener('click', function () {
                    removePopupMessage();
                });

                document.getElementById('confirm-button').addEventListener('click', function () {
                    fetch(`/delete-user/${userID}`, {
                        method: 'DELETE'
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            window.location.href = '/';
                        } else {
                            console.error('Error deleting account:', data.message);
                        }
                    })
                    .catch(error => console.error('Error:', error));
                    removePopupMessage();
                });
            });
        })
    .catch(error => console.error('Error:', error));
}

function showProfileSettings(mainContainer, userID) {
    fetch(`/read-user/${userID}`)
        .then(response => response.json())
        .then(data => {
            mainContainer.innerHTML = createProfileSettingsHTML(data.email, data.username);

            // Helper function for hiding error fields
            const hideError = (field) => {
                const input = document.getElementById(`${field}-input`);
                const error = document.getElementById(`${field}-error`);
                if (input) input.classList.remove('error');
                if (error) error.classList.remove('visible');
            };

            // Helper functions for editing fields
            const showEditField = (field) => {
                document.getElementById(`${field}-display`).style.display = 'none';
                document.getElementById(`${field}-field`).classList.remove('hidden');
                document.querySelector(`.edit-button[data-field="${field}"]`).style.display = 'none';
            };

            // Helper functions for cancelling fields
            const cancelEditField = (field) => {
                document.getElementById(`${field}-display`).style.display = 'block';
                document.getElementById(`${field}-field`).classList.add('hidden');
                document.querySelector(`.edit-button[data-field="${field}"]`).style.display = 'block';
                hideError(field);
            };

            // Helper functions for updating fields
            const updateFieldSuccess = (field) => {
                document.getElementById(`${field}-display`).style.display = 'block';
                document.getElementById(`${field}-field`).classList.add('hidden');
                document.querySelector(`.edit-button[data-field="${field}"]`).style.display = 'block';
                hideError(field);
                window.location.reload();
            };

            // Helper functions for showing error fields
            const showFieldError = (field, message) => {
                const input = document.getElementById(`${field}-input`);
                const error = document.getElementById(`${field}-error`);
                if (error) {
                    error.textContent = message;
                    error.classList.add('visible');
                }
                if (input) input.classList.add('error');
            };

            // Input click = hide error if visible
            document.querySelectorAll('.input').forEach(input => {
                input.addEventListener('click', (event) => {
                    const field = event.target.id.split('-')[0];
                    hideError(field);
                });
            });

            // Edit button logic
            document.querySelectorAll('.edit-button').forEach(button => {
                button.addEventListener('click', (event) => {
                    const field = event.target.dataset.field;
                    showEditField(field);
                });
            });

            // Cancel button logic
            document.querySelectorAll('.cancel-button').forEach(button => {
                button.addEventListener('click', (event) => {
                    const field = event.target.dataset.field;
                    cancelEditField(field);
                });
            });

            // Save button logic
            document.querySelectorAll('.save-button').forEach(button => {
                button.addEventListener('click', (event) => {
                    const field = event.target.dataset.field;
                    const newValue = document.getElementById(`${field}-input`).value;

                    // Make API call to update user information
                    fetch(`/update-user/${userID}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ [field]: newValue })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (!data.success) {
                            showFieldError(field, data.message);
                            return;
                        }
                        updateFieldSuccess(field);
                    })
                    .catch(error => console.error('Error:', error));
                });
            });
        })
    .catch(error => console.error('Error:', error));
}
