var AskFast = require("askfast"),
    url = require('url');

var Agent = function(bid, req, res, next) {
    // Create a new instance of the AskFast object.
    var askfast = new AskFast(req);
    var query = url.parse(req.url,true).query;

    var responder = query.responder;
    if(query.function=="name") {
        var result = askfast.getResult();
        var name = "test";
        if(result.answer_text!=null) {
            name = result.answer_text;
        }
        return bid.create(responder, name, function(err, result) {

            askfast.ask("Geef een aantal op dat u denkt dat in de vaas zit?","?function=bid&responder="+responder);

            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(askfast.finalize());
        });
    } else if(query.function=="bid") {
        var result = askfast.getResult();
        var amount = 0;
        if(result.answer_text!=null) {
            if(isNaN(result.answer_text)) {
                askfast.ask("U heeft een ongeldig aantal gegeven. Geef een getal tussen 1 en 100 000.","?function=bid&responder="+responder);
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(askfast.finalize());
                return;
            } else {
                amount = result.answer_text;
            }
        }
        return bid.update(responder, amount, function(err, result) {

            if(!err) {
                askfast.say("Bedankt voor uw gok!");
            } else {
                askfast.ask("Er is iets misgegaan geef nogmaals het aantal op dat u denkt dat in de vaas zit?","?function=bid&responder="+responder);
            }
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(askfast.finalize());
        });
    } else {
        return bid.findByAddress(responder, function(err, doc){
            if(err && err.error=='not_found') {
                askfast.ask("Wat leuk dat u mee doet met het raadspel. Wat is uw naam?","?function=name&responder="+responder);
            } else {
                if(doc.amount) {
                    askfast.say("U heeft al reeds een bod geplaatst?");
                } else {
                    askfast.ask("Wat leuk dat u mee doet met het raadspel. Wat is uw naam?","?function=name&responder="+responder);
                }
            }
            // Render out the JSON for AskFast to consume.
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(askfast.finalize());
        });
    }

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(askfast.finalize());
}

module.exports = Agent;
