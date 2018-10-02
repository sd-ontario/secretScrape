const Note = require("../models/note");
const Article = require("../models/article");
const mongoose = require("mongoose");

const request = require("request");
const cheerio = require("cheerio");

module.exports = function(app) {

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
            } else {
                console.log(doc);
            }
        });
        res.send("scrape complete");
        });
        });
    });
};

