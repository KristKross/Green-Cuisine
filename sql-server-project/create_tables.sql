-- For Edamam API
CREATE TABLE users (
    UserID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255),
    username VARCHAR(255),
    password VARCHAR(255)
);

CREATE TABLE favourites (
    UserID INT,
    RecipeName VARCHAR(100),
    RecipeURI VARCHAR(200),
    FOREIGN KEY (UserID) REFERENCES users(UserID)
);
