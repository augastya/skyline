// server.js
// Skyline & Co. — a full-stack real estate listings site.
// Express + EJS views + SQLite (better-sqlite3), session-based auth,
// image uploads via multer.

require('dotenv').config();

const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const methodOverride = require('method-override');
const path = require('path');

const db = require('./config/db');
const { attachUser } = require('./middleware/auth');
const helpers = require('./config/helpers');

const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- View engine ----------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ---------- Core middleware ----------
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'skyline-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 } // 7 days
}));

app.use(attachUser(db));

// Presentation helpers (price formatting, star ratings, etc.) available
// in every EJS template as `helpers.xxx()`.
app.use((req, res, next) => {
  res.locals.helpers = helpers;
  next();
});

// Make a couple of things available in every view without repeating them
// in each render() call.
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.query = req.query;
  next();
});

// ---------- Routes ----------
app.use('/', indexRoutes);
app.use('/', authRoutes);
app.use('/properties', propertyRoutes);
app.use('/dashboard', dashboardRoutes);

// ---------- 404 ----------
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page not found' });
});

// ---------- Error handler ----------
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('404', { title: 'Something went wrong', serverError: true });
});

app.listen(PORT, () => {
  console.log(`Skyline & Co. running at http://localhost:${PORT}`);
});
