const BAR_STOPS_AT = 50; //pixel from bottom
const MAX_BARS = 10; //total bars per level

class BarGroup {
  constructor(y) {
    this.height = 30;
    this.y = y; //y is starting position

    this.speedY = 1;
    this.counted = false; //counted for score.

    this.speedXr = random(1,5);
    this.speedXl = random(1,5);

    this.left = {
      x : 0,
      width : 0,
      speed : this.speedXl
    };

    this.right = {
      x : world.width,
      width : world.width,
      speed : this.speedXr
    };
  }

  draw() {
    const {y, height} = this;
    let rx = this.right.x;
    let rwidth = this.right.width;
    let lx = this.left.x;
    let lwidth = this.left.width;
    fill(0);
    rect(rx, y, rwidth, height);
    rect(lx, y, lwidth, height);
  }

  move() {
    const {y, speedY} = this;

    this.y += speedY;

    this.left.width += this.left.speed;
    this.right.x -= this.right.speed;

    let gap = this.right.x - this.left.width;

    if (gap <= 0) {
      this.left.speed = 0;
      this.right.speed = 0;
    }

    if (y > world.height - this.height - BAR_STOPS_AT) {
      this.speedY = 0;
    }

    if (y <= 300) {
      this.right.speed=0;
      this.left.speed=0;
    } else if (gap >= 0) {
      this.right.speed=this.speedXr;
      this.left.speed=this.speedXl;
    }
  }
}

let ball;

let rect1;

let barGroups = []; //bar groups

function setup() {
  noStroke();
  const canv = createCanvas(world.width,world.height);
  canv.style('border-radius','5px');

  ball = new Ball(world);
  ball.x = width/2;

  barGroups[0] = new BarGroup(world.height-100);
  barGroups[0].left.width = world.width;
  for (let i = 1; i<=MAX_BARS ; i++) {
    barGroups[i] = new BarGroup(-i*300);
  }
}

let score = -1;
let gameOver = false;
let gameLevel = -1;

function draw() {
  frameRate(60);
  background(150);
  ball.draw();
  ball.worldEffect();
  for (b of barGroups) {
    b.draw()
    b.move();
    if (val = ball.collisionCheckv3(b)) {
      if (val < 3) { // (top surface)
        if (!b.counted) {
          score++;
          b.counted = true;
          console.log('score:',score);
          if (score%MAX_BARS == 0) { //level up
            gameLevel++;
            console.log("level:",gameLevel);
            for (let i = 1; i <= MAX_BARS ; i++) {
              barGroups[i] = new BarGroup(-(i-1) * 300);
            }
          }
        }
        ball.speedY = b.speedY;
      } else if (val > 3) { // (bottom surface)
        ball.speedY = 3; //thrust down
      }
    }
  }

  if (ball.y >= world.height) {
    gameOver = true;
  }

  if (score >= 0 && score < MAX_BARS*(gameLevel + 1)) {
    const d2 = world.height - BAR_STOPS_AT - 30;
    const d1 = barGroups[(score + 1) - (gameLevel*10)].y + barGroups[(score + 1) - (gameLevel*10)].height;
    if ( d2 - d1 <= ball.diameter && ball.y > (d2 - ball.diameter)) { //one more condition for ball pos on gameover yet to be added
      gameOver = true;
    }
  }

  fill(255);
  textSize(20);
  text("score: "+score, 15, 25);

  if(gameOver) {
    console.log('game over');
    textSize(32);
    text("game over",170,200);

    noLoop();
  }
}

function keyPressed() {
  if (keyCode == 38 ) {
    for (b of barGroups) {
      if (ball.collisionCheckv3(b) < 3) {
        ball.jump();
        return false;
      }
    }
  }

  if (keyCode == 39) //right
    ball.moveRight();

  if (keyCode == 37) //left
    ball.moveLeft();
}