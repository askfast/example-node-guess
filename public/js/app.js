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
var magicNumber = 236;

$( document ).ready(function() {

    startTimerNoActvity();
    setSizes();
    //var screen = {'html':'<br>Raad eens hoeveel diamanten er in deze vaas zitten?','smile':'blink.png'};
    var screen = {'html':'<strong>Hey you,</strong><br />How many diamonds are there? Make your shot','smile':'enterance.png'};
    slideScreen(screen);

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
            if(doc.amount==null) {
                var screen = {'html':'<strong>Hey '+doc.name+',</strong><br />How many diamonds are there? Make your shot','smile':'happy.png'};
                //$("#container").html("Bericht van: "+doc.address+"<br>Hallo "+doc.name+", Wat is uw bod?");
                slideScreen(screen);
            } else {
                //$("#container").html("Bericht van: "+doc.address+"<br>Hallo "+doc.name+", Bedankt voor uw bod van: "+doc.amount);
                var screen = {'html':'<strong>'+doc.name+',</strong><br />Nope. Your guess is off the chart','smile':'duzyuz.png'};
                if(doc.amount==magicNumber) {
                    screen = {'html':'<strong>'+doc.name+',</strong><br />You are the winner, Sir!','smile':'winner.png'};
                } else if(doc.amount >= (magicNumber-15) || doc.amount <= (magicNumber+15)) {
                    screen = {'html':'<strong>Interesting '+doc.name+'</strong> How can you be that close?','smile':'close2.png'};
                }

                slideScreen(screen);

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

    startTimer = setTimeout(showStart, 2 * 60 * 1000); // Show start screen after 2 minutes
    console.log("Started start timer: "+startTimer);
}

function showStart() {
    var screen = {'html':'<br>Raad eens hoeveel diamanten er in deze vaas zitten?','smile':'blink.png'};
    slideScreen(screen);
}

function startTimerNoActvity() {

    if(noActivityTimer!=null) {
        console.log("Stop timer with id: "+noActivityTimer);
        clearInterval(noActivityTimer);
    }

    noActivityTimer = setTimeout(showNoActivity, 10 * 60 * 1000); // Show start screen after 10 minutes
    console.log("Started no activity timer: "+noActivityTimer);
}

function showNoActivity() {
    console.log("No activity");
    var screen = {'html':'<strong>Why do not you play with me guys?</strong>','smile':'noactivity.png'};
    slideScreen(screen);
    //$("#container").html("Vinden jullie mij niet leuk????");
}

/*
var screens = [];
screens.push({'html':'<strong>Player Name,</strong><br />Thanks for playing.','smile':'blink.png'});  // Make a guess name
screens.push({'html':'<strong>Interesting</strong> How can you be that close?','smile':'close2.png'}); // Close1
screens.push({'html':'<strong>Player Name,</strong><br />You already made a guess, Sir.','smile':'dil.png'});  // Not used
screens.push({'html':'<strong>Player Name,</strong><br />Nope. Your guess is off the chart','smile':'duzyuz.png'}); // off 1
screens.push({'html':'<strong>Hey you,</strong><br />How many diamonds are there? Make your shot','smile':'enterance.png'}); // Start
screens.push({'html':'<strong>Hey you,</strong><br />How many diamonds are there? Make your shot','smile':'happy.png'});
screens.push({'html':'<strong>Hahaha Marteen,</strong><br />Do you need glasses?','smile':'happy2.png'});  // Off 2
screens.push({'html':'<strong>Why do not you play with me guys?</strong>','smile':'noactivity.png'}); //NoActivity
screens.push({'html':'<strong>Marteen,</strong><br />It is really close.','smile':'sasirmis.png'}); // close 2
screens.push({'html':'<strong>Marteen,</strong><br />You are the winner, Sir!','smile':'winner.png'}); //winner
*/


function slideScreen(screen) {

    $('#speech-bubble').removeClass().addClass('fadeOutRightBig animated');
    $('#smile').removeClass().addClass('fadeOutLeftBig animated');

    var wait = window.setTimeout( function(){
        $('#speech-bubble').html(screen.html);
        $('#smile img').attr('src','img/smiles/'+screen.smile).ready(function() {
            $('#speech-bubble').removeClass().addClass('fadeInRightBig animated');
            $('#smile').removeClass().addClass('fadeInLeftBig animated');
        });
    },1300);
}

function setSizes() {
    var pageWidth = $('body').width();
    var pageHeight = getPageHeight();

    var speechWidth = pageWidth*0.4;
    var speechHeight = speechWidth*(5/6);

    if(speechHeight>pageHeight*0.4) {
        speechHeight = pageHeight*0.4;
        speechWidth = speechHeight*1.2;
    }

    var paddingH = speechWidth*0.2;
    var paddingVTop = speechHeight*0.2;
    var paddingVBottom = speechHeight*0.2;

    speechWidth = speechWidth;
    speechHeight = speechHeight;

    var speechMargin = pageWidth*0.4;

    $('#speech-bubble').css({
        width:speechWidth+'px',
        height:speechHeight+'px',
        paddingTop:paddingVTop+'px',
        paddingBottom:paddingVBottom+'px',
        paddingLeft:paddingH+'px',
        paddingRight:paddingH+'px',
        marginLeft:speechMargin+'px'
    });

    var smileHeight = pageHeight-(speechHeight+paddingVTop+paddingVBottom)-10;
    var smileWidth = smileHeight/0.75;

    var smileMargin = (pageWidth-smileWidth)/3;


    $('#smile').css({marginLeft:smileMargin,width:smileWidth});
    $('#smile img').css({height:smileHeight});
}

function getPageHeight()
{
    var windowHeight=0;
    if (self.innerHeight)
    {
        windowHeight = self.innerHeight;
    }
    else if (document.documentElement && document.documentElement.clientHeight)
    {
        windowHeight = document.documentElement.clientHeight;
    }
    else if (document.body)
    {
        windowHeight = document.body.clientHeight;
    }
    return windowHeight;
}

function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}