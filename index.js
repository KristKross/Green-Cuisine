const express = require('express');
const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3000;
const appId = process.env.APP_ID;
const apiKey = process.env.API_KEY;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.post('/search', async (req, res) => {
    const recipeName = req.body.recipeName;
    const url = `https://api.edamam.com/search?q=${recipeName}&app_id=${appId}&app_key=${apiKey}&to=24`;
    try {
        const response = await axios.get(url);
        const recipes = response.data.hits.map(hit => {
            const recipe = hit.recipe;
            recipe.label = toTitleCase(recipe.label);
            return recipe;
        });
        res.json(recipes);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.status(500).send(`Error: ${error.message}`);
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
