-- For Edamam API
CREATE TABLE users (
    UserID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(255),
    Username VARCHAR(255),
    Password VARCHAR(255)
);

CREATE TABLE favourites (
    UserID INT,
    RecipeURI VARCHAR(200),
    FOREIGN KEY (UserID) REFERENCES users(UserID)
);
