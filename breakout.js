var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);
document.addEventListener("mousemove", mouseMoveHandler, false);

// world variables
var paused = false;
var mouseOK = true;
var score = 0;
var roundMaxScore = 0;
var maxHealth = 2;
var minHealth = 0;
var lives = 3;
var restartCheck = 0;
var difficultyCheck = 0;

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// ball variables
var x = canvas.width/2;
var y = canvas.height-30;
var dx = 2;
var dy = -2;
var storedDX = storedDY = 0;
var ballRadius = 10;
var ballColor = "#0095DD";

// paddle variables
var paddleHeight = 10;
var paddleWidth = 75;
var paddleX = (canvas.width-paddleWidth)/2;
var rightPressed = false;
var leftPressed = false;
var paddleSpeed = 4;

// brick variables
var brickRowCount = 3;
var brickColumnCount = 5;
var brickPadding = 10;
var brickOffsetTop = 30;
var brickOffsetLeft = 30;
var brickWidth = Math.floor((canvas.width - brickOffsetLeft*2 - (brickPadding*(brickColumnCount-1))) / brickColumnCount); // 75
var brickHeight = Math.floor((canvas.height/2 - brickOffsetTop*3 - (brickPadding*(brickRowCount-1))) / brickRowCount + brickRowCount + 1); // 20;
var bricks = [];
var brickColors = [null, "#0095DD", "#DD0095", "#95DD00", "#000000"]
function createBricks(){
  roundMaxScore = 0
  x = canvas.width/2;
  y = canvas.height-30;
  storedDX = 2;
  storedDY = -2;
  for (brickCol=0; brickCol<brickColumnCount; brickCol++){
    bricks[brickCol] = [];
    for(brickRow=0; brickRow<brickRowCount; brickRow++){
      var thisStatus = Math.floor(Math.random()*(maxHealth-minHealth+1))+minHealth;
      roundMaxScore += thisStatus;
      bricks[brickCol][brickRow] = {
        status: thisStatus,
        x: brickCol*(brickWidth + brickPadding) + brickOffsetLeft,
        y: brickRow*(brickHeight + brickPadding) + brickOffsetTop,
      }
    }
  }
  if(!roundMaxScore){
    createBricks();
  }
}
createBricks();

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI*2);
  ctx.fillStyle = ballColor;
  ctx.fill();
  ctx.closePath();
}

function updateBall() {
  x += dx;
  y += dy;
  var skew = .25
  if (x+ballRadius >= canvas.width || x-ballRadius <= 0){ // ball touches sides
    dx *= -1;
    dy += skew - Math.random() * skew * 2;
    ballColor = getRandomColor();
  }
  if (y-ballRadius <= 0){ // ball touches top
    dx += skew - Math.random() * skew * 2;
    dy *= -1;
    ballColor = getRandomColor();
  }else if (y+ballRadius >= canvas.height-paddleHeight && (x>=paddleX && x <= paddleX+paddleWidth) ){
    dy = -Math.abs(dy * 1.05);
    paddleSpeed *= 1.02;
    if (dy > 0) {
      y = canvas.height - paddleHeight - ballRadius;
    }
  }else if (y+ballRadius >= canvas.height){
    // Game Over
    if (lives != '0') {
      lives--;
      if (lives){
        x = canvas.width/2;
        y = canvas.height-30;
        dx = 2;
        dy = -2;
        paddleX = (canvas.width-paddleWidth)/2;
        paddleSpeed = 4;
      }
    }
  }
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function updatePaddle(){
  if (rightPressed && paddleX < canvas.width-paddleWidth && !paused){
    paddleX += paddleSpeed;
  }
  if (leftPressed && paddleX > 0 && !paused){
    paddleX -= paddleSpeed;
  }
}

function drawBricks() {
  bricks.forEach(col => {
    col.forEach(brick =>{
      if (brick.status) {
        ctx.beginPath();
        ctx.rect(brick.x, brick.y, brickWidth, brickHeight);
        if (brick.status>3){
          var colorIndex = 4; // maximum
        }else {
          colorIndex = brick.status;
        }
        ctx.fillStyle = brickColors[colorIndex]; // changes colors depending on "health"
        ctx.fill();
        ctx.closePath();
        if (colorIndex>3){
          var fontSize = brickHeight-4;
          if (fontSize<2){
            fontSize = 2;
            fontSize = String(fontSize);
          }
          ctx.font =  fontSize + "px Arial";
          ctx.fillStyle = "#FFFFFF";
          ctx.fillText(brick.status, brick.x+(brickWidth-fontSize)/2, brick.y+fontSize);
        }
      }
    });
  });
}

function updateBricks(){
  bricks.forEach(col => {
    col.forEach(brick =>{
      if (brick.status) {
        let tempX = Math.floor(x);
        let tempY = Math.floor(y);
        if (tempX+ballRadius>=brick.x && tempX-ballRadius<=brick.x+brickWidth && tempY>=brick.y && tempY<=brick.y+brickHeight){
          brick.status -= 1;
          dx*=-1;
          score++;
          roundMaxScore--;
        }else if (tempY+ballRadius>=brick.y && tempY-ballRadius<=brick.y+brickHeight && tempX>=brick.x && tempX<=brick.x+brickWidth){
          brick.status -= 1;
          dy*=-1;
          score++;
          roundMaxScore--;
        }
      }
    });
  });
}

function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText("Score: "+score, 8, 20);
}

function drawLives() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText("Lives: "+lives, canvas.width-65, 20);
}

function handleKeyDown(e) {
  switch(e.keyCode) {
    case 37: // left arrow key
      leftPressed = true;
      break;
    case 39: // right arrow key
      rightPressed = true;
      break;
    case 80: // p key
      if (paused){
        paused = false;
        dx = storedDX;
        dy = storedDY;
        restartCheck = 0;
        difficultyCheck = 0;
      }else{
        paused = true;
        storedDX = dx;
        storedDY = dy;
        dx = dy = 0;
      }
      break;
    case 77: // m key
      mouseOK = !mouseOK;
      break;
    case 82: // r key
      if (paused){
        restartCheck++;
      }
      if (restartCheck>=3 || lives==='0'){
        document.location.reload();
      }
      break;
    case 68: // d key
      if(paused){
        difficultyCheck++;
      }
      break;
    case 72: // h key
      //harder difficulty
      if (difficultyCheck>=3){
        maxHealth++;
        createBricks();
      }
      break;
    case 85: // u key;
      // 'uppen' the difficulty
      if (difficultyCheck>=3){
        if(maxHealth>minHealth){
          minHealth++;
          createBricks();
        }
      }
      break;
    case 69: // e key;
      // easier difficulty;
      if (difficultyCheck>=3){
        if(maxHealth>minHealth && maxHealth>1){
          maxHealth--;
          createBricks();
        }
      }
      break;
    case 76: // l key;
      // lessen the difficulty;
      if (difficultyCheck>=3){
        if(minHealth>0){
          minHealth--;
          createBricks();
        }
      }
      break;
    case 70: // f key;
      // faster!
      if (Math.abs(dx)<20 && Math.abs(dy)<20) {
        dx*=1.25;
        dy*=1.25;
        paddleSpeed*=1.25;
      }
      break;
    case 83: // s key;
      // s l  o   w    e     r
      if (Math.abs(dx)>2.5 && Math.abs(dy)>2.5) {
        dx*=.8;
        dy*=.8;
        paddleSpeed*=.8;
      }
      break;
  }
}

function handleKeyUp(e) {
  switch(e.keyCode) {
    case 37:
      leftPressed = false;
      break;
    case 39:
      rightPressed = false;
      break;
  }
}

function mouseMoveHandler(e) {
  if (mouseOK && !paused) {
    var relativeX = e.clientX - canvas.offsetLeft; // effectively this is equal to the distance between the canvas left edge and the mouse pointer
    if(relativeX > 0 + paddleWidth/3 && relativeX < canvas.width-paddleWidth/3) {
      //If the relative X pointer position is greater than zero and lower than the Canvas width, the pointer is within the Canvas boundaries
      paddleX = relativeX - paddleWidth/2;
    }
  }
}

function checkWinOrLose() {
  if(roundMaxScore == 0) {
    alert("YOU WIN, CONGRATULATIONS!\nClick OK to continue playing!\nCurrent score: " + score);
    // document.location.reload();
    createBricks();
  }

  if(!lives) {
    alert("GAME OVER\nYour score: " + score);
    // document.location.reload(); // refreshes window and restarts game
    dx = 0;
    dy = 0;
    lives = "0";
    leftPressed = rightPressed = false;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // clears the canvas
  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();
  drawLives();

  checkWinOrLose();

  updateBall();
  updatePaddle();
  updateBricks();
  requestAnimationFrame(draw); // instead of the fixed 10 milliseconds frame rate, we are giving control of the framerate back to the browser.
  // It will sync the framerate accordingly and render the shapes only when needed. This produces a more efficient, smoother animation loop.
}

// setInterval(draw, 10); // this will call draw() every 10 ms, but may be limited in rendering capacity
draw(); // this will work in conjunction with requestAnimationFrame()
