var client = require('http-api-client');
var d3 = require("d3");
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("data.sqlite");


var formatTime = d3.timeFormat("%Y-%m-%d");

var dateTime = "2018-01-01"	

//db.each("SELECT dateModified FROM data ORDER BY dateModified DESC LIMIT 1", function(err, timeStart) {


//})
db.serialize(function() {
    db.run("SELECT dateModified FROM data ORDER BY dateModified DESC LIMIT 10");
	//db.run("DELETE from data WHERE date(dateModified)<date('"+dateTime+"') ");
})
db.close();
