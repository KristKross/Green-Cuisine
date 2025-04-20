-- For Edamam API
CREATE TABLE users (
    UserID INT PRIMARY KEY,
    Username VARCHAR(50),
    Password VARCHAR(256),
    Email VARCHAR(100)
);

CREATE TABLE favourites (
    UserID INT,
    RecipeName VARCHAR(100),
    RecipeURI VARCHAR(200),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);
