const { verifySignUp, authJwt } = require("../middleware");
const notification_controller = require("../controllers/notification.controller");

module.exports = function(app) {

  // set header to be sent with every request
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });


  // Get notification for a specific user
  app.post("/api/notification/get_notification", authJwt.verifyToken , notification_controller.get_notification);
  app.post("/api/notification/cancel_notification", authJwt.verifyToken, notification_controller.cancel_notification);
  app.post("/api/notification/create_notifications", authJwt.verifyToken, notification_controller.create_notification);
  // app.post("/api/notification/register_notification", notification_controller.get_all_notifications);
  // app.post("/api/notification/send_notification", notification_controller.get_all_notifications);


};
