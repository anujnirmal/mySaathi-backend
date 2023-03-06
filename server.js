const express = require("express");
const Sentry = require('@sentry/node');
const Tracing = require("@sentry/tracing");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const cron = require("node-cron");
const bodyParser = require('body-parser');
const member_onboarding_controller = require("./controllers/memberOnboarding/member.onboarding.controller");
require("dotenv").config();

const app = express();

Sentry.init({
  dsn: "https://dafb0b67b95040f29b7ad65121aef766@o4504580955832320.ingest.sentry.io/4504580957077504",
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app }),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());
app.use(bodyParser.json({limit: '100mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '100mb', extended: true}))

// Setting globally, so the response containing BigInt datatype
// can be serialized
BigInt.prototype.toJSON = function () {
  return this.toString();
};

// Change the origin in production
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://mysaathi-prod.web.app",
    "https://mysaathi-prod.firebaseapp.com",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors());

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// onboard_members_using_google_sheet();
//middleware for cookies
app.use(cookieParser());

// Test Route
app.get("/", (req, res) => {
  return res.json({ message: "Welcome to mySaaThi Server" });
});

// TODO: write another cron job to reset member balance one 1st Jan

// Basic Terminology
// Dashboard Users - these are admins, super admins access to the dashboard
// Members - these are end users, these users will only access through mobile app - ios or android

// -----
// ROUTES
// -----
require("./routes/auth.routes")(app); // Authentication for both dashboad users and nornam app users
require("./routes/member.routes")(app); // All routes for mobile app / normal users
require("./routes/dashboard.routes")(app); // All routes for dashboard users


app.use(
  Sentry.Handlers.errorHandler()
);


// Setting up cron job to onboard members
cron.schedule("27 22 * * Sat", () => {
  member_onboarding_controller.onboard_member_google_sheet("", "", true);
});



// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
