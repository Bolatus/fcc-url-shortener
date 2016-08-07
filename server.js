
var validUrl = require('valid-url');
const http = require('http');
var url = require("url");
var mongo = require("mongodb").MongoClient;

const port = 8080;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  var rrr = url.parse(req.url,true);
  if (rrr.path && rrr.path.length>1 && validUrl.isUri(rrr.path.substring(1))){
      // Connect to the db
      mongo.connect("mongodb://user1:123@ds029665.mlab.com:29665/fcc-url-shortener-db", function(err, db) {
        if(!err) {
          console.log("We are connected");
        }
        var collection = db.collection('shortenedUrls');
        var randomNum = Math.floor(Math.random() * 10000) + 10000;  
        collection.insert( { orig: rrr.path.substring(1), shrt: randomNum } );
        console.log("New url inserted.");
        db.close();
         res.end(JSON.stringify({
            originalUrl: rrr.path.substring(1),
            shortVersion: 'https://fcc-url-shortener.herokuapp.com/'+randomNum
         }));
      });

     
  } else 
  if ( rrr.path && rrr.path.length==6 && !isNaN(rrr.path.substring(1))   ){
      console.log("Looking for original url");
                mongo.connect("mongodb://user1:123@ds029665.mlab.com:29665/fcc-url-shortener-db", function(err, db) {
                  if(!err) {
                    console.log("We are connected");
                  }
                  var collection = db.collection('shortenedUrls');
                  collection.findOne(
                    {shrt: parseInt(rrr.path.substring(1))}, 

                    function(err, result) {
                      if (err) { 
                        console.log("Original url NOT found.");
                        db.close();
                        res.end('Not valid url! ');
                      }

                      if (result && result.orig) {
                        console.log("Original url found.");
                        db.close();
                        res.writeHead(302, {
                          'Location': result.orig
                          //add other headers here...
                        });
                        res.end();
                      } else {
                        console.log("Original url NOT found.");
                        db.close();
                        res.end('Not valid url! ');
                      }
                  });
            });
  } else {
    res.end('Not valid url! ');
  }

  
});

server.listen(process.env.PORT);