/**
 * Import required packages
 */
const express = require("express"); // Express framework for building web applications
const routes = require("./controllers"); // Import routes from controllers directory
const sequelize = require("./config/connection"); // Database connection using Sequelize ORM
const path = require("path"); // Node.js path module for file path operations
const exphbs = require("express-handlebars"); // Handlebars view engine for Express
const session = require("express-session"); // Session middleware for Express
const SequelizeStore = require("connect-session-sequelize")(session.Store); // Session store using Sequelize
const helpers = require("./utils/helpers"); // Custom Handlebars helper functions
const hbs = exphbs.create({ helpers }); // Create Handlebars engine instance with helpers
require("dotenv").config(); // Load environment variables from .env file

/**
 * Session configuration
 * - secret: Used for signing session ID cookies (loaded from environment variable)
 * - cookie: Configuration options for the session cookie (empty object uses defaults)
 * - resave: False prevents saving session if not modified
 * - saveUninitialized: True saves new but unmodified sessions
 * - store: Uses Sequelize to store sessions in database instead of memory
 */
const sess = {
  secret: process.env.SESSION_SECRET,
  cookie: {},
  resave: false,
  saveUninitialized: true,
  store: new SequelizeStore({
    db: sequelize, // Pass the Sequelize connection
  }),
};

/**
 * Initialize Express application
 */
const app = express();
const PORT = process.env.PORT || 3001; // Use port from environment or default to 3001

/**
 * Apply session middleware with our configuration
 */
app.use(session(sess));

/**
 * Set up Handlebars as the template engine
 */
app.engine("handlebars", hbs.engine); // Register handlebars as the view engine
app.set("view engine", "handlebars"); // Set handlebars as the default view engine

/**
 * Express middleware configuration
 */
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(express.static(path.join(__dirname, "public"))); // Serve static files from 'public' directory

/**
 * Apply routes from controllers
 */
app.use(routes);

/**
 * Initialize database connection and start server
 * - force: false prevents dropping and recreating tables on each startup
 */
sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log("Now listening")); // Start server after database sync completes
});
