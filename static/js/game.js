const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const screenWidth = canvas.width;
const screenHeight = canvas.height;

let gameSpeed = 15, bgX = 0, score = 0, obstacles = [], frame = 0;

const images = {};
const loadImage = (key, src) =>
  new Promise(res => {
    const img = new Image();
    img.src = src;
    img.onload = () => { images[key] = img; res(); };
  });

async function loadAssets() {
  const assets = [
    ["dinoRun1", "static/assets/dino/DinoRun1.png"],
    ["dinoRun2", "static/assets/dino/DinoRun2.png"],
    ["dinoBow1", "static/assets/dino/DinoBow1.png"],
    ["dinoBow2", "static/assets/dino/DinoBow2.png"],
    ["dinoJump", "static/assets/dino/DinoJump.png"],
    ["smallCactus1", "static/assets/cactus/SmallCactus1.png"],
    ["smallCactus2", "static/assets/cactus/SmallCactus2.png"],
    ["largeCactus1", "static/assets/cactus/LargeCactus1.png"],
    ["largeCactus2", "static/assets/cactus/LargeCactus2.png"],
    ["ptero1", "static/assets/bird/Bird1.png"],
    ["ptero2", "static/assets/bird/Bird2.png"],
    ["bg", "static/assets/other/Track.png"]
  ];
  await Promise.all(assets.map(([k,s]) => loadImage(k,s)));
}

class Dino {
  constructor() {
    this.runImgs = [images.dinoRun1, images.dinoRun2];
    this.bowImgs = [images.dinoBow1, images.dinoBow2];
    this.jumpImg = images.dinoJump;
    this.x = 80; this.y = 280;
    this.jumpSpeed = 8.5;
    this.step = 0;
    this.isJumping = false;
    this.isBowing = false;
    this.gravity = 0.8;
  }
  update(keys) {
    if(this.isJumping) {
      this.y -= this.jumpSpeed * 4;
      this.jumpSpeed -= this.gravity;
      if(this.jumpSpeed < -8.5) {
        this.jumpSpeed = 8.5;
        this.isJumping = false;
        this.y = 280;
      }
      this.image = this.jumpImg;
    } else if(this.isBowing) {
      this.image = this.bowImgs[Math.floor(this.step/5)%2];
      this.y = 310;
    } else {
      this.image = this.runImgs[Math.floor(this.step/5)%2];
      this.y = 280;
    }

    if((keys[" "] || keys["ArrowUp"]) && !this.isJumping) {
      this.isJumping = true; this.isBowing = false;
    } else if(keys["ArrowDown"] && !this.isJumping) {
      this.isBowing = true;
    } else this.isBowing = false;

    this.step = (this.step + 1) % 10;
  }
  draw() { ctx.drawImage(this.image, this.x, this.y); }
  getRect() { return {x:this.x, y:this.y, width:this.image.width, height:this.image.height}; }
}

class Cactus {
  constructor() {
    this.cactusImages = [
      images.smallCactus1, images.smallCactus2,
      images.largeCactus1, images.largeCactus2
    ];
    this.image = this.cactusImages[Math.floor(Math.random() * this.cactusImages.length)];
    this.x = screenWidth;

    if(this.image === images.largeCactus1 || this.image === images.largeCactus2){
      this.y = 270; 
    } else {
      this.y = 295;
    }
  }
  update() { this.x -= gameSpeed; }
  draw() { ctx.drawImage(this.image, this.x, this.y); }
  getRect() { return {x:this.x, y:this.y, width:this.image.width, height:this.image.height}; }
}

class Pterosaur {
  constructor() {
    this.images = [images.ptero1, images.ptero2];
    this.x = screenWidth; this.y = 230; this.index = 0;
  }
  update() {
    this.x -= gameSpeed;
    this.index = (this.index + 1) % 10;
  }
  draw() { ctx.drawImage(this.images[Math.floor(this.index/5)], this.x, this.y); }
  getRect() { return {x:this.x, y:this.y, width:this.images[0].width, height:this.images[0].height}; }
}

function drawBackground() {
  ctx.drawImage(images.bg, bgX, 350);
  ctx.drawImage(images.bg, bgX + images.bg.width, 350);
  bgX -= gameSpeed;
  if(bgX <= -images.bg.width) bgX = 0;
}

function showScore() {
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + Math.floor(score), 950, 30);
}

function isColliding(a,b) {
  return a.x < b.x + b.width && a.x + a.width > b.x &&
         a.y < b.y + b.height && a.y + a.height > b.y;
}

async function main() {
  await loadAssets();
  let keys = {};
  let gameOver = false; 

  document.addEventListener("keydown", e => keys[e.key] = true);
  document.addEventListener("keyup", e => keys[e.key] = false);

  const player = new Dino();

  function gameLoop() {
    if (gameOver) return; 

    ctx.clearRect(0, 0, screenWidth, screenHeight);
    drawBackground();

    player.update(keys);
    player.draw();

    if (obstacles.length === 0) {
      obstacles.push(Math.random() < 0.5 ? new Cactus() : new Pterosaur());
    }

    obstacles.forEach((obs, idx) => {
      obs.update();
      obs.draw();

      if (isColliding(player.getRect(), obs.getRect())) {
        gameOver = true; 
        alert("Game Over! Your score: " + Math.floor(score));
        document.location.reload();
      }

      if (obs.x < -100) obstacles.splice(idx, 1);
    });

    showScore();

    score += 0.5;
    if (score % 100 === 0) {
        gameSpeed += 0.5;
    }
    frame++;

    if (!gameOver) {
      requestAnimationFrame(gameLoop);
    }
  }

  gameLoop();
}


main();
