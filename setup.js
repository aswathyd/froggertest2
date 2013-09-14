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

// object constructor for most objects (vehicles, logs, inlets, etc.)
function objectArray(sX, sY, w, h, y, n, s, d) {
	this.spriteX = sX;
	this.spriteY = sY;
	this.width = w;
	this.height = h;
	this.y = y;
	this.num = n;
	this.speed = s;
	this.direction = d;
	this.xCoords = new Array();
	if (this.direction == directions.left) {
		this.startX = Math.floor(Math.random() * (width / this.num));
		for (i = 0; i < this.num; i++) {
			this.xCoords[i] = this.startX + i * (width / this.num + this.width);
		}
	} else {
		this.startX = Math.floor(Math.random() * (width / this.num));
		for (i = 0; i < this.num; i++) {
			this.xCoords[i] = this.startX + i * (width / this.num + this.width);
		}
	}
}

var vehicleLibrary = {
	pink: new objectArray(10, 268, 28, 20, 455, 4, 2, directions.left),
	white: new objectArray(46, 264, 28, 24, 420, 3, 1, directions.right),
	yellow: new objectArray(81, 265, 24, 26, 385, 4, 1, directions.left),
	tank: new objectArray(12, 302, 24, 21, 350, 5, 2, directions.right),
	truck: new objectArray(104, 302, 46, 18, 315, 3, 2, directions.left)
}

var logLibrary = {
	shortRight: new objectArray(10, 230, 85, 21, 110, 3, 3, directions.right),
	shortLeft: new objectArray(10, 230, 85, 21, 215, 3, 3, directions.left),
	mediumRight: new objectArray(10, 197, 117, 22, 180, 2, 2, directions.right),
	mediumLeft: new objectArray(10, 197, 117, 22, 180, 2, 2, directions.left),
	longRight: new objectArray(10, 166, 180, 22, 250, 2, 3, directions.right),
	longLeft: new objectArray(10, 166, 180, 22, 145, 2, 3, directions.left)
}

// Frogger!!!
function frog(d, x, y) {
	this.direction = d;
	if (this.direction == directions.left) {
		this.x = x - colSize / 2;
		this.y = y;
		this.jumpX = this.x + colSize / 4;
		this.jumpY = this.y;
		this.spriteX = 81;
		this.spriteY = 337;
		this.spriteJumpX = 112;
		this.spriteJumpY = 338;
		this.width = 18;
		this.height = 23;
		this.jumpWidth = 25;
		this.jumpHeight = 22;
	} else if (this.direction == directions.up) {
		this.x = x;
		this.y = y - laneSize;
		this.jumpX = this.x;
		this.jumpY = this.y + laneSize / 2;
		this.spriteX = 12;
		this.spriteY = 367;
		this.spriteJumpX = 45;
		this.spriteJumpY = 365;
		this.width = 23;
		this.height = 17;
		this.jumpWidth = 22;
		this.jumpHeight = 25;
	} else if (this.direction == directions.right) {
		this.x = x + colSize / 2;
		this.y = y;
		this.jumpX = this.x - colSize / 4;
		this.jumpY = this.y;
		this.spriteX = 14;
		this.spriteY = 333;
		this.spriteJumpX = 45;
		this.spriteJumpY = 335;
		this.width = 17;
		this.height = 23;
		this.jumpWidth = 25;
		this.jumpHeight = 22;
	} else if (this.direction == directions.down) {
		this.x = x;
		this.y = y + laneSize;
		this.jumpX = this.x;
		this.jumpY = this.y - laneSize / 2;
		this.spriteX = 81;
		this.spriteY = 370;
		this.spriteJumpX = 114;
		this.spriteJumpY = 366;
		this.width = 23;
		this.height = 17;
		this.jumpWidth = 22;
		this.jumpHeight = 25;
	}
	this.reset = function() {
		this.x = 187;
		this.y = 490;
		this.direction = directions.up;
	}
}

