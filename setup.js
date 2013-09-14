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
