const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

// Load environment variables from .env file
const appId = process.env.APP_ID;
const apiKey = process.env.API_KEY;

// This function determines the current season based on the month
function getSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
}

// This function returns a random seasonal ingredient based on the current season
function getRandomSeasonalIngredient() {
    const season = getSeason();
    const ingredientList = seasonalIngredients[season];
    const randomIndex = Math.floor(Math.random() * ingredientList.length);
    return ingredientList[randomIndex];
}

// This function returns a random seasonal ingredient based on the current season
const seasonalIngredients = {
    spring: ['asparagus', 'strawberry', 'peas', 'lemon', 'mint', 'lamb', 'quiche', 'frittata'],
    summer: ['tomato', 'zucchini', 'berries', 'stone fruit', 'grilled meat', 'salads', 'corn', 'avocado'],
    fall: ['pumpkin', 'apples', 'squash', 'sweet potato', 'cranberries', 'brussels sprouts', 'turkey', 'stuffing'],
    winter: ['root vegetables', 'citrus', 'stew', 'braised meat', 'roasted vegetables', 'hot chocolate', 'soup', 'baked goods']
};

// This function fetches recipes from the Edamam API based on the provided parameters
async function fetchRecipes(recipeName, mealType, dishType, dietLabel, healthLabel, cuisineType, nextPageURL = '') {
    let allHits = [];
    let nextPage = '';

    try {
        const url = nextPageURL || (() => {
            const baseURL = 'https://api.edamam.com/api/recipes/v2?type=public';
            const params = new URLSearchParams({
                q: recipeName,
                app_id: appId,
                app_key: apiKey,
            });

            if (mealType) params.append('mealType', mealType);
            if (dishType) params.append('dishType', dishType);
            if (dietLabel) params.append('diet', dietLabel);
            if (healthLabel) params.append('health', healthLabel);
            if (cuisineType) params.append('cuisineType', cuisineType);

            return `${baseURL}&${params.toString()}`;
        })();

        const response = await axios.get(url);
        allHits = response.data.hits || [];
        nextPage = response.data._links?.next?.href || '';
    } catch (error) {
        console.error('Error fetching recipes:', error.message);
    }

    return { allHits, nextPage };
}

// This function fetches recipe details using the RecipeURI from the Edamam API
async function fetchRecipeWithURI(results) {
    const favouriteRecipes = [];

    for (const result of results) {
        const URI = result.RecipeURI;
        try {
            const baseURL = 'https://api.edamam.com/api/recipes/v2/by-uri?type=public';
            const params = new URLSearchParams({
                uri: URI,
                app_id: appId,
                app_key: apiKey
            });

            const url = `${baseURL}&${params.toString()}`;
            const response = await axios.get(url);

            if (response.data.hits && response.data.hits.length > 0) {
                favouriteRecipes.push(response.data.hits[0].recipe);
            }
        } catch (error) {
            console.error('Error fetching recipe details from Edamam:', error.message);
        }
    }

    return favouriteRecipes;
}

module.exports = {
    fetchRecipes,
    fetchRecipeWithURI,
    getSeason,
    getRandomSeasonalIngredient
};