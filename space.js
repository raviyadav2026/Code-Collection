const canvas = document.getElementById('shooterCanvas');
const ctx = canvas.getContext('2d');

const startMenu = document.getElementById('startMenu');
const gameOverMenu = document.getElementById('gameOverMenu');
const scoreDisplay = document.getElementById('scoreDisplay');
const healthDisplay = document.getElementById('healthDisplay');
const finalScore = document.getElementById('finalScore');

let gameRunning = false;
let gameScore = 0;
let mousePos = { x: 0, y: 0 };

const ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 16,
    speed: 4.5,
    health: 100,
    vx: 0, vy: 0,
    friction: 0.88
};

let projectiles = [];
let targets = [];
let particles = [];

let spawnFrequency = 0.015;
let targetSpeedFactor = 1.8;

const inputs = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

window.addEventListener('keydown', (e) => { if (e.key in inputs) inputs[e.key] = true; });
window.addEventListener('keyup', (e) => { if (e.key in inputs) inputs[e.key] = false; });

canvas.addEventListener('mousemove', (e) => {
    const spaceBounds = canvas.getBoundingClientRect();
    mousePos.x = e.clientX - spaceBounds.left;
    mousePos.y = e.clientY - spaceBounds.top;
});

canvas.addEventListener('mousedown', () => {
    if (!gameRunning) return;
    
    // Evaluate precise angular trigonometry trajectory target paths toward current cursor positions
    const angleRad = Math.atan2(mousePos.y - ship.y, mousePos.x - ship.x);
    projectiles.push({
        x: ship.x, y: ship.y,
        vx: Math.cos(angleRad) * 8.5,
        vy: Math.sin(angleRad) * 8.5,
        radius: 3,
        color: '#06b6d4'
    });
});

function spawnTargetNode() {
    if (Math.random() < spawnFrequency) {
        let x, y;
        // Randomly roll perimeter vectors edge distributions structures boundary paths
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? -20 : canvas.width + 20;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? -20 : canvas.height + 20;
        }

        const angle = Math.atan2(ship.y - y, ship.x - x);
        const radius = Math.random() * (18 - 10) + 10;
        
        targets.push({
            x: x, y: y, radius: radius,
            vx: Math.cos(angle) * (Math.random() * 1 + targetSpeedFactor),
            vy: Math.sin(angle) * (Math.random() * 1 + targetSpeedFactor),
            color: '#f97316'
        });
    }
}

function generateExplosionCluster(x, y, color) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            radius: Math.random() * 2.5 + 1,
            decayRate: 0.025, alpha: 1, color: color
        });
    }
}

function updateEnginePhysics() {
    if (!gameRunning) return;

    if (inputs.w || inputs.ArrowUp) ship.vy -= ship.speed * 0.15;
    if (inputs.s || inputs.ArrowDown) ship.vy += ship.speed * 0.15;
    if (inputs.a || inputs.ArrowLeft) ship.vx -= ship.speed * 0.15;
    if (inputs.d || inputs.ArrowRight) ship.vx += ship.speed * 0.15;

    ship.vx *= ship.friction; ship.vy *= ship.friction;
    ship.x += ship.vx; ship.y += ship.vy;

    ship.x = Math.max(ship.radius, Math.min(canvas.width - ship.radius, ship.x));
    ship.y = Math.max(ship.radius, Math.min(canvas.height - ship.radius, ship.y));

    spawnTargetNode();

    projectiles.forEach((laser, lIdx) => {
        laser.x += laser.vx; laser.y += laser.vy;
        if (laser.x < 0 || laser.x > canvas.width || laser.y < 0 || laser.y > canvas.height) {
            projectiles.splice(lIdx, 1);
        }
    });

    targets.forEach((node, nIdx) => {
        node.x += node.vx; node.y += node.vy;

        const distanceToShip = Math.hypot(ship.x - node.x, ship.y - node.y);
        if (distanceToShip < ship.radius + node.radius) {
            generateExplosionCluster(node.x, node.y, node.color);
            targets.splice(nIdx, 1);
            ship.health = Math.max(0, ship.health - Math.round(node.radius));
            healthDisplay.textContent = ship.health;
            if (ship.health <= 0) terminateMissionProfile();
        }

        projectiles.forEach((laser, lIdx) => {
            const distanceToLaser = Math.hypot(laser.x - node.x, laser.y - node.y);
            if (distanceToLaser < laser.radius + node.radius) {
                generateExplosionCluster(node.x, node.y, node.color);
                targets.splice(nIdx, 1);
                projectiles.splice(lIdx, 1);
                gameScore += 25;
                scoreDisplay.textContent = gameScore;

                // Scale Difficulty Parameters based on milestones inside current run logs
                if (gameScore % 250 === 0) {
                    spawnFrequency += 0.003;
                    targetSpeedFactor += 0.25;
                }
            }
        });
    });

    particles.forEach((p, pIdx) => {
        p.x += p.vx; p.y += p.vy; p.alpha -= p.decayRate;
        if (p.alpha <= 0) particles.splice(pIdx, 1);
    });
}

function drawUniverseFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(Math.atan2(mousePos.y - ship.y, mousePos.x - ship.x));
    
    ctx.beginPath();
    ctx.moveTo(ship.radius * 1.25, 0);
    ctx.lineTo(-ship.radius, -ship.radius * 0.85);
    ctx.lineTo(-ship.radius * 0.5, 0);
    ctx.lineTo(-ship.radius, ship.radius * 0.85);
    ctx.closePath();
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.fill(); ctx.stroke();
    ctx.restore();

    projectiles.forEach(l => {
        ctx.beginPath();
        ctx.arc(l.x, l.y, l.radius, 0, Math.PI * 2);
        ctx.fillStyle = l.color;
        ctx.fill();
    });

    targets.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();
    });

    particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

function absoluteGameLoop() {
    if (!gameRunning) return;
    updateEnginePhysics();
    drawUniverseFrame();
    requestAnimationFrame(absoluteGameLoop);
}

function runMissionDeployment() {
    gameScore = 0; ship.health = 100;
    ship.x = canvas.width / 2; ship.y = canvas.height / 2;
    ship.vx = 0; ship.vy = 0;
    projectiles = []; targets = []; particles = [];
    spawnFrequency = 0.015; targetSpeedFactor = 1.8;

    scoreDisplay.textContent = gameScore;
    healthDisplay.textContent = ship.health;

    startMenu.classList.remove('active');
    gameOverMenu.classList.remove('active');

    gameRunning = true;
    absoluteGameLoop();
}

function terminateMissionProfile() {
    gameRunning = false;
    finalScore.textContent = gameScore;
    gameOverMenu.classList.add('active');
}

// Interface Button Event Click Assignments
document.getElementById('startBtn').addEventListener('click', runMissionDeployment);
document.getElementById('resetBtn').addEventListener('click', runMissionDeployment);
