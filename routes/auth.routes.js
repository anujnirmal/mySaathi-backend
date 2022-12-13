const { authJwt } = require("../middleware");
const refresh_token_controller = require("../controllers/refreshToken/refreshToken.controller");
const dashboard_auth_controller = require("../controllers/auth/dashboard.auth.controller");
const member_auth_controller = require("../controllers/auth/member.auth.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // -----
  // SIGNIN ROUTES FOR MEMBER AND ADMIN
  // -----
  app.post("/api/auth/admin/sign_in", dashboard_auth_controller.dashboard_sign_in); 
  app.post("/api/auth/member/sign_in", member_auth_controller.member_sign_in);
  
  // -----
  // LOGOUT ROUTES FOR MEMBER
  // -----
  app.post("/api/auth/member/log_out", authJwt.verifyToken, member_auth_controller.member_log_out); 
  app.post("/api/auth/member/log_out_all", authJwt.verifyToken, member_auth_controller.member_log_out_from_all_devices); 
  
  // -----
  // REFRESH TOKEN GENERATION FOR ADMIN AND MEMBER
  // -----
  app.post("/api/auth/dashboard_refresh_token", refresh_token_controller.dashboard_refreshToken); 
  app.post("/api/auth/member_refresh_token", refresh_token_controller.member_refreshToken); 

};

