let currentPage = 1;

// Function to update the URI without reloading the page
function updateURI(uri) {
    history.pushState(null, '', uri);
}

function attachEventListeners() {
    document.querySelector('#search-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const recipeName = event.target.elements.recipeName.value;;
        currentPage = 1; // Reset to the first page for new search
        window.location.href = `/search?q=${recipeName}&page=${currentPage}`;
    });
}

// Call attachEventListeners to set up the event listener
attachEventListeners();