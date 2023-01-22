const firebase = require("../../config/firebase.config");
const { prisma } = require("../../models");

// set find_all = true to get all the fcm tokens
// if find_all = false then it will take member_ids to get the tokens
// if filter_by_language is set to true then language parameter will be used
exports.get_fcm_tokens = async (
  find_all,
  member_ids,
  filter_by_language,
  language
) => {
  try {
    let query = {};
    let fcm_tokens;
    let fcm_token_list = [];

    // query for finding all the fcm tokens with no language

    if (!filter_by_language) {
      if (find_all === true) {
        query = {};
        fcm_tokens = await prisma.notification_tokens.findMany(query);
      }

      if (find_all === false) {
        query.where = {
          member_id: {
            in: member_ids,
          },
        };
        fcm_tokens = await prisma.notification_tokens.findMany(query);
      }

      for (let i = 0; i < fcm_tokens.length; i++) {
        const token = fcm_tokens[i].fcm_token;
        fcm_token_list.push(token);
      }
    }

    if (filter_by_language) {
      // find all the fcm token by filtering language
      if (find_all === true) {
        fcm_tokens = await prisma.members.findMany({
          where: {
            language: language,
          },
          include: {
            notification_token: true,
          },
        });
      }

      if (find_all === false) {
        fcm_tokens = await prisma.members.findMany({
          where: {
            id: {
              in: member_ids,
            },
            language: language,
          },
          include: {
            notification_token: true,
          },
        });
      }
      
      console.log("token is " + JSON.stringify(fcm_tokens));

      for (let i = 0; i < fcm_tokens.length; i++) {
        let all_fcm_tokens = fcm_tokens[i].notification_token;
        // loop inside the notification loop
        for (let j = 0; j < all_fcm_tokens.length; j++) {
          const token = all_fcm_tokens[j].fcm_token;
          fcm_token_list.push(token);
        }
        // const token = fcm_tokens[i].notification_token[0]?.fcm_token;
        // console.log("inside is" + token);
      }
    }

    // return the result
    console.log(fcm_token_list);
    return fcm_token_list;
  } catch (err) {
    console.log(err);
    return [];
  }
};

// USe this to send push notification
// this block of code sends 500 messages at a time
// Can handle unlimited number of messages
exports.send_push_notification = (content, allTokens) => {
  // divide the length of allTokens by 500
  let number_of_times_to_iterate = allTokens.length / 500;

  // loop and take the 500 fcm one by one to a new array
  for (let i = 0; i < number_of_times_to_iterate; i++) {
    // this will start from 0, 500, 1000
    let fcm_token_start_from = i * 500;
    // if i equals 0 then end from 500
    // if i is not equal to 0 then
    let fcm_token_end_at = i === 0 ? 500 : 500 * (i + 1);
    let fcm_token_500 = [];
    fcm_token_500 = allTokens.slice(fcm_token_start_from, fcm_token_end_at); // this will copy tokens form 1 to 499

    const message = {
      tokens: fcm_token_500,
      // tokens: registrationTokens,
      notification: {
        body: content.body,
        title: content.title,
      },
      apns: {
        payload: {
          aps: {
            "mutable-content": 1,
          },
        },
        fcm_options: {
          image: "image-url",
        },
      },
      data: {
        for: "news",
      },
    };

    if (content.image_url !== "") {
      message.android = {
        notification: {
          image: content.image_url,
        },
      };
    }

    firebase
      .messaging()
      .sendMulticast(message)
      .then((response) => {
        console.log("Successfully sent message:", JSON.stringify(response));
      })
      .catch((error) => {
        console.log("Error sending message:", error);
      });
  }
};
