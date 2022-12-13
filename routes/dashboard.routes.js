const { authJwt } = require("../middleware");
const controller = require("../controllers/admin.usercontrol.controller");
const news_controller = require("../controllers/news.controller");
const notification_controller = require("../controllers/notification.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });


  // TODO: Make a route to get all the users
  // -----
  // CRUD FOR DASHBOARD USERS
  // -----
  app.post("/api/admin/create_dashboard_user", controller.create_dashboard_user);
  app.put("/api/admin/update_dashboard_password", [authJwt.verifyToken, authJwt.isAdmin], controller.update_dashboard_password);
  app.delete("/api/admin/delete_dashboard_user", controller.delete_dashboard_user);

  // TODO: Make a route to get all the members
  // -----
  // CRUD FOR MEMBERS
  // -----
  app.post("/api/admin/create_member", authJwt.verifyToken, controller.create_member);
  app.put("/api/admin/update_member", controller.update_dashboard_password);
  app.delete("/api/admin/delete_member", controller.delete_dashboard_user);

  // -----
  // NEWS
  // -----
  app.post("/api/news/create_news", authJwt.verifyToken, news_controller.create_news);
  app.put("/api/news/update_news", authJwt.verifyToken, news_controller.update_news);
  app.delete("/api/news/delete_news", authJwt.verifyToken, news_controller.delete_news);

  // -----
  // NOTIFICATIONS
  // -----
  app.post("/api/notification/get_notification", authJwt.verifyToken , notification_controller.get_notification);
  app.post("/api/notification/cancel_notification", authJwt.verifyToken, notification_controller.cancel_notification);
  app.post("/api/notification/create_notifications", authJwt.verifyToken, notification_controller.create_notification);

  // -----
  // NOTIFICATION
  // -----
  app.post("/api/notification/create_notifications", authJwt.verifyToken, notification_controller.create_notification);

};

