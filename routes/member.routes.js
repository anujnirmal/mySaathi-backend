const { authJwt } = require("../middleware");
const news_controller = require("../controllers/news/news.controller");
const notification_controller = require("../controllers/notification/notification.controller");
const transaction_controller = require("../controllers/transactions/transaction.controller");

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
  // NOTIFICATION
  // -----
  app.post("/api/notification/get_notification", notification_controller.get_notification);
  app.post("/api/notification/cancel_notification", authJwt.verifyToken, notification_controller.cancel_notification);
  app.post("/api/notification/add_fcm_token", notification_controller.add_fcm_token);


  // -----
  // EDUCATION MODULE
  // -----
  // TODO: add authentication
  app.post("/api/education/add_receipts", transaction_controller.add_receipts);

};
