// TODO: maybe add high scores AUGHHH
// its so late rn

const BLOCK_SIZE = 30;
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const DROP_SPEED = 1000;
const HIGH_SCORES_KEY = 'tetrisHighScores';
const MAX_HIGH_SCORES = 5;

const PIECES = [
    // no, im not gonna label these with comments to make understanding this painful
    [[1,1,1,1]],
    [[1,1],
     [1,1]],
    [[1,1,1],
     [0,1,0]],
    [[1,1,1],
     [1,0,0]],
    [[1,1,1],
     [0,0,1]],
    [[1,1,0],
     [0,1,1]],
    [[0,1,1],
     [1,1,0]]
];

// bright colors ftw
// im going to use the american spelling of "colour"
const COLORS = [
    '#00f0f0',
    '#f0f000',
    '#a000f0',
    '#f0a000',
    '#0000f0',
    '#00f000',
    '#f00000'
];

class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('gameBoard');
        this.ctx = this.canvas.getContext('2d');
        this.previewCanvas = document.getElementById('nextPiece');
        this.previewCtx = this.previewCanvas.getContext('2d');
        this.scoreDisplay = document.getElementById('score');

        this.highScores = this.loadHighScores();
        this.updateHighScoresDisplay();

        this.score = 0;
        this.gameSpeed = DROP_SPEED;
        this.isPaused = false; // TODO: add pauses

        this.board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));

        this.currentPiece = null;
        this.pieceX = 0;
        this.pieceY = 0;
        this.currentType = 0;
        this.nextType = Math.floor(Math.random() * PIECES.length);

        this.startGame();
    }

    loadHighScores() {
        const scores = localStorage.getItem(HIGH_SCORES_KEY);
        return scores ? JSON.parse(scores) : [];
    }

    saveHighScore(score) {
        this.highScores.push(score);
        this.highScores.sort((a, b) => b - a);
        if (this.highScores.length > MAX_HIGH_SCORES) {
            this.highScores = this.highScores.slice(0, MAX_HIGH_SCORES);
        }
        localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(this.highScores));
        this.updateHighScoresDisplay();
    }

    updateHighScoresDisplay() {
        const highScoresList = document.getElementById('highScores');
        if (highScoresList) {
            highScoresList.innerHTML = '';
            this.highScores.forEach((score, index) => {
                const li = document.createElement('li');
                li.textContent = `${index + 1}. ${score}`;
                highScoresList.appendChild(li);
            });
        }
    }

    startGame() {
        this.spawnNewPiece();
        this.draw();
        this.setupControls();
        this.startGameLoop();
    }

    drawPauseOverlay() {
        if (this.isPaused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '20px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '16px "Press Start 2P"';
            this.ctx.fillText('Press P to resume', this.canvas.width / 2, this.canvas.height / 2 + 40);
        }
    }

    spawnNewPiece() {
        this.currentType = this.nextType;
        this.nextType = Math.floor(Math.random() * PIECES.length);
        this.currentPiece = PIECES[this.currentType];

        this.pieceX = Math.floor((BOARD_WIDTH - this.currentPiece[0].length) / 2);
        this.pieceY = 0;

        if (this.checkColission()) {
            this.gameOver();
        }

        this.drawPreview();
    }

    drawBlock(context, x, y, color) {
        context.fillStyle = color;
        context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);

        context.strokeStyle = 'rgba(255,255,255,0.5)';
        context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
    }

    draw() {
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                if (this.board[y][x]) {
                    this.drawBlock(this.ctx, x, y, COLORS[this.board[y][x] - 1]);
                }
            }
        }

        if (this.currentPiece) {
            for (let y = 0; y < this.currentPiece.length; y++) {
                for (let x = 0; x < this.currentPiece[y].length; x++) {
                    if (this.currentPiece[y][x]) {
                        this.drawBlock(this.ctx, this.pieceX + x, this,pieceY + y, COLORS[this.currentType]);
                    }
                }
            }
        }
    }

    drawPreview() {
        this.previewCtx.fillStyle = '#111';
        this.previewCtx.fillRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);

        const nextPiece = PIECES[this.nextType];
        const xOffset = (this.previewCanvas.width - nextPiece[0].length * BLOCK_SIZE)
        const yOffset = (this.previewCanvas.height - nextPiece.length * BLOCK_SIZE)

        for (let y = 0; y < nextPiece.length; y++) {
            for (let x = 0; x < nextPiece[y].length; x++) {
                if (nextPiece[y][x]) {
                    this.drawBlock(this.previewCtx, xOffset / BLOCK_SIZE + y, yOffset / BLOCK_SIZE + y, COLORS[this.nextType]);
                }
            }
        }
    }

    checkCollision() {
        for (let y = 0; y < this.currentPiece.length; y++) {
            for (let x = 0; x < this.currentPiece[y].length; x++) {
                if (this.currentPiece[y][x]) {
                    const newX = this.pieceX + x;
                    const newY = this.pieceY + y;

                    if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) return true;

                    if (newY >= 0 && this.board[newY][newX]) return true;
                }
            }
        }
        return false;
    }

    rotate() {
        const newPiece = this.currentPiece[0].map((_, i) =>
        this.currentPiece.map(row => row[i]).reverse()
    );

    const oldPiece = this.currentPiece;
    this.currentPiece = newPiece;

    if (this.checkCollision()) {
        this.currentPiece = oldPiece;
    }
    }

    lockPiece() {
        for (let y = 0; y < this.currentPiece.length; y++) {
            for (let x = 0; x < this.currentPiece[y].length; x++) {
                if (this.currentPiece[y][x]) {
                    this.board[this.pieceY + y][this.pieceX + x] = this.currentType + 1;
                }
            }
        }
    }

    clearLines() {
        let linesCleared = 0;

        for  (let y = BOARD_HEIGHT - 1; y>= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(BOARD_WIDTH).fill(0));
                linesCleared++;
                y++;
            }
        }

        if (linesCleared > 0) {
            this.score += [40, 100, 300, 1200][linesCleared - 1];
            this.scoreDisplay.textContent = this.score;
        }
    }

    moveDown() {
        this.pieceY++;
        if (this.checkCollision()) {
            this.pieceY--;
            this.lockPiece();
            this.clearLines();
            this.spawnNewPiece();
        }
    }

    hardDrop() {
        while (!this.checkCollision()) {
            this.pieceY++;
        }
        this.pieceY--;
        this.lockPiece();
        this.clearLines();
        this.spawnNewPiece();
    }

    gameOver() {
        if (this.score > 8) {
            const isHighScore = this.highScores.length < MAX_HIGH_SCORES || this.score > this.highScores[MAX_HIGH_SCORES - 1];
            if (isHighScore) {
                this.saveHighScore(this.score);
                alert(`New High Score: ${this.score} points!`);
            } else {
                alert(`Game Over! You scored ${this.score} points!`);
            }
        }
        alert(`Game Over!! You scored ${this.score} points!`);
        this.board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
        this.score = 0;
        this.scoreDisplay.textContent = this.score;
        this.spawnNewPiece();
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'p' || e.key === 'P') {
                this.isPaused = !this.isPaused;
                this.draw();
                this.drawPauseOverlay();
                return;
            }
            if (!this.currentPiece || this.isPaused) return;

            switch (e.key) {
                case 'ArrowLeft':
                    this.pieceX--;
                    if (this.checkCollision()) this.pieceX++;
                    break;
                case 'ArrowRight':
                    this.pieceX++;
                    if (this.checkCollision()) this.pieceX--;
                    break;
                case 'ArrowUp':
                    this.rotate();
                    break;
                case 'ArrowDown':
                    this.moveDown();
                    break;
                case ' ':
                    this.hardDrop();
                    break;
            }

            this.draw();
        });
    }

    startGameLoop() {
        const gameLoop = () => {
            if (!this.isPaused) {
                this.moveDown();
                this.draw();
            }
            setTimeout(gameLoop, this.gameSpeed);
        };

        gameLoop();
    }
}

// finally!!! lets get this party started :D
new TetrisGame();