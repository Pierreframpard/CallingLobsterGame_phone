const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const scrollSpeed = 3;
let lobster = {
    x: canvas.width / 4, // Position fixe en x
    y: canvas.height / 2,
    width: canvas.width * 0.1,
    height: canvas.width * 0.1,
    dy: 0,
    gravity: 0.7,
    jumpPower: -10,
    isJumping: false
};

let obstacles = [];
let backgroundX = 0;
let gameOver = false;
let score = 0;

// Ajouter un élément audio pour le fond musical
const backgroundMusic = new Audio("assets/background_music.mp3");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5; // Ajustable

// Activer la musique au premier touchstart (pour éviter les restrictions des navigateurs mobiles)
let musicStarted = false;
document.addEventListener("touchstart", () => {
    if (!musicStarted) {
        backgroundMusic.play().catch(error => console.log("Erreur audio :", error));
        musicStarted = true;
    }
});

const lobsterSprite = new Image();
lobsterSprite.src = "assets/lobster.png"; // Image du homard en pixel art
const backgroundImage = new Image();
backgroundImage.src = "assets/brutalist_city.png"; // Image de la ville brutaliste
const phoneSprite1 = new Image();
phoneSprite1.src = "assets/retro_phone_1.png"; // Image du téléphone rétro bas

const phoneSprite2 = new Image();
phoneSprite2.src = "assets/retro_phone_2.png"; // Image du téléphone rétro haut

function jump() {
    lobster.dy = lobster.jumpPower; // Applique une nouvelle impulsion vers le haut
}

document.addEventListener("touchstart", jump);
document.addEventListener("keydown", (event) => {
    if (event.code === "Space" || event.code === "ArrowUp") {
        jump();
    }
});

function update() {
    if (gameOver) return;
    if (!gameOver) score++;

    lobster.y += lobster.dy;
    lobster.dy += lobster.gravity * 0.9; // Gravité légèrement réduite pour fluidifier la descente
    
    // Position fixe en x
    lobster.x = canvas.width / 4;

    // Vérifier les limites du homard
    if (lobster.y >= canvas.height - lobster.height) {
        lobster.y = canvas.height - lobster.height;
        lobster.isJumping = false;
    }
    if (lobster.y <= 0 || lobster.y >= canvas.height - lobster.height) {
        gameOver = true;
    }

    backgroundX -= scrollSpeed; // Faire défiler le fond horizontalement
    if (backgroundX <= -canvas.width) {
        backgroundX = 0;
    }

    // Générer des paires de téléphones
    if (Math.random() < 0.02) {
        const minGap = 250; // Écartement minimum plus grand
        const maxGap = 350; // Écartement maximum pour plus de variété
        const gap = Math.random() * (maxGap - minGap) + minGap;
        const topY = Math.random() * (canvas.height - 300 - gap);
        obstacles.push({
            x: canvas.width,
            y: topY,
            width: canvas.width * 0.15,
            height: canvas.width * 0.15,
            isTop: true
        });
        obstacles.push({
            x: canvas.width,
            y: topY + gap,
            width: canvas.width * 0.15,
            height: canvas.width * 0.15,
            isTop: false
        });
        obstacles.push({
            x: canvas.width,
            y: topY - canvas.width * 0.15, // Nouveau téléphone au-dessus du premier
            width: canvas.width * 0.15,
            height: canvas.width * 0.15,
            isTop: true
        });
        obstacles.push({
            x: canvas.width,
            y: topY + gap + canvas.width * 0.15, // Nouveau téléphone en dessous du second
            width: canvas.width * 0.15,
            height: canvas.width * 0.15,
            isTop: false
        });
    }

    obstacles.forEach(obstacle => {
        obstacle.x -= scrollSpeed; // Faire défiler les téléphones vers la gauche
        if (obstacle.x < lobster.x + lobster.width && 
            obstacle.x + obstacle.width > lobster.x && 
            obstacle.y < lobster.y + lobster.height && 
            obstacle.y + obstacle.height > lobster.y) {
            gameOver = true; // Collision avec un téléphone
        }
    });

    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.drawImage(backgroundImage, backgroundX, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, backgroundX + canvas.width, 0, canvas.width, canvas.height);

    ctx.drawImage(lobsterSprite, lobster.x, lobster.y, lobster.width, lobster.height);

    obstacles.forEach(obstacle => {
        const sprite = obstacle.isTop ? phoneSprite2 : phoneSprite1;
        ctx.drawImage(sprite, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
    ctx.fillStyle = "white";
    ctx.font = "24px sans-serif";
    ctx.fillText("Score: " + score, 20, 40);

    if (gameOver) {
        ctx.fillStyle = "red";
        ctx.font = "48px sans-serif";
        ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2);
        ctx.font = "24px sans-serif";
        ctx.fillText("Touch to Restart", canvas.width / 2 - 90, canvas.height / 2 + 50);
        ctx.fillText("Final Score: " + score, canvas.width / 2 - 100, canvas.height / 2 + 100);
    }
}

function restartGame() {
    score = 0;
    lobster.x = canvas.width / 4;
    lobster.y = canvas.height / 2;
    lobster.dy = 0;
    lobster.isJumping = false;
    obstacles = [];
    backgroundX = 0;
    gameOver = false;
}

document.addEventListener("touchstart", () => {
    if (gameOver) {
        restartGame();
    } else {
        jump();
    }
});

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
