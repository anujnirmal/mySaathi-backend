const db = require("../models");
const config = require("../config/auth.config");
const RefreshToken = require("./refreshToken/refreshToken");

const prisma = db.prisma;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

// -----
// Dashboard User CRUD routes begin here
// -----

// Create User who can login in Admin Dashboard
exports.create_dashboard_user = async (req, res) => {
  const { email, password, role } = req.body;

  // role = SUPERADMIN, ADMIN

  await prisma.dashboard_users
    .create({
      data: {
        email_id: email,
        password: bcrypt.hashSync(password, 8),
        role: role,
      },
    })
    .then((user) => {
      console.log(user);
      res
        .json({ message: "Successfully created " + role + " user" })
        .status(201)
        .send();
    })
    .catch((err) => {
      console.log(err);

      // P2002 user already exists
      if (err.code == "P2002") {
        // 409 = already exists
        res.json({ message: "User Already Exists" }).status(409).send();
      }
    });
};

// Update passwords of Admin Dashboard users
exports.update_dashboard_password = async (req, res) => {
  // Save User to Database
  const { email, newPassword } = req.body;

  await prisma.dashboard_users
    .update({
      where: { email_id: email },
      data: { password: bcrypt.hashSync(newPassword, 8) },
    })
    .then((user) => {
      console.log(user);
      res
        .json({ message: "Successfully update password for " + email })
        .status(200)
        .send();
    })
    .catch((err) => {
      console.log(err);
      if (err.code == "P2025") {
        return res
          .json({ message: "Not user found with this email " + email })
          .status(500)
          .send();
      }

      return res
        .json({ message: "Internal Server Error " + email })
        .status(500)
        .send();
    });
};

// Delete Admin Dashboard users
exports.delete_dashboard_user = async (req, res) => {
  const { email } = req.body;

  await prisma.dashboard_users
    .delete({
      where: {
        email_id: email,
      },
    })
    .then((user) => {
      console.log(user);
      res
        .json({ message: "Successfully created " + role + " user" })
        .status(201)
        .send();
    })
    .catch((err) => {
      console.log(err);
      res
        .json({ message: "Internal Server Error " + err })
        .status(500)
        .send();
    });
};

// -----
// Dashboard User CRUD routes ends here
// -----

// -----
// Member User CRUD routes begin here
// -----

// Create member
exports.create_member = async (req, res) => {
  // TODO: generate ycf_id
  const {
    ycf_id,
    full_name,
    mobile_number,
    aadhaar_number,
    pancard_number,
    address,
  } = req.body;

  await prisma.members
    .create({
      data: {
        ycf_id: ycf_id.toString(),
        full_name: full_name,
        mobile_number: mobile_number,
        aadhaar_number: aadhaar_number,
        pancard_number: pancard_number,
        address: address,
      },
    })
    .then((member) => {
      console.log(member);
      return res
        .json({ message: "Successfully created member", data: member })
        .status(201)
        .send();
    })
    .catch((err) => {
      console.log(err);
      // P2002 user already exists
      if (err.code == "P2002") {
        // 409 = already exists
        return res
          .json({ message: "Record already Exists" })
          .status(409)
          .send();
      }
    });
};
