// Chess for Blind & Deaf - Main Application
// Uses slider-based input with haptic/visual feedback

class ChessGame {
    constructor() {
        this.stockfish = null;
        this.gameState = 'start'; // start, mode-selection, input, waiting, output
        this.playerColor = null; // 'white' or 'black'
        this.board = this.initializeBoard();
        this.currentTurn = 'white';
        this.moveHistory = [];
        
        // Move input state machine
        this.inputState = 'from-file'; // from-file, from-rank, to-file, to-rank, promotion
        this.currentMove = {
            fromFile: null,
            fromRank: null,
            toFile: null,
            toRank: null,
            promotion: null
        };
        
        // Touch handling
        this.longPressTimer = null;
        this.lastTapTime = 0;
        this.tapCount = 0;
        
        // Slider
        this.isDragging = false;
        this.currentCheckpoint = -1;
        this.checkpointLabels = [];
        
        this.initializeElements();
        this.initializeStockfish();
        this.setupEventListeners();
        this.updateStatus();
    }

    initializeBoard() {
        // Simple board representation (we'll use Stockfish for validation)
        return {
            position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' // FEN notation
        };
    }

    initializeElements() {
        this.elements = {
            container: document.getElementById('container'),
            interactionArea: document.getElementById('interaction-area'),
            startScreen: document.getElementById('start-screen'),
            modeSelection: document.getElementById('mode-selection'),
            waitingScreen: document.getElementById('waiting-screen'),
            sliderContainer: document.getElementById('slider-container'),
            slider: document.getElementById('slider'),
            sliderThumb: document.getElementById('slider-thumb'),
            sliderLabel: document.getElementById('slider-label'),
            currentValue: document.getElementById('current-value'),
            vibrationFlash: document.getElementById('vibration-flash'),
            gameStatus: document.getElementById('game-status'),
            gameMode: document.getElementById('game-mode'),
            currentTurnEl: document.getElementById('current-turn'),
            currentMoveEl: document.getElementById('current-move'),
            boardPosition: document.getElementById('board-position')
        };
    }

    initializeStockfish() {
        if (typeof STOCKFISH === 'function') {
            this.stockfish = STOCKFISH();
            this.stockfish.onmessage = (event) => this.handleStockfishMessage(event);
            this.stockfish.postMessage('uci');
        } else {
            console.error('Stockfish not loaded');
            this.elements.gameStatus.textContent = 'Error: Engine not loaded';
        }
    }

    setupEventListeners() {
        // Touch events on interaction area
        this.elements.interactionArea.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.elements.interactionArea.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        this.elements.interactionArea.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        
        // Mouse events for desktop testing
        this.elements.interactionArea.addEventListener('mousedown', (e) => this.handleTouchStart(e));
        this.elements.interactionArea.addEventListener('mouseup', (e) => this.handleTouchEnd(e));
        this.elements.interactionArea.addEventListener('mousemove', (e) => this.handleTouchMove(e));
    }

    handleTouchStart(e) {
        if (this.gameState === 'start') {
            // Long press to start
            this.longPressTimer = setTimeout(() => {
                this.startGame();
            }, 3000);
        } else if (this.gameState === 'mode-selection') {
            // Track tap time for double tap detection
            const now = Date.now();
            if (now - this.lastTapTime < 300) {
                this.tapCount++;
            } else {
                this.tapCount = 1;
            }
            this.lastTapTime = now;
        } else if (this.gameState === 'input') {
            // Check if touch is on slider thumb
            const touch = e.touches ? e.touches[0] : e;
            const thumbRect = this.elements.sliderThumb.getBoundingClientRect();
            const touchX = touch.clientX;
            const touchY = touch.clientY;
            
            if (touchX >= thumbRect.left && touchX <= thumbRect.right &&
                touchY >= thumbRect.top && touchY <= thumbRect.bottom) {
                this.isDragging = true;
                e.preventDefault();
            }
        }
    }

    handleTouchMove(e) {
        if (this.isDragging && this.gameState === 'input') {
            e.preventDefault();
            const touch = e.touches ? e.touches[0] : e;
            this.updateSliderPosition(touch.clientY);
        }
    }

    handleTouchEnd(e) {
        if (this.gameState === 'start') {
            clearTimeout(this.longPressTimer);
        } else if (this.gameState === 'mode-selection') {
            // Wait a bit to see if it's a double tap
            setTimeout(() => {
                if (this.tapCount === 1) {
                    this.selectColor('white');
                } else if (this.tapCount >= 2) {
                    this.selectColor('black');
                }
                this.tapCount = 0;
            }, 300);
        } else if (this.gameState === 'input' && this.isDragging) {
            this.isDragging = false;
            this.confirmSliderSelection();
        }
    }

    startGame() {
        this.vibrate(200);
        this.gameState = 'mode-selection';
        this.showScreen('mode-selection');
        this.updateStatus();
    }

    selectColor(color) {
        this.playerColor = color;
        this.vibrate(300);
        this.elements.gameMode.textContent = `You: ${color}`;
        this.updateStatus();
        
        if (color === 'white') {
            // Player starts
            this.startPlayerMove();
        } else {
            // Stockfish starts
            this.getStockfishMove();
        }
    }

    startPlayerMove() {
        this.gameState = 'input';
        this.inputState = 'from-file';
        this.currentMove = {
            fromFile: null,
            fromRank: null,
            toFile: null,
            toRank: null,
            promotion: null
        };
        this.showSlider();
        this.updateStatus();
    }

    showScreen(screen) {
        this.elements.startScreen.style.display = 'none';
        this.elements.modeSelection.classList.remove('active');
        this.elements.waitingScreen.classList.remove('active');
        this.elements.sliderContainer.classList.remove('active');
        
        if (screen === 'mode-selection') {
            this.elements.modeSelection.classList.add('active');
        } else if (screen === 'waiting') {
            this.elements.waitingScreen.classList.add('active');
        }
    }

    showSlider() {
        this.showScreen('slider');
        this.elements.sliderContainer.classList.add('active');
        this.setupSliderForCurrentState();
    }

    setupSliderForCurrentState() {
        // Clear existing checkpoints
        const existingCheckpoints = this.elements.slider.querySelectorAll('.checkpoint');
        existingCheckpoints.forEach(cp => cp.remove());
        
        // Determine what we're selecting
        let labels = [];
        if (this.inputState === 'from-file' || this.inputState === 'to-file') {
            labels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
            this.elements.sliderLabel.textContent = this.inputState === 'from-file' ? 'From File (a-h)' : 'To File (a-h)';
        } else if (this.inputState === 'from-rank' || this.inputState === 'to-rank') {
            labels = ['1', '2', '3', '4', '5', '6', '7', '8'];
            this.elements.sliderLabel.textContent = this.inputState === 'from-rank' ? 'From Rank (1-8)' : 'To Rank (1-8)';
        } else if (this.inputState === 'promotion') {
            labels = ['Q', 'R', 'B', 'N'];
            this.elements.sliderLabel.textContent = 'Promotion (Q/R/B/N)';
        }
        
        this.checkpointLabels = labels;
        
        // Create checkpoints
        const sliderHeight = this.elements.slider.offsetHeight;
        const spacing = sliderHeight / (labels.length + 1);
        
        labels.forEach((label, index) => {
            const checkpoint = document.createElement('div');
            checkpoint.className = 'checkpoint';
            checkpoint.style.top = `${spacing * (index + 1)}px`;
            this.elements.slider.appendChild(checkpoint);
        });
        
        // Reset slider thumb to center
        this.currentCheckpoint = -1;
        this.elements.sliderThumb.style.top = '50%';
        this.elements.currentValue.textContent = '-';
        this.updateStatus();
    }

    updateSliderPosition(clientY) {
        const sliderRect = this.elements.slider.getBoundingClientRect();
        const relativeY = clientY - sliderRect.top;
        const percentage = Math.max(0, Math.min(1, relativeY / sliderRect.height));
        
        // Calculate nearest checkpoint
        const numCheckpoints = this.checkpointLabels.length;
        const spacing = 1 / (numCheckpoints + 1);
        let nearestCheckpoint = -1;
        let minDistance = Infinity;
        
        for (let i = 0; i < numCheckpoints; i++) {
            const checkpointPos = spacing * (i + 1);
            const distance = Math.abs(percentage - checkpointPos);
            if (distance < minDistance && distance < 0.08) { // Snap threshold
                minDistance = distance;
                nearestCheckpoint = i;
            }
        }
        
        // Snap to checkpoint or free position
        let finalY;
        if (nearestCheckpoint !== -1) {
            const snapPercentage = spacing * (nearestCheckpoint + 1);
            finalY = sliderRect.height * snapPercentage;
            
            // Vibrate when entering a new checkpoint
            if (nearestCheckpoint !== this.currentCheckpoint) {
                this.currentCheckpoint = nearestCheckpoint;
                this.vibrate(50);
                this.elements.currentValue.textContent = this.checkpointLabels[nearestCheckpoint];
            }
        } else {
            finalY = relativeY;
            if (this.currentCheckpoint !== -1) {
                this.currentCheckpoint = -1;
                this.elements.currentValue.textContent = '-';
            }
        }
        
        this.elements.sliderThumb.style.top = `${finalY}px`;
    }

    confirmSliderSelection() {
        if (this.currentCheckpoint === -1) {
            // No valid selection, vibrate error
            this.vibrate([100, 50, 100]);
            return;
        }
        
        const selectedValue = this.checkpointLabels[this.currentCheckpoint];
        this.vibrate(200); // Confirmation vibration
        
        // Update move based on current state
        if (this.inputState === 'from-file') {
            this.currentMove.fromFile = selectedValue;
            this.inputState = 'from-rank';
        } else if (this.inputState === 'from-rank') {
            this.currentMove.fromRank = selectedValue;
            this.inputState = 'to-file';
        } else if (this.inputState === 'to-file') {
            this.currentMove.toFile = selectedValue;
            this.inputState = 'to-rank';
        } else if (this.inputState === 'to-rank') {
            this.currentMove.toRank = selectedValue;
            // Check if promotion is needed
            if (this.needsPromotion()) {
                this.inputState = 'promotion';
            } else {
                this.executePlayerMove();
                return;
            }
        } else if (this.inputState === 'promotion') {
            this.currentMove.promotion = selectedValue.toLowerCase();
            this.executePlayerMove();
            return;
        }
        
        // Setup slider for next state
        this.setupSliderForCurrentState();
    }

    needsPromotion() {
        // Check if it's a pawn reaching the last rank
        const fromRank = parseInt(this.currentMove.fromRank);
        const toRank = parseInt(this.currentMove.toRank);
        
        if (this.playerColor === 'white' && fromRank === 7 && toRank === 8) {
            return true;
        }
        if (this.playerColor === 'black' && fromRank === 2 && toRank === 1) {
            return true;
        }
        return false;
    }

    executePlayerMove() {
        const moveStr = `${this.currentMove.fromFile}${this.currentMove.fromRank}${this.currentMove.toFile}${this.currentMove.toRank}${this.currentMove.promotion || ''}`;
        
        // Validate move with Stockfish
        this.stockfish.postMessage(`position fen ${this.board.position}`);
        this.stockfish.postMessage('d'); // Display position (for debugging)
        
        // Try the move
        this.makeMove(moveStr);
    }

    makeMove(moveStr) {
        this.elements.currentMoveEl.textContent = moveStr;
        this.moveHistory.push(moveStr);
        
        // Update position (simplified - in real chess we'd validate)
        // For now, just switch turns
        this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
        this.updateStatus();
        
        // Long vibration for successful move
        this.vibrate(500);
        
        // Get opponent move
        if (this.currentTurn !== this.playerColor) {
            this.getStockfishMove();
        } else {
            this.startPlayerMove();
        }
    }

    getStockfishMove() {
        this.gameState = 'waiting';
        this.showScreen('waiting');
        this.updateStatus();
        
        // Send position to Stockfish
        const moves = this.moveHistory.join(' ');
        this.stockfish.postMessage(`position startpos moves ${moves}`);
        this.stockfish.postMessage('go movetime 2000'); // Think for 2 seconds
    }

    handleStockfishMessage(event) {
        const message = event.data ? event.data : event;
        
        if (typeof message !== 'string') return;
        
        if (message.startsWith('bestmove')) {
            const parts = message.split(' ');
            const move = parts[1];
            
            if (move && move !== '(none)') {
                this.relayStockfishMove(move);
            }
        }
    }

    relayStockfishMove(move) {
        // Parse the move (e.g., "e2e4" or "e7e8q")
        const fromFile = move[0];
        const fromRank = move[1];
        const toFile = move[2];
        const toRank = move[3];
        const promotion = move[4] || null;
        
        this.currentMove = { fromFile, fromRank, toFile, toRank, promotion };
        this.gameState = 'output';
        this.inputState = 'from-file';
        
        this.showSlider();
        this.outputMoveSequence();
    }

    outputMoveSequence() {
        // Output the move step by step
        const sequence = [
            { state: 'from-file', value: this.currentMove.fromFile, label: 'From File' },
            { state: 'from-rank', value: this.currentMove.fromRank, label: 'From Rank' },
            { state: 'to-file', value: this.currentMove.toFile, label: 'To File' },
            { state: 'to-rank', value: this.currentMove.toRank, label: 'To Rank' }
        ];
        
        if (this.currentMove.promotion) {
            sequence.push({ state: 'promotion', value: this.currentMove.promotion.toUpperCase(), label: 'Promotion' });
        }
        
        let index = 0;
        
        const outputNext = () => {
            if (index >= sequence.length) {
                // Move complete
                const moveStr = `${this.currentMove.fromFile}${this.currentMove.fromRank}${this.currentMove.toFile}${this.currentMove.toRank}${this.currentMove.promotion || ''}`;
                this.moveHistory.push(moveStr);
                this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
                this.updateStatus();
                
                // Wait a bit then start player's turn
                setTimeout(() => {
                    this.startPlayerMove();
                }, 1000);
                return;
            }
            
            const step = sequence[index];
            this.inputState = step.state;
            this.setupSliderForCurrentState();
            this.elements.sliderLabel.textContent = `Opponent: ${step.label}`;
            
            // Find checkpoint index
            const checkpointIndex = this.checkpointLabels.indexOf(step.value.toLowerCase()) !== -1 
                ? this.checkpointLabels.indexOf(step.value.toLowerCase())
                : this.checkpointLabels.indexOf(step.value.toUpperCase());
            
            if (checkpointIndex !== -1) {
                this.animateSliderToCheckpoint(checkpointIndex, () => {
                    // Pause at checkpoint
                    setTimeout(() => {
                        index++;
                        outputNext();
                    }, 1500);
                });
            } else {
                index++;
                outputNext();
            }
        };
        
        outputNext();
    }

    animateSliderToCheckpoint(checkpointIndex, callback) {
        const sliderHeight = this.elements.slider.offsetHeight;
        const numCheckpoints = this.checkpointLabels.length;
        const spacing = sliderHeight / (numCheckpoints + 1);
        const targetY = spacing * (checkpointIndex + 1);
        
        this.elements.sliderThumb.style.transition = 'top 0.8s ease-in-out';
        this.elements.sliderThumb.style.top = `${targetY}px`;
        this.currentCheckpoint = checkpointIndex;
        this.elements.currentValue.textContent = this.checkpointLabels[checkpointIndex];
        
        // Vibrate when reaching checkpoint
        setTimeout(() => {
            this.vibrate(100);
            setTimeout(() => {
                this.elements.sliderThumb.style.transition = '';
                callback();
            }, 100);
        }, 800);
    }

    vibrate(pattern) {
        // Try actual vibration
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
        
        // Visual feedback (green flash)
        const flash = this.elements.vibrationFlash;
        flash.classList.add('active');
        
        const duration = Array.isArray(pattern) 
            ? pattern.reduce((a, b) => a + b, 0)
            : pattern;
        
        setTimeout(() => {
            flash.classList.remove('active');
        }, duration);
    }

    updateStatus() {
        this.elements.gameStatus.textContent = this.gameState;
        this.elements.currentTurnEl.textContent = this.currentTurn;
        
        if (this.gameState === 'input' || this.gameState === 'output') {
            const move = `${this.currentMove.fromFile || '?'}${this.currentMove.fromRank || '?'} → ${this.currentMove.toFile || '?'}${this.currentMove.toRank || '?'}`;
            this.elements.currentMoveEl.textContent = move;
        }
        
        this.elements.boardPosition.textContent = `Moves: ${this.moveHistory.length}`;
    }
}

// Initialize the game when page loads
window.addEventListener('load', () => {
    new ChessGame();
});
