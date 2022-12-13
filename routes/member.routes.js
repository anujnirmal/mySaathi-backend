const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller");
const member_controller = require("../controllers/member.auth.controller");
const news_controller = require("../controllers/news.controller");
const notification_controller = require("../controllers/notification.controller");

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
  app.get("/api/news/get_all_news", authJwt.verifyToken, news_controller.get_all_news);

  // -----
  // NOTIFICATION
  // -----
  app.post("/api/notification/get_notification", authJwt.verifyToken , notification_controller.get_notification);
  app.post("/api/notification/cancel_notification", authJwt.verifyToken, notification_controller.cancel_notification);

};
