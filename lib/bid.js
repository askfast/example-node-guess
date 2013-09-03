var cradle = require('cradle');
var couchHost = '';
var username = '';
var password = '';

var Bid = function() {
    this.connection = new (cradle.Connection)(couchHost, 5984,
        {auth: { username: username, password: password }, cache: true, raw: false});
    this.db = this.connection.database('guess');

    var thiz = this;
    this.db.destroy(function(){
        thiz.db.create(function(err, res){
            createViews();
        });
    });

    function createViews() {
        thiz.db.save('_design/bid', {
            all: {
                map: function (doc) {
                    if (doc.address) emit(doc.address, doc);
                }
            }
        });
    }
}

Bid.prototype.findAll = function(callback) {
    this.db.view('bid/all', function(err, res){
        if( err ){
            callback(err)
        }else{
            var docs = [];
            res.forEach(function (row){
                docs.push(row);
            });

            callback(null, docs);
        }
    });
}

Bid.prototype.create = function(address, name, callback) {
    var bid = {address: address, name: name, time: new Date().getTime()};
    this.save(bid, callback);
}

Bid.prototype.update = function(address, amount, callback) {
    var thiz=this;
    this.findByAddress(address, function(err, bid){
        if(err){
            callback(err);
        } else {
            bid.amount = amount;
            bid.time = new Date().getTime();
            thiz.save(bid, callback);
        }
    });
}

Bid.prototype.findByAddress = function(address, callback) {
    this.db.get(address, function(err, res){
        if(err) {
            callback(err);
        } else {
            callback(null, res);
        }
    })
}

Bid.prototype.save = function(bid, callback){
    this.db.save(bid.address, bid, function(err, res){
       if(err) {
           callback(err);
       } else {
           callback(null, res);
       }
    });
}

module.exports = Bid;