const db = require("../../models");
const config = require("../../config/auth.config");
const RefreshToken = require("../../controllers/refreshToken/refreshToken");

const prisma = db.prisma;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.dashboard_sign_in = (req, res) => {
  const { email, password } = req.body;

  prisma.dashboard_users
    .findUnique({
      where: { email_id: email },
    })
    .then(async (dashboard_user) => {
      if (!dashboard_user) {
        return res.status(404).send({ message: "Dashboard user Not found." });
      }

      let passwordIsValid = bcrypt.compareSync(
        password,
        dashboard_user.password
      );

      if (!passwordIsValid) {
        return res
          .json({
            accessToken: null,
            message: "Invalid Password!",
          })
          .status(401)
          .send();
      }

      let token = jwt.sign({ dashboard_user_id: dashboard_user.id, role: dashboard_user.role }, config.secret, {
        expiresIn: config.admin_jwt_expiration,
      });

      let refreshToken = await RefreshToken.createToken(
        config.admin_jwt_refreshexpiration
      );

      // Save the refresh token in the db
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
            return res.json({message: "Internal server error"}).status(500).send();
          })
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send({ message: err.message });
    });
};
