var AskFast = require("askfast"),
    url = require('url'),
    host = null,
    path = "agent";

var Agent = function(bid, req, res, next) {
    // Create a new instance of the AskFast object.
    var askfast = new AskFast(req);
    if(host!=null)
        askfast.url = host;
    var query = url.parse(req.url,true).query;

    var responder = query.responder;
    var prefMedium = query.preferred_medium;
    var medium = query.medium;
    if(medium ==null && prefMedium=="audio/wav")
        medium="phone";
    if(query.function=="name") {
        return askfast.getResult().receive(function(answer) {
            var name = "test";
            if(answer!=null && answer.answer_text!=null) {
                name = answer.answer_text;
                return bid.create(responder, medium, name, null, function(err, result) {

                    askfast.ask(answer.answer_text+" geef het aantal driehoeken op dat u denkt dat er op het scherm staan?",path+"?function=bid&responder="+responder+"&medium="+medium);

                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(askfast.finalize());
                });
            } else {
                askfast.ask("Wat leuk dat u mee doet met het raadspel. Wat is uw naam?",path+"?function=name&responder="+responder+"&medium="+medium);
            }
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(askfast.finalize());
        });
    } else if(query.function=="bid") {
        var amount = 0;
        return askfast.getResult().receive(function(answer) {
            if(prefMedium!=null && prefMedium=="audio/wav") {
                if(answer!=null && answer.answer_text!=null) {
                    if(isNaN(answer.answer_text) || parseInt(answer.answer_text)<=0) {
                        console.log("Amount NaN?", answer.answer_text);
                        askfast.ask("/audio/invalid_new.wav",path+"?function=bid&responder="+responder+"&medium="+medium+"&preferred_medium=audio/wav");
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.end(askfast.finalize());
                        return;
                    } else {
                        amount = parseInt(answer.answer_text);
                    }
                } else {
                    askfast.ask("/audio/invalid_new.wav",path+"?function=bid&responder="+responder+"&medium="+medium+"&preferred_medium=audio/wav");
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(askfast.finalize());
                    return;
                }
                return bid.update(responder, medium, amount, function(err, result) {

                    if(!err) {
                        askfast.say("/audio/bedankt_new.wav");
                    } else {
                        askfast.ask("/audio/start_new.wav",path+"?function=bid&responder="+responder+"&medium="+medium+"&preferred_medium=audio/wav");
                    }
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(askfast.finalize());
                });
            } else {
                if(answer!=null && answer.answer_text!=null) {
                    if(isNaN(answer.answer_text) || parseInt(answer.answer_text)<=0) {
                        console.log("Amount NaN?", answer.answer_text);
                        askfast.ask("U heeft een ongeldig aantal gegeven. Geef een getal tussen 1 en 100 000.",path+"?function=bid&responder="+responder+"&medium="+medium);
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.end(askfast.finalize());
                        return;
                    } else {
                        amount = parseInt(answer.answer_text);
                    }
                } else {
                    askfast.ask("U heeft een ongeldig aantal gegeven. Geef een getal tussen 1 en 100 000.",path+"?function=bid&responder="+responder+"&medium="+medium);
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(askfast.finalize());
                    return;
                }
                return bid.update(responder, medium, amount, function(err, result) {

                    if(!err) {
                        askfast.say("Bedankt voor uw gok!");
                    } else {
                        askfast.ask("Er is iets misgegaan geef nogmaals het aantal op dat u denkt dat in de vaas zit?",path+"?function=bid&responder="+responder+"&medium="+medium);
                    }
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(askfast.finalize());
                });
            }
        });
    } else {
        return bid.findByAddress(medium+"_"+responder, function(err, doc){
            if(prefMedium!=null && prefMedium=="audio/wav") {
                if(err && err.error=='not_found') {
                    return bid.create(responder, medium, responder.substring(0,responder.length-2)+'**', null, function(err, result) {
                        askfast.ask("audio/start_new.wav",path+"?function=bid&responder="+responder+"&medium="+medium+"&preferred_medium=audio/wav");
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.end(askfast.finalize());
                    });
                } else {
                    if(doc.amount) {
                        askfast.say("/audio/retry_new.wav");
                    } else {
                        askfast.ask("audio/start_new.wav",path+"?function=bid&responder="+responder+"&medium="+medium+"&preferred_medium=audio/wav");
                    }
                }
            } else {
                if(err && err.error=='not_found') {
                    askfast.ask("Wat leuk dat u mee doet met het raadspel. Wat is uw naam?",path+"?function=name&responder="+responder+"&medium="+medium);
                } else {
                    if(doc.amount) {
                        askfast.say("U heeft al reeds een bod geplaatst?");
                    } else {
                        askfast.ask("Wat leuk dat u mee doet met het raadspel. Wat is uw naam?",path+"?function=name&responder="+responder+"&medium="+medium+"&medium="+medium);
                    }
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
