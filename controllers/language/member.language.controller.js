const db = require("../../models");

const prisma = db.prisma; // Creating an instance of the databse

// Update member language recieved from mobile phone
exports.update_member_language = async (req, res) => {
  const { member_id, language } = req.body;

  if (member_id === null || member_id === undefined) {
    return res.status(400).json({ message: "Please provide member id" }).send();
  }

  if (language === null || language === undefined) {
    return res
      .status(400)
      .json({ message: "Please provide a language" })
      .send();
  }

  let languageToUpdate = language.toUpperCase();

  // Validate language
  if (
    languageToUpdate !== "HINDI" ||
    languageToUpdate !== "ENGLISH" ||
    languageToUpdate !== "MARATHI"
  ) {
    return res
      .status(400)
      .json({ message: "Please provide a valid language" })
      .send();
  }

  await prisma.members
    .update({
      where: {
        id: member_id,
      },
      data: {
        language: languageToUpdate,
      },
    })
    .then((member) => {
      return res.status(200).json({ message: "success" }).send();
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ message: "Internal Server Error" }).send();
    });
};
