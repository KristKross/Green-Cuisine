// Call function to set up the event listener of the search form
function attachEventListeners() {
    document.querySelector('#search-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const recipeName = event.target.elements.recipeName.value;;
        currentPage = 1;
        window.location.href = `/search?q=${recipeName}&page=${currentPage}`; // Redirect to the search page
    });
}

attachEventListeners();