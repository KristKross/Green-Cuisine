// document.addEventListener('DOMContentLoaded', async () => {
//     try {
//         const response = await fetch('/seasonal-recipes');
//         const data = await response.json();
//         const seasonalRecipes = data.recipes;
//         renderSeasonalRecipes(seasonalRecipes);
//     } catch (error) {
//         console.error('Error fetching season:', error);
//     }

//     const recipeQueries = [
//         'Non-Traditional Pasta Carbonara',
//         'Classic American Burger',
//         'Pan-Seared Ribeye Steak with Quick Creamed Spinach Recipe'
//     ];
//     try {
//         const results = await Promise.all(
//             recipeQueries.map(query =>
//                 fetch(`/featured-search?q=${encodeURIComponent(query)}`)
//                     .then(response => response.json())
//             )
//         );
//         const singleRecipes = results.flatMap(result => result.recipes);
//         renderFeaturedRecipes(singleRecipes);
//     } catch (error) {
//         console.error('Error fetching recipes:', error);
//     }
// });

// function renderFeaturedRecipes(recipes) {
//     const featuredContainer = document.getElementById('featured');
//     const classes = ['sub-card left', 'main-card', 'sub-card right'];
    
//     featuredContainer.innerHTML = `
//         <div class="featured-container">
//             ${recipes.slice(0, 3).map((recipe, index) => `
//                 <div class="featured-card ${classes[index]}" style="background-image: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent), url('${recipe.image}');">
//                     <div class="time-container">
//                         <div class="clock-image"></div>
//                         <h4>${recipe.totalTime === 0 ? "N/A" : `${recipe.totalTime} min`}</h4>
//                     </div>
//                     <h3 class="recipe-name">${recipe.label}</h3>
//                 </div>
//             `).join('')}
//         </div>
//     `;
//     featuredContainer.querySelectorAll('.featured-card').forEach((recipeCard, index) => {
//         recipeCard.addEventListener('click', () => {
//             localStorage.setItem('selectedRecipe', JSON.stringify(recipes[index]));
//             window.location.href = `/recipe?q=${encodeURIComponent(recipes[index].label)}`;
//         });
//     });
// }

// function renderSeasonalRecipes(seasonalRecipes) {
//     const mainContainer = document.getElementById('main-container');
//     const sideContainer = document.getElementById('side-container');

//     if (seasonalRecipes.length > 0) {
//         const mainRecipe = seasonalRecipes[0];
//         mainContainer.innerHTML = `
//             <div class="seasonal-card" style="background-image: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent), url('${mainRecipe.image}');">
//                 <div class="text-container" style="display: ${mainRecipe.dishType ? 'block' : 'none'};">
//                     <p class="dish-type">${mainRecipe.dishType}</p>
//                 </div>
//                 <div class="time-container">
//                     <div class="clock-image"></div> 
//                     <h4>${mainRecipe.totalTime === 0 ? "N/A" : `${mainRecipe.totalTime} min`}</h4>
//                 </div>
//                 <h3 class="recipe-name">${mainRecipe.label}</h3>
//             </div>
//         `;
//         mainContainer.addEventListener('click', () => {
//             localStorage.setItem('selectedRecipe', JSON.stringify(mainRecipe));
//             window.location.href = `/recipe?q=${encodeURIComponent(mainRecipe.label)}`;
//         });
//     }
    
//     const sideRecipes = seasonalRecipes.slice(1, 3);
//     sideContainer.innerHTML = sideRecipes.map(recipe => `
//         <div class="seasonal-card" style="background-image: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent), url('${recipe.image}');">
//                 <div class="text-container" style="display: ${recipe.dishType ? 'block' : 'none'};">
//                     <p class="dish-type">${recipe.dishType}</p>
//                 </div>
//                 <div class="time-container">
//                     <div class="clock-image"></div> 
//                     <h4>${recipe.totalTime === 0 ? "N/A" : `${recipe.totalTime} min`}</h4>
//                 </div>
//                 <h3 class="recipe-name">${recipe.label}</h3>
//             </div>
//     `).join('');
//     sideRecipes.forEach(recipe => {
//         const sideRecipeElement = sideContainer.querySelector(`.seasonal-card[style*="${recipe.image}"]`);
//         sideRecipeElement.addEventListener('click', () => {
//             localStorage.setItem('selectedRecipe', JSON.stringify(recipe));
//             window.location.href = `/recipe?q=${encodeURIComponent(recipe.label)}`;
//         });
//     });
// }


// const categoriesMap = {
//     'main dishes': 'main course',
//     'desserts': 'desserts',
//     'appetisers': 'starter',
//     'soups': 'soup',
//     'salads': 'salad',
//     'breakfast': 'breakfast'
// };

// document.querySelectorAll('.category-card').forEach(card => {
//     card.addEventListener('click', () => {
//         const category = card.querySelector('h3').textContent.toLowerCase();
//         if (['soups', 'salads', 'main dishes', 'appetisers', 'desserts'].includes(category)) {
//             window.location.href = `/search?q=recipe&page=1&dishType=${encodeURIComponent(categoriesMap[category])}`;
//         } else {
//             window.location.href = `/search?q=recipe&page=1&mealType=${encodeURIComponent(categoriesMap[category])}`;
//         }
//     });
// });

// const dietLabelMap = {
//     'vegan': 'vegan',
//     'vegetarian': 'vegetarian',
//     'gluten-free': 'gluten-free',
//     'low-carb': 'low-carb',
//     'paleo': 'paleo',
//     'keto': 'keto-friendly'
// };

// document.querySelectorAll('.preference-card').forEach(card => {
//     card.addEventListener('click', () => {
//         const diet = card.querySelector('h3').textContent.trim().toLowerCase();

//         window.location.href = `/search?q=recipe&page=1&health=${encodeURIComponent(dietLabelMap[diet])}`;
//     });
// });