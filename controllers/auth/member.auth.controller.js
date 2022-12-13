const db = require("../../models");
const config = require("../../config/auth.config");
const RefreshToken = require("../../controllers/refreshToken/refreshToken");

const prisma = db.prisma;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.member_sign_in = async (req, res) => {

  const { aadhaar_number, mobile_number, device_id } = req.body;

  // TODO: limit the number of devices a user can login in

  // Some basic validation
  // Aadhaar number should be 12 digits only as specified by the govt
  // Incase this changes in future update it here
  const AADHAAR_LENGTH = 12;
  const MOBILE_NUMBER_LENGTH = 10;
  const DEVICE_ID_LENGTH = 8;

  if (aadhaar_number.toString().length != AADHAAR_LENGTH) {
    return res
      .json({
        message: "Please enter a valid Aadhaar number",
      })
      .status(404)
      .send();
  }

  if (mobile_number.toString().length != MOBILE_NUMBER_LENGTH) {
    return res
      .json({
        message: "Please enter a valid mobile number",
      })
      .status(404)
      .send();
  }

  if (device_id.length != DEVICE_ID_LENGTH) {
    return res
      .json({
        message: "Please enter a valid device id",
      })
      .status(404)
      .send();
  }

  await prisma.members
    .findUnique({
      where: { mobile_number: mobile_number },
    })
    .then(async (member) => {
      if (!member) {
        return res
          .status(404)
          .send({ message: "Wrong aadhaar number or phone number" });
      }

      // if aadhar number entered by user is != to the one stored in db
      // I know this is not secure, but this is what they want :()
      if (aadhaar_number != member.aadhaar_number) {
        // auth not successfull
        return res
          .status(404)
          .send({ message: "Wrong aadhaar number or phone number" });
      }

      let invalidate_before_date = new Date();

      let token = jwt.sign(
        {
          mobile_number: member.mobile_number,
          device_id: device_id,
          invalidate_before: invalidate_before_date.getTime(),
        },
        config.secret,
        {
          expiresIn: config.member_jwt_expiration,
        }
      );

      let refreshToken = await RefreshToken.createToken(
        config.member_jwt_refreshexpiration // pass in the refresh token expiry for member
      );


      await prisma.refresh_tokens
        .findFirst({
          where: {
            device_id: device_id,
          },
        })
        .then(async (result) => {
          //if device found
          if (result) {
            await prisma.refresh_tokens
              .update({
                where: {
                  device_id: device_id,
                },
                data: {
                  refresh_token: refreshToken.token,
                  expiry_at: refreshToken.expiry_at,
                  invalidate_before: invalidate_before_date,
                },
              })
              .then((result) => {
                return res
                  .json({
                    id: member.id,
                    mobile_number: member.mobile_number,
                    access_token: token,
                    refresh_token: result.refresh_token, //pass the refresh token returnd after updating db
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
          } else {
            // if device id is not found
            await prisma.refresh_tokens
              .create({
                data: {
                  refresh_token: refreshToken.token,
                  expiry_at: refreshToken.expiry_at,
                  device_id: device_id,
                  invalidate_before: invalidate_before_date,
                  member: {
                    connect: {
                      id: member.id,
                    },
                  },
                },
              })
              .then((result) => {
                return res
                  .json({
                    id: member.id,
                    mobile_number: member.mobile_number,
                    access_token: token,
                    refresh_token: result.refresh_token, //pass the refresh token returnd after updating db
                  })
                  .status(200)
                  .send();
              })
              .catch((err) => {
                return res
                  .json({ message: "Internal server error" })
                  .status(500)
                  .send();
              });
          }
        });

      // Save the refresh token in the db
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send({ message: "Internal server error" });
    });
};

// Member logs out
// TODO: remove refresh token from the db
// take the access tokens devices id and delete it from db
// check for the time
exports.member_log_out = async (req, res) => {
  const { mobile_number } = req.body;
  const { device_id } = req.user; // this is provided by the jwt token from the middle where

  const MOBILE_NUMBER_LENGTH = 10;

  if (mobile_number.toString().length != MOBILE_NUMBER_LENGTH) {
    return res
      .json({
        message: "Please provide a valid mobile number",
      })
      .status(404)
      .send();
  }

  let invalidate_before_time = new Date();

  // Find the member using the mobile_number
  // then delete the refresh token within the the "refresh_tokens" table using the device id
  await prisma.refresh_tokens
    .update({
      where: {
        device_id: device_id, // got device id from req.user
      },
      data: {
        refresh_token: "",
        invalidate_before: invalidate_before_time,
      },
    })
    .then(async (result) => {
      return res
        .status(200)
        .json({ message: "Successfully logged out user" })
        .send();
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ message: "Internal server error" }).send();
    });
};

// Member logs out from all devices
// Search in the "refresh_tokens" table and update all the invalidate_before
// field to current time
// thus when an user logs in then the jwt token's invalidate before and
// refresh_tokens
exports.member_log_out_from_all_devices = async (req, res) => {
  const { mobile_number } = req.body;

  // Length for validation
  const MOBILE_NUMBER_LENGTH = 10;

  // validate the request 
  if (mobile_number.toString().length != MOBILE_NUMBER_LENGTH) {
    return res
      .json({
        message: "Please provide a valid mobile number",
      })
      .status(404)
      .send();
  }

  // Find the member using the mobile_number
  // then delete the all the refresh tokens of the user
  await prisma.members
    .findFirst({
      where: {
        mobile_number: mobile_number,
      },
    })
    .then(async (member) => {
      // delete all the 
      await prisma.members
        .update({
          where: {
            mobile_number: mobile_number,
          },
          data: {
            refresh_token: {
              deleteMany: {
                member_id: member.id,
              },
            },
          },
        })
        .then((result) => {
          return res
            .status(200)
            .json({ message: "Successfully deleted member refresh tokens" })
            .send();
        });
    })
    .catch((err) => {
      return res.status(500).json({ message: "Internal server error" }).send();
    });
};
