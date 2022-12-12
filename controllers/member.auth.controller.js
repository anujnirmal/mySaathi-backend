const db = require("../models");

const prisma = db.prisma;

// Get all news
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

// Test routes
exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};
