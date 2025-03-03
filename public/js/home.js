// Call function to set up the event listener of the search form
document.querySelector('#search-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const recipeName = event.target.elements.recipeName.value;;
    currentPage = 1;
    window.location.href = `/search?q=${recipeName}&page=${currentPage}`;
});