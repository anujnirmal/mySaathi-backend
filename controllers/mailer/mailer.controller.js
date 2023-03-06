const nodemailer = require("nodemailer");

// Upload featured image for news from dashboard
exports.send_email = async (req, res) => {
  const { name: full_name, saathiId: ycf_id, message } = req.body;


  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ycf.developer@gmail.com", // generated ethereal user
      pass: "pytyzsrtmbqezmkf", // generated ethereal password
    },
  });

  let email = 
  `
    Full Name: ${full_name} <br/>
    YFC ID: ${ycf_id} <br/>
    Message: ${message} 
  `

  // contact@yashchoprafoundation.org, developer@yashchoprafoundation.org

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"MySaathi Mobile App" <developer@yashchoprafoundation.org>', // sender address
    to: "contact@yashchoprafoundation.org", // list of receivers
    subject: "Contact Request From Mobile App", // Subject line
    text: email, // plain text body
    html: `<b>${email}</b>`, // html body
  }).then(() => {
    console.log("success");
    return res.status(200).json({message: "Success"}).send();
  }).catch((err) => {
    console.log("err");
    return res.status(500).json({message: "Internal Server Error"}).send();
  })
};
