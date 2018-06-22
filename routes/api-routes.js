var db = require("../models");
var request = require("request");
var cheerio = require("cheerio");

module.exports = function (app) {
    // Routes
    app.get("/", function (req, res) {
        db.article.find({}, function(error, found) {
            // Show any errors
            if (error) {
              console.log(error);
            } else {
                article = {
                    data: found
                }
                // Otherwise, send the books we found to the browser as a json
                res.render("index", article);
            }
        });
    })
    
    app.get("/saved", function (req, res) {
        db.article.find({saved: true})
        .then(function(found) {
            console.log(found);
            
            article = {
                data: found
            }
            // Otherwise, send the books we found to the browser as a json
            res.render("saved", article);
        }).catch(function(err){
            console.log(err);
        });
    })
    // A GET route for scraping the echojs website
    app.get("/scrape", function (req, res) {
        // First, we grab the body of the html with request
        results=[];

        request("https://www.nytimes.com/", function (error, response, html) {
            //   // Then, we load that into cheerio and save it to $ for a shorthand selector
            var $ = cheerio.load(html);
            // console.log(html);
            //   // Now, we grab every h2 within an article tag, and do the following:
            $(".story").each(function (i, element) {
                // Save an empty result object
                
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
                    .then(function (result) {
                    // View the added result in the conso le
                        results.push(result);
                    })
                    .catch(function (err) {
                    // If an error occurred, send it to the client
                        console.log(err);
                    });
                }
            });        
            // If we were able to successfully scrape and save an Article, send a message to the client
            res.redirect("/"); //#####
        });
    });
    
    app.post("/api/saved", function(req, res) {
        console.log(req.body)
        db.article.update(
            { _id: req.body.id },
            { $set: { saved:true } },
          function (err, data) {
            res.json(data); //send to handlebars
            console.log("saved",data);
        });
    });

    app.delete("/api/delete/:id", function(req, res) {
        
        db.article.update(
            { _id: req.params.id },
            { $set: { saved: false } },
          function (err, data) {
            res.json(data);
            console.log("deleted",data);
        });
    });

    app.post("/api/articles/:id", function (req, res) {
        
        db.Note.create(req.body)
        .then(function(dbNote) {
            return db.article.findOneAndUpdate({ _id: req.params.id}, { $push: { note: dbNote._id}}, { new: true })
        }).then(function(dbUser) {
            // If the User was updated successfully, send it back to the client
            res.json(dbUser);
        })
        .catch(function(err) {
            // If an error occurs, send it back to the client
            res.json(err);
        });
    });

    app.get("/api/allnotes/:id", function (req, res) {
        db.article.find({_id: req.params.id}).populate("note")
        .then(function (dbArticle) {
            console.log("single", dbArticle[0].note)
            
            res.json(dbArticle[0].note);
        })
    })
};