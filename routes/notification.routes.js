const { verifySignUp } = require("../middleware");
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
  app.post("/api/notification/get_notification", notification_controller.get_notification);
  
  app.post("/api/notification/create_notifications", notification_controller.create_notification);
  // app.post("/api/notification/register_notification", notification_controller.get_all_notifications);
  // app.post("/api/notification/send_notification", notification_controller.get_all_notifications);
  
  // // Get all the news
  
  
  // // TODO: Add authentications to the routes below
  // // Create news
  // app.post("/api/notification/create_news", notification_controller.create_news);
  // // Update an existing news
  // app.put("/api/notification/update_news", notification_controller.update_news);
  // // delete one or many news
  // app.delete("/api/notification/delete_news", notification_controller.delete_news);

};
