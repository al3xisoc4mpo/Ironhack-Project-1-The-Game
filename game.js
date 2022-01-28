// Canvas Set-Up
const canvas = document.getElementById("gameScreen");
const context = canvas.getContext("2d");

canvas.width = 1200;
canvas.height = 580;

// Obtaining the play/pause button
playButton = document.getElementById('play-button');

// Event listener for starting game when play button is clicked
window.onload = () => {
    playButton.onclick = () => {
        isPaused = !isPaused;
        if (isPaused) {
            playButton.src = "./images/pause-button.png";
            startGame();
        } else {
            playButton.src = "./images/play-button.png"
            context.fillStyle = "rgba(0,0,0,0.7)"
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.font = "bold 30px 'Press Start 2P', cursive";
            context.textAlign = "center"
            context.fillStyle = "white"
            context.fillText("Paused", canvas.width / 2, canvas.height / 2);
            cancelAnimationFrame(animationFrame);
            backgroundAudio.pause();
            startGame();
        }
    };
};

// Function to Start Game
function startGame() {
    if (isPaused) {
        backgroundAudio.play();
        animationFrame = requestAnimationFrame(animationLoop)
    }
}

// Declaring and/or initializing core game variables
let animationFrame = null; // to toggle game start/stop
let frames = 0; // for animation flow control
let isPaused = false; // to monitor pause state;
let hasGameEnded = false;


let shield = 3; // shield level, getting hit with zero shield and you loose
let fuel = 300; // fuel reserves, when depleted you loose
let lightYears = 3; // distance from goal, when light years reaches 0 you win

// Declaring and initializing variables with empty arrays for all obstacles/objects in the game
const proyectiles = [];
const asteroids = [];
const blackHoles = [];

// Declaring and initializing variables with the images that will be used throught the game
const fuelImages = ["./images/fuel-green.png", "./images/fuel-yellow.png", "./images/fuel-red.png"]
const shieldImages = ["./images/shield-green.png", "./images/shield-yellow.png", "./images/shield-red.png"]
const proyectileImagePath = "./images/proyectile.png";
const asteroidImagePath = "./images/asteroid.png";
const blackHoleImagePath = "./images/black-hole.png";
const arriveToPlanetPath = "./images/nasa-planet-nebula.jpg"


// Declaring and initializing variables for all the sound effects.
backgroundAudio = new Audio();
backgroundAudio.src = "./sound/background-audio.mp3"
backgroundAudio.loop = true;
missileFiringAudio = new Audio();
missileFiringAudio.src = "./sound/missile-firing.mp3"
shieldImpactAudio = new Audio();
shieldImpactAudio.src = "./sound/shield-impact.mp3"
explosionAudio = new Audio();
explosionAudio.src = "./sound/explosion.mp3"
blackHoleAudio = new Audio();
blackHoleAudio.src = "./sound/black-hole.mp3"

// Declaring Player Class
class Player {
    constructor() {
        this.width = 60;
        this.height = 60;
        this.position = {
            x: (canvas.width / 2) - (this.width / 2),
            y: canvas.height - this.height - 20
        }
        this.image = new Image();
        this.image.src = "./images/spaceship.png";
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

// Iniating player from Player Class
const player = new Player();

// Declaring Obstacle Class
class Obstacle {
    constructor(width, height, imagePath, speedX, speedY) {
        this.width = width;
        this.height = height;
        this.position = {
            x: Math.floor(Math.random() * (canvas.width - this.width)),
            y: 0
        }
        this.image = new Image();
        this.image.src = imagePath;
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

// Generating Asteroids and monitoring for collision.
function generateAsteroids() {
    if (frames % 30 === 0 || frames % 60 === 0 || frames % 90 === 0 || frames % 120 === 0 || frames % 150 === 0) {
        const asteroid = new Obstacle(80, 80, asteroidImagePath, 0.8, 1.6);
        asteroids.push(asteroid);
    }
    asteroids.forEach((asteroid, asteroid_index) => {
        asteroid.draw();
        if (player.collision(asteroid)) {
            if (shield > 0) {
                shieldImpactAudio.play();
            } else {
                explosionAudio.play();
            }
            shield--;
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
            // console.log(asteroids);
        }
    })
}

// Generate Black Holes
function generateBlackHoles() {
    if (frames % 400 === 0) {
        const blackHole = new Obstacle(player.width * 3, player.height * 3, blackHoleImagePath, 0, 0.5);
        blackHoles.push(blackHole);
    }
    blackHoles.forEach((blackHole, blackHole_index) => {
        blackHole.draw();
        if (player.collision(blackHole)) {
            blackHoleAudio.play();
            fuel -= 30;
            blackHoles.splice(blackHole_index, 1);
        }
        proyectiles.forEach((proyectile, proyectile_index) => {
            if (proyectile.collision(blackHole)) {
                proyectiles.splice(proyectile_index, 1);
            }
        });
        if (blackHole.position.y >= canvas.height) {
            blackHoles.splice(blackHole_index, 1);
            // console.log(blackHoles);
        }
    })
}

// Declaring Item Class
class Item {
    constructor(width, height, imagePath, positionX, positionY, speedX, speedY) {
        this.width = width;
        this.height = height;
        this.image = new Image();
        this.image.src = imagePath;
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

// Declaring Proyectile Class - reviewing possible elimination
class Proyectile extends Item {
    constructor(width, height, imagePath, positionX, positionY, speedX, speedY) {
        super(width, height, imagePath, positionX, positionY, speedX, speedY);
    }
    // draw() {
    //     this.position.x += this.speed.x;
    //     this.position.y += this.speed.y;
    //     context.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    // }
}

// Declaring Background Class
class GameBoard {
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
    youWin() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        this.image2 = new Image();
        this.image2.src = arriveToPlanetPath;
        context.drawImage(this.image2, 0, 0, canvas.width, 1200);
        context.font = "bold 40px 'Press Start 2P', cursive";
        context.textAlign = "center"
        context.fillStyle = "white"
        context.fillText("You Win!!!", canvas.width / 2, 100);
        context.font = "bold 30px 'Press Start 2P', cursive";
        context.fillText("Welcome home!", canvas.width / 2, canvas.height / 2 + 40);
        context.fillText("Pilot Iron Jhack", canvas.width / 2, canvas.height / 2 + 80);
        context.font = "bold 20px 'Press Start 2P', cursive";
        context.fillText("Press R to play again", canvas.width / 2, canvas.height / 2 + 160);
    }
    youLoose1() {
        context.fillStyle = "rgb(0,0,0)"
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.font = "bold 54px 'Press Start 2P', cursive";
        context.textAlign = "center"
        context.fillStyle = "white"
        context.fillText("Game Over", canvas.width / 2, 100);
        this.image2 = new Image();
        this.image2.src = fuelImages[2];
        context.drawImage(this.image2, canvas.width / 2 - 50, canvas.height / 4 + 20, 100, 100);
        context.fillText("You ran out of fuel", canvas.width / 2, canvas.height / 2 + 40);
        context.font = "bold 30px 'Press Start 2P', cursive";
        context.fillText("Press R to play again", canvas.width / 2, canvas.height / 2 + 120);
    }
    youLoose2() {
        context.fillStyle = "rgb(0,0,0)"
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.font = "bold 50px 'Press Start 2P', cursive";
        context.textAlign = "center"
        context.fillStyle = "white"
        context.fillText("Game Over", canvas.width / 2, 100);
        this.image2 = new Image();
        this.image2.src = shieldImages[2];
        context.drawImage(this.image2, canvas.width / 2 - 50, canvas.height / 4, 100, 100);
        context.font = "bold 40px 'Press Start 2P', cursive";
        context.fillText("Destroyed, impacted by an", canvas.width / 2, canvas.height / 2 + 40);
        context.fillText("asteroid with no shield", canvas.width / 2, canvas.height / 2 + 80);
        context.font = "bold 30px 'Press Start 2P', cursive";
        context.fillText("Press R to play again", canvas.width / 2, canvas.height / 2 + 160);
    }
}

// Initializing background from Player Class
const background = new GameBoard("./images/space.jpg");

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
        case "win":
            animationFrame = null;
            background.youWin();
            break;
        case "loose1":
            animationFrame = null;
            background.youLoose1();
            break;
        case "loose2":
            animationFrame = null;
            background.youLoose2();
            break;
        default:
            break;
    }
    if (animationFrame) {
        animationFrame = requestAnimationFrame(animationLoop);
    };
}

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
            proyectiles.push(new Proyectile(player.width / 2, player.height / 2, proyectileImagePath, player.position.x + player.width / 4, player.position.y, 0, -8));
            fuel -= 10;
            // console.log(proyectiles);
            break;
        case "r":
            restartGame();
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
        fuel--;
    }
}

// Function to monitor game status
function statusCheck() {
    if (lightYears === 0) {
        hasGameEnded = true;
        // console.log(hasGameEnded);
        return "win"
    } else if (fuel <= 0) {
        hasGameEnded = true;
        // console.log(hasGameEnded);
        return "loose1"
    } else if (shield < 0) {
        hasGameEnded = true;
        // console.log(hasGameEnded);
        return "loose2";
    } else {
        hasGameEnded = false;
        return "alive"
    }
}

// Function to print stats in screen
function printStats() {
    const fuelImage = new Image();
    if (fuel >= 200) {
        fuelImage.src = fuelImages[0];
        context.drawImage(fuelImage, 20, 20, 50, 50);
    }
    if (fuel >= 100 && fuel < 200) {
        fuelImage.src = fuelImages[1];
        context.drawImage(fuelImage, 20, 20, 50, 50);
    }
    if (fuel < 100) {
        fuelImage.src = fuelImages[2];
        context.drawImage(fuelImage, 20, 20, 50, 50);
    }
    const shieldImage = new Image();
    if (shield === 3) {
        shieldImage.src = shieldImages[0];
        context.drawImage(shieldImage, 1120, 20, 60, 60);
    }
    if (shield === 2) {
        shieldImage.src = shieldImages[1];
        context.drawImage(shieldImage, 1120, 20, 60, 60);
    }
    if (shield === 1) {
        shieldImage.src = shieldImages[2];
        context.drawImage(shieldImage, 1120, 20, 60, 60);
    }
    context.font = "bold 20px 'Press Start 2P', cursive";
    context.fillStyle = "white";
    context.textAlign = "left";
    context.fillText(`Fuel: ${fuel}`, 80, 60);
    context.textAlign = "center"
    context.fillText(`Light Years to Home:`, canvas.width / 2, 50);
    context.fillText(`${lightYears}`, canvas.width / 2, 75);
    context.textAlign = "right"
    context.fillText(`Shield: ${shield}`, 1120, 60);
}

// Function to launch proyectiles
function launchProyectiles() {
    proyectiles.forEach((proyectile, proyectile_index) => {
        missileFiringAudio.play();
        proyectile.draw();
        if (proyectile.position.y + proyectile.height <= 0) {
            proyectiles.splice(proyectile_index, 1);
        }
    });
}

// Function for restarting game
function restartGame() {
    if (hasGameEnded) {
        shield = 3;
        fuel = 300;
        lightYears = 3;
        proyectiles.splice(0, proyectiles.length);
        asteroids.splice(0, asteroids.length);
        blackHoles.splice(0, blackHoles.length);
        player.position.x = (canvas.width / 2) - (player.width / 2);
        player.position.y = canvas.height - player.height - 20;
        startGame();
        hasGameEnded = !hasGameEnded;
        // console.log(hasGameEnded);
    }
}