const db = require("../../models");
const config = require("../../config/auth.config");
const RefreshToken = require("../refreshToken/refreshToken");

const prisma = db.prisma;

var jwt = require("jsonwebtoken");

// refresh token generation for dashboard users
exports.dashboard_refreshToken = async (req, res) => {
  const { email, refresh_token: request_token } = req.body;
  console.log(req.body);
  if (request_token == null) {
    return res.status(403).json({ message: "Refresh Token is required!" });
  }

  try {
    // Find using request token
    let dashboard_user = await prisma.dashboard_users.findFirst({
      where: { refresh_token: request_token },
    });

    if (!dashboard_user) {
      res.status(403).json({ message: "Refresh token is not in database!" });
      return;
    }

    if (RefreshToken.verifyExpiration(dashboard_user.expiry_at)) {
      prisma.dashboard_users.update({
        where: { email_id: email },
        data: { refresh_token: "" },
      });

      return res.status(403).json({
        message: "Refresh token was expired. Please make a new signin request",
      });
    }

    let new_access_token = jwt.sign(
      { email: dashboard_user.email_id },
      config.secret,
      {
        expiresIn: config.admin_jwt_expiration,
      }
    );

    return res
      .json({
        access_token: new_access_token,
        refresh_token: dashboard_user.refresh_token,
      })
      .status(200)
      .send();
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: err });
  }
};

// Refresh token generation for member/ mobile app users
exports.member_refreshToken = async (req, res) => {
  const { refresh_token: request_token } = req.body;

  if (request_token === null || request_token === undefined || request_token === "") {
    return res.status(403).json({ message: "Refresh Token is required!" });
  }

  // Find using request token
  await prisma.refresh_tokens.findFirst({
    where: {
      refresh_token: request_token
    }
  })
    .then((refresh_token_object) => {
      // no refresh token found
      if (!refresh_token_object) {
        return res
          .status(403)
          .json({ message: "Refresh token is not in database!" });
      }

      if (RefreshToken.verifyExpiration(refresh_token_object.expiry_at)) {
        prisma.members
          .update({
            where: {
              id: refresh_token_object.member_id,
            },
            data: {
              refresh_token: {
                delete: {
                  id: refresh_token_object.member_id
                },
              },
            },
          })
          .then((result) => {
            console.log(result);
          })
          .catch((err) => {
            console.log(err);
          });

        return res.status(403).json({
          message:
            "Refresh token was expired. Please make a new signin request",
        });
      }

      let new_access_token = jwt.sign(
        { member_id: refresh_token_object.member_id },
        config.secret,
        {
          expiresIn: config.member_jwt_expiration,
        }
      );

      return res
        .json({
          access_token: new_access_token,
          refresh_token: refresh_token_object.refresh_token,
        })
        .status(200)
        .send();
    });
};
