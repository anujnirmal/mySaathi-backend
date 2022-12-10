const { verifySignUp } = require("../middleware");
const news_controller = require("../controllers/news.controller");

module.exports = function(app) {

  // set header to be sent with every request
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Get all the news
  app.get("/api/news/get_all_news", news_controller.get_all_news);
  
  // TODO: Add authentications to the routes below
  // Create news
  app.post("/api/news/create_news", news_controller.create_news);
  // Update an existing news
  app.put("/api/news/update_news", news_controller.update_news);
  // delete one or many news
  app.delete("/api/news/delete_news", news_controller.delete_news);

};
