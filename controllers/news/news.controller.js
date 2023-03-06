const db = require("../../models");
const { converToUTCToDate } = require("../../helper/helper.functions");
const {
  send_push_notification,
  get_fcm_tokens,
} = require("../notification/push.notification.controller");

const prisma = db.prisma; // Creating an instance of the databse

// Get all news
exports.get_all_news = async (req, res) => {
  await prisma.news
    .findMany({})
    .then((news) => {
      console.log(news);
      let data = news;
      converToUTCToDate(news, data);
      return res.status(200).json({ data: data }).send();
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ message: "Internal Server Error" }).send();
    });
};

// Get all news
exports.get_news_by_language = async (req, res) => {
  const { language } = req.body;

  console.log(language);

  if (language === "" || language === "selectedLanguage") {
    return res.status(422).json({ message: "Please select a language" }).send();
  }
  await prisma.news
    .findMany({
      where: {
        language: language.toLowerCase(),
      },
    })
    .then((news) => {
      console.log(news);
      let data = news;
      converToUTCToDate(news, data);
      return res.status(200).json({ data: data }).send();
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ message: "Internal Server Error" }).send();
    });
};

// create news
exports.create_news = async (req, res) => {
  // Destructuring the results recieved
  // image_url is recieved from aws s3 after uploading
  // it on the frontend
  const { title, body, image_url, plainText: plain_text, language } = req.body;

  console.log(req.body);

  let isLanguageUndefined = false;

  // Check for response length
  if (title.length == 0) {
    // 422 - for validation error
    return res.status(422).json({ message: "Title cannot be null" }).send();
  }

  if (body.length == 0) {
    // 422 - for validation error
    return res.status(422).json({ message: "Body cannot be null" }).send();
  }

  if (
    language === undefined ||
    language === "selectedLanguage" ||
    language === ""
  ) {
    isLanguageUndefined = true;
    // return res.status(422).json({ message: "Please select a language" }).send();
  }

  try {
    let result = await prisma.news.create({
      data: {
        title: title,
        body: body,
        image_url: image_url,
        plain_text_body: plain_text,
        language: isLanguageUndefined ? "ENGLISH" : language,
      },
    });

    // Get the fcm tokens
    let fcm_tokens = await get_fcm_tokens(
      true,
      [],
      true,
      isLanguageUndefined ? "ENGLISH" : language.toUpperCase()
    );

    let content_to_send;

    if (isLanguageUndefined || language.toUpperCase() === "ENGLISH") {
      content_to_send = {
        body: title,
        title: "Check out this new post",
        image_url: image_url,
      };
    } else if (language.toUpperCase() === "HINDI") {
      content_to_send = {
        body: title,
        title: "इस नई पोस्ट को देखें",
        image_url: image_url,
      };
    } else if (language.toUpperCase() === "MARATHI") {
      content_to_send = {
        body: title,
        title: "हे नवीन पोस्ट पहा",
        image_url: image_url,
      };
    }

    send_push_notification(content_to_send, fcm_tokens);

    return res
      .status(201)
      .json({ message: "Successfully created news", data: [result] })
      .send();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Intenral Server Error" }).send();
  }
};

// Update an existing news
exports.update_news = async (req, res) => {
  // Destructuring recieved response
  const { news_id, title, body, image_url, language } = req.body;

  console.log(req.body);
  // Check for response length
  if (title.length == 0) {
    // 422 - for validation error
    return res.status(422).json({ message: "Title cannot be null" }).send();
  }

  if (body.length == 0) {
    // 422 - for validation error
    return res.status(422).json({ message: "Body cannot be null" }).send();
  }

  await prisma.news
    .update({
      where: {
        id: news_id,
      },
      data: {
        title: title,
        body: body,
        image_url: image_url,
        language: language,
        updated_at: new Date(), // Update the date with the time updated
      },
    })
    .then((news) => {
      return res
        .status(200)
        .json({ message: "Successfully updated news", data: [news] })
        .send();
    })
    .catch((err) => {
      console.log(err);
      if (err.code == "P2011") {
        // 422 = nprocessable Entity
        return res.status(422).json({ message: "Cannot be null" }).send();
      }

      if (err.code == "P2025") {
        // 422 = nprocessable Entity
        return res.status(404).json({ message: "Record not found" }).send();
      }

      return res.status(500).json({ message: "Intenral Server Error" }).send();
    });
};

// Delete one or many news
exports.delete_news = async (req, res) => {
  // news_id is an array which includes
  // all the ids of news to be deleted
  // TODO: delete image from s3 after deleting photos to save space
  const { news_ids } = req.body;

  if (news_ids === null || news_ids === undefined) {
    return res.status(404).json({ message: "Please No Ids found" }).send();
  }

  await prisma.news
    .deleteMany({
      where: {
        id: {
          in: news_ids, // this delete all the ids passed in as array
        },
      },
    })
    .then((news) => {
      // news.count == 0 : record not found or none deleted
      if (news.count == 0) {
        return res.status(404).json({ message: "Record not found" }).send();
      }
      return res
        .status(200)
        .json({ message: "Successfully deleted news" })
        .send();
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ message: "Intenral Server Error" }).send();
    });
};
