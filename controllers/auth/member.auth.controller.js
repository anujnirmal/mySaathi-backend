const db = require("../../models");
const config = require("../../config/auth.config");
const RefreshToken = require("../../controllers/refreshToken/refreshToken");

const prisma = db.prisma;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.member_sign_in = async (req, res) => {
  const { aadhaar_number, mobile_number } = req.body;

  // TODO: limit the number of devices a user can login in

  // Some basic validation
  // Aadhaar number should be 12 digits only as specified by the govt
  // Incase this changes in future update it here
  const AADHAAR_LENGTH = 12;  
  const MOBILE_NUMBER_LENGTH = 10; 

  if (aadhaar_number.toString().length != AADHAAR_LENGTH) {
    return res
      .json({
        message: "Please enter a valid Aadhaar number"
      })
      .status(404)
      .send();
  }

  if (mobile_number.toString().length != MOBILE_NUMBER_LENGTH) {
    return res
      .json({
        message: "Please enter a valid mobile number"
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
        return res.status(404).send({ message: "Member Not found." });
      }

      // if aadhar number entered by user is = to the one stored in db
      // I know this is not secure, but this is what they want :()
      if (aadhaar_number === member.aadhaar_number) {
        // auth successful
      }

      let token = jwt.sign({ email: member.email_id }, config.secret, {
        expiresIn: config.member_jwt_expiration,
      });

      let refreshToken = await RefreshToken.createToken(
        config.member_jwt_refreshexpiration // pass in the refresh token expiry for member
      );

      // Save the refresh token in the db
      await prisma.refresh_tokens
        .create({
            data: {
                refresh_token: refreshToken.token,
                expiry_at: refreshToken.expiry_at,
                member: {
                    connect: {
                        id: member.id
                    }
                }
            }
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
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send({ message:  "Internal server error"  });
    });
};
