const express = require('express');
const app = express();
const port = 8080;
const Meeting = require('./models/meeting');
const OfficerMovement = require('./models/tour'); // Adjust the path if needed

const path = require("path");
const expressLayouts = require('express-ejs-layouts');

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static('public'));

// EJS Layouts
app.use(expressLayouts);
app.set('layout', 'layout/boilerplate'); // refers to views/layout/boilerplate.ejs

// Body parser middleware (if you're handling POST)
app.use(express.urlencoded({ extended: true }));
const mongoose = require('mongoose');
const session = require('express-session');

const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const User = require('./models/user.js');

const sessionOption ={
  // store,
  secret:"mysupersecretcode",
  resave:false,
  saveUninitialized: true,
  cookie: {
  expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true,
},

};
app.use(session(sessionOption));
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});
// Passport Config
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
  res.locals.isLoggedIn = req.isAuthenticated(); // for login status
  res.locals.currentUser = req.user;             // optional: logged-in user info
  next();
});
// Prevent browser cache for every request



main()
.then(()=>{
    console.log("Database connected successful");
})
.catch(err => console.log(err));



async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/Ecor");
  // await mongoose.connect(dbUrl);

}
// Routes
app.get("/addnew", (req, res) => {
    res.render("listings/addnew");
});



app.get("/authentication", (req, res) => {
  res.render('listings/auth', { layout: false });
});
app.get("/home", (req, res) => {
  res.render('listings/home', { layout: false });
});
app.get("/form", (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/home");
  res.render('listings/form');
});

app.get("/secondpage", (req, res) => {
  res.render('listings/secondpage');
});
app.get("/tour", (req, res) => {
  res.render('listings/tour');
});

// app.get("/tourSearch", async (req, res) => {
//   try {
//     const { fromDate, toDate } = req.query;
//     let filter = {};

//     if (fromDate && toDate) {
//       const from = new Date(fromDate);
//       const to = new Date(toDate);
//       to.setHours(23, 59, 59, 999);
//       filter.leavingHQOn = { $gte: from, $lte: to };
//     }

//     const data = await OfficerMovement.find(filter).sort({ leavingHQOn: 1 });

//     res.render("listings/tourSearch", {
//       data,
//       fromDate,
//       toDate,
//       user: req.session.user || null
//     });
//   } catch (err) {
//     console.error("Tour search error:", err);
//     res.status(500).send('Server error while fetching officer movement');
//   }
// });
app.get("/tourSearch", async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    let filter = {};

    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      filter.leavingHQOn = { $gte: from, $lte: to };
    }

    const data = await OfficerMovement.find(filter).sort({ leavingHQOn: 1 });

    res.render("listings/tourSearch", {
      data,
      fromDate: fromDate || "",  // ✅ Provide default value
      toDate: toDate || "",      // ✅ Provide default value
      user: req.session.user || null
    });
  } catch (err) {
    console.error("Tour search error:", err);
    res.status(500).send('Server error while fetching officer movement');
  }
});

// // POST Route to save form data
// app.post('/submits', async (req, res) => {
//   const { fromDate, toDate } = req.body;

//   try {
//     const data = await OfficerMovement.find({
//       leavingHQOn: {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate)
//       }
//     }).sort({ leavingHQOn: 1 });

//    res.render('listings/tourSearch', { 
//   data,
//   user: req.session.user || null // Ensure user is defined
// });

//   } catch (err) {
//     console.error("Tour search error:", err);
//     res.status(500).send('Server error while fetching officer movement');
//   }
// });
app.post('/submit', async (req, res) => {
    if (!req.isAuthenticated()) return res.redirect("/home");
  try {
    const {
      officerName,
      description,
      leavingHQOn,
      comingBackOn,
      purpose,
      goingTo,
      status
    } = req.body;

    const newEntry = new OfficerMovement({
      officerName,
      description,
      leavingHQOn,
      comingBackOn,
      purpose,
      goingTo,
      status
    });

    await newEntry.save();
    res.redirect('/tour');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error while saving data');
  }
});
app.get("/appointments", async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    let meetings = [];

    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999); // include the full end day

      meetings = await Meeting.find({
        meetingDate: { $gte: from, $lte: to }
      }).sort({ meetingDate: 1, meetingTime: 1 });
    } else {
      meetings = await Meeting.find({}).sort({ meetingDate: 1, meetingTime: 1 });
    }

    res.render("listings/appoitment", {
      meetings,
      fromDate,
      toDate
    });
  } catch (err) {
    console.error("Error loading meetings:", err);
    res.status(500).send("Internal Server Error");
  }
});
// app.post('/submits', async (req, res) => {
//   try {
//     const { fromDate, toDate } = req.body;
//     let filter = {};

//     if (fromDate && toDate) {
//       const from = new Date(fromDate);
//       const to = new Date(toDate);
//       to.setHours(23, 59, 59, 999); // include full end date
//       filter.leavingHQOn = { $gte: from, $lte: to };
//     }

//     const data = await OfficerMovement.find(filter).sort({ leavingHQOn: 1 });

//     res.render('listings/tourSearch', {
//       data,
//       fromDate,
//       toDate,
//       user: req.session.user || null
//     });

//   } catch (err) {
//     console.error("Tour search error:", err);
//     res.status(500).send('Server error while fetching officer movement');
//   }
// });
app.post('/submits', async (req, res) => {
try {
const { fromDate, toDate } = req.body;
let filter = {};

if (fromDate && toDate) {
const from = new Date(fromDate);
const to = new Date(toDate);
to.setHours(23, 59, 59, 999); // include full end date
filter.leavingHQOn = { $gte: from, $lte: to };
}

const data = await OfficerMovement.find(filter).sort({ leavingHQOn: 1 });

res.render('listings/tourSearch', {
data,
fromDate,
toDate,
user: req.session.user || null
});
 } catch (err) {
console.error("Tour search error:", err);
res.status(500).send('Server error while fetching officer movement');
}
});

app.post("/appointments", async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;
    let meetings = [];

    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999); // include full last day

      meetings = await Meeting.find({
        meetingDate: { $gte: from, $lte: to }
      }).sort({ meetingDate: 1, meetingTime: 1 });
    }

    res.render("listings/appoitment", { meetings });
  } catch (err) {
    console.error("Error retrieving meetings:", err);
    res.status(500).send("Server Error");
  }
});

app.post('/meetings', async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/home");

  try {
    const { meetingDate, meetingTime, meetingWith, designation, purpose, venue, isVIP } = req.body;

    const existingMeeting = await Meeting.findOne({
      meetingDate: new Date(meetingDate),
      meetingTime: meetingTime
    });

    if (existingMeeting) {
      return res.render("listings/form", {
        errorMsg: "Meeting already exists for the selected date and time."
      });
    }

    const newMeeting = new Meeting({
      meetingDate,
      meetingTime,
      meetingWith,
      designation,
      purpose,
      venue,
      isVIP: isVIP === "on"
    });

    await newMeeting.save();
    res.redirect("/form");

  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving meeting.");
  }
});


// Register Route
app.post("/register", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      console.log("User successfully registered and logged in");
      res.redirect("/form");
    });
  } catch (e) {
    res.send("Registration Failed: " + e.message);
  }
});

// Login Route
app.post("/login", passport.authenticate("local", {
  failureRedirect: "/home", // stays on auth page if login fails
}), (req, res) => {
  res.redirect("/appointments"); // change this to your dashboard or home page
});


app.get("/edit/:id", async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/home");

  const meeting = await Meeting.findById(req.params.id);
  if (!meeting) return res.status(404).send("Meeting not found");

  res.render("listings/edit", { meeting });
});

app.post("/edit/:id", async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/authentication");

  const { id } = req.params;
  const { meetingDate, meetingTime, meetingWith, designation, purpose, venue, isVIP } = req.body;

  try {
    await Meeting.findByIdAndUpdate(id, {
      meetingDate,
      meetingTime,
      meetingWith,
      designation,
      purpose,
      venue,
      isVIP: isVIP === "on"
    });
    res.redirect("/appointments");
  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).send("Error updating meeting.");
  }
});

app.post("/logout", (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect("/appointments");
  });
});
app.get("/tour/edit/:id", async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/home");

  try {
    const entry = await OfficerMovement.findById(req.params.id);
    if (!entry) return res.status(404).send("Officer movement entry not found");

    res.render("listings/editTour", { entry }); // You must have views/listings/editTour.ejs
  } catch (err) {
    console.error("Error loading edit form:", err);
    res.status(500).send("Server error while loading edit form");
  }
});
// app.post("/tour/edit/:id", async (req, res) => {
//   if (!req.isAuthenticated()) return res.redirect("/home");

//   const { officerName, description, leavingHQOn, comingBackOn, purpose, goingTo, status } = req.body;

//   try {
//     await OfficerMovement.findByIdAndUpdate(req.params.id, {
//       officerName,
//       description,
//       leavingHQOn,
//       comingBackOn,
//       purpose,
//       goingTo,
//       status
//     });

//     res.redirect("/tourSearch");
//   } catch (err) {
//     console.error("Error updating officer movement:", err);
//     res.status(500).send("Failed to update officer movement");
//   }
// });
app.post("/tour/edit/:id", async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/home");

  const { officerName, designation, leavingHQOn, comingBackOn, purpose, goingTo, status } = req.body;

  try {
    await OfficerMovement.findByIdAndUpdate(req.params.id, {
      officerName,
      designation,
      leavingHQOn: new Date(leavingHQOn),
      comingBackOn: new Date(comingBackOn),
      purpose,
      goingTo,
      status
    });

    res.redirect("/tourSearch");
  } catch (err) {
    console.error("Error updating officer movement:", err);
    res.status(500).send("Failed to update officer movement");
  }
});

app.get("/meetings/note/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const meeting = await Meeting.findById(id);
    if (!meeting) return res.status(404).send("Meeting not found");
    res.render("listings/notePage", { meeting });
  } catch (err) {
    console.error("Error loading note page:", err);
    res.status(500).send("Internal server error");
  }
});

app.post("/meetings/note/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { quickNote } = req.body;
    await Meeting.findByIdAndUpdate(id, { quickNote });
    res.redirect("/meetings/note/" + id);
  } catch (err) {
    console.error("Error saving note:", err);
    res.status(500).send("Error saving note");
  }
});

app.post('/meetings/note/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { quickNote } = req.body;

    await Meeting.findByIdAndUpdate(id, { quickNote });
    res.redirect(`/meetings/note/${id}`);
  } catch (err) {
    console.error("Error saving note:", err);
    res.status(500).send("Error saving note");
  }
});



app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
