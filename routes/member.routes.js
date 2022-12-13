const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller");
const member_controller = require("../controllers/member.auth.controller");
const news_controller = require("../controllers/news.controller")

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("api/member/get_news", authJwt.verifyToken, news_controller.get_all_news);

  

};
