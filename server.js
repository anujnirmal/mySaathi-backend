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

// routes
require('./routes/auth.routes')(app); // authentication routes
require('./routes/user.routes')(app); 
require('./routes/member.routes')(app); // member routes for the mobile app
require('./routes/news.routes')(app) 
require('./routes/notification.routes')(app) 

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
