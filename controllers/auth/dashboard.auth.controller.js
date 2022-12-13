const db = require("../../models");
const config = require("../../config/auth.config");
const RefreshToken = require("../../controllers/refreshToken/refreshToken");

const prisma = db.prisma;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

// Dashboard user signin controller
exports.dashboard_sign_in = (req, res) => {
  const { email, password } = req.body;

  // Find dashboard user using the email passed
  prisma.dashboard_users
    .findUnique({
      where: { email_id: email },
    })
    .then(async (dashboard_user) => {

      // If no user found then send 404
      if (!dashboard_user) {
        return res.status(404).send({ message: "Dashboard user Not found." });
      }

      // Check for the password entered
      let passwordIsValid = bcrypt.compareSync(
        password,
        dashboard_user.password
      );
      
      // If password is not valid
      if (!passwordIsValid) {
        return res
          .json({
            accessToken: null,
            message: "Invalid Password!",
          })
          .status(401)
          .send();
      }

      // Once the credentials have been verified
      // make a signed jwt using the following details
      // 1. dashboard_user_id - for querying and fecthing data with each new request
      // 2. role - to retrict access level to the resources on dashboard
      let token = jwt.sign(
        { dashboard_user_id: dashboard_user.id, role: dashboard_user.role },
        config.secret, // secret key saved in auth.config.js in config folder
        {
          expiresIn: config.admin_jwt_expiration, // admin expiry value from auth.config.js
        }
      );

      // Create a refresh token to be used when access token/jwt is expired
      let refreshToken = await RefreshToken.createToken(
        config.admin_jwt_refreshexpiration //value is stored in auth.config.js in config folder
      );

      // Save the refresh token along with its expiry time in the db
      await prisma.dashboard_users
        .update({
          where: {
            id: dashboard_user.id,
          },
          data: {
            refresh_token: refreshToken.token,
            expiry_at: refreshToken.expiry_at,
          },
        })
        .then((result) => {
          return res
            .json({
              id: dashboard_user.id,
              email: dashboard_user.email_id,
              role: dashboard_user.role,
              access_token: token,
              refresh_token: refreshToken.token,
            })
            .status(200)
            .send();
        })
        .catch((err) => {
          console.log(err);
          return res
            .json({ message: "Internal server error" })
            .status(500)
            .send();
        });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send({ message: err.message });
    });
};
