const nodemailer = require("nodemailer");

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


exports.send_member_update_email = async (oldsData, updatedData) => {
 
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ycf.developer@gmail.com", // generated ethereal user
      pass: "pytyzsrtmbqezmkf", // generated ethereal password
    },
  });

  let updatedMemberDetail = "";
  let oldMemberDetail = "";

  // Updated Member Detail Object
  for (const key in updatedData) {
    if(updatedData[key] !== oldsData[key]){
      if(key !== "modules"){
        updatedMemberDetail += `<span style="color: red"><b>${key}:</b> ${updatedData[key]} </span><br/>`;
      }else {
        updatedMemberDetail += `<b>${key}:</b> ${updatedData[key]} <br/>`;
      }
    }else {
      updatedMemberDetail += `<b>${key}:</b> ${updatedData[key]} <br/>`;
    }
  }

  // Old Member Detail Object
  for (const key in oldsData) {
    oldMemberDetail += `<b>${key}:</b> ${oldsData[key]} <br/>`;
  }


  // This email comprise of two objects, 
  //the updatedmemberdetail object and the member detail object
  let email = 
  `
    <b>Updated Data</b>
    <hr />
    <br/>
    ${updatedMemberDetail}
    <br/><br/><br/>
    <b>Old Data</b>
    <hr />
    <br />
    ${oldMemberDetail}
  `

  // contact@yashchoprafoundation.org, developer@yashchoprafoundation.org

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"MySaathi Mobile App" <developer@yashchoprafoundation.org>', // sender address
    to: "anujnirmal.work@gmail.com", // list of receivers
    subject: "Contact Request From Mobile App", // Subject line
    text: email, // plain text body
    html: `<p>${email}</p>`, // html body
  }).then(() => {
    console.log("success");
    return;
  }).catch((err) => {
    console.log("err");
    return;
  })
};
