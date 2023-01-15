const firebase = require("../../config/firebase.config");

// {
//     body: "This is an FCM notification that displays an image!",
//     title: "FCM Notification",
//   },

exports.send_push_notification = (content, allTokens) => {
  // divide the length of allTokens by 500
  let number_of_times_to_iterate = allTokens.length / 500;

  console.log("Number of times " + number_of_times_to_iterate);

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
        console.log("Successfully sent message:", response);
      })
      .catch((error) => {
        console.log("Error sending message:", error);
      });
  }
};
