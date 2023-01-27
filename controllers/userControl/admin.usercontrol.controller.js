const db = require("../../models");
const config = require("../../config/auth.config");
const RefreshToken = require("../refreshToken/refreshToken");
const logger = require("../../logger/logger");
const { converToUTCToDate } = require("../../helper/helper.functions");

const prisma = db.prisma;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { log } = require("winston");
const { parse } = require("dotenv");

const incrementString = (text) => {
  return text.replace(/(\d*)$/, (_, t) =>
    (+t + 1).toString().padStart(t.length, 0)
  );
};

const EMAILREGEX = new RegExp(
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
);

// -----
// Dashboard User CRUD routes begin here
// -----

// Create User who can login in Admin Dashboard
exports.get_all_dashboard_users = async (req, res) => {
  await prisma.dashboard_users
    .findMany({})
    .then((user) => {
      console.log(user);
      res.json({ message: "success", data: user }).status(201).send();
    })
    .catch((err) => {
      console.log(err);
      res.json({ message: "Internal Server Error" }).status(500).send();
    });
};

// Create User who can login in Admin Dashboard
exports.create_dashboard_user = async (req, res) => {
  const {
    firstName: first_name,
    lastName: last_name,
    email: email_id,
    password,
    role,
  } = req.body;

  console.log(req.body);

  await prisma.dashboard_users
    .create({
      data: {
        first_name,
        last_name,
        email_id: email_id,
        password: bcrypt.hashSync(password, 8),
        role: role,
      },
    })
    .then((user) => {
      console.log(user);
      res
        .status(201)
        .json({ message: "Successfully created " + role + " user" })
        .send();
    })
    .catch((err) => {
      console.log(err);
      // P2002 user already exists
      if (err.code == "P2002") {
        // 409 = already exists
        res.status(409).json({ message: "User Already Exists" }).send();
      }
    });
};

// Update passwords of Admin Dashboard users
exports.update_dashboard_password = async (req, res) => {
  // Save User to Database
  const { id, newPassword } = req.body;

  if (id === "") {
    return res
      .status(404)
      .json({
        message: "Please enter a email",
      })
      .send();
  }

  if (newPassword === "" || newPassword?.length < 8) {
    return res
      .status(404)
      .json({
        message: "Password length should be greater then 7 characters",
      })
      .send();
  }

  try {
    let dashboard_user = await prisma.dashboard_users.update({
      where: { id: id },
      data: { password: bcrypt.hashSync(newPassword, 8) },
    });
    res.json({ message: "Successfully update password" }).status(200).send();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error " }).send();
  }
};

// Update passwords of Admin Dashboard users
exports.update_dashboard_user_detail = async (req, res) => {
  // Save User to Database
  const {
    id,
    firstName: first_name,
    lastName: last_name,
    email,
    role,
  } = req.body;

  if (first_name === "" || first_name?.length < 3) {
    return res
      .status(404)
      .json({
        message: "Please enter first name",
      })
      .send();
  }

  if (last_name === "" || last_name?.length < 3) {
    return res
      .status(404)
      .json({
        message: "Please enter last name",
      })
      .send();
  }

  if (email === "" || !email.match(EMAILREGEX)) {
    return res
      .status(404)
      .json({
        message: "Please enter email",
      })
      .send();
  }

  try {
    // If old password matched then update the password
    let dashboard_user = await prisma.dashboard_users.update({
      where: { id: id },
      data: {
        first_name: first_name,
        last_name: last_name,
        email_id: email,
        role: role,
      },
    });
    res.json({ message: "Successfully update user" }).status(200).send();
  } catch (err) {
    console.log(err);
    return res
      .json({ message: "Internal Server Error " + email })
      .status(500)
      .send();
  }
};

// Delete Admin Dashboard users
exports.delete_dashboard_user = async (req, res) => {
  const { id } = req.body;

  await prisma.dashboard_users
    .deleteMany({
      where: {
        id: {
          in: id,
        },
      },
    })
    .then((user) => {
      logger.info(user);
      res.json({ message: "Successfully deleted user" }).status(200).send();
    })
    .catch((err) => {
      logger.error(err);
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
    gender,
    ycfid: ycf_id,
    bankName: bank_name,
    bankAccountNumber: bank_account_number,
    ifscCode: ifsc_code,
    bankBranchName: bank_branch_name,
    children,
    modules,
    yearlyQuota: yearly_quota,
    alternateMobileNumber: alternate_mobile_number,
    dob: date_of_birth,
    registeredFilmUnionMember: registered_member_of_film_union,
    activeSaathiMemberBefore2022: active_saathi_member_till_2022,
    disabled,
    mentionDisability: disability,
    salary: monthly_salary_range,
    retired: retired_person,
  } = req.body;

  console.log(req.body);

  const AADHAAR_LENGTH = 12;
  const MOBILE_NUMBER_LENGTH = 10;
  const PAN_CARD_LENGTH = 10;
  const FULL_NAME_LENGTH = 3;
  const ADDRESS_NAME_LENGTH = 10;

  if (aadhaar_number.toString().length != AADHAAR_LENGTH) {
    logger.error("Invalid aadhaar number");
    return res
      .status(404)
      .json({
        message: "Please enter a valid Aadhaar number",
      })
      .send();
  }

  if (mobile_number.toString().length != MOBILE_NUMBER_LENGTH) {
    logger.error("Invalid mobile number");
    return res
      .status(404)
      .json({
        message: "Please enter a valid Mobile number",
      })
      .send();
  }

  if (pancard_number.length != PAN_CARD_LENGTH) {
    logger.error("Invalid pancard number");
    return res
      .status(404)
      .json({
        message: "Please enter a valid Pancard number",
      })

      .send();
  }

  if (!(full_name.length > FULL_NAME_LENGTH)) {
    logger.error("Full name should be greater than " + FULL_NAME_LENGTH);
    return res
      .status(404)
      .json({
        message: "Full name should be greater than " + FULL_NAME_LENGTH,
      })

      .send();
  }

  if (!(address.length > ADDRESS_NAME_LENGTH)) {
    logger.error("Address should be greater than " + ADDRESS_NAME_LENGTH);
    return res
      .status(404)
      .json({
        message: "Address should be greater than " + ADDRESS_NAME_LENGTH,
      })

      .send();
  }

  // console.log("new children" + JSON.stringify(childrenNew));
  // let last_ycf_id;
  // // get the last ycf id
  // await prisma.ycf_id_counter
  //   .findFirst({
  //     where: {
  //       id: 1,
  //     },
  //   })
  //   .then((ycf) => {
  //     last_ycf_id = ycf.last_ycf_id;
  //   })
  //   .catch((err) => {
  //     logger.error(err);
  //     return res.status(500).json({ message: "Internal Server Error" }).send();
  //   });

  // let new_ycf_id = incrementString(last_ycf_id);

  let memberData = {};

  if (children?.count === 0 || children === undefined) {
    memberData = {
      ycf_id: ycf_id,
      full_name: full_name,
      mobile_number: mobile_number.toString(),
      aadhaar_number: aadhaar_number.toString(),
      pancard_number: pancard_number,
      profile_photo: profile_photo.toString(),
      address: address,
      pincode: pincode,
      modules: modules,
      date_of_birth: date_of_birth.toString(),
      gender: gender,
      alternate_mobile_number: alternate_mobile_number.toString(),
      trashed: false,
      yearly_quota: yearly_quota,
      balance_amount: yearly_quota,
      bank_detail: {
        create: {
          bank_name: bank_name,
          bank_account_number: bank_account_number.toString(),
          ifsc_code: ifsc_code,
          bank_branch_name: bank_branch_name,
        },
      },
      member_other_detail: {
        create: {
          registered_member_of_film_union: registered_member_of_film_union,
          active_saathi_member_till_2022: active_saathi_member_till_2022,
          monthly_salary_range: monthly_salary_range,
          retired_person: retired_person,
          disabled: disabled,
          disability: disability,
        },
      },
    };
  } else {
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

    memberData = {
      ycf_id: ycf_id,
      full_name: full_name,
      mobile_number: mobile_number.toString(),
      aadhaar_number: aadhaar_number.toString(),
      pancard_number: pancard_number,
      profile_photo: profile_photo.toString(),
      address: address,
      pincode: pincode,
      modules: modules,
      trashed: false,
      date_of_birth: date_of_birth.toString(),
      gender: gender,
      alternate_mobile_number: alternate_mobile_number.toString(),
      yearly_quota: yearly_quota,
      balance_amount: yearly_quota,
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
      member_other_detail: {
        create: {
          registered_member_of_film_union: registered_member_of_film_union,
          active_saathi_member_till_2022: active_saathi_member_till_2022,
          monthly_salary_range: monthly_salary_range,
          retired_person: retired_person,
          disabled: disabled,
          disability: disability,
        },
      },
    };
  }

  await prisma.members
    .create({
      data: memberData,
    })
    .then(async (member) => {
      res
        .status(201)
        .json({ message: "Successfully created member", data: member })
        // .status(201)
        .send();
  
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
    ycfid: ycf_id,
    bankName: bank_name,
    bankAccountNumber: bank_account_number,
    ifscCode: ifsc_code,
    bankBranchName: bank_branch_name,
    children,
    modules,
    yearlyQuota: yearly_quota,
    alternateMobileNumber: alternate_mobile_number,
    dob: date_of_birth,
    registeredFilmUnionMember: registered_member_of_film_union,
    activeSaathiMemberBefore2022: active_saathi_member_till_2022,
    disabled,
    mentionDisability: disability,
    salary: monthly_salary_range,
    retired: retired_person,
    gender,
  } = req.body;

  const AADHAAR_LENGTH = 12;
  const MOBILE_NUMBER_LENGTH = 10;
  const PAN_CARD_LENGTH = 10;
  const FULL_NAME_LENGTH = 3;
  const ADDRESS_NAME_LENGTH = 10;

  if (aadhaar_number.toString().length != AADHAAR_LENGTH) {
    logger.error("Input Validation failed");
    return res
      .status(404)
      .json({
        message: "Please enter a valid Aadhaar number",
      })
      .send();
  }

  if (mobile_number.toString().length != MOBILE_NUMBER_LENGTH) {
    logger.error("Input Validation failed");
    return res
      .status(404)
      .json({
        message: "Please enter a valid Mobile number",
      })
      .send();
  }

  if (pancard_number.length != PAN_CARD_LENGTH) {
    logger.error("Input Validation failed");
    return res
      .status(404)
      .json({
        message: "Please enter a valid Pancard number",
      })

      .send();
  }

  if (!(full_name.length > FULL_NAME_LENGTH)) {
    logger.error("Input Validation failed");
    return res
      .status(404)
      .json({
        message: "Full name should be greater than " + FULL_NAME_LENGTH,
      })

      .send();
  }

  if (!(address.length > ADDRESS_NAME_LENGTH)) {
    logger.error("Input Validation failed");
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
        ycf_id: ycf_id,
        mobile_number: mobile_number.toString(),
        aadhaar_number: aadhaar_number.toString(),
        pancard_number: pancard_number,
        profile_photo: profile_photo?.toString(),
        address: address,
        pincode: pincode,
        modules: modules,
        trashed: false,
        date_of_birth: date_of_birth.toString(),
        gender: gender,
        alternate_mobile_number: alternate_mobile_number.toString(),
        yearly_quota: yearly_quota,
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
        member_other_detail: {
          create: {
            registered_member_of_film_union: registered_member_of_film_union,
            active_saathi_member_till_2022: active_saathi_member_till_2022,
            monthly_salary_range: monthly_salary_range,
            retired_person: retired_person,
            disabled: disabled,
            disability: disability,
          },
        },
      },
    })
    .then(async (member) => {
      console.log("here");
      // Upadte or create New Children
      if (req.body.hasOwnProperty(children)) {
        console.log("inside here");
        let childrenUpdateResul;
        try {
          for (let i = 0; i < children?.length; i++) {
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
          logger.error(err);
          return res
            .status(500)
            .json({ message: "Internal Server Error" })
            .send();
        }
      }

      return (
        res
          .status(201)
          .json({ message: "Successfully created member", data: member })
          // .status(201)
          .send()
      );
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
        member_bank_transaction: {
          include: {
            receipts: true,
          },
        },
        member_other_detail: true,
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

// Update member password
exports.update_member_password = async (req, res) => {
  const { member_id, new_password } = req.body;

  if (member_id === null || member_id === undefined) {
    return res.status(404).json({ message: "No Ids found" }).send();
  }

  if (new_password === null || new_password === undefined) {
    return res.status(404).json({ message: "No Password found" }).send();
  }

  await prisma.members
    .update({
      where: {
        id: member_id,
      },
      data: {
        password: bcrypt.hashSync(new_password, 8),
      },
    })
    .then((member) => {
      // news.count == 0 : record not found or none deleted
      return res
        .status(200)
        .json({ message: "Successfully updated member password" })
        .send();
    })
    .catch((err) => {
      logger.log(err);
      return res.status(500).json({ message: "Intenral Server Error" }).send();
    });
};


// Update member password
exports.add_member_photo = async (req, res) => {
  const { member_id, image_url } = req.body;

  console.log(req.body);

  if (member_id === null || member_id === undefined) {
    return res.status(404).json({ message: "No Ids found" }).send();
  }

  if (image_url === null || image_url === undefined) {
    return res.status(404).json({ message: "No Password found" }).send();
  }

  await prisma.members
    .update({
      where: {
        id: member_id,
      },
      data: {
        profile_photo: image_url,
      },
    })
    .then((member) => {
      // news.count == 0 : record not found or none deleted
      return res
        .status(200)
        .json({ message: "Successfully added profile photo", image_url: image_url })
        .send();
    })
    .catch((err) => {
      logger.log(err);
      return res.status(500).json({ message: "Intenral Server Error" }).send();
    });
};

