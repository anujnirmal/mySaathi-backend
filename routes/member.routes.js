const { authJwt } = require("../middleware");
const news_controller = require("../controllers/news/news.controller");
const notification_controller = require("../controllers/notification/notification.controller");
const transaction_controller = require("../controllers/transactions/transaction.controller");
const member_auth_controller = require("../controllers/auth/member.auth.controller");
const member_language_controller = require("../controllers/language/member.language.controller");
const mailer_controller = require("../controllers/mailer/mailer.controller");
const file_upload_controller = require("../controllers/fileUpload/file.upload.controller");
const admin_usercontrol_controller = require("../controllers/userControl/admin.usercontrol.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // -----
  // NEWS
  // -----
  app.post("/api/news/get_news_by_language", news_controller.get_news_by_language);

  // -----
  // LOGIN
  // -----
  app.post("/api/member/auth/check_mobile_number", member_auth_controller.member_login_check_mobile_number);
  app.post("/api/member/auth/login", member_auth_controller.member_login_or_create_password);

  // -----
  // LANGUAGE
  // -----
  app.post("/api/member/language/update", authJwt.verifyToken ,member_language_controller.update_member_language);

   // -----
  // GET MEMBER DETAIL
  // -----
  app.post("/api/member/get_all_data", authJwt.verifyToken , member_auth_controller.member_get_all_data);

  // -----
  // NOTIFICATION
  // -----
  app.post("/api/notification/get_notification", authJwt.verifyToken, notification_controller.get_notification);
  app.post("/api/notification/cancel_notification", authJwt.verifyToken, notification_controller.cancel_notification);
  app.post("/api/notification/add_fcm_token", authJwt.verifyToken ,notification_controller.add_fcm_token);


  // -----
  // EDUCATION MODULE
  // -----
  // TODO: add authentication
  app.post("/api/education/add_receipts", authJwt.verifyToken , transaction_controller.add_receipts);
  app.post("/api/fileupload/upload_receipts", file_upload_controller.upload_receipt);

  // -----
  // SEND EMAIL
  // -----
  app.post("/api/email/contact", mailer_controller.send_email);

  // -----
  // UPLOAD & ADD MEMBER PHOTO
  // -----
  app.put("/api/fileupload/upload_member_photo", file_upload_controller.upload_member_photo);
  app.post("/api/fileupload/add_member_photo", admin_usercontrol_controller.add_member_photo);

};
