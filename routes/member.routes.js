const { authJwt } = require("../middleware");
const news_controller = require("../controllers/news/news.controller");
const notification_controller = require("../controllers/notification/notification.controller");
const transaction_controller = require("../controllers/transactions/transaction.controller");
const member_auth_controller = require("../controllers/auth/member.auth.controller");
const member_language_controller = require("../controllers/language/member.language.controller");

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
  // app.get("/api/news/get_all_news", authJwt.verifyToken, news_controller.get_all_news);

  // -----
  // LOGIN
  // -----
  app.post("/api/member/auth/check_mobile_number", member_auth_controller.member_login_check_mobile_number);
  app.post("/api/member/auth/login", member_auth_controller.member_login_or_create_password);

  // -----
  // LANGUAGE
  // -----
  app.post("/api/member/language/update", member_language_controller.update_member_language);

  // -----
  // NOTIFICATION
  // -----
  app.post("/api/notification/get_notification", authJwt.verifyToken, notification_controller.get_notification);
  app.post("/api/notification/cancel_notification", authJwt.verifyToken, notification_controller.cancel_notification);
  app.post("/api/notification/add_fcm_token", authJwt.verifyToken, notification_controller.add_fcm_token);


  // -----
  // EDUCATION MODULE
  // -----
  // TODO: add authentication
  app.post("/api/education/add_receipts", transaction_controller.add_receipts);

};
