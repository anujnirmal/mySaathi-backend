const express = require("express");
const cors = require("cors");

const app = express();

var corsOptions = {
  origin: "http://localhost:8081"
};

// Setting globally, so the response containing BigInt datatype
// can be serialized
BigInt.prototype.toJSON = function () {
  return this.toString();
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Test Route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to mySaaThi Server" });
});

// Basic Terminology
// Dashboard Users - these are admins, super admins access to the dashboard
// Members - these are end users, these users will only access through mobile app - ios or android

// -----
// ROUTES
// -----
require('./routes/auth.routes')(app); // Authentication for both dashboad users and nornam app users
require('./routes/member.routes')(app); // All routes for mobile app / normal users 
require('./routes/dashboard.routes')(app)  // All routes for dashboard users

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
