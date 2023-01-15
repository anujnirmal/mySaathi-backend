const db = require("../../models");
const firebase = require("../../config/firebase.config");
const { send_push_notification } = require("./push.notification.controller");

const prisma = db.prisma; // Creating an instance of the databse

exports.create_notification = async (req, res) => {
  
  // for_module : news, notification, education
  const { title, body, image_url, for_module , for_all_members, member_ids } = req.body;

  console.log(req.body);

  let member_ids_to_update = [];

  try {
    // if for_all_member = true
    if (for_all_members) {
      // Get all the members
      // The format of the members returned will be = [ { id: 1 }, { id: 6 }, { id: 7 } ]
      let member_list = await prisma.members.findMany({
        where: {
          trashed: false
        },
        select: {
          id: true,
        },
      });
      console.log("Member list" + member_list);
      member_ids_to_update = member_list;
    } else {
      // if the message is not for all members then assign the member_ids
      // recieved from the client
      member_ids_to_update = member_ids;
    }

    console.log("Member ids to update " + JSON.stringify(member_ids_to_update));

    // Create notification

    let notifications_list = await prisma.notifications.create({
      data: {
        title: title,
        body: body,
        image_url: image_url,
        member: {
          connect: member_ids_to_update,
        },
      },
    });

    // Send notification using firebase cloud messaging
    // member_ids_to_update format is = ["id": 1, "id": 2]
    // converting it to [1,2] just with the values and not key
    let member_ids_value = [];
    for (let i = 0; i < member_ids_to_update.length; i++) {
      let value = member_ids_to_update[i].id;
      member_ids_value.push(value)
    }

    // Get all the fcm tokens for the member ids
    let fcm_token_list = await prisma.notification_tokens.findMany({
      where: {
        member_id: {
          in: member_ids_value
        }
      }
    })

    // make an array of just fcm_tokens
    let fcm_tokens = [];
    for (let i = 0; i < fcm_token_list.length; i++) {
      const token = fcm_token_list[i].fcm_token;
      fcm_tokens.push(token);
    }

    console.log("FCM tokens " + JSON.stringify(fcm_token_list));

    let notification = {
      body: body,
      title: title,
      image_url: image_url,
      for_module: for_module,
    }

    // Send the notification to the users
    send_push_notification(notification, fcm_tokens)

    return res
      .json({
        message: "Successfully created notification for all",
      })
      .status(201)
      .send();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" }).send();
  }
};

let content = {
  title: "Approved",
  body: "Your request for 2000 is approved",
};

let tokens = [
  "fzy4N7r5QTSPRDWoFMkvZD:APA91bFMcidKQj8tTP7sa27Kw4fuwwcZaKdaJsPQlwCRP-dTkFWGHZ0bA9iwt7z5MLM5mURMzfoPQlhD8qCWLg1ToFkb9fTCIxa7ZXeryNpkQgc-BJ0LmA4jHaBx7kr365pz-WWf1GgX",
];

// Add firebase cloud messaging token to the respected user
exports.add_fcm_token = async (req, res) => {
  const { member_id, fcm_token } = req.body;

  await prisma.notification_tokens
    .upsert({
      where: {
        fcm_token: fcm_token,
      },
      update: {
        fcm_token: fcm_token,
      },
      create: {
        fcm_token: fcm_token,
        member: {
          connect: {
            id: member_id,
          },
        },
      },
    })
    .then((notification_token) => {
      return res.status(200).json({ message: "Successfully Created", data: notification_token }).send();
    })
    .catch((err) => {
      // P2002 user already exists
      console.log(err);
      return res.status(500).json({ message: "Internal Server Error" }).send();
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
    .then(async (result) => {
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
        id: notification_id,
      },
      data: {
        member: {
          disconnect: {
            id: member_id,
          },
        },
      },
    })
    .then((result) => {
      console.log(result);
      return res
        .json({
          message: "Successfully deleted the notification",
        })
        .status(200)
        .send();
    })
    .catch((err) => {
      console.log(err);
      return res.json({ message: "Intrnal server error" }).status(500).send();
    });
};

exports.send_notification = async (req, res) => {
  const { title, body } = req.body;

  try {
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ message: err.message || "Something went wrong!" });
  }
};
