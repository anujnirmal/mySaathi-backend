const db = require("../../models");
const config = require("../../config/auth.config");
const RefreshToken = require("../../controllers/refreshToken/refreshToken");

const prisma = db.prisma;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { default: axios } = require("axios");

exports.member_login_check_mobile_number = async (req, res) => {
  // const { mobile_number, device_id } = req.body;
  const { mobile_number } = req.body;

  console.log(req.body);

  if (
    mobile_number === null ||
    mobile_number === undefined ||
    mobile_number.length !== 10
  ) {
    return res
      .status(400)
      .json({ message: "Please send correct mobile number" })
      .send();
  }

  try {
    // If success then
    //  TODO: check with ketan about the member
    let member = await prisma.members.findUnique({
      where: { mobile_number: mobile_number },
    });

    // If user does not exist
    if (!member) {
      return res
        .status(200)
        .json({ user_exists: false, password_exists: false });
    }

    if (member.password === null) {
      return res
        .status(200)
        .json({ user_exists: true, password_exists: false });
    }

    if (member.password !== null) {
      return res.status(200).json({ user_exists: true, password_exists: true });
    }

    // let invalidate_before_date = new Date();

    // let token = jwt.sign(
    //   {
    //     mobile_number: member.mobile_number,
    //     device_id: device_id,
    //     invalidate_before: invalidate_before_date.getTime(),
    //   },
    //   config.secret,
    //   {
    //     expiresIn: config.member_jwt_expiration,
    //   }
    // );

    // let refreshToken = await RefreshToken.createToken(
    //   config.member_jwt_refreshexpiration // pass in the refresh token expiry for member
    // );

    // await prisma.refresh_tokens
    //   .findFirst({
    //     where: {
    //       device_id: device_id,
    //     },
    //   })
    //   .then(async (result) => {
    //     //if device found
    //     if (result) {
    //       await prisma.refresh_tokens
    //         .update({
    //           where: {
    //             device_id: device_id,
    //           },
    //           data: {
    //             refresh_token: refreshToken.token,
    //             expiry_at: refreshToken.expiry_at,
    //             invalidate_before: invalidate_before_date,
    //           },
    //         })
    //         .then((result) => {
    //           return res
    //             .json({
    //               id: member.id,
    //               mobile_number: member.mobile_number,
    //               access_token: token,
    //               refresh_token: result.refresh_token, //pass the refresh token returnd after updating db
    //             })
    //             .status(200)
    //             .send();
    //         })
    //         .catch((err) => {
    //           console.log(err);
    //           return res
    //             .json({ message: "Internal server error" })
    //             .status(500)
    //             .send();
    //         });
    //     } else {
    //       // if device id is not found
    //       await prisma.refresh_tokens
    //         .create({
    //           data: {
    //             refresh_token: refreshToken.token,
    //             expiry_at: refreshToken.expiry_at,
    //             device_id: device_id,
    //             invalidate_before: invalidate_before_date,
    //             member: {
    //               connect: {
    //                 id: member.id,
    //               },
    //             },
    //           },
    //         })
    //         .then((result) => {
    //           return res
    //             .json({
    //               id: member.id,
    //               mobile_number: member.mobile_number,
    //               access_token: token,
    //               refresh_token: result.refresh_token, //pass the refresh token returnd after updating db
    //             })
    //             .status(200)
    //             .send();
    //         })
    //         .catch((err) => {
    //           return res
    //             .json({ message: "Internal server error" })
    //             .status(500)
    //             .send();
    //         });
    //     }
    //   });

    // Save the refresh token in the db
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" }).send();
  }
};

// Use this to login user
// if the password does not exist then create it, if it exists then check it
// and login
exports.member_login_or_create_password = async (req, res) => {
  // const { mobile_number, device_id } = req.body;
  const { mobile_number, password, device_id, language, fcm_token } = req.body;

  console.log(req.body);

  if (
    mobile_number === null ||
    mobile_number === undefined ||
    mobile_number.length !== 10
  ) {
    return res
      .status(400)
      .json({ message: "Please send correct input" })
      .send();
  }

  if (password === null || password === undefined || password.length < 8) {
    return res
      .status(400)
      .json({ message: "Password should be atleast 8 characters long" })
      .send();
  }

  if (device_id === null || device_id === undefined || device_id === "") {
    return res
      .status(400)
      .json({ message: "Please provide a device id" })
      .send();
  }

  if (
    language === null ||
    language === undefined ||
    !(language === "ENGLISH" || language === "MARATHI" || language === "HINDI")
  ) {
    return res
      .status(400)
      .json({ message: "Please provide a valid language" })
      .send();
  }

  try {
    // If success then
    //  TODO: check with ketan about the member
    let member = await prisma.members.findUnique({
      where: {
        mobile_number: mobile_number,
      },
      include: {
        children: true,
        bank_detail: true,
      },
    });

    // If user does not exist
    if (!member) {
      return res.status(400).json({ message: "User not found" });
    }

    let logged_in_member;
    // send this to the frontend
    // this will be used to decide whether to show the
    // welcome screen or not
    let first_time_login = false;

    if (member.password === null) {
      logged_in_member = await prisma.members.update({
        where: {
          mobile_number: mobile_number,
        },
        data: {
          password: bcrypt.hashSync(password, 8),
        },
      });

      // If password was null that means user
      // loggedin for the first time
      first_time_login = true;
    } else {
      // Check for the password
      let passwordIsValid = bcrypt.compareSync(password, member.password);

      // Delete password before sending it to the end user
      delete member.password;
      delete member.trashed;

      // if password is not valid
      if (!passwordIsValid) {
        return res
          .status(404)
          .json({
            message: "Please enter correct mobile number and password",
          })
          .send();
      }
    }

    // Update Language && and fcm token
    await prisma.members
      .update({
        where: {
          mobile_number: mobile_number,
        },
        data: {
          language: language,
          notification_token: {
            upsert: {
              where: {
                fcm_token: fcm_token,
              },
              update: {
                fcm_token: fcm_token,
              },
              create: {
                fcm_token: fcm_token,
              },
            },
          },
        },
      })
      .then(async (language_updated) => {
        console.log(language_updated);

        let invalidate_before_date = new Date();

        // Create json web token
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

        // Create a new refresh token
        let refreshToken = await RefreshToken.createToken(
          config.member_jwt_refreshexpiration // pass in the refresh token expiry for member
        );

        // Find the refresh token
        // IF refresh token is found then just update,
        // If not found then create a new one
        await prisma.refresh_tokens
          .upsert({
            where: {
              device_id: device_id,
            },
            update: {
              refresh_token: refreshToken.token,
              expiry_at: refreshToken.expiry_at,
              invalidate_before: invalidate_before_date,
            },
            create: {
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
                member_detail: member,
                first_time_login: first_time_login,
              })
              .status(200)
              .send();
          })
          .catch((err) => {
            return res
              .status(500)
              .json({ message: "Internal Server Error" })
              .send();
          });
      })
      .catch((err) => {
        console.log(err);
        return res
          .status(500)
          .json({ message: "Internal Server Error" })
          .send();
      });

    // Save the refresh token in the db
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" }).send();
  }
};

// Members can request a new otp during login process
exports.member_get_otp = async (req, res) => {
  const { mobile_number } = req.body;

  if (mobile_number.length != 10) {
    return res
      .json({ message: "Mobile number should be 10 digits long" })
      .status(400)
      .send();
  }

  // Add template id recieved from msg91's dashboard
  const template_id = "";
  const get_otp_base_url = "https://api.msg91.com/api/v5/otp?";
  const get_otp_url =
    get_otp_base_url +
    "template_id=" +
    template_id +
    "&mobile=" +
    mobile_number +
    "&authkey=" +
    config.msg91_auth_key;

  await prisma.members
    .findUnique({
      where: { mobile_number: mobile_number },
    })
    .then(async (member) => {
      if (!member) {
        return res.status(404).send({ message: "Phone number not found" });
      }

      // If member found
      axios
        .get(get_otp_url)
        .then((response) => {
          console.log(response);
          return res
            .status(200)
            .json({ message: "OTP sent successfully" })
            .send();
        })
        .catch((err) => {
          console.log(err);
          return res
            .status(500)
            .json({ message: "Internal Server Error" })
            .send();
        });
    })
    .catch((err) => {
      return res.status(500).json({ message: "Internal Server Error" }).send();
    });
};

// Verify the otp entered by the members
exports.member_verify_otp = async (req, res) => {
  const { otp, mobile_number, device_id } = req.body;

  // Add template id recieved from msg91's dashboard
  // TODO: implement validation after getting dlt
  const verify_otp_base_url = "https://api.msg91.com/api/v5/otp/verify?";
  const verify_otp_url =
    verify_otp_base_url +
    "otp=" +
    otp +
    "&authkey=" +
    config.msg91_auth_key +
    "&mobile=" +
    mobile_number;

  try {
    const result = await axios.get(verify_otp_url);

    if (result.type != "success") {
      // TODO: implement error validation
      return res.status(500).json({ message: "Internal Server Error" }).send();
    }

    // If success then
    await prisma.members
      .findUnique({
        where: { mobile_number: mobile_number },
      })
      .then(async (member) => {
        if (!member) {
          return res.status(404).send({ message: "Phone number" });
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
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" }).send();
  }
};

// Members can request the otp again
exports.member_resend_otp = async (req, res) => {
  const { mobile_number } = req.body;

  if (mobile_number.length != 10) {
    return res
      .json({ message: "Mobile number should be 10 digits long" })
      .status(400)
      .send();
  }

  // Add template id recieved from msg91's dashboard
  const retry_type = "text"; //or set it to voice
  const resend_otp_base_url = "https://api.msg91.com/api/v5/otp/retry?";
  const resend_otp_url =
    resend_otp_base_url +
    "authkey=" +
    config.msg91_auth_key +
    "&retrytype=" +
    retry_type +
    "&mobile=" +
    mobile_number;

  axios
    .get(get_otp_url)
    .then((response) => {
      console.log(response);
      // TODO: get the otp and send it
      return res
        .status(200)
        .json({ message: "OTP resent successfully" })
        .send();
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ message: "Internal Server Error" }).send();
    });
};

// Member logs out
// TODO: remove refresh token from the db
// take the access tokens devices id and delete it from db
// check for the time
exports.member_log_out = async (req, res) => {
  const { member_id, fcm_token } = req.body;
  // const { device_id } = req.user; // this is provided by the jwt token from the middle where

  console.log(req.body);

  let invalidate_before_time = new Date();

  // Find the member using the mobile_number
  // then delete the refresh token within the the "refresh_tokens" table using the device id
  await prisma.notification_tokens
    .findFirst({
      where: {
        fcm_token: fcm_token,
      },
    })
    .then(async (token) => {
      if (!token) {
        return res
          .status(200)
          .json({ message: "Successfully logged out user" })
          .send();
      }

      await prisma.members
        .update({
          where: {
            id: member_id,
          },
          data: {
            notification_token: {
              delete: {
                fcm_token: fcm_token,
              },
            },
          },
        })
        .then(() => {
          return res
            .status(200)
            .json({ message: "Successfully logged out user" })
            .send();
        })
        .catch((err) => {
          console.log(err);
          return res
            .status(500)
            .json({ message: "Internal server error" })
            .send();
        });
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
