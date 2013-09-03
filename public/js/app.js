/**
 * Created with JetBrains WebStorm.
 * User: sven
 * Date: 3-9-13
 * Time: 15:38
 * To change this template use File | Settings | File Templates.
 */

PouchDB.destroy('guess');
var db = new PouchDB('guess');
var startTimer = null;
var noActivityTimer = null;
var couchHost = '';
var username = '';
var password = '';

$( document ).ready(function() {

    startTimerNoActvity();

    var filter= function(doc){
        //console.log(doc);
        if(doc.address) {
            return doc;
        } else
            console.log("Filter: "+doc._id);
    }

    db.replicate.from("http://"+username+":"+password+"@"+couchHost+":5984/guess", {
        continuous: true,
        filter: filter,
        onChange: function(change) { /*console.log("Change: ",change);*/ },
        complete: function(err, response) { console.log("Complete!"); }});

    db.changes({continuous: true,
        onChange: function(change) { loadChange(change.id); } } );

});

function loadChange(id) {
    db.get(id, function(err, doc){
        if(doc.address) {
            console.log("Change: ",doc);
            if(doc.amount==null) {
                $("#container").html("Bericht van: "+doc.address+"<br>Hallo "+doc.name+", Wat is uw bod?");
            } else {
                $("#container").html("Bericht van: "+doc.address+"<br>Hallo "+doc.name+", Bedankt voor uw bod van: "+doc.amount);
                startTimerStart();
                startTimerNoActvity();
            }
        }
    })
}

function startTimerStart() {

    if(startTimer!=null) {
        console.log("Stop timer with id: "+startTimer);
        clearInterval(startTimer);
    }

    startTimer = setInterval(showStart, 2 * 60 * 1000); // Show start screen after 2 minutes
    console.log("Started start timer: "+startTimer);
}

function showStart() {
    $("#container").html("Raad eens hoeveel diamanten er in deze vaas zitten?");
}

function startTimerNoActvity() {

    if(noActivityTimer!=null) {
        console.log("Stop timer with id: "+noActivityTimer);
        clearInterval(noActivityTimer);
    }

    noActivityTimer = setInterval(showNoActivity, 10 * 60 * 1000); // Show start screen after 2 minutes
    console.log("Started no activity timer: "+noActivityTimer);
}

function showNoActivity() {
    $("#container").html("Vinden jullie mij niet leuk????");
}