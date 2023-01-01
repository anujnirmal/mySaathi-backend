const db = require("../../models");
const config = require("../../config/auth.config");
const RefreshToken = require("../refreshToken/refreshToken");
const logger = require("../../logger/logger")

const prisma = db.prisma;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

const incrementString = (text) => {
  return text.replace(/(\d*)$/, (_, t) =>
    (+t + 1).toString().padStart(t.length, 0)
  );
};

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
      logger.info(user);
      res
        .json({ message: "Successfully created " + role + " user" })
        .status(201)
        .send();
    })
    .catch((err) => {
      logger.error(err)
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
    fullName: full_name,
    mobileNumber: mobile_number,
    aadhaarNumber: aadhaar_number,
    panCardNumber: pancard_number,
    memberProfile: profile_photo,
    address,
    pincode,
    bankName: bank_name,
    bankAccountNumber: bank_account_number,
    ifscCode: ifsc_code,
    bankBranchName: bank_branch_name,
    children,
    modules,
  } = req.body;

  // console.log(req.body);

  const AADHAAR_LENGTH = 12;
  const MOBILE_NUMBER_LENGTH = 10;
  const PAN_CARD_LENGTH = 10;
  const FULL_NAME_LENGTH = 3;
  const ADDRESS_NAME_LENGTH = 10;

  if (aadhaar_number.toString().length != AADHAAR_LENGTH) {
    logger.error("Invalid aadhaar number")
    return res
      .status(404)
      .json({
        message: "Please enter a valid Aadhaar number",
      })
      .send();
  }

  if (mobile_number.toString().length != MOBILE_NUMBER_LENGTH) {
    logger.error("Invalid mobile number")
    return res
      .status(404)
      .json({
        message: "Please enter a valid Mobile number",
      })
      .send();
  }

  if (pancard_number.length != PAN_CARD_LENGTH) {
    logger.error("Invalid pancard number")
    return res
      .status(404)
      .json({
        message: "Please enter a valid Pancard number",
      })

      .send();
  }

  if (!(full_name.length > FULL_NAME_LENGTH)) {
    logger.error("Full name should be greater than " + FULL_NAME_LENGTH)
    return res
      .status(404)
      .json({
        message: "Full name should be greater than " + FULL_NAME_LENGTH,
      })

      .send();
  }

  if (!(address.length > ADDRESS_NAME_LENGTH)) {
    logger.error("Address should be greater than " + ADDRESS_NAME_LENGTH)
    return res
      .status(404)
      .json({
        message: "Address should be greater than " + ADDRESS_NAME_LENGTH,
      })

      .send();
  }

  // create child object
  let childrenNew = [];

  for (let i = 0; i < children.length; i++) {
    let childObject = {};
    for (let key in children[i]) {
      if (key != "id") {
        childObject[key] = children[i][key];
      }
    }
    childrenNew[i] = childObject;
  }

  // console.log("new children" + JSON.stringify(childrenNew));
  let last_ycf_id;
  // get the last ycf id
  await prisma.ycf_id_counter
    .findFirst({
      where: {
        id: 1,
      },
    })
    .then((ycf) => {
      last_ycf_id = ycf.last_ycf_id;
    })
    .catch((err) => {
      logger.error(err)
      return res.status(500).json({message: "Internal Server Error"}).send();
    });

  let new_ycf_id = incrementString(last_ycf_id);

  await prisma.members
    .create({
      data: {
        ycf_id: new_ycf_id,
        full_name: full_name,
        mobile_number: mobile_number.toString(),
        aadhaar_number: aadhaar_number.toString(),
        pancard_number: pancard_number,
        profile_photo: profile_photo.toString(),
        address: address,
        pincode: pincode,
        modules: modules,
        trashed: false,
        bank_detail: {
          create: {
            bank_name: bank_name,
            bank_account_number: bank_account_number.toString(),
            ifsc_code: ifsc_code,
            bank_branch_name: bank_branch_name,
          },
        },
        children: {
          create: childrenNew,
        },
      },
    })
    .then(async (member) => {
      // Update the number in the ycf counter
      await prisma.ycf_id_counter
        .update({
          where: {
            id: 1,
          },
          data: {
            last_ycf_id: new_ycf_id,
          },
        })
        .then((result) => {
          return (
            res
              .status(201)
              .json({ message: "Successfully created member", data: member })
              // .status(201)
              .send()
          );
        })
        .catch((err) => {
          logger.error(err)
          return res
            .status(500)
            .json({ message: " Internal Server Error" })
            .send();
        });
    })
    .catch((err) => {
      logger.error(err);
      // P2002 user already exists
      if (err.code == "P2002") {
        // 409 = already exists
        return res
          .status(409)
          .json({ message: err.meta.target + " Record already Exists" })
          .send();
      }
    });
};

// Update Member
exports.update_member = async (req, res) => {
  const {
    member_id,
    fullName: full_name,
    mobileNumber: mobile_number,
    aadhaarNumber: aadhaar_number,
    panCardNumber: pancard_number,
    memberProfile: profile_photo,
    address,
    pincode,
    bank_id,
    bankName: bank_name,
    bankAccountNumber: bank_account_number,
    ifscCode: ifsc_code,
    bankBranchName: bank_branch_name,
    children,
    modules,
  } = req.body;

  console.log(req.body);

  const AADHAAR_LENGTH = 12;
  const MOBILE_NUMBER_LENGTH = 10;
  const PAN_CARD_LENGTH = 10;
  const FULL_NAME_LENGTH = 3;
  const ADDRESS_NAME_LENGTH = 10;

  if (aadhaar_number.toString().length != AADHAAR_LENGTH) {
    logger.error("Input Validation failed")
    return res
      .status(404)
      .json({
        message: "Please enter a valid Aadhaar number",
      })
      .send();
  }

  if (mobile_number.toString().length != MOBILE_NUMBER_LENGTH) {
    logger.error("Input Validation failed")
    return res
      .status(404)
      .json({
        message: "Please enter a valid Mobile number",
      })
      .send();
  }

  if (pancard_number.length != PAN_CARD_LENGTH) {
    logger.error("Input Validation failed")
    return res
      .status(404)
      .json({
        message: "Please enter a valid Pancard number",
      })

      .send();
  }

  if (!(full_name.length > FULL_NAME_LENGTH)) {
    logger.error("Input Validation failed")
    return res
      .status(404)
      .json({
        message: "Full name should be greater than " + FULL_NAME_LENGTH,
      })

      .send();
  }

  if (!(address.length > ADDRESS_NAME_LENGTH)) {
    logger.error("Input Validation failed")
    return res
      .status(404)
      .json({
        message: "Address should be greater than " + ADDRESS_NAME_LENGTH,
      })

      .send();
  }

  await prisma.members
    .update({
      where: {
        id: member_id,
      },
      data: {
        full_name: full_name,
        mobile_number: mobile_number.toString(),
        aadhaar_number: aadhaar_number.toString(),
        pancard_number: pancard_number,
        profile_photo: profile_photo.toString(),
        address: address,
        pincode: pincode,
        modules: modules,
        trashed: false,
        bank_detail: {
          update: {
            where: {
              id: bank_id,
            },
            data: {
              bank_name: bank_name,
              bank_account_number: bank_account_number.toString(),
              ifsc_code: ifsc_code,
              bank_branch_name: bank_branch_name,
            },
          },
        },
      },
    })
    .then(async (member) => {
      // Upadte or create New Children
      let childrenUpdateResul;
      try {
        for (let i = 0; i < children.length; i++) {
          childrenUpdateResul = await prisma.children.upsert({
            where: {
              id: children[i].id,
            },
            update: {
              child_name: children[i].child_name,
              school_college_name: children[i].school_college_name,
              standard_grade: children[i].standard_grade,
            },
            create: {
              child_name: children[i].child_name,
              school_college_name: children[i].school_college_name,
              standard_grade: children[i].standard_grade,
              member: {
                connect: { id: member_id },
              },
            },
          });
        }

        return (
          res
            .status(201)
            .json({ message: "Successfully created member", data: member })
            // .status(201)
            .send()
        );
      } catch (err) {
        logger.error(err)
        return res
          .status(500)
          .json({ message: "Internal Server Error" })
          .send();
      }
    })
    .catch((err) => {
      logger.error(err)
      // P2002 user already exists
      if (err.code == "P2002") {
        // 409 = already exists
        return res
          .status(409)
          .json({ message: err.meta.target + " Record already Exists" })
          .send();
      }
    });
};

// Get all members who are not trashed or deleted
exports.get_all_members = async (req, res) => {
  await prisma.members
    .findMany({
      where: {
        trashed: false,
      },
      include: {
        bank_detail: true,
        children: true,
      },
    })
    .then((member) => {
      return res.status(200).json({ message: "success", data: member }).send();
    })
    .catch((err) => {
      logger.error(err);
      return res.status(500).json({ message: "Internal Server Error" }).send();
    });
};

// Get all members who are trashed or deleted
exports.get_all_deleted_members = async (req, res) => {
  await prisma.members
    .findMany({
      where: {
        trashed: true,
      },
      include: {
        bank_detail: true,
        children: true,
      },
    })
    .then((member) => {
      return res.status(200).json({ message: "success", data: member }).send();
    })
    .catch((err) => {
      logger.error(err);
      return res.status(500).json({ message: "Internal Server Error" }).send();
    });
};

// Delete one or many members
exports.delete_members = async (req, res) => {
  const { members_id } = req.body;
  console.log(req.body);

  if (members_id === null || members_id === undefined) {
    return res.status(404).json({ message: "No Ids found" }).send();
  }

  await prisma.members
    .updateMany({
      where: {
        id: {
          in: members_id, // this delete all the ids passed in as array
        },
      },
      data: {
        trashed: true,
      },
    })
    .then((news) => {
      console.log(news);
      // news.count == 0 : record not found or none deleted
      if (news.count == 0) {
        return res.status(404).json({ message: "Record not found" }).send();
      }
      return res
        .status(200)
        .json({ message: "Successfully deleted member" })
        .send();
    })
    .catch((err) => {
      logger.error(err);
      return res.status(500).json({ message: "Intenral Server Error" }).send();
    });
};

// Delete child
exports.delete_child = async (req, res) => {
  const { child_id } = req.body;
  
  if (child_id === null || child_id === undefined) {
    return res.status(404).json({ message: "No Ids found" }).send();
  }

  await prisma.children
    .delete({
      where: {
        id: child_id,
      },
    })
    .then((news) => {
      console.log(news);

      return res
        .status(200)
        .json({ message: "Successfully deleted member" })
        .send();
    })
    .catch((err) => {
      logger.error(err);
      if (err.code == "P2025") {
        return res.status(404).json({ message: "Not Found" }).send();
      }
      return res.status(500).json({ message: "Intenral Server Error" }).send();
    });
};

// Restore one or many members
exports.restore_members = async (req, res) => {
  const { members_id } = req.body;

  if (members_id === null || members_id === undefined) {
    return res.status(404).json({ message: "No Ids found" }).send();
  }

  await prisma.members
    .updateMany({
      where: {
        id: {
          in: members_id, // this delete all the ids passed in as array
        },
      },
      data: {
        trashed: false,
      },
    })
    .then((news) => {
      // news.count == 0 : record not found or none deleted
      if (news.count == 0) {
        return res.status(404).json({ message: "Record not found" }).send();
      }
      return res
        .status(200)
        .json({ message: "Successfully deleted member" })
        .send();
    })
    .catch((err) => {
      logger.log(err);
      return res.status(500).json({ message: "Intenral Server Error" }).send();
    });
};
