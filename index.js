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

app.post('/register', (req, res) => {
    const { email, password } = req.body;

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
        // Insert the user data into the database
        const insertQuery = 'INSERT INTO users (email, password) VALUES (?, ?)';
        db.query(insertQuery, [email, password], (err, results) => {
            if (err) {
                console.error('Error inserting data:', err);
                res.json({ success: false, message: 'Error occurred' });
                return;
            }
            res.json({ success: true, message: 'User registered successfully' });
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
        if (results.length > 0) {
            res.json({ success: true, message: 'Login successful' });
        } else {
            res.json({ success: false, message: 'Invalid email or password' });
        }
    });
});

// Server listening on port 3000 
app.listen(port, () => { 
    console.log(`Server running at http://localhost:${port}`);
});