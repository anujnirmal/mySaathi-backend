const { authJwt } = require("../middleware");
const controller = require("../controllers/userControl/admin.usercontrol.controller");
const news_controller = require("../controllers/news/news.controller");
const notification_controller = require("../controllers/notification/notification.controller");
const transaction_controller = require("../controllers/transactions/transaction.controller");
const member_onboarding_controller = require("../controllers/memberOnboarding/member.onboarding.controller");
const file_upload_controller = require("../controllers/fileUpload/file.upload.controller");
const analytics_controller = require("../controllers/analytics/analytics.controller");

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
  // Super admin routes
  app.post("/api/admin/get_all_dashboard_users",[authJwt.verifyToken, authJwt.isSuperAdmin], controller.get_all_dashboard_users);
  app.post("/api/admin/create_dashboard_user", controller.create_dashboard_user);
  app.put("/api/admin/update_dashboard_password", [authJwt.verifyToken, authJwt.isSuperAdmin], controller.update_dashboard_password);
  app.put("/api/admin/update_dashboard_user_detail", [authJwt.verifyToken, authJwt.isSuperAdmin], controller.update_dashboard_user_detail);
  app.delete("/api/admin/delete_dashboard_user", [authJwt.verifyToken, authJwt.isSuperAdmin], controller.delete_dashboard_user);
  app.post("/api/admin/seed_user_from_google_sheet", member_onboarding_controller.onboard_member_google_sheet);
 

  // TODO: Make a route to get all the members
  // -----
  // CRUD FOR MEMBERS : Beneficiary - on admin dashboard
  // -----
  app.post("/api/admin/get_all_members", authJwt.verifyToken, controller.get_all_members);
  app.post("/api/admin/get_all_deleted_members", authJwt.verifyToken, controller.get_all_deleted_members);
  app.post("/api/admin/create_member", authJwt.verifyToken, controller.create_member);
  app.put("/api/admin/update_member", authJwt.verifyToken, controller.update_member);
  app.put("/api/admin/updat_member_password", authJwt.verifyToken, controller.update_member_password);
  app.delete("/api/admin/delete_members", authJwt.verifyToken, controller.delete_members);
  app.delete("/api/admin/delete_child", authJwt.verifyToken, controller.delete_child);
  app.post("/api/admin/restore_members", authJwt.verifyToken, controller.restore_members);
  // TODO: endpoints for updating and change the rest verbs
  // app.put("/api/admin/update_member", controller.update_dashboard_password);
  // app.delete("/api/admin/delete_member", controller.delete_dashboard_user);

  // -----
  // NEWS
  // -----
  app.post("/api/news/get_all_news", news_controller.get_all_news);
  app.post("/api/news/get_news_by_language", news_controller.get_news_by_language);
  app.post("/api/news/create_news", authJwt.verifyToken, news_controller.create_news);
  app.post("/api/news/upload_featured_image", file_upload_controller.upload_featured_image);
  app.put("/api/news/update_news", authJwt.verifyToken, news_controller.update_news);
  app.delete("/api/news/delete_news", authJwt.verifyToken, news_controller.delete_news);

  // -----
  // NOTIFICATIONS
  // -----
  app.post("/api/notification/get_notification", authJwt.verifyToken , notification_controller.get_notification);
  app.post("/api/notification/cancel_notification", authJwt.verifyToken, notification_controller.cancel_notification);
  app.post("/api/notification/create_notifications", notification_controller.create_notification);
  app.post("/api/notification/create_notifications", authJwt.verifyToken, notification_controller.create_notification);
 

  // -----
  // TRANSACTIONS
  // -----
  // TODO: Add the middleware for authentication later  
  app.post("/api/transactions/create_transaction", authJwt.verifyToken, transaction_controller.create_member_transaction);
  app.post("/api/transactions/get_transactions", authJwt.verifyToken ,transaction_controller.get_transaction_data_by_member_id);
  app.post("/api/transactions/get_all_pending_transactions", transaction_controller.get_all_pending_transaction);
  app.put("/api/transactions/accept_pending_transaction", transaction_controller.accept_transaction);
  app.put("/api/transactions/reject_pending_transaction", transaction_controller.reject_transaction);

  // -----
  // FILE UPLOAD
  // -----
  app.post("/api/fileupload/featured_image", file_upload_controller.upload_featured_image);
  app.post("/api/notification/upload_notification_image",  file_upload_controller.upload_notification_image);
  app.post("/api/fileupload/upload_member_photo",  file_upload_controller.upload_member_photo);

  // -----
  // ANALYTICS
  // -----
  app.post("/api/analytics/get_all_analytics", authJwt.verifyToken, analytics_controller.get_analytics);
};

