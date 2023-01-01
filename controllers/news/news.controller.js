const db = require("../../models");

const prisma = db.prisma; // Creating an instance of the databse

const convertUTCToDate = (news, data) => {
  for (let i = 0; i < news.length; i++) {
    let createdUTCDate = news[i].created_at;
    let updatedOnUTCDate = news[i].updated_at;

    let createdDate =
      createdUTCDate.getDate() +
      "/" +
      createdUTCDate.getMonth() +
      "/" +
      createdUTCDate.getFullYear();
    let updatedOnDate =
      updatedOnUTCDate.getDate() +
      "/" +
      updatedOnUTCDate.getMonth() +
      "/" +
      updatedOnUTCDate.getFullYear();

    data[i].created_at = createdDate;
    data[i].updated_at = updatedOnDate;
  }
};

// Get all news
// TODO: check if limiting the queries recieved is required
exports.get_all_news = async (req, res) => {
  
  await prisma.news
    .findMany({})
    .then((news) => {
      // console.log(news);
      let data = news;
      convertUTCToDate(news, data);
      return res.status(200).json({ data: data }).send();
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ message: "Internal Server Error" }).send();
    });
};

// Create a new news
exports.create_news = async (req, res) => {
  // Destructuring the results recieved
  // image_url is recieved from aws s3 after uploading
  // it on the frontend
  const { title, body, image_url } = req.body;

  // Check for response length
  if (title.length == 0) {
    // 422 - for validation error
    return res.status(422).json({ message: "Title cannot be null" }).send();
  }

  if (body.length == 0) {
    // 422 - for validation error
    return res.status(422).json({ message: "Body cannot be null" }).send();
  }

  // Note:
  // image_url can be null as it is option in the db as well
  await prisma.news
    .create({
      data: {
        title: title,
        body: body,
        image_url: image_url,
      },
    })
    .then((news) => {
      console.log(news);
      return res
        .status(201)
        .json({ message: "Successfully created news", data: [news] })
        .send();
    })
    .catch((err) => {
      return res.status(500).json({ message: "Intenral Server Error" }).send();
    });
};

// Update an existing news
exports.update_news = async (req, res) => {
  // Destructuring recieved response
  const { news_id, title, body, image_url } = req.body;

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

  console.log(req.body);

  if(news_ids === null || news_ids === undefined){
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
      console.log(news);
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
