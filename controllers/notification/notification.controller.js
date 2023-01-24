const db = require("../../models");
const firebase = require("../../config/firebase.config");
const { send_push_notification } = require("./push.notification.controller");
const translate = require("@plainheart/google-translate-api");

const prisma = db.prisma; // Creating an instance of the databse

exports.create_notification = async (req, res) => {
  // for_module : news, notification, education
  const { title, body, image_url, for_module, for_all_members, member_ids } =
    req.body;

  console.log(req.body);

  // ["HINDI", "ENGLISH", "MARATHI"]
  let languages_to_send_to = [];
  let member_ids_to_update = [];
  let member_ids_to_update_hindi = [];
  let member_ids_to_update_marathi = [];
  let member_ids_to_update_english = [];

  try {
    // if for_all_member = true
    if (for_all_members) {
      // Get all the members
      // The format of the members returned will be = [ { id: 1 }, { id: 6 }, { id: 7 } ]
      let member_list_hindi = await prisma.members.findMany({
        where: {
          trashed: false,
          language: "HINDI",
        },
        select: {
          id: true,
        },
      });

      let member_list_marathi = await prisma.members.findMany({
        where: {
          trashed: false,
          language: "MARATHI",
        },
        select: {
          id: true,
        },
      });

      let member_list_english = await prisma.members.findMany({
        where: {
          trashed: false,
          language: "ENGLISH",
        },
        select: {
          id: true,
        },
      });

      // All the languages available
      languages_to_send_to = ["HINDI", "MARATHI", "ENGLISH"];

      // Creating a master copy to send notifications to
      for (let i = 0; i < 3; i++) {
          if(i === 0) {
            for (let i = 0; i < member_list_hindi.length; i++) {
              let value = {
                id: member_list_hindi[i].id
              }
              member_ids_to_update.push(value);
            }
          }

          if(i === 1){
            for (let i = 0; i < member_list_english.length; i++) {
              let value = {
                id: member_list_english[i].id
              }
              member_ids_to_update.push(value);
            }
          }

          if(i === 2){
            for (let i = 0; i < member_list_marathi.length; i++) {
              let value = {
                id: member_list_marathi[i].id
              }
              member_ids_to_update.push(value);
            }
          }
      }

      // all the member ids who chose hindi as language
      member_ids_to_update_hindi = member_list_hindi;
      // all the member ids who chose marathi as language
      member_ids_to_update_marathi = member_list_marathi;
      // all the member ids who chose english as language
      member_ids_to_update_english = member_list_english;
    } else {
      // if the message is not for all members then assign the member_ids
      // recieved from the client
      
      // Create a master copy to send all notifications to
      let local_member_ids = [];
      for (let i = 0; i < member_ids.length; i++) {
        let value = member_ids[i].id;
        local_member_ids.push(value);
      }


      let member_list_hindi = await prisma.members.findMany({
        where: {
          id: {
            in: local_member_ids,
          },
          language: "HINDI",
        },
      });

      let member_list_marathi = await prisma.members.findMany({
        where: {
          id: {
            in: local_member_ids,
          },
          language: "MARATHI",
        },
      });

      let member_list_english = await prisma.members.findMany({
        where: {
          id: {
            in: local_member_ids,
          },
          language: "ENGLISH",
        },
      });

      // Making the master copy to save notification
      member_ids_to_update = member_ids;
      // all the members with english as language selected
      member_ids_to_update_english = member_list_english;
      // all the members with hindi as language selected;
      member_ids_to_update_hindi = member_list_hindi;
      // all the members with marathi as language selected
      member_ids_to_update_marathi = member_list_marathi;

      // Assign the languages to send the notification to
      if (member_ids_to_update_english.length !== 0) {
        console.log("here");
        languages_to_send_to.push("ENGLISH");
      }

      if (member_ids_to_update_hindi.length !== 0) {
        console.log("hindi");
        languages_to_send_to.push("HINDI");
      }

      if (member_ids_to_update_marathi.length !== 0) {
        console.log("marathi");
        languages_to_send_to.push("MARATHI");
      }
    }

    // Create notification

    // TODO: Translate the notifications
    // hi = hindi
    // mr = marathi
    let hindi_title = "";
    let hindi_body = "";
    let marathi_title = "";
    let marathi_body = "";

    try {
      if (title) {
        let hindi_title_translation = await translate(title, { to: "hi" });
        let marathi_title_translation = await translate(title, { to: "mr" });
        hindi_title = hindi_title_translation.text;
        marathi_title = marathi_title_translation.text;
      }

      if (body) {
        let hindi_body_translation = await translate(body, { to: "hi" });
        let marathi_body_translation = await translate(body, { to: "mr" });
        hindi_body = hindi_body_translation.text;
        marathi_body = marathi_body_translation.text;
      }

      console.log("Hindi title" + hindi_title);
      console.log("Hindi body" + hindi_body);
      console.log("Marathi title" + marathi_title);
      console.log("Marathi body" + marathi_body);
    } catch (error) {
      console.log("Error translating " + error);
    }

    console.log("Member _id " + JSON.stringify(member_ids_to_update));

    // update notification in db for all the users
    let notifications_list = await prisma.notifications.create({
      data: {
        english_title: title,
        english_body: body,
        hindi_title: hindi_title,
        hindi_body: hindi_body,
        marathi_title: marathi_title,
        marathi_body: marathi_body,
        image_url: image_url,
        member: {
          connect: member_ids_to_update,
        },
      },
    });

    // Create a for loop to loop through all the languages to send the notification to
    for (let i = 0; i < languages_to_send_to.length; i++) {
      console.log("round 1" + languages_to_send_to[i]);
      // Push notification object
      let notification;

      // Send notification using firebase cloud messaging
      // member_ids_to_update format is = ["id": 1, "id": 2]
      // converting it to [1,2] just with the values and not key
      let member_ids_value = [];
      let member_ids_to_loop;
      if (languages_to_send_to[i] === "HINDI") {
        member_ids_to_loop = member_ids_to_update_hindi;
        // Notification object
        notification = {
          body: hindi_body,
          title: hindi_title,
          image_url: image_url,
        };
      }

      if (languages_to_send_to[i] === "MARATHI") {
        member_ids_to_loop = member_ids_to_update_marathi;
        // Notification object
        notification = {
          body: marathi_body,
          title: marathi_title,
          image_url: image_url,
        };
      }

      if (languages_to_send_to[i] === "ENGLISH") {
        member_ids_to_loop = member_ids_to_update_english;
        // Notification object
        notification = {
          body: body,
          title: title,
          image_url: image_url,
        };
      }

      for (let i = 0; i < member_ids_to_loop.length; i++) {
        let value = member_ids_to_loop[i].id;
        member_ids_value.push(value);
      }

      // Get all the fcm tokens for the member ids
      let fcm_token_list = await prisma.notification_tokens.findMany({
        where: {
          member_id: {
            in: member_ids_value,
          },
        },
      });

      // make an array of just fcm_tokens
      let fcm_tokens = [];
      for (let i = 0; i < fcm_token_list.length; i++) {
        const token = fcm_token_list[i].fcm_token;
        fcm_tokens.push(token);
      }

      console.log("FCM tokens " + JSON.stringify(fcm_token_list));

      // Send the notification to the users
      send_push_notification(notification, fcm_tokens);
    }

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

// let content = {
//   title: "Approved",
//   body: "Your request for 2000 is approved",
// };

// let tokens = [
//   "fzy4N7r5QTSPRDWoFMkvZD:APA91bFMcidKQj8tTP7sa27Kw4fuwwcZaKdaJsPQlwCRP-dTkFWGHZ0bA9iwt7z5MLM5mURMzfoPQlhD8qCWLg1ToFkb9fTCIxa7ZXeryNpkQgc-BJ0LmA4jHaBx7kr365pz-WWf1GgX",
// ];

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
      return res
        .status(200)
        .json({ message: "Successfully Created", data: notification_token })
        .send();
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
        notification: true,
      },
    })
    .then(async (result) => {
      console.log(JSON.stringify(result));
      return res
        .json({
          notificaion: result[0].notification,
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
