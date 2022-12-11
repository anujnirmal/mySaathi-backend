const db = require("../models");
const firebase = require("../config/firebase.config");

const prisma = db.prisma; // Creating an instance of the databse

const tokens = [];

// TODO: store all the token in a db table to make it persist even if the server crashes
exports.create_notification = async (req, res) => {
  const { title, body, for_all_members, member_ids } = req.body;

  let notification = {};

  console.log(req.body);

  // if for_all_member = true
  if (for_all_members) {
    notification = {
      title: title,
      body: body,
      for_all: for_all_members,
    };
  } else {
    notification = {
      title: title,
      body: body,
      for_all: false,
      members_notification: {
        create: [{
          member: 1 
        }],
      },
    };
  }

  await prisma.notifications
    .create({
      data: notification,
    })
    .then((result) => {
      console.log(result);
      return res
        .json({
          message: "Successfully created notification for all",
          data: result,
        })
        .status(201)
        .send();
    })
    .catch((err) => {
      // P2002 user already exists
      console.log(err);
      if (err.code == "P2002") {
        // 409 = already exists
        return res.json({ message: "User Already Exists" }).status(409).send();
      }
    });
};

// Get all notification
// Todo: get all notfication and filter by user and then send
exports.get_notification = async (req, res) => {

  await prisma.notifications
    .findMany({})
    .then((result) => {
      console.log(result);
      return res
        .json({
          data: result,
        })
        .status(201)
        .send();
    })
    .catch((err) => {
        return res.json({ message: "Intrnal server error" }).status(500).send();

    });
};



















// Connect with firebase messaging service
// TODO: store all the token in a db table to make it persist even if the server crashes
exports.register_notification = async (req, res) => {
  const { token } = req.body;

  tokens.push(token);
  res
    .status(200)
    .json({ message: "Successfully registered FCM Token!" })
    .send();
};

exports.send_notification = async (req, res) => {
  const { title, body, imageUrl } = req.body;

  try {
    await firebase.messaging().sendMulticast({
      tokens,
      notification: {
        title,
        body,
        imageUrl,
      },
    });
    res.status(200).json({ message: "Successfully sent notifications!" });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ message: err.message || "Something went wrong!" });
  }
};
