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

3. **Set up environment variables**:
   Create a `.env` file in the root directory of the project. Add your Edamam API credentials as follows:
   ```
   APP_ID=your_app_id
   API_KEY=your_api_key
   ```

4. **Run the application**:
   Start the server using the following command:
   ```bash
   npm start
   ```
   The application will be running at `http://localhost:3000`.

5. **Development mode**:
   To run the application in development mode with hot-reloading, use:
   ```bash
   npm run dev
   ```

## Usage

- Open your browser and navigate to `http://localhost:3000`.
- Enter the name of a recipe you want to search for in the provided input field and click "Search".
- The results will be displayed on the page.

## Dependencies

- Express
- Axios
- Dotenv
- Nodemon (for development)

Ensure you have these dependencies installed by running `npm install` as mentioned in the installation steps.

## License

This project is licensed under the ISC License.
