const formidable = require("formidable");
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { v4: uuidv4 } = require('uuid');

const spacesEndpoint = new aws.Endpoint(process.env.DO_SPACES_ENDPOINT);
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_SPACES_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET,
});

let file_name;

// Change bucket property to your Space name
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.DO_SPACES_NAME,
    acl: "public-read",
    key: function (req, file, cb) {
      let rand_file_name = uuidv4();
      file_name = rand_file_name + file.originalname.substring(file.originalname.lastIndexOf("."));
      console.log(file_name);
      cb(null, req.folder_name + "/" + file_name );
    },
  }),
}).array("upload");


exports.upload_featured_image = async (req, res) => {
  // Add folder name to be accessed by the multer to create folder
  let folder_name = "featured-image"
  req.folder_name = "featured-image";
  upload(req, res, function (error, data) {
    
    if (error) {
      console.log(error);
      return res.status(500).json({message: "There was an error uploading file"}).send();
    }
    console.log("File uploaded successfully.");
    let location = [];
    for (let i = 0; i < req.files.length; i++) {
      location.push(req.files[i].location);
    }
    return res.status(200).json({message: "Success", image_location: location}).send();
  });
};

exports.upload_notification_image = async (req, res) => {
  // Add folder name to be accessed by the multer to create folder
  let folder_name = "notification-image"
  req.folder_name = folder_name;
  upload(req, res, function (error, data) {
    console.log(req.files);
    if (error) {
      console.log(error);
      return res.status(500).json({message: "There was an error uploading file"}).send();
    }
    console.log("File uploaded successfully.");
    let location = [];
    for (let i = 0; i < req.files.length; i++) {
      location.push(req.files[i].location);
    }
    return res.status(200).json({message: "Success", image_location: location}).send();
  });
};



exports.upload_receipt = async (req, res) => {
  // Add folder name to be accessed by the multer to create folder
  let folder_name = "receipts"
  req.folder_name = folder_name;
  upload(req, res, function (error, data) {
    if (error) {
      console.log(error);
      return res.status(500).json({message: "There was an error uploading file"}).send();
    }
    console.log("File uploaded successfully.");
    let location = [];
    for (let i = 0; i < req.files.length; i++) {
      location.push(req.files[i].location);
    }
    return res.status(200).json({message: "Success", image_location: location}).send();
  });
};

exports.upload_member_photo = async (req, res) => {
  // Add folder name to be accessed by the multer to create folder
  let folder_name = "member-photos"
  req.folder_name = folder_name;
  upload(req, res, function (error, data) {
    if (error) {
      console.log(error);
      return res.status(500).json({message: "There was an error uploading file"}).send();
    }
    console.log("File uploaded successfully.");
    let location = [];
    for (let i = 0; i < req.files.length; i++) {
      location.push(req.files[i].location);
    }
    return res.status(200).json({message: "Success", image_location: location}).send();
  });
};



