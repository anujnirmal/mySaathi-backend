const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const { v4: uuidv4 } = require("uuid");
const User = db.user;

const prisma = db.prisma;

const { TokenExpiredError } = jwt;

const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res
      .status(401)
      .send({ message: "Unauthorized! Access Token was expired!" });
  }

  return res.status(401).send({ message: "Unauthorized!" });
};

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({
      message: "No token provided!",
    });
  }

  jwt.verify(token, config.secret, async (err, decoded) => {
    if (err) {
      return catchError(err, res);
    }

    // If mobile number is present that means an member is trying to access resources
    if (decoded.hasOwnProperty("mobile_number")) {
      let isUserValid = await isJWTInvalidate(decoded);
      if (!isUserValid) {
        return catchError(err, res);
      }
    }

    //add the data to be accessed by the next in line
    req.user = decoded;
    next();
  });
};

// check if the jwt has been invalidated by the user
// user has either logged out or logged out from all devices
const isJWTInvalidate = async (decoded_value) => {
  try {
    let refresh_token = await prisma.refresh_tokens.findFirst({
      where: {
        device_id: decoded_value.device_id,
      },
    });

    // If no record was found in the db
    if (!refresh_token) {
      return false; // thus showing unathorized to the end user
    }

    let db_invalidate_date = refresh_token.invalidate_before;
    let token_invalidate_date = decoded_value.invalidate_before;

    // Check if the stored time in the db is less than or equal to one recieving from jwt
    // if its less than the time within jwt that means that the user has not performed: logout or logout all
    if (db_invalidate_date <= token_invalidate_date) {
      return true; // the token has not been black listed and hence is valid
    } else {
      return false; // the token has been black listed and hence is not valid
    }
  } catch (err) {
    console.log(err);
    return;
  }
};

isSuperAdmin = async (req, res, next) => {
  // Get the role from the req.user which was assigned by the middleware in the previous step
  const { role } = req.user;
  if (role == "SUPERADMIN") {
    next();
    return;
  } else {
    res
      .status(403)
      .json({
        message: "Require Super Admin Role!",
      })
      .send();
    return;
  }
};

isAdmin = async (req, res, next) => {
  const { role } = req.user;
  // Allow access to super admin as well 
  if (role == "ADMIN" || role == "SUPERADMIn") {
    next();
    return;
  } else {
    res
      .status(403)
      .json({
        message: "Require Admin Role!",
      })
      .send();
    return;
  }
};

isMember = (req, res, next) => {
  User.findByPk(req.userId).then((user) => {
    user.getRoles().then((roles) => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "moderator") {
          next();
          return;
        }

        if (roles[i].name === "admin") {
          next();
          return;
        }
      }

      res.status(403).send({
        message: "Require Moderator or Admin Role!",
      });
    });
  });
};

const authJwt = {
  verifyToken: verifyToken,
  isSuperAdmin: isSuperAdmin,
  isAdmin: isAdmin,
  isMember: isMember,
};
module.exports = authJwt;
