const db = require("../models");

const prisma = db.prisma; // Creating an instance of the databse

// Get all news
// TODO: check if limiting the queries recieved is required
exports.get_all_news = async (req, res) => {

  await prisma.news
    .findMany({})
    .then((news) => {
      res
        .json({
          news: news,
        })
        .status(200)
        .send();
    })
    .catch((err) => {
      console.log(err);
      res.json({ message: "Internal Server Error" }).status(500).send();
    });

};

// Create a new news
exports.create_news = async (req, res) => {

  // Destructuring the results recieved
  // image_url is recieved from aws s3 after uploading
  // it on the frontend
  const { title, body, image_url, news_url } = req.body;

  // Check for response length
  if(title.length == 0){
    // 422 - for validation error
    return res.json({ message: "Title cannot be null" }).status(422).send();
  }

  if(body.length == 0){
    // 422 - for validation error
    return res.json({ message: "Body cannot be null" }).status(422).send();
  }

  // Note: 
  // image_url can be null as it is option in the db as well
  await prisma.news
    .create({
      data: {
        title: title,
        body: body,
        image_url: image_url,
        news_url: news_url   // this link is used to send users to the appropirate blog on frontend
      },
    })
    .then((news) => {
      console.log(news);
      return res.json({ message: "Successfully created news", data: [news] }).status(201).send();
    })
    .catch((err) => {
      // P2002 user already exists
      if (err.code == "P2002") {
        return res.json({ message: "News already exists" }).status(403).send();
      }
      console.log(err);
      return res.json({ message: "Intenral Server Error" }).status(500).send();
    });

};

// Update an existing news
exports.update_news = async (req, res) => {

  // Destructuring recieved response
  const { news_id, title, body, image_url, news_url } = req.body;

  // Check for response length
  if(title.length == 0){
    // 422 - for validation error
    return res.json({ message: "Title cannot be null" }).status(422).send();
  }

  if(body.length == 0){
    // 422 - for validation error
    return res.json({ message: "Body cannot be null" }).status(422).send();
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
        news_url: news_url,
        updated_at: new Date() // Update the date with the time updated
      },
    })
    .then((news) => {
      console.log(news);
      return res.json({ message: "Successfully updated news", data: [news]  }).status(200).send();
    })
    .catch((err) => {
      console.log(err);
      if(err.code == "P2011"){
        // 422 = nprocessable Entity
        return res.json({ message: "Cannot be null" }).status(422).send();
      }

      if(err.code == "P2025"){
        // 422 = nprocessable Entity
        return res.json({ message: "Record not found" }).status(404).send();
      }

      return res.json({ message: "Intenral Server Error" }).status(500).send();
    });

};

// Delete one of many news 
exports.delete_news = async (req, res) => {

  // news_id is an array which includes
  // all the ids of news to be deleted
  const { news_id } = req.body;

  await prisma.news
    .deleteMany({
      where: {
        id: {
          in: news_id,  // this delete all the ids passed in as array
        },
      },
    })
    .then((news) => {
      console.log(news);
      // news.count == 0 : record not found or none deleted
      if(news.count == 0){
        return res.json({ message: "Record not found" }).status(404).send();
      }
      return res.json({ message: "Successfully deleted news" }).status(200).send();
    })
    .catch((err) => {
      console.log(err);
      return res.json({ message: "Intenral Server Error" }).status(500).send();
    });

};
