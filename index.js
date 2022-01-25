// Canvas Set-Up
const canvas = document.getElementById("gameScreen");
const context = canvas.getContext("2d");

canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.9;

// Declaring and/or initializing core game variables
let animationFrame = null;
let frames = 0; // for animation flow control
let lightYears = 10; // distance from goal, when light years reaches 0 you win

const proyectiles = [];
const asteroids = [];
const blackHoles = [];
const asteroidImage = new Image();
asteroidImage.src = "./images/asteroid.png";
const blackHoleImage = new Image();
blackHoleImage.src = "./images/black hole.png";
const proyectileImage = new Image();
proyectileImage.src = "./images/proyectile.png"

// Declare Player Class
class Player {
    constructor() {
        this.width = canvas.width * 0.05;
        this.height = canvas.height * 0.1;
        this.position = {
            x: canvas.width / 2 - (this.width / 2),
            y: canvas.height - this.height - 20
        }
        this.image = new Image();
        this.image.src = "./images/spaceship.png";
        this.shield = 3;
        this.fuel = 200;
    }
    draw() {
        context.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }
    collision(object) {
        return (
            this.position.x < object.position.x + object.width &&
            this.position.x + this.width > object.position.x &&
            this.position.y < object.position.y + object.height &&
            this.position.y + this.height > object.position.y
        )
    }
}

// Iniate player from Player Class
const player = new Player(canvas.width, canvas.height);

// Declare Obstacle Class
class Obstacle {
    constructor(width, height, img, maxHP, speedX, speedY) {
        this.width = width;
        this.height = height;
        this.position = {
            x: Math.floor(Math.random() * canvas.width - this.width),
            y: -this.width
        }
        this.image = new Image();
        this.image.src = img.src;
        this.health = maxHP;
        this.speed = {
            x: (Math.random() > 0.5 ? 1 : -1) * speedX,
            y: speedY
        }
    }
    draw() {
        this.position.x += this.speed.x;
        this.position.y += this.speed.y;
        context.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }
}

class Item {
    constructor(width, height, img, positionX, positionY, speedX, speedY) {
        this.width = width;
        this.height = height;
        this.image = new Image();
        this.image.src = img;
        this.position = {
            x: positionX,
            y: positionY
        };
        this.speed = {
            x: speedX,
            y: speedY
        };
    }
    draw() {
        this.position.x += this.speed.x;
        this.position.y += this.speed.y;
        context.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }
    collision(object) {
        return (
            this.position.x < object.position.x + object.width &&
            this.position.x + this.width > object.position.x &&
            this.position.y < object.position.y + object.height &&
            this.position.y + this.height > object.position.y
        )
    }
}

class Proyectile extends Item {
    constructor(width, height, img, positionX, positionY, speedX, speedY) {
        super(width, height, img, positionX, positionY, speedX, speedY);
    }
    draw() {
        this.position.x += this.speed.x;
        this.position.y += this.speed.y;
        context.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }
}

// Generate Asteroids
function generateAsteroids() {
    if (frames % 100 === 0 || frames % 300 === 0) {
        const asteroid = new Obstacle(80, 80, asteroidImage, 1, 0.5, 1);
        asteroids.push(asteroid);
    }
    asteroids.forEach((asteroid, asteroid_index) => {
        asteroid.draw();
        if (player.collision(asteroid)) {
            player.shield--;
            asteroids.splice(asteroid_index, 1);
        }
        proyectiles.forEach((proyectile, proyectile_index) => {
            if (proyectile.collision(asteroid)) {
                asteroids.splice(asteroid_index, 1);
                proyectiles.splice(proyectile_index, 1);
            }
        });
        if (asteroid.position.x + asteroid.width <= 0 || asteroid.position.x >= canvas.width || asteroid.position.y >= canvas.height) {
            asteroids.splice(asteroid_index, 1);
            console.log(asteroids);
        }
    })
}

// Generate Black Holes
function generateBlackHoles() {
    if (frames % 1000 === 0) {
        const blackHole = new Obstacle(player.width*4, player.height*4, blackHoleImage, 1, 0, 0.5);
        blackHoles.push(blackHole);
    }
    blackHoles.forEach((blackHole, blackHole_index) => {
        blackHole.draw();
        if (player.collision(blackHole)) {
            player.fuel--;
            blackHoles.splice(blackHole_index, 1);
        }
        proyectiles.forEach((proyectile, proyectile_index) => {
            if (proyectile.collision(blackHole)) {
                proyectiles.splice(proyectile_index, 1);
            }
        });
        if (blackHole.position.y >= canvas.height) {
            blackHoles.splice(blackHole_index, 1);
            console.log(blackHoles);
        }
    })
}



// Declare Background Class
class Background {
    constructor(backgroundImage) {
        this.position = {
            x: 0,
            y: 0
        };
        this.width = canvas.width;
        this.height = canvas.height;
        this.image = new Image();
        this.image.src = backgroundImage;
    }
    draw() {
        this.position.y += 3;
        if (this.position.y > canvas.height) {
            this.position.y = 0;
        }
        else {
            context.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
            context.drawImage(this.image, this.position.x, this.position.y - this.height, this.width, this.height);
        }
    }
    gameOver() {
        context.fillStyle = "rgba(0,0,0,0.8)"
        context.fillRect(0,0,canvas.width,canvas.height);
        context.font = "bold 50px Arial";
        context.textAlign = "center"
        context.fillStyle = "white"
        context.fillText("Game Over", canvas.width / 2, canvas.height / 2);
    }
}

// Iniate background from Player Class
const background = new Background("./images/space.jpg");

// Function to create animation Loop
function animationLoop() {
    frames++;
    context.clearRect(0, 0, canvas.width, canvas.height);
    statsUpdate();
    background.draw();
    player.draw();
    generateBlackHoles();
    generateAsteroids();
    launchProyectiles();
    printStats();
    switch (statusCheck()) {
        case "loose":
            background.gameOver();
            animationFrame = null;
            console.log("loose");
            break;
        case "win":
            animationFrame = null;
            console.log("win");
            break;
        default:
            break;
    }
    if (animationFrame) {
        animationFrame = requestAnimationFrame(animationLoop);
    };
}

// Function to start the game
function startGame() {
    animationFrame = requestAnimationFrame(animationLoop)
}

startGame();

// Generate movement pattern for the player
addEventListener("keydown", event => {
    switch (event.key) {
        case "ArrowLeft":
            if ((player.position.x - 30) < 0) {
                player.position.x = 0;
            } else {

                player.position.x -= 30;
            }
            break;
        case "ArrowRight":
            if ((player.position.x + player.width + 30) >= canvas.width) {
                player.position.x = canvas.width - player.width;
            } else {
                player.position.x += 30;
            }
            break;
        case "ArrowUp":
            if ((player.position.y - 30) <= 0) {
                player.position.y = 0;
            } else {
                player.position.y -= 30;
            }
            break;
        case "ArrowDown":
            if ((player.position.y + player.height + 30) >= canvas.height) {
                player.position.y = canvas.height - player.height;
            } else {
                player.position.y += 30;
            }
            break;
        case " ":
            proyectiles.push(new Proyectile(player.width / 2, player.height / 2, proyectileImage.src, player.position.x + player.width / 4, player.position.y, 0, -5));
            player.fuel -= 10;
            console.log(proyectiles);
            break;
        default:
            break;
    };
});

// Function to update player stats
function statsUpdate() {
    if (frames % 1200 === 0) {
        lightYears--;
    }
    if (frames % 100 === 0) {
        player.fuel--;
    }
}

// Function to monitor game status
function statusCheck() {
    if (player.shield <= 0 || player.fuel <= 0) {
        return "loose";
    } else if (lightYears <= 0) {
        return "win"
    } else {
        return "alive"
    }
}

// Function to print stats in screen
function printStats() {
    context.font = "bold 20px Arial";
    context.fillStyle = "white"
    context.textAlign = "left"
    context.fillText(`Fuel: ${player.fuel}`, canvas.width / 8, 50);
    context.textAlign = "center"
    context.fillText(`Light Years to Home: ${lightYears}`, canvas.width / 2, 50);
    context.textAlign = "right"
    context.fillText(`Shield: ${player.shield}`, (canvas.width - canvas.width / 8), 50);
}

function launchProyectiles() {
    proyectiles.forEach((proyectile, proyectile_index) => {
        proyectile.draw();
        if (proyectile.position.y + proyectile.height <= 0) {
            proyectiles.splice(proyectile_index, 1);
        }
    });
}