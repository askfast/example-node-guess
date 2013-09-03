/**
 * Created with JetBrains WebStorm.
 * User: sven
 * Date: 2-9-13
 * Time: 20:10
 * To change this template use File | Settings | File Templates.
 */
var express = require('express'),
    agent = require('./routes/agent.js'),
    Bid = require('./lib/bid.js');

var bid = new Bid();

var app = express();

app.configure(function(){
    app.use(express.static(__dirname + '/public'));
    app.use(express.logger('dev'));
});

app.use('/agent', function(req, res, next){
    agent(bid, req, res, next);
});

app.get('/bids', function(req, res, next){

    bid.findAll(function(err, docs){
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(docs));
    });
});

app.get('/', function(req, res){
    res.sendfile(__dirname + '/public/index.html');
});

app.use(function(req, res, next) {
    res.sendfile(__dirname + req.url);
});

app.listen(3000);
console.log("Server running on port: 3000");