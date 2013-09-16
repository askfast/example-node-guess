var cradle = require('cradle');
var couchHost = '';
var username = '';
var password = '';

var Bid = function() {
    this.connection = new (cradle.Connection)(couchHost, 5984,
        {auth: { username: username, password: password }, cache: true, raw: false});
    this.db = this.connection.database('guess');

    var thiz = this;
    this.db.destroy(function(err, res){

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

Bid.prototype.create = function(address, medium, name, amount, callback) {
    var bid = {address: address, name: name, time: new Date().getTime()};
    if(amount!=null)
        bid.amount = amount;
    this.save(medium+"_"+address,bid, callback);
}

Bid.prototype.update = function(address, medium, amount, callback) {
    var thiz=this;
    this.findByAddress(medium+"_"+address, function(err, bid){
        if(err){
            callback(err);
        } else {
            bid.amount = amount;
            bid.time = new Date().getTime();
            thiz.save(bid._id, bid, callback);
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

Bid.prototype.save = function(id, bid, callback){
    this.db.save(id, bid, function(err, res){
       if(err) {
           callback(err);
       } else {
           callback(null, res);
       }
    });
}

module.exports = Bid;