CREATE TABLE users (
    UserID INT PRIMARY KEY,
    Username VARCHAR(50),
    PasswordHash VARCHAR(256),
    Email VARCHAR(100)
);

CREATE TABLE recipes (
    RecipeID INT PRIMARY KEY,
    RecipeName VARCHAR(100),
    Instructions TEXT,
    UserID INT,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);
