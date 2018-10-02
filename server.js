const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const path = require("path");
const request = require("request");
const cheerio = require("cheerio");

const Article = require("./models/article");
const Note = require("./models/note");



const PORT = process.env.PORT || 8080

const app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());

app.use(express.static("public"));

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoScraper";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);



/* Routes Start Here
************************************/




app.get("/scrape", function(req, res) {

    request("https://www.nytimes.com/", function(err, res, html) {

    const $ = cheerio.load(html);

    $("article").each(function(i, element) {

        let result = {};

        result.title = $(element).find("h2").text();
        result.link = $(element).find("a"). attr("href");

    function fillSummary(){

        let s1 = $(element).find("li").text();
        let s2 = $(element).find("p").text();
        let s3 = "No summary available, click the title to read the article";

        if(s1 == '' && s2 == ''){
            return s3;
        }else if(s1 == '' && s2 !== ''){
            return s2;
        }else{
            return s1;
        };
    };

        result.summary = fillSummary();

        let entry = new Article(result);

        entry.save(function(err, doc) {
            if(err) {
                console.log(err);
            }else{
                console.log(doc);
            };

        });

    
    });
  
    });
});


//GET all articles
app.get("/articles", function(req,res){
    Article.find({}).then(function(dbarticle){
        res.json(dbarticle);
    }).catch(function(err){
        res.json(err);
    });
});


//GET one article by id
app.get("/articles/:id", function(req, res) {
    Article.findOne({_id: req.params.id})
    .populate("note")
    .then(function(dbarticle){
        res.json(dbarticle);
    }).catch(function(err){
        res.json(err);
    });
});


//POST a new note on an article
app.post("/articles/:id", function(req, res) {
    Node.create(req.body)
    .then(function(dbnote){
        return Article.findOneAndUpdate({_id: req.params.id}, {note: dbnote._id}, {new:true});
    }).then(function(dbarticle) {
        res.json(dbarticle)
    }).catch(function(err) {
        res.json(err);
    })
})








/*Routes end here*****************
*********************************/








app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});



