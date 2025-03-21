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

function getSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) {
        return 'spring';
    } else if (month >= 5 && month <= 7) {
        return 'summer';
    } else if (month >= 8 && month <= 10) {
        return 'fall'; 
    } else {
        return 'winter'; 
    }
}

const seasonalIngredients = {
    spring: ['asparagus', 'strawberry', 'peas', 'lemon', 'mint', 'lamb', 'quiche', 'frittata'],
    summer: ['tomato', 'zucchini', 'berries', 'stone fruit', 'grilled meat', 'salads', 'corn', 'avocado'],
    fall: ['pumpkin', 'apples', 'squash', 'sweet potato', 'cranberries', 'brussels sprouts', 'turkey', 'stuffing'],
    winter: ['root vegetables', 'citrus', 'stew', 'braised meat', 'roasted vegetables', 'hot chocolate', 'soup', 'baked goods']
};

// Store all fetched recipes globally
let allRecipes = [];

// Function to fetch all recipes and store them in memory
async function fetchAllRecipes(recipeName, start, end, mealType, dishType, dietLabel, healthLabel) {
    let allHits = [];
    let from = start ? start : 0;
    const limit = end ? end : 100;
    try {
        const baseURL = 'https://api.edamam.com/search';
        const params = new URLSearchParams({
            q: recipeName,
            app_id: appId,
            app_key: apiKey,
            from,
            to: from + limit
        });

        if (mealType) { params.append('mealType', mealType); }
        if (dishType) { params.append('dishType', dishType); }
        if (dietLabel) {params.append('diet', dietLabel); }
        if (healthLabel) {params.append('health', healthLabel); }
        
        const url = `${baseURL}?${params.toString()}`;
        const response = await axios.get(url);
        allHits = response.data.hits;
    } catch (error) {
        console.error('Error fetching recipes:', error.message);
    }
    allRecipes = allHits;
}

app.get('/featured-search', async (req, res) => {
    allRecipes = [];

    const recipeName = req.query.q;
    const start = 0
    await fetchAllRecipes(recipeName, start, 1);

    const formattedRecipes = allRecipes.map(hit => {
        const recipe = hit.recipe;
        recipe.label = recipe.label.toLowerCase();
        return recipe;
    });

    if (formattedRecipes.length) {
        res.json({ recipes: formattedRecipes });
    } else {
        res.status(404).json({ success: false, message: 'No recipes found.' });
    }
});

app.get('/seasonal-recipes', async (req, res) => {
    allRecipes = [];

    const season = getSeason();
    const recipeName = seasonalIngredients[season][Math.floor(Math.random() * seasonalIngredients[season].length)];
    
    const start = Math.floor(Math.random() * 97);
    await fetchAllRecipes(recipeName, start, 3);

    const formattedRecipes = allRecipes.map(hit => {
        const recipe = hit.recipe;
        recipe.label = recipe.label.toLowerCase();
        recipe.dishType = Array.isArray(recipe.dishType) && recipe.dishType.length > 0 ? recipe.dishType[0] : '';
        return recipe;
    });

    if (formattedRecipes.length) {
        res.json({ recipes: formattedRecipes });
    } else {
        res.status(404).json({ success: false, message: 'No recipes found.' });
    }
});

// Route to handle the search and paginate results
app.post('/search', async (req, res) => {
    const recipeName = req.body.recipeName;
    const page = parseInt(req.query.page) || 1; 
    const mealType = req.query.mealType || '';
    const dishType = req.query.dishType || '';
    const dietLabel = req.query.diet || '';
    const healthLabel = req.query.health || '';
    const limit = 24;

    allRecipes = [];

    await fetchAllRecipes(recipeName, null, null, mealType, dishType, dietLabel, healthLabel);

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
        if (results.length > 1) {
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

app.get('/read-user/:userID', (req, res) => {
    const userID = req.params.userID;

    const query = 'SELECT * FROM users WHERE UserID = ?';
    db.query(query, [userID], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            res.json({ success: false, message: 'Error occurred' });
            return;
        }
        if (results.length === 0) {
            res.json({ success: false, message: 'User not found' });
            return;
        }
        const user = results[0];
        res.json({ success: true, message: 'User found', username: user.Username, email: user.Email, password: user.Password });
    });
});

app.put('/update-user/:userID', (req, res) => {
    const userID = req.params.userID;
    const { newEmail, newPassword, newUsername } = req.body;

    let fieldsToUpdate = [];
    let values = [];

    // Check which fields are provided and add them to the update query
    if (newEmail) {
        fieldsToUpdate.push('email = ?');
        values.push(newEmail);
    }
    if (newPassword) {
        fieldsToUpdate.push('password = ?');
        values.push(newPassword);
    }
    if (newUsername) {
        fieldsToUpdate.push('username = ?');
        values.push(newUsername);
    }

    // If no fields are provided, return an error
    if (fieldsToUpdate.length === 0) {
        res.json({ success: false, message: 'No fields provided for update' });
        return;
    }

    // Add UserID to the values for the WHERE clause
    values.push(userID);

    const query = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE UserID = ?`;

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error updating data:', err);
            res.json({ success: false, message: 'Error occurred' });
            return;
        }
        res.json({ success: true, message: 'User updated successfully' });
    });
});

app.delete('/delete-user/:id', (req, res) => {
    const userID = req.params.id;
    const query = 'DELETE FROM users WHERE UserID = ?';
    db.query(query, [userID], (err, results) => {
        if (err) {
            console.error('Error deleting data:', err);
            res.json({ success: false, message: 'Error occurred' });
            return;
        }
        res.json({ success: true, message: 'User deleted successfully' });
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

// Function to fetch favourite recipes
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