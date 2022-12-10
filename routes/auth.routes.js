const { verifySignUp } = require("../middleware");
const controller = require("../controllers/dashboard.auth.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Dashbord Auth routes
  app.post("/api/auth/admin/create_dashboard_user", controller.create_dashboard_user);
  app.put("/api/auth/admin/update_dashboard_password", controller.update_dashboard_password);
  app.delete("/api/auth/admin/delete_dashboard_user", controller.delete_dashboard_user);

  
  app.post("/api/auth/admin/dashboard_sign_in", controller.dashboard_sign_in);
  app.post("/api/auth/admin/refreshtoken", controller.refreshToken);

  // Member Auth Routes
  // app.post("/api/auth/admin/create_user", 
  //   [verifySignUp.checkDuplicateUsernameOrEmail, 
  //     verifySignUp.checkRolesExisted
  //   ], 
  //   controller.signup);

};

   // [
    //   verifySignUp.checkDuplicateUsernameOrEmail,
    //   verifySignUp.checkRolesExisted
    // ],
