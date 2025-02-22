// Required modules
const express = require('express');
const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');

// Added dotenv to load environment variables
dotenv.config();

// Variables to process environment variables
const app = express();
const port = 3000;
const appId = process.env.APP_ID;
const apiKey = process.env.API_KEY;

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Function to convert a string to title case
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

// Routes to serve the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Routes to serve the recipes when page loads
// TODO: Implement multiple pages for the loaded recipes
app.get('/recipes', async (req, res) => {
    const url = `https://api.edamam.com/search?q=random&app_id=${appId}&app_key=${apiKey}&to=24`;
    try {
        const response = await axios.get(url); // Fetching data from the Edamam API
        const recipes = response.data.hits.map(hit => { // Mapping the data to get the required fields
            const recipe = hit.recipe; // Getting the recipe
            recipe.label = toTitleCase(recipe.label);
            return recipe; // Returning the recipe
        });
        res.json(recipes); // Sending the recipes as a JSON response
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.status(500).send(`Error: ${error.message}`);
    }
});

// Routes to serve the search results when the form is submitted
// TODO: Implement multiple pages for search results
app.post('/search', async (req, res) => {
    const recipeName = req.body.recipeName; // Getting the recipe name from the form
    const url = `https://api.edamam.com/search?q=${recipeName}&app_id=${appId}&app_key=${apiKey}&to=24`;
    try {
        const response = await axios.get(url); // Fetching data from the Edamam API
        const recipes = response.data.hits.map(hit => { // Mapping the data to get the required fields
            const recipe = hit.recipe; // Getting the recipe
            recipe.label = toTitleCase(recipe.label);
            return recipe; // Returning the recipe
        });
        res.json(recipes); // Sending the recipes as a JSON response
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.status(500).send(`Error: ${error.message}`);
    }
});

// Server listening on port 3000 
app.listen(port, () => { 
    console.log(`Server running at http://localhost:${port}`);
});