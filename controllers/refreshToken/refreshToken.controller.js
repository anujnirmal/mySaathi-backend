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
  const { mobile_number, refresh_token: request_token } = req.body;

  if (request_token == null) {
    return res.status(403).json({ message: "Refresh Token is required!" });
  }

  // Find using request token
  await prisma.members
    .findFirst({
      include: {
        refresh_token: {
          where: {
            refresh_token: request_token,
          },
        },
      },
    })
    .then((member) => {
      // no refresh token found
      if (member.refresh_token.length == 0) {
        return res
          .status(403)
          .json({ message: "Refresh token is not in database!" });
      }

      if (RefreshToken.verifyExpiration(member.refresh_token[0].expiry_at)) {
        prisma.members
          .update({
            where: {
              mobile_number: mobile_number,
            },
            data: {
              refresh_token: {
                delete: {
                  id: member.refresh_token[0].id,
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
        { mobile_number: member.mobile_number  },
        config.secret,
        {
          expiresIn: config.member_jwt_expiration,
        }
      );

      return res
        .json({
          access_token: new_access_token,
          refresh_token: member.refresh_token[0].refresh_token,
        })
        .status(200)
        .send();
    });
};
