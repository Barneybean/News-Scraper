var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var cheerio = require("cheerio");
var request = require("request");
// Require all models
var db = require("./models");

var PORT = 8080;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// By default mongoose uses callbacks for async queries, we're setting it to use promises (.then syntax) instead
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/newscraper", {
  useMongoClient: true
});

// Routes
app.get("/", function (req, res) {
  db.article.find({}).then( function (err, result) {
    if (err) {
      res.render("index", err);
    } else {
      res.render("index", result);
    };
  })
})

// A GET route for scraping the echojs website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("https://www.nytimes.com/", function(error, response, html) {
  //   // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // console.log(html);
  //   // Now, we grab every h2 within an article tag, and do the following:
    $(".story").each(function(i, element) {
      // Save an empty result object
      
        var results = [];

        var title = $(element).children("h2").text().trim();
        var link = $(element).children("h2").find("a").attr("href");
        // var summary = $(element).children().find("p.summary").text();
        // console.log(summary);

        if (title && link) {
          // console.log("here");
          db.article.create({
            title: title,
            link: link
          })
          .then(function(result) {
          // View the added result in the conso le
            console.log(result);
          })
          .catch(function(err) {
            // If an error occurred, send it to the client
            console.log(err);
          });
        } 
    });

    // If we were able to successfully scrape and save an Article, send a message to the client
    res.json({message: "Scrape Complete"});
  });
});
// Route for getting all Articles from the db
// app.get("/articles", function(req, res) {
 
// });

// // Route for grabbing a specific Article by id, populate it with it's note
// app.get("/articles/:id", function(req, res) {
 
// });

// // Route for saving/updating an Article's associated Note
// app.post("/articles/:id", function(req, res) {
 


// });

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
})
