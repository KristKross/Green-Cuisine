// Required modules
const express = require('express');
const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2');

// Added dotenv to load environment variables
dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

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
    res.sendFile(path.join(__dirname, 'public', 'html/home.html'));
});

app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html/search.html'));
});

app.get('/recipe', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html/recipe.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html/register.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html/profile.html'));
});

// Store all fetched recipes globally
let allRecipes = [];

// Function to fetch all recipes and store them in memory
async function fetchAllRecipes(recipeName) {
    let allHits = [];
    let from = 0;
    const limit = 100;
    try {
        const baseURL = 'https://api.edamam.com/search';
        const params = new URLSearchParams({
            q: recipeName,
            app_id: appId,
            app_key: apiKey,
            from,
            to: from + limit
        });
        const url = `${baseURL}?${params.toString()}`;
        const response = await axios.get(url);
        allHits = response.data.hits;
    } catch (error) {
        console.error('Error fetching recipes:', error.message);
    }
    allRecipes = allHits;
}

// Route to handle the search and paginate results
app.post('/search', async (req, res) => {
    const recipeName = req.body.recipeName;
    const page = parseInt(req.query.page) || 1; 
    const limit = 24;

    // Clear the cached recipes on each new search to avoid showing old data
    allRecipes = [];

    await fetchAllRecipes(recipeName);

    const start = (page - 1) * limit;
    const end = start + limit;

    const recipesForPage = allRecipes.slice(start, end);

    const formattedRecipes = recipesForPage.map(hit => {
        const recipe = hit.recipe;
        recipe.label = recipe.label.toLowerCase();
        recipe.dishType = Array.isArray(recipe.dishType) ? recipe.dishType.join(', ') : '';
        return recipe;
    });

    res.json({recipes: formattedRecipes, total: allRecipes.length, page, limit});
});

app.post('/register', (req, res) => {
    const { email, username, password } = req.body;

    // Check if the user exists in the database
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            res.json({ success: false, message: 'Error occurred' });
            return;
        }
        if (results.length > 0) {
            res.json({ success: false, message: 'Email is already taken' });
            return;
        }
        if (username.length < 3) {
            res.json({ success: false, message: 'Username must be at least 3 characters long' });
            return;
        }
        if (username.length > 10) {
            res.json({ success: false, message: 'Username must be at most 10 characters long' });
            return;
        }
        // Insert the user data into the database
        const insertQuery = 'INSERT INTO users (email, username, password) VALUES (?, ?, ?)';
        db.query(insertQuery, [email, username, password], (err, results) => {
            if (err) {
                console.error('Error inserting data:', err);
                res.json({ success: false, message: 'Error occurred' });
                return;
            }
            res.json({ success: true, message: 'User registered successfully', email });
        });
    });
});


app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Check if the user exists in the database
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';

    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            res.json({ success: false, message: 'Error occurred' });
            return;
        }
        if (results.length === 0) {
            res.json({ success: false, message: 'Invalid email or password' });
            return;
        }
        const user = results[0];
        res.json({ success: true, message: 'Login successful', username: user.Username, userID: user.UserID });
    });
});

app.post('/add-favourite', (req, res) => {
    const { user_id, recipe_name, recipe_uri } = req.body;

    const query = 'INSERT INTO favourites (UserID, RecipeName, RecipeURI) VALUES (?, ?, ?)';
    db.query(query, [user_id, recipe_name, recipe_uri], (err, results) => {
        if (err) {
            console.error('Error adding favourite:', err);
            res.json({ success: false, message: 'Error occurred' });
            return;
        }
        res.json({ success: true, message: 'Recipe added to favourites' });
    });
});

app.get('/favourites/:userID', (req, res) => {
    const userID = req.params.userID;

    const query = 'SELECT RecipeName, RecipeURI FROM favourites WHERE UserID = ?';
    db.query(query, [userID], (err, results) => {
        if (err) {
            console.error('Error fetching favourites:', err);    
            res.json({ success: false, message: 'Error occurred' });
            return;
        }

        res.json({ success: true, favourites: results });
    });
});

// Function to check if a recipe is favourited
app.post('/check-favourite', (req, res) => {
    const { user_id, recipe_name, recipe_uri } = req.body;

    const query = 'SELECT * FROM favourites WHERE UserID = ? AND RecipeName = ? AND RecipeURI = ?';
    db.query(query, [user_id, recipe_name, recipe_uri], (err, results) => {
        if (err) {
            console.error('Error checking favourite:', err);
            return res.json({ success: false, message: 'Error occurred' });
        }

        if (results.length > 0) {
            res.json({ isFavourited: true });
        } else {
            res.json({ isFavourited: false });
        }
    });
});

// Function to remove a recipe from favourites
app.post('/remove-favourite', (req, res) => {
    const { user_id, recipe_name } = req.body;

    const query = 'DELETE FROM favourites WHERE UserID = ? AND RecipeName = ?';
    db.query(query, [user_id, recipe_name], (err, results) => {
        if (err) {
            console.error('Error removing favourite:', err);
            res.json({ success: false, message: 'Error occurred' });
            return;
        }
        res.json({ success: true, message: 'Recipe removed from favourites' });
    });
});

// Function to fetch favourite recipes
app.post('/search-favourites', async (req, res) => {
    const { userID } = req.body;

    try {
        const results = await fetchFavouriteRecipeDetails(userID);
        const favouriteRecipes = await fetchRecipesFromAPI(results);
        res.json({ success: true, favourites: favouriteRecipes });
    } catch (error) {
        console.error('Error fetching favourites:', error);
        res.json({ success: false, message: 'Error occurred' });
    }
});

// Function to fetch recipe details from the database
function fetchFavouriteRecipeDetails(userID) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT RecipeName, RecipeURI FROM favourites WHERE UserID = ?';
        db.query(query, [userID], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

// Function to fetch recipe details from Edamam
async function fetchRecipesFromAPI(results) {
    const favouriteRecipes = [];
    for (const result of results) {
        const recipeName = result.RecipeName.toLowerCase();
        const recipeURI = result.RecipeURI;
        try {
            const baseURL = 'https://api.edamam.com/search';
            const params = new URLSearchParams({
                q: recipeName,
                app_id: appId,
                app_key: apiKey
            });
            const url = `${baseURL}?${params.toString()}`;
            const response = await axios.get(url);
            const recipeData = response.data.hits
                .map(hit => hit.recipe)
                .filter(recipe => recipe.label.toLowerCase() === recipeName && recipe.uri === recipeURI);

            favouriteRecipes.push(...recipeData);
        } catch (error) {
            console.error('Error fetching recipe details from Edamam:', error.message);
        }
    }
    return favouriteRecipes;
}


// Server listening on port 3000 
app.listen(port, () => { 
    console.log(`Server running at http://localhost:${port}`);
});