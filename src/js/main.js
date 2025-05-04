    import _ from 'lodash';
    import '../scss/main.scss';
    import backIconPath from '../assets/icons/back-icon.png';

    document.addEventListener('DOMContentLoaded', () => {
        const loginName = document.querySelector('#login-name');
        const menuToggle = document.querySelector('.menu-toggle');
        const menu = document.querySelector('.menu');
        const mainMenu = menu.querySelector('.main-menu');
        const subMenuContainer = menu.querySelector('.sub-menu-container');
        const dropdownButtons = menu.querySelectorAll('.dropdown-item');
        const navItems = document.querySelector('.dropdown-container');

        setupLoginName(loginName);
        checkScroll(navItems, menu);
        setupScrollListener(menuToggle);
        setupResizeHandlers(mainMenu, menu, subMenuContainer, navItems);
        setupMenuToggle(menuToggle, menu, navItems);
        setupDropdownButtons(dropdownButtons, mainMenu, subMenuContainer);
        setupSearchPage();
    });

// Function to set up the login name
function setupLoginName(loginName) {
    if (!loginName) return;

    fetch('/session-data', {
        method: 'GET',
        credentials: 'include',
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loginName.textContent = `Hello, ${data.username}`;
            loginName.href = '/profile';
        }
    })
    .catch(console.error);
}

// Function to set up the scroll listener
function setupScrollListener(menuToggle) {
    window.addEventListener('scroll', () => {
        document.body.classList.toggle('scrolled', window.scrollY > 30);
        menuToggle.classList.toggle('show', window.scrollY > 30);
        document.querySelector('main').classList.toggle('scrolled', window.scrollY > 30);
    });
}

// Function to check the scroll position
function checkScroll(navItems, menu) {
    window.addEventListener('scroll', function() {
        if (window.innerHeight <= 30) {
            navItems.classList.add('show');
            return
        }

        navItems.classList.remove('show');
        menu.classList.remove('show');
    });
}

// Function to set up the resize handlers
function setupResizeHandlers(mainMenu, menu, subMenuContainer, navItems) {
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            subMenuContainer.style.display = 'none';
            mainMenu.style.display = 'flex';
            navItems.classList.remove('show');
            menu.classList.remove('show');
        }
    });
}

// Function to set up the menu toggle
function setupMenuToggle(menuToggle, menu, navItems) {
    menuToggle.addEventListener('click', () => {
        menu.classList.toggle('show');
        navItems.classList.toggle('show');
    });
}

// Function to set up the dropdown buttons
function setupDropdownButtons(buttons, mainMenu, subMenuContainer) {
    buttons.forEach(button => { // Add event listener to each dropdown button
        button.addEventListener('click', function (e) {
            if (window.innerWidth > 768) return;
            e.preventDefault();

            // Find and show the sub-menu
            const subMenu = this.closest('.dropdown-item').querySelector('.sub-menu');
            if (!subMenu) return;

            showSubMenu(mainMenu, subMenuContainer, subMenu);
        });
    });
}

// Function to show the sub-menu
function showSubMenu(mainMenu, subMenuContainer, subMenu) {
    mainMenu.style.display = 'none';
    subMenuContainer.style.display = 'block';

    // Clone the sub-menu and add a back button
    const backButton = createBackButton(mainMenu, subMenuContainer);
    subMenuContainer.innerHTML = '';
    subMenuContainer.appendChild(backButton);

    const clonedSubMenu = subMenu.cloneNode(true);
    subMenuContainer.appendChild(clonedSubMenu);

    // Add the data-filter attribute if it exists
    const filterAttr = subMenu.getAttribute('data-filter');
    if (filterAttr) {
        subMenuContainer.setAttribute('data-filter', filterAttr);
    } else {
        subMenuContainer.removeAttribute('data-filter');
    }

    setupSubMenuItems(subMenuContainer);
}

// Function to create the back button
function createBackButton(mainMenu, subMenuContainer) {
    const backButton = document.createElement('button');
    backButton.classList.add('back-btn');
    backButton.innerHTML = `<img src="${backIconPath}" alt="Back Icon"> Back`;

    backButton.addEventListener('click', () => {
        subMenuContainer.style.display = 'none';
        mainMenu.style.display = 'flex';
    });

    return backButton;
}

// Function to set up the sub-menu items
function setupSubMenuItems(subMenuContainer) {
    const items = subMenuContainer.querySelectorAll('.sub-menu p');

    items.forEach(item => {
        item.addEventListener('click', () => {
            const search = item.getAttribute('data-search');
            const category = item.getAttribute('data-category');
            const filter = subMenuContainer.getAttribute('data-filter');

            const params = new URLSearchParams({ q: search || 'recipe' });
            if (filter) params.append(filter, category);

            window.location.href = `/search?${params.toString()}`;
        });
    });
}

// Function to set up the search page
function setupSearchPage() {
    const categoryItems = document.querySelectorAll('.sub-menu p');
    const recipeItems = document.querySelectorAll('.footer-content p');

    // Add event listener to each category item
    categoryItems.forEach(item => {
        item.addEventListener('click', _.debounce((e) => handleCategoryClick(item)(e), 100));
    });

    // Add event listener to each recipe item
    recipeItems.forEach(recipe => {
        recipe.addEventListener('click', _.debounce((e) => handleRecipeClick(recipe)(e), 100));
    });
}

// Function to handle category click
function handleCategoryClick(item) {
    return (e) => {
        e.preventDefault();

        // Get the search and category values
        const search = item.getAttribute('data-search');
        const category = item.getAttribute('data-category');
        const filter = item.closest('.sub-menu')?.getAttribute('data-filter');

        // Navigate to the search page with the search and category values
        const params = new URLSearchParams({ q: search || 'recipe' });
        if (filter) params.append(filter, category);

        // Navigate to the search page
        window.location.href = `/search?${params.toString()}`;
    };
}

// Function to handle recipe click
function handleRecipeClick(recipe) {
    return () => {
        const recipesMap = {
            "Non-Traditional Pasta Carbonara": 'http://www.edamam.com/ontologies/edamam.owl#recipe_da4a5ccd1498a3fb48eee56793ca4fbb',
            "Classic American Burgers": 'http://www.edamam.com/ontologies/edamam.owl#recipe_b9db2fefe520aea1f481adbfc007b832',
            "Pan-Seared Ribeye Steak": 'http://www.edamam.com/ontologies/edamam.owl#recipe_2efb6c7072df4012bc84122481cc5ebd',
            "Classic French Ratatouille": 'http://www.edamam.com/ontologies/edamam.owl#recipe_082d4785f00436b464e5956c21da5551',
            "Indian Butter Chicken": 'http://www.edamam.com/ontologies/edamam.owl#recipe_820a30063d65927b942d592be2b1056b',
            "Authentic Mexican Tacos": 'http://www.edamam.com/ontologies/edamam.owl#recipe_e3f85c5e1b3a43699722f6b85bfc2f54',
        };

        // Find the recipe URI
        const recipeName = recipe.textContent;
        const recipeURI = _.get(recipesMap, recipeName);

        if (!recipeURI) return;

        // Fetch the selected recipe
        fetch(`/featured-search?q=${encodeURIComponent(recipeURI)}`)
            .then(response => response.json())
            .then(data => {
                const [selectedRecipe] = data.recipes || [];
                if (selectedRecipe) {
                    localStorage.setItem('selectedRecipe', JSON.stringify(selectedRecipe));
                    window.location.href = `/recipe?q=${encodeURIComponent(selectedRecipe.label)}`;
                }
            })
        .catch(console.error);
    };
}