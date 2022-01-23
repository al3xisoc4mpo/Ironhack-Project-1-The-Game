// Setup canvas
const canvas = document.getElementById("gameScreen");
const context = canvas.getContext("2d");

canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.9;

let frames = 0;
let SpaceToDestination

const asteroids = [];
const asteroidImage = new Image();
asteroidImage.src = "./images/asteroid.png";

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
    }
    draw() {
        context.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }
    collision(object){
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
class Obstacle {
    constructor(width, height, img, maxHP, speedX, speedY) {
        this.width = width;
        this.height = height;
        this.position = {
            x: Math.floor(Math.random() * canvas.width),
            y: -this.width
        }
        this.image = new Image();
        this.image.src = img.src;
        this.health = maxHP;
        this.speed = {
            x: (Math.random()>0.5?1:-1) * speedX,
            y: speedY
        }
    }
    draw() {
        this.position.x += this.speed.x;
        this.position.y += this.speed.y;
        context.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }
}

function generateAsteroids() {
    if (frames % 300 === 0 || frames % 500 === 0) {
        const asteroid = new Obstacle(80, 80, asteroidImage, 1, 0.5, 1);
        asteroids.push(asteroid);
    }
    asteroids.forEach((asteroid,asteroid_index) => {
        asteroid.draw();
        if(player.collision(asteroid)){
            console.log(player.collision(asteroid));
        }
        if(asteroid.position.x + asteroid.width <= 0 || asteroid.position.x >= canvas.width || asteroid.position.y + asteroid.height >= canvas.height){
            asteroids.splice(asteroid_index,1);
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
        context.font = "50px Arial";
        context.fillText("Game Over", 100, 100);
    }
}

// Iniate player from Player Class
const background = new Background("./images/space.jpg");

// Create animation Loop
function animationLoop() {
    frames++;
    context.clearRect(0, 0, canvas.width, canvas.height);
    background.draw();
    player.draw();
    generateAsteroids();
    requestAnimationFrame(animationLoop);
}

animationLoop();

// Generate movement pattern for the player
addEventListener("keydown", event => {
    switch (event.key) {
        case "ArrowLeft":
            if ((player.position.x - 20) < 0) {
                player.position.x = 0;
            } else {
                player.position.x -= 20;
            }
            break;
        case "ArrowRight":
            if ((player.position.x + player.width + 20) >= canvas.width) {
                player.position.x = canvas.width - player.width;
            } else {
                player.position.x += 20;
            }
            break;
        case "ArrowUp":
            if ((player.position.y - 20) <= 0) {
                player.position.y = 0;
            } else {
                player.position.y -= 20;
            }
            break;
        case "ArrowDown":
            if ((player.position.y + player.height + 20) >= canvas.height) {
                player.position.y = canvas.height - player.height;
            } else {
                player.position.y += 20;
            }
            break;
        default:
            break;
    };
});