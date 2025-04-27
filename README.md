## Installation

To get started with this project, follow the steps below to set up your local environment:

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd recipe-website
   ```

2. **Install dependencies**:
   Make sure you have [Node.js](https://nodejs.org/) installed. Then run the following command to install the necessary packages:
   ```bash
   npm install
   ```

3. **Create the SQL Database**:
   Make sure you have a SQL server running. You can create the database for the project by using the following SQL command:
   ```sql
   CREATE DATABASE recipe_database;
   ```
   After creating the database, execute the `create_tables.sql` and script located in the `sql-server-project` directory to create the necessary tables.
   ```bash
   mysql -u your_username -p recipe_database < sql-server-project/create_tables.sql
   ```

4. **Set up environment variables**:
   Create a `.env` file in the root directory of the project. Add your Edamam API credentials and other information:
   ```
   NODE_ENV="development"
   APP_ID=your_app_id
   API_KEY=your_api_key
   DB_HOST=your_db_host
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name
   SESSION_SECRET=your_session_token
   ```

5. **Run the application**:
   Start the server using the following command:
   ```bash
   npm start
   ```
   The application will be running at `http://localhost:3000`.

6. **Development Workflow**:
   To use Nodemon for backend development and Webpack for frontend bundling, follow these steps:

   #### Webpack (Frontend Bundling)
   1. Run `npm start` to launch the development server with Webpack Dev Server.
   2. Make changes to your files in the `src` directory, and Webpack will automatically bundle and reload the changes.

   #### Nodemon (Backend Development)
   1. Run `npm run dev` in your terminal to start the development server.
   2. Make changes to your code and observe how both the server and the build process are updated accordingly.

7. **Building the Application**:
   Change the `NODE_ENV` environment to production to start building.
   ```bash
   NODE_ENV="production"
   ```

   Run `npm run build` to build the `dist` folder.

## Usage

- Open your browser and navigate to `http://localhost:3000`.
- Enter the name of a recipe you want to search for in the provided input field and click "Search".
- The results will be displayed on the page.

## Dependencies List
   #### Dependencies:
   - axios: ^1.8.2
   - dotenv: ^16.4.7
   - express: ^4.21.2
   - express-mysql-session: ^3.0.3
   - express-session: ^1.18.1
   - mysql2: ^3.12.0

   #### DevDependencies:
   - browser-sync: ^3.0.4
   - copy-webpack-plugin: ^13.0.0
   - css-loader: ^7.1.2
   - file-loader: ^6.2.0
   - html-loader: ^5.1.0
   - html-webpack-plugin: ^5.6.3
   - image-minimizer-webpack-plugin: ^4.1.3
   - lodash: ^4.17.21
   - mini-css-extract-plugin: ^2.9.2
   - nodemon: ^3.1.9
   - nodemon-webpack-plugin: ^4.8.2
   - sass: ^1.87.0
   - sass-loader: ^16.0.5
   - sharp: ^0.34.1
   - style-loader: ^4.0.0
   - webpack: ^5.99.7
   - webpack-cli: ^6.0.1
   - webpack-dev-server: ^5.2.1

Ensure you have these dependencies installed by running `npm install` as mentioned in the installation steps.

## License

This project is licensed under the ISC License.
