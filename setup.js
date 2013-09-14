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
function drawGame() {
	drawWater();
	drawRoad();
	drawRoadside(277);
	drawRoadside(486);
	drawHeader();
	drawFooter();
	drawMovingObjects(vehicles);
	drawMovingObjects(logs);
	drawFrogsHome();
	drawFly();
}

function drawWater() {
	ctx.fillStyle = "#191970";
	ctx.fillRect(0, 0, width, 290);
}

function drawRoad() {
	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 283, width, 282);
}

function drawRoadside(y) {
	ctx.drawImage(sprites, 0, 120, 399, 34, 0, y, 399, 34);
}

function drawHeader() {
	ctx.drawImage(sprites, 0, 0, 399, 110, 0, 0, 399, 110);
}

function drawFooter() {
	ctx.fillStyle = "#00FF00";
	ctx.font = "20px Arial";
	ctx.fillText("Level " + level, 95, 545);
	ctx.font = "14px Arial";
	ctx.fillText("Score: " + score + "\t\t\t\t\t\t\t\t\t\tHigh Score: " + highScore, 2, 563);
	for (i = 0; i < numLives; i++) {
		ctx.drawImage(sprites, 10, 335, 20, 20, i * 12, 535, 12, 12);
	}
	drawTimer();
}

function drawTimer() {
	var x = time / 1000 * timeInterval * 4;
	ctx.fillStyle = "#00FF00";
	ctx.fillRect(399 - x, 545, 399, 565);
}

function drawMovingObjects(objectArray) {
	for (i = 0; i < objectArray.length; i++) {
		for (j = 0; j < objectArray[i].num; j++) {
			ctx.drawImage(sprites, objectArray[i].spriteX, objectArray[i].spriteY, objectArray[i].width, objectArray[i].height, objectArray[i].xCoords[j], objectArray[i].y, objectArray[i].width, objectArray[i].height);
		}
	}
}

function drawFrog(frog) {
	ctx.drawImage(sprites, frog.spriteX, frog.spriteY, frog.width, frog.height, frog.x, frog.y, frog.width, frog.height);
}

function drawMovingFrog() {
	ctx.drawImage(sprites, frogger.spriteJumpX, frogger.spriteJumpY, frogger.jumpWidth, frogger.jumpHeight, frogger.jumpX, frogger.jumpY, frogger.jumpWidth, frogger.jumpHeight);
}

function drawDeadFrog() {
	ctx.drawImage(deadFrogSprite, 5, 4, 18, 24, deadFrog.x, deadFrog.y, 18, 24);
}

function drawDeadFrogMsg() {
	ctx.fillStyle = "#00FF00";
	ctx.fillRect(45, 207, 300, 150);
	ctx.fillStyle = "#000000";
	ctx.fillRect(55, 216, 280, 130);
	ctx.fillStyle = "#00FF00";
	ctx.font = "36px Arial";
	ctx.fillText("Frogger has died", 60, 290);
}

function drawFly() {
	ctx.drawImage(sprites, 140, 235, fly[0].width, fly[0].height, fly[0].xCoords[0], fly[0].y, fly[0].width, fly[0].height);
}

function drawFrogsHome() {
	for (i = 0; i < frogsHome.length; i++) {
		drawFrog(frogsHome[i].homeFrog);
	}
}

function drawGameOver() {
	ctx.fillStyle = "#00FF00";
	ctx.fillRect(45, 197, 300, 170);
	ctx.fillStyle = "#000000";
	ctx.fillRect(55, 206, 280, 150);
	ctx.fillStyle = "#00FF00";
	ctx.font = "36px Arial";
	ctx.fillText("Game Over", 105, 245);
	ctx.font = "18px Arial";
	ctx.fillText("Submit Score", 147, 320);
	ctx.fillText("Play Again", 160, 345);
	if (isNewHighScore) {
		ctx.fillStyle = "#FFFFFF";
		ctx.fillText("New high score: " + highScore, 115, 285);
	}
}

// Contains the game loop, which runs different functions depending on the game status
function runGame() {
	setInterval(function() {
		if (time > 0) {
			if (deathPause > 0) {
				runDeath();
			} else if (movePause > 0) {
				runMove();
			} else {
				runRegular();
			}
		} else {
			runEndGame();
		}
	}, timeInterval);
}

// Runs while the frog is dead
function runDeath() {
	drawGame();
	drawDeadFrog();
	drawDeadFrogMsg();
	deathPause--;
}

// Runs when the frog moves
function runMove() {
	update();
	drawGame();
	drawMovingFrog();
	movePause--;
}

// Runs when nothing in the game has changed (i.e., the frog is alive and hasn't moved)
function runRegular() {
	update();
	drawGame();
	drawFrog(frogger);
}

// Runs when the game is over
function runEndGame() {
	drawGame();
	deadFrog = {
		x: frogger.x,
		y: frogger.y
	}
	drawDeadFrog();
	clickOn = true;		// allows user to play again
	time = 0;
	if (score > highScore) {
		highScore = score;
		localStorage["highScore"] = highScore;
		isNewHighScore = true;
	}
	drawGameOver();
}

// Updates the coordinates of objects that may move and then checks for events such as the frog reaching an inlet
function update() {
	updateMovingObjects(vehicles);
	updateMovingObjects(logs);
	updateFly();
	if (isHome()) {
		updateHome();
	} else {
		if (isCollisionDeath()) {
			updateCollisionDeath();
		} else if (isUpArrow) {
			score += 10;
			isUpArrow = false;
		}
	}
	time--;
}

// Adjusts the positions of objects in an array
function updateMovingObjects(objectArray) {
	for (i = 0; i < objectArray.length; i++) {
		for (j = 0; j < objectArray[i].num; j++) {
			if (objectArray[i].direction == directions.left) {
				if (objectArray[i].xCoords[j] <= 0 - objectArray[i].width) {
					objectArray[i].xCoords[j] = 399 + objectArray[i].width;
				} else {
					objectArray[i].xCoords[j] -= objectArray[i].speed;
				}
			} else {
				if (objectArray[i].xCoords[j] >= 399 + objectArray[i].width) {
					objectArray[i].xCoords[j] = 0 - objectArray[i].width;
				} else {
					objectArray[i].xCoords[j] += objectArray[i].speed;
				}
			}
		}
	}
}

// Adjusts the fly so that it is only present sometimes and moves randomly
function updateFly() {
	if (fly[0].isActive) {
		if (fly[0].intervalsActive == 0) {
			fly[0].isActive = false;
		} else {
			fly[0].intervalsActive--;
			drawFly();
		}
	} else {
		initFly();
	}
}

// Determines whether there is a collision between the frog and any objects in the argument array
// Moves the frog with the object it's touching if isMoving is true (e.g., for logs)
function isCollisionWith(objectArray, isMoving) {
	var xSpan, ySpan;
	for (i = 0; i < objectArray.length; i++) {
		ySpan = (frogger.y >= objectArray[i].y && frogger.y <= objectArray[i].y + objectArray[i].height) || (frogger.y + frogger.height >= objectArray[i].y && frogger.y <= objectArray[i].y + objectArray[i].height);
		for (j = 0; j < objectArray[i].num; j++) {
			xSpan = (frogger.x >= objectArray[i].xCoords[j] && frogger.x <= objectArray[i].xCoords[j] + objectArray[i].width) || (objectArray[i].xCoords[j] >= frogger.x && objectArray[i].xCoords[j] <= frogger.x + frogger.width);
			if (xSpan && ySpan) {
				if (isMoving) {
					moveFrogWith(objectArray[i]);
				}
				return true;
			}
		}
	}
	return false;
}

// Moves the frog with the object it's on (e.g., a log)
function moveFrogWith(object) {
	if (object.direction == directions.left) {
		frogger.x -= object.speed;
	} else {
		frogger.x += object.speed;
	}
}

// Checks whether the frog is in an unoccupied inlet (and not on the green land!)
function isHome() {
	return isCollisionWith(inlets, false) && !isCollisionWith(frogsHome, false) && !isCollisionWith(badlands, false);
}

// Checks whether the frog is now dead
// Won't run if isHome() is true and so doesn't need to check if the frog is in an inlet
function isCollisionDeath() {
	return isCollisionWith(vehicles, false) || (frogger.y < 262 && (!isCollisionWith(logs, true) || (frogger.x <= 0 || frogger.x + frogger.width >= 399) || isCollisionWith(badlands, false)));
}

// Updates objects (e.g., resets frog's position) on frog's death
function updateCollisionDeath() {
	deadFrog = {
		x: frogger.x,
		y: frogger.y
	};
	numLives--;
	gameOver = numLives <= 0;
	isUpArrow = false;
	if (gameOver) {
		runEndGame();
	} else {
		frogger.reset();
		deathPause = 50;
		movePause = 0;
	}
}

// Updates objects (e.g., frogsHome) when the frog reaches an unoccupied inlet
function updateHome() {
	score += 50 + Math.round(time * (timeInterval / 1000));
	numHome++;
	if (fly[0].isActive && isCollisionWith(fly, false)) {
		score += 200;
		fly[0].isActive = false;
		fly[0].intervalsActive = 0;
	}
	updateFrogsHome();
	frogger.reset();
	if (numHome % 5 == 0) {
		score += 1000;
		increaseLevel();
	}
}

// Adds to the frogsHome object when the frog reaches an unoccupied inlet
function updateFrogsHome() {
	var x;
	if (frogger.x <= 95) {
		x = 15;
	} else if (frogger.x <= 178) {
		x = 100;
	} else if (frogger.x <= 265) {
		x = 185;
	} else if (frogger.x <= 348) {
		x = 270;
	} else {
		x = 355;
	}
	frogsHome.push({
		homeFrog: new frog(directions.up, x, 114),
		num: 1,
		xCoords: new Array(),
		y: 72,
		width: 23,
		height: 17
	});
	frogsHome[frogsHome.length - 1].xCoords[0] = frogsHome[frogsHome.length - 1].homeFrog.x;
}

// Increases the level and difficulty when 5 frogs reach inlets
function increaseLevel() {
	level++;
	initObjects();
	increaseSpeed(vehicles);
	increaseSpeed(logs);
}

// Increases the speed of moving objects
function increaseSpeed(objectArray) {
	for (i = 0; i < objectArray.length; i++) {
		objectArray[i].speed++;
	}
}

// Contains the game's event listeners for arrow keys (if game is running and frog is alive) and clicks to play again (if game is over)
function eventListener() {
	$(document).keydown(function(event) {
		var arrow = {
			left: 37,
			up: 38,
			right: 39,
			down: 40
		}
		if (deathPause == 0) {
			if (event.which == arrow.left || event.keyCode == arrow.left) {
				frogger = new frog(directions.left, frogger.x, frogger.y);
				movePause = 2;
			} else if (event.which == arrow.up || event.keyCode == arrow.up) {
				frogger = new frog(directions.up, frogger.x, frogger.y);
				movePause = 2;
				isUpArrow = true;
			} else if (event.which == arrow.right || event.keyCode == arrow.right) {
				frogger = new frog(directions.right, frogger.x, frogger.y);
				movePause = 2;
			} else if ((event.which == arrow.down || event.keyCode == arrow.down) && frogger.y < 485) {
				frogger = new frog(directions.down, frogger.x, frogger.y);
				movePause = 2;
			} else {
				return;
			}
		} else {
			return;
		}
		event.preventDefault();
	});
	$("#clickSubmit").click(function() {
		if (clickOn) {
			submitScore();
		}
	});
	$("#clickPlay").click(function() {
		if (clickOn) {
			init();
		}
	});
}

function submitScore() {
	var username = window.prompt("Please enter your username:");
	while (username == null || username == "") {
		username = window.prompt("Oops! Please enter your username again:");
	}
	var postURL = "http://vast-tundra-5648.herokuapp.com/submit.json";
	$.post(postURL, {
		game_title: "Frogger",
		username: username,
		score: score
	});
	init();
}

