var client = require('http-api-client');
var d3 = require("d3");
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("data.sqlite");


var formatTime = d3.timeFormat("%Y-%m-%d");


//db.each("SELECT dateModified FROM data ORDER BY dateModified DESC LIMIT 1", function(err, timeStart) {
var start =  "2017-11-04T01:20:36.384290+02:00"
//var start = timeStart.dateModified
//var end  = formatTime(new Date());
var end  = "2017-12-04"
console.log("старт full: "+start); 


console.log("старт: "+start.replace(/T.*/, "") +"конец: "+end); 

function piv(){  
//p++;
client.request({url: 'https://public.api.openprocurement.org/api/2.3/contracts?offset='+start})
      .then(function (data) {
		var dataset = data.getJSON().data;
		start = data.getJSON().next_page.offset;			
		console.log(start)
		return dataset;
	})	
	.then(function (dataset) {			
		dataset.forEach(function(item) {
		client.request({url: 'https://public.api.openprocurement.org/api/2.3/contracts/'+item.id})
		.then(function (data) {	

	//var change = data.getJSON().data.changes[data.getJSON().data.changes.length-1].rationaleTypes[0];
	var changeLength = data.getJSON().data.changes.length;
	
	//if(change=="itemPriceVariation"){		
		var up=0;var down=0;
		for (var p = 0; p < changeLength; p++) {
		if(data.getJSON().data.changes[p].rationaleTypes[0]=="itemPriceVariation"){
			up=up+1;
		}
		if(data.getJSON().data.changes[p].rationaleTypes[0]=="priceReduction"){
			down=down+1;
		}
		}

	if(up>0){
	
		var upDates="";var downDate="";
		for (var p = 0; p < changeLength; p++) {
		if(data.getJSON().data.changes[p].rationaleTypes[0]=="itemPriceVariation"){
			upDates = upDates+data.getJSON().data.changes[p].dateSigned+";"
		}
		if(data.getJSON().data.changes[p].rationaleTypes[0]=="priceReduction"){
			downDate = downDate+data.getJSON().data.changes[p].dateSigned+";"
		}	
		}
			
//console.log(changeLength+"-"+upDate);
	
	if(data.getJSON().data.changes[0].rationaleTypes[0]=="itemPriceVariation")
		{
			var first = data.getJSON().data.changes[0].dateSigned;
		}
 	
	var tender_id = data.getJSON().data.tender_id;
	var id = data.getJSON().data.id;		
	var lotIdContracts = data.getJSON().data.items[0].relatedLot;
	var dateSigned = data.getJSON().data.dateSigned;
	var amount = data.getJSON().data.value.amount;	
	var region = data.getJSON().data.procuringEntity.address.region;	
	var suppliers = data.getJSON().data.suppliers[0].name;	
	
	
	
		//////////save//////////////
		client.request({url: 'https://public.api.openprocurement.org/api/2.3/tenders/'+data.getJSON().data.tender_id})
		.then(function (data) {
		var startAmount;
		if(data.getJSON().data.lots==undefined){
			startAmount = data.getJSON().data.value.amount;
		}
		else {
		for (var i = 1; i <= data.getJSON().data.lots.length; i++) {
				if(lotIdContracts==data.getJSON().data.lots[data.getJSON().data.lots.length-(i)].id){
				startAmount =  data.getJSON().data.lots[data.getJSON().data.lots.length-(i)].value.amount
				};			
			}
		}
		var save=Math.round((startAmount-amount)/startAmount*100);
		var numberOfBids;
		if(isNaN(data.getJSON().data.numberOfBids)){numberOfBids = 1}
		else {numberOfBids=data.getJSON().data.numberOfBids};
		
		
		
		//////////SQLite//////////////
	db.serialize(function() {	
	db.run("CREATE TABLE IF NOT EXISTS data (dateModified TEXT,id TEXT,dateSigned TEXT,first TEXT,tenderID TEXT,suppliers TEXT,procuringEntity TEXT,numberOfBids INT,startAmount INT,amount INT,save INT,cpv TEXT,region TEXT,up INT,down INT,downDate TEXT,upDates TEXT)");
	var statement = db.prepare("INSERT INTO data VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"); 	
	statement.run(
	item.dateModified,
	id,
	dateSigned,
	first,
	data.getJSON().data.tenderID,
	data.getJSON().data.procuringEntity.name.toUpperCase(),
	suppliers,
	numberOfBids,
	startAmount,
	amount,
	save,
	data.getJSON().data.items[0].classification.description,
	region,
	up,
	down,
	downDate,
	upDates
	);
	statement.finalize();
	});
	//////////SQLiteEnd//////////////
	
		})
		.catch(function  (error) {									
		}); 
		//////////saveEnd//////////////
	
	
	}		
	})
	.catch(function  (error) {
		//console.log("error_detale2")				
	});  
	});	
	})
	.catch(function  (error) {
		//console.log("error_detale3")				
	})
	.then(function () {	
	
		if (start.replace(/T.*/, "") != end) {
			setTimeout(function() {piv ();},10000);
		}	
		else {
			console.log("STOP")
		}
		
		})
	.catch( function (error) {
		console.log("error")
		piv ();
	});   					
}



piv ();	

//})
