// Setup canvas
const canvas = document.getElementById("gameScreen");
const context = canvas.getContext("2d");

canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.9;

// Declare Player Class
class Player {
    constructor() {
        this.width = canvas.width * 0.05;
        this.height = canvas.height * 0.1;
        this.position = {
            x: canvas.width / 2,
            y: canvas.height - this.height - 20
        }
        this.image = new Image;
        this.image.src = "./images/spaceship.png";
    }
    draw() {
        context.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }
}

// Iniate player from Player Class
const player = new Player(canvas.width, canvas.height);

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
        this.position.y++;
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
    context.clearRect(0, 0, canvas.width, canvas.height);
    background.draw();
    player.draw();
    requestAnimationFrame(animationLoop);
}

animationLoop();

// Generate movement pattern for the player
addEventListener("keydown", event => {
    switch (event.key) {
        case "ArrowLeft":
            player.position.x -= 20;
            break;
        case "ArrowRight":
            player.position.x += 20;
            break;
        case "ArrowUp":
            player.position.y -= 20;
            break;
        case "ArrowDown":
            player.position.y += 20;
            break;
        default:
            break;
        };
    });