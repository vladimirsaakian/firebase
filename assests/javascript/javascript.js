var config = {
    apiKey: "AIzaSyAL3FnzR6cZRmD-myEU4923gAIhKY2ckjM",
    authDomain: "train-schedule-5b77e.firebaseapp.com",
    databaseURL: "https://train-schedule-5b77e.firebaseio.com",
    projectId: "train-schedule-5b77e",
    storageBucket: "train-scheduler-a77f7.appspot.com",
    messagingSenderId: "1011185952961"
  };
  
 firebase.initializeApp(config);

 var database = firebase.database();

 var firebaseDataObject = null;

 var updateKey;

 var name;
 var destination;
 var time;
 var frequency;

 function Train(name, destination, firstTrainTime, frequency)
 {

 	this.name = name;
 	this.destination = destination;
 	this.firstTrainTime = firstTrainTime;
 	this.frequency = frequency;

 };


$(document).ready(function(){

	$("#current-time").text(moment().format("MMM DD hh:mm A"));

	setInterval(function(){

		$("#current-time").text(moment().format("MMM DD hh:mm A"));
		displayTrainSchedule();

	},60000);

	database.ref().on("value",function(data){
		
		firebaseDataObject = data.val();
		displayTrainSchedule(); 		
	}, 

	function(objectError)
	{
		console.log("error:" + objectError.code);
	});

});


//==========================================================================================

$("#submit-btn").on("click", function(event){

 	event.preventDefault();

 	if(getInputValues())
 	{

	 	var firstTrainTime = firstTimeString(time);

	 	var newTrain = new Train(name, destination, firstTrainTime, frequency);
	 		
	 	database.ref().push( newTrain ); 		

 	}

});

//====================================================================================


$(document).on("click", ".remove", function()
{
	var con = confirm("Are you sure you want to remove train?");  
	
	if(con == true)
	{
		var key = $(this).attr("key");

		database.ref().child(key).remove();
	}


});

//====================================================================================

$(document).on("click", ".update", function()
{
	updateKey = $(this).attr("key");
	displayUpdate()

});

//====================================================================================

$("#close-btn").on("click", function(event)
{
	event.preventDefault();

	updateDone();

});

//=================================================================
$("#update-btn").on("click", function(event)
{
	event.preventDefault();

	updateTrain();

});

//==================================================================



$("#add-train-btn").on("click", function(event)
{
	event.preventDefault();

	$("#submit-btn").css("display", "initial");
	$("#add-panel").slideToggle();

});
//==================================================================

function getNextArrival(time, frequency)
{
	var nextArrival = moment(time);
 	
 	while(nextArrival < moment()) 	
 	{ 		
 		nextArrival.add(frequency, "minutes"); 
	};

	return nextArrival;

}


//====================================================================================

function getMinutesAway(time)
{
	
	var minutesAway = Math.round(getNextArrival(time).diff(moment(),"minutes",true));


	return (minutesAway === 0) ? "Arrived" : minutesAway

}


//====================================================================================

function displayTrainSchedule()
{
	$("#schedule").empty();

	if(firebaseDataObject !== null)
	{	
		
		Object.keys(firebaseDataObject).forEach(function(key)
		{		 		
			var name = firebaseDataObject[key].name;	 		
	 		var destination = firebaseDataObject[key].destination;
	 		var firstTrainTime = firebaseDataObject[key].firstTrainTime;
	 		var frequency = firebaseDataObject[key].frequency;	
	 		var nextArrival = getNextArrival(firstTrainTime, frequency) ;
	 		var minutesAway = getMinutesAway(nextArrival);

	 		var newTableRow = $("<tr>");
	 		newTableRow.append($("<td>").html(name)); 		
	 		newTableRow.append($("<td>").html(destination));
	 		newTableRow.append($("<td>").html(frequency));
	 		newTableRow.append($("<td>").html(nextArrival.format("MMM DD hh:mm A")));
	 		newTableRow.append($("<td>").html(minutesAway));

	 		var newDiv = $("<div>") 
	 		newDiv.addClass("update");		
	 		newDiv.attr(
	 		{	 			
	 			"key" : key,
	 			"data-toggle" : "tooltip",
	 			"data-placement" : "left",
	 			"title" : "Update"
	 		});
	 		newDiv.html("<span class='glyphicon glyphicon-edit pop'></span>");
			newTableRow.append($("<td>").html(newDiv));
			
	 		var newDiv = $("<div>") 
	 		newDiv.addClass("remove");
	 		newDiv.attr(
	 		{	 			
	 			"key" : key,
	 			"data-toggle" : "tooltip",
	 			"data-placement" : "left",
	 			"title" : "Remove"
	 		});
	 		newDiv.html("<span class='glyphicon glyphicon-trash pop'></span>");
			newTableRow.append($("<td>").html(newDiv));		

	 		$("#schedule").append(newTableRow);

	 				
		});
	
	}	

}


//====================================================================================

function firstTimeString(time)
{
	
	var currentDateString = moment().format("YYYY-MM-DD");

		
	return (currentDateString + "T" + time);

}

//=======================================================

function pad(time) 
{
	var array = time.split(":");
	
	
	array[0] = parseInt(array[0]); //HH
	array[1] = parseInt(array[1]); //MM

	
	if (array[0] < 10)
	{
		array[0] = '0' + array[0];
	}

	if (array[1] < 10)
	{
		array[1] = '0' + array[1];
	}
	
	
    return (array[0] + ":" + array[1]);



//========================================================================


function checkTime(time)
{	
	var array = time.split(":");
	
	
	if(( isNaN(array[0]) ) || ( isNaN(array[1]) ) )
	{			
		return false;
	}
	
	array[0] = parseInt(array[0]);
	array[1] = parseInt(array[1]);
	
	return ((array[0] >= 0 && array[0] <= 23) && (array[1] >= 0 && array[1] <= 59)) ? true : false;	
}

//========================================================================


function displayUpdate()
{
	$("#add-panel").slideDown();

	$("#submit-btn").css("display", "none");
	$("#update-btn").css("display", "initial");

	$("#add-title").html("Update Train");

	$("#name").val(firebaseDataObject[updateKey].name);	 		
	$("#destination").val(firebaseDataObject[updateKey].destination);
	$("#time").val(moment(firebaseDataObject[updateKey].firstTrainTime).format("HH:mm"));
	$("#frequency").val(firebaseDataObject[updateKey].frequency);	

}

//========================================================================

function updateDone()
{
	
	$("#name").val("");	 		
	$("#destination").val("");
	$("#time").val("");
	$("#frequency").val("");

	$("#add-panel").slideUp();

	$("#add-title").html("Add Train");	

	$("#submit-btn").css("display", "initial");
	$("#update-btn").css("display", "none");	

}

//========================================================================

function updateTrain()
{	
	if(getInputValues())
 	{
	 	var firstTrainTime = firstTimeString(time);

	 	var newTrain = new Train(name, destination, firstTrainTime, frequency);
	 		
	 	database.ref("/" + updateKey ).update(newTrain);

	 	updateDone();		
 	}


//===========================================================================

function getInputValues()
{

	name = $("#name").val().trim();
 	destination = $("#destination").val().trim();
 	time = $("#time").val().trim().replace(/\s/g,""); 
 	frequency = parseInt($("#frequency").val().trim()); 

 	if(name === "")
 	{
 		alert("Please Enter A Train Name");
 		$("#name").val("").focus();
 		return false;

 	}
 	else if(destination === "")
 	{
 		alert("Please Enter A Destination");
 		$("#destination").val("").focus();
 		return false;
 	}
 	else if(!checkTime(time))
 	{
 		alert("Please Enter A Valid First Train Time! (HH:MM)");
 		$("#time").val("").focus();
 		return false;
 	}
 	else if(isNaN(frequency))
 	{
 		alert("Please Enter A Frequency");
 		$("#frequency").val("").focus();
 		return false;
 	}	
 	else
 	{
 		time = pad(time);

	 	$("#name").val("");
	 	$("#destination").val("");
	 	$("#time").val("");   
	 	$("#frequency").val("");

	 	return true;
	 		
 	}

}