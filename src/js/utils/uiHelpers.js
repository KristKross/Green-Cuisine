// Function to show loading indicator
export function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loader';

    const main = document.querySelector('main');
    main.appendChild(loadingDiv);
}

// Function to remove loading indicator
export function removeLoading() {
    const loadingDiv = document.getElementById('loader');

    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// Function to show error message
export function showError(title, message) {
    const errorMessageDiv = document.createElement('div');
    errorMessageDiv.id = 'error-message';
    errorMessageDiv.innerHTML = `
        <div class="error-title">${title || "Whoops! This one's a bit undercooked."}</div>
        <div class="error-message">${message || "The page you're looking for is unavailable. Please try again using our menu at the top."}</div>
    `;
    
    const main = document.querySelector('main');
    main.appendChild(errorMessageDiv);
}

// Function to update the URI without reloading the page
export function updateURI(uri, state) {
    history.pushState(state, '', uri);
}

// Function to show popup message
export function showPopupMessage() {
    const popup = document.createElement('div');
    popup.id = "confirmation-popup";
    popup.classList.add('popup');
    popup.innerHTML = `
        <div class="popup-content">
            <h2>Are you sure?</h2>
            <p>Do you really want to delete your account? This<br>process cannot be undone.</p>
            <button id="cancel-button" class="cancel">Cancel</button>
            <button id="confirm-button" class="confirm">Delete</button>
        </div>
    `;
    document.body.appendChild(popup);
}

// Function to remove popup message
export function removePopupMessage() {
    const popup = document.getElementById('confirmation-popup');
    if (popup) {
        document.body.removeChild(popup);
    }
}
