const express = require("express");
const app = express();
const path = require("path");
const User = require("./models/user");
const passport = require("passport");
const bodyParser = require("body-parser")
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const flash = require("connect-flash")

// Require database connection
require("./models/db");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));


// Session config
app.use(require("express-session")({
  secret: "Rusty is a dog",
  resave: false,
  saveUninitialized: false
}));



app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport Configuration
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Routes

// Home route
app.get("/", (req, res) => {
  res.render("home.ejs");
});

// Signup page
app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});

// Sign-up Route
app.post("/signup", async (req, res) => {

  try {
    const { name, phone, email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      req.flash("success", "signup  successfully.");

      return res.status(409)
        .json({ message: 'User is already exist, you can login', success: false });


    }
    const userModel = new User({ name, phone, email, password });
    await userModel.save();
    res.status(201)
      .json({
        message: "Signup successfully",
        success: true
      })
    req.flash("success", "signup  successfully.");
    console.log(req.flash("success"))

    res.redirect("/login")
  } catch (err) {

    res.status(500)
      .json({
        message: "Internal server error",
        success: false
      })
  }
});

// Login page
app.get("/login", (req, res) => {
  res.render("login.ejs");
});
// Login Route
app.post("/login", async (req, res) => {
  try {

    const user = await User.findOne({ name: req.body.name, email: req.body.email })
    if (user) {
      const pswdCheck = req.body.password === user.password
      if (pswdCheck) {
        res.render("home.ejs")
      } else {
        res.status(400).json({ error: "password doesn't match" });

      }
    } else {
      res.status(400).json({ error: "User doesn't exist" });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
}
)

// Logout route
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logged out successfully.");
    res.redirect("/login");
  });
});

// Home route after login
app.get("/home", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("home.ejs", { user: req.user });
  } else {
    req.flash("error", "Please log in first.");
    res.redirect("/login");
  }
});




// Start server
app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
