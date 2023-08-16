const path = require('path')

const debug = require('debug')('blog-project');
const fileUpload = require('express-fileupload');
const express = require('express');
const dotEnv = require('dotenv');
const passport = require('passport');
const morgan = require('morgan');
const expressLayout = require("express-ejs-layouts");
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const connectDb = require('./config/db');
const winston = require('./config/winston');

// Load Confg
dotEnv.config({ path: "./config/config.env" })

// DataBase
connectDb();
debug('connected To Database');

// Passprot Config
require('./config/passport');


const app = express();

// Logging
if (process.env.NODE_ENV === 'development') {
    debug("morgan Enable")
    app.use(morgan('combined', { stream: winston.stream }))
}

// View Engine
app.use(expressLayout);
app.set("view engine", "ejs");
app.set("layout", "./layouts/mainLayout");
app.set("views", "views");


// Body Parser
app.use(express.urlencoded({ extended: false })); // Form data parser middleware for parsing application
app.use(express.json())

// File Upload Middleware 
app.use(fileUpload())

// Session
const store = MongoStore.create({
    mongoUrl: process.env.MOONGO_URL, // Replace with your MongoDB connection URL
    collectionName: 'sessions' // Specify the collection name for storing sessions
});

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        unset: "destroy",
        store: store
    })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());


// Flash
app.use(flash());


// Static Folder
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, 'node_modules', 'bootsrap-v4-rtl', 'dist')));
// app.use(express.static(path.join(__dirname, 'node_modules', 'font-awesome')));


// Routes
app.use('/', require('./routes/blog'));
app.use("/dashboard", require("./routes/dashboard"));
app.use("/users", require("./routes/users"));

// 404
app.use(require('./controllers/errorController').get404)
const PORT = process.env.PORT || 3002;

app.listen(PORT, () => console.log(`server listen in ${process.env.NODE_ENV} on ${PORT}`))