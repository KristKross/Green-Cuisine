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

// Routes to serve the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Routes to serve the recipes when page loads
app.get('/recipes', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const total = 100;
    const limit = 24;
    const from = (page - 1) * limit;
    const to = from + limit;
    const url = `https://api.edamam.com/search?q=random&app_id=${appId}&app_key=${apiKey}&from=${from}&to=${to}`;
    try {
        const response = await axios.get(url); // Fetching data from the Edamam API
        const recipes = response.data.hits.map(hit => { // Mapping the data to get the required fields
            const recipe = hit.recipe; // Getting the recipe
            recipe.dishType = Array.isArray(recipe.dishType) ? recipe.dishType.join(', ') : '';
            return recipe; // Returning the recipe
        });
        res.json({ recipes, total, page, limit }); // Sending the recipes, total count, current page, and limit as a JSON response
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.status(500).send(`Error: ${error.message}`);
    }
});

// Routes to serve the search results when the form is submitted
app.post('/search', async (req, res) => {
    const recipeName = req.body.recipeName; // Getting the recipe name from the form
    const page = parseInt(req.query.page) || 1;
    const total = 100;
    const limit = 24;
    const from = (page - 1) * limit;
    const to = from + limit;
    const url = `https://api.edamam.com/search?q=${recipeName}&app_id=${appId}&app_key=${apiKey}&from=${from}&to=${to}`;
    try {
        const response = await axios.get(url); // Fetching data from the Edamam API
        const recipes = response.data.hits.map(hit => { // Mapping the data to get the required fields
            const recipe = hit.recipe; // Getting the recipe
            recipe.dishType = Array.isArray(recipe.dishType) ? recipe.dishType.join(', ') : '';
            return recipe; // Returning the recipe
        });
        res.json({ recipes, total, page, limit });
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.status(500).send(`Error: ${error.message}`);
    }
});

// Server listening on port 3000 
app.listen(port, () => { 
    console.log(`Server running at http://localhost:${port}`);
});