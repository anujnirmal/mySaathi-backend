const db = require("../models");
const firebase = require("../config/firebase.config");

const prisma = db.prisma; // Creating an instance of the databse


// TODO: store all the token in a db table to make it persist even if the server crashes
exports.create_notification = async (req, res) => {
  const { title, body, for_all_members, member_ids } = req.body;
  
  let member_ids_to_update = [];

  // if for_all_member = true
  if (for_all_members) {
    // Get all the members
    // The format of the members returned will be = [ { id: 1 }, { id: 6 }, { id: 7 } ]
    await prisma.members.findMany({
      select: {
        id: true
      }
    })
      .then((member) => {
        console.log(member);
        member_ids_to_update = member;
      })
  } else {
    // if the message is not for all members then assign the member_ids 
    // recieved from the client
    member_ids_to_update = member_ids;
  }

  console.log(member_ids_to_update);

  await prisma.notifications
    .create({
      data: {
        title: title,
        body: body,
        member: {
          connect: member_ids
        }
      }
    })
    .then((result) => {
      console.log(result);
      return res
        .json({
          message: "Successfully created notification for all",
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
exports.get_notification = async (req, res) => {
  
  const { member_id } = req.body;

  // Get notification for the given user
  await prisma.members
    .findMany({
      where: {
        id: member_id,
      },
      select: {
        id: true,
        ycf_id: true,
        notification: true,
      },
    })
    .then(async(result) => {
        return res
          .json({
            member_notification: result,
          })
          .status(201)
          .send();
      })
    .catch((err) => {
      console.log(err);
      return res.json({ message: "Intrnal server error" }).status(500).send();
    });
};

// When an member clicks cancel on the notification
// then disconnect their member id to the specific notification
exports.cancel_notification = async (req, res) => {
  const { notification_id, member_id } = req.body;

  await prisma.notifications
    .update({
      where: {
        id:  notification_id
      },
      data: {
        member: {
          disconnect: {
            id: member_id
          },
        },
      },
    })
    .then((result) => {
      console.log(result);
      return res
        .json({
          message: "Successfully deleted the notification"
        })
        .status(200)
        .send();
    })
    .catch((err) => {
      console.log(err);
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
