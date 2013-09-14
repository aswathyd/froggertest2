// global variables
var sprites, deadFrogSprite, canvas, ctx;
var width = 399, height = 565;
var timeInterval, laneSize = 35, colSize = 42;
var score, highScore, isNewHighScore;
var seconds, time, level;
var numLives, gameOver, numHome;
var frogger, deadFrog, vehicles, logs, fly;
var inlets, badlands, frogsHome;
var movePause, deathPause, isUpArrow, clickOn;
var directions = {
	left: "left",
	up: "up",
	right: "right",
	down: "down"
};

// ensures everything loads immediately on page load
$(document).ready(function() {
	initHighScores();
	startGame();
});

// Initializes the game
function startGame() {
	sprites = new Image();
	sprites.src = "assets/frogger_sprites.png";
	deadFrogSprite = new Image();
	deadFrogSprite.src = "assets/dead_frog.png";
	$(sprites).load(function() {
		return;
	});
	$(deadFrogSprite).load(function() {
		canvas = $("#game")[0];
		if (canvas.getContext) {
			// browser supports canvas
			init();
			ctx = canvas.getContext("2d");
			runGame();
			eventListener();
		} else {
			// browser doesn't support canvas
			alert("Your browser doesn't support the game. Sorry!");
		}
	});
}

// Starts the initializing process!!
function init() {
	initVariables();
	initObjects();
	initClickDivs();
	loadHighScores();
}

// Initializes variables
function initVariables() {
	timeInterval = 40;	// milliseconds	
	score = 0;
	highScore = getLocalStorage("highScore");
	ifNewHighScore = false;
	seconds = 30;
	time = seconds * (1000 / timeInterval);
	level = 1;
	numLives = 5;
	numHome = 0;
	movePause = 0;
	deathPause = 0;
	isUpArrow = false;
	clickOn = false;
}

// Initializes objects
function initObjects() {
	initFrogger();
	initVehicles();
	initLogs();
	initFly();
	initInlets();
	initBadlands();
	initFrogsHome();
}

function initFrogger() {
	frogger = new frog(directions.up);
	frogger.reset();
}

function initVehicles() {
	vehicles = new Array();
	vehicles.push(vehicleLibrary.pink);
	vehicles.push(vehicleLibrary.white);
	vehicles.push(vehicleLibrary.yellow);
	vehicles.push(vehicleLibrary.tank);
	vehicles.push(vehicleLibrary.truck);
}

function initLogs() {
	logs = new Array();	
	logs.push(logLibrary.longRight);
	logs.push(logLibrary.shortLeft);
	logs.push(logLibrary.mediumRight);
	logs.push(logLibrary.longLeft);
	logs.push(logLibrary.shortRight);
}

function initInlets() {
	inlets = new Array();
	inlets[0] = {
		y: 70,
		width: 30,
		height: 30,
		num: 5,
		xCoords: new Array()
	}
	for (i = 0; i < inlets[0].num; i++) {
		inlets[0].xCoords[i] = 12 + i * 85;
	}
}

function initBadlands() {
	badlands = new Array();
	badlands[0] = {
		y: 0,
		width: 35,
		height: 95,
		num: 4,
		xCoords: new Array()
	}
	for (i = 0; i < badlands[0].num; i++) {
		badlands[0].xCoords[i] = 52 + i * 85;
	}
}

// Randomizes the fly's presence and location
function initFly() {
	fly = new Array();
	fly[0] = {
		y: 80,
		width: 16,
		height: 16,
		num: 1,
		isActive: Math.floor(Math.random() * 100) == 1,
		intervalsActive: Math.floor(Math.random() * 10) * 3 + 100,
		xCoords: new Array()
	}
	if (fly[0].isActive) {
		fly[0].xCoords[0] = 18 + (Math.floor(Math.random() * 5)) * 85;
	} else {
		fly[0].xCoords[0] = -1000;
	}
}

function initFrogsHome() {
	frogsHome = new Array();
}

// the click div lets the player play again
function initClickDivs() {
	initClickDiv("Play");
	initClickDiv("Submit");
}

function initClickDiv(name) {
	if (document.getElementById("click" + name) != null) {
		return;
	}
	var div = document.createElement("div");
	div.id = "click" + name;
	document.getElementById("game_div").appendChild(div);
}

// Checks the local storage for a value (i.e., the high score)
function getLocalStorage(name) {
	for (key in localStorage) {
		if (key == name) {
			return localStorage[key];
		}
	}
	return 0;
}

function initHighScores() {
	var div = document.createElement("div");
	initHighScoresHeader(div);
	div.id = "highScores";
	var scoresDiv = document.createElement("div");
	scoresDiv.id = "scoresData";
	$("body").append(div);
	$(div).append(scoresDiv);
}

function loadHighScores() {
	$("#scoresData").empty();
	var getURL = "http://vast-tundra-5648.herokuapp.com/highscores.json";
	$.get(getURL, {
		game_title: "Frogger"
	}, "json").done(function(data) {
		for (var i in data) {
			addHighScore(data[i], Number(i) + 1);
		}
	});
}

function initHighScoresHeader(div) {
	var header = document.createElement("div");
	header.id = "highScoresHeader";
	var rank = document.createElement("div");
	rank.innerHTML = "<h3>Rank</h3>";
	var username = document.createElement("div");
	username.innerHTML = "<h3>Username</h3>";
	var scoreDiv = document.createElement("div");
	scoreDiv.innerHTML = "<h3>Score</h3>";
	var dateDiv = document.createElement("div");
	dateDiv.innerHTML = "<h3>Date</h3>";
	$(div).append(header);
	$(header).append(rank);
	$(header).append(username);
	$(header).append(scoreDiv);
	$(header).append(dateDiv);
}

function addHighScore(data, rank) {
	var row = document.createElement("div");
	row.classList.add("highScore");
	var rankDiv = document.createElement("div");
	rankDiv.innerHTML = "<p>" + rank + ".</p>";
	rankDiv.classList.add("rank");
	var username = document.createElement("div");
	username.innerHTML = "<p>" + data.username + "</p>";
	username.classList.add("username");
	var scoreDiv = document.createElement("div");
	scoreDiv.innerHTML = "<p>" + data.score + "</p>";
	scoreDiv.classList.add("score");
	var date = new Date(data.created_at);
	var dateDiv = document.createElement("div");
	dateDiv.innerHTML = "<p>" + (date.getMonth() + 1) +
				"/" + date.getDate() + "/"
				+ date.getFullYear() + "</p>";
	dateDiv.classList.add("date");
	$("#scoresData").append(row);
	$(row).append(rankDiv);
	$(row).append(username);
	$(row).append(scoreDiv);
	$(row).append(dateDiv);
}
