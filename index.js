// Setup canvas
const canvas = document.getElementById("gameScreen");
const context = canvas.getContext("2d");

canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.9;

// Declare Player Class
class Player {
    constructor(gameWidth, gameHeight) {
        this.width = gameWidth * 0.05;
        this.height = gameHeight * 0.05;
        this.position = {
            x: gameWidth / 2,
            y: gameHeight - this.height - 20
        }
        this.image = new Image;
        this.image.src = "./images/spaceship.jpg";
    }
    draw() {
        context.drawImage(this.image, this.position.x, this.position.y,this.width, this.height);
    }
}

// Iniate player from Player Class
const player = new Player(canvas.width, canvas.height);

// Create animation Loop
function animationLoop() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    player.draw();
    console.log(requestAnimationFrame(animationLoop));
}

animationLoop();