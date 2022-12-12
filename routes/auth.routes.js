const { verifySignUp } = require("../middleware");
const controller = require("../controllers/admin.usercontrol.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });


  // CRUD for Dashboard users
  app.post("/api/admin/create_dashboard_user", controller.create_dashboard_user);
  app.put("/api/admin/update_dashboard_password", controller.update_dashboard_password);
  app.delete("/api/admin/delete_dashboard_user", controller.delete_dashboard_user);

  // Crud for members
  app.post("/api/admin/create_member", controller.create_member);
  app.put("/api/admin/update_member", controller.update_dashboard_password);
  app.delete("/api/admin/delete_member", controller.delete_dashboard_user);
  
  // app.post("/api/auth/admin/dashboard_sign_in", controller.dashboard_sign_in);
  // app.post("/api/auth/admin/refreshtoken", controller.refreshToken);


};

