# Chess for Blind & Deaf Users

An accessible chess application designed specifically for blind and deaf users, using touch input and haptic/visual feedback to play against Stockfish AI.

## Features

- **Touch-based input**: All interactions through touch gestures and slider
- **Haptic feedback**: Vibrations for every interaction (with visual green flash for browser testing)
- **Stockfish AI**: Play against a strong chess engine
- **Accessible design**: Optimized for blind and deaf users
- **Responsive**: Works on desktop and mobile devices

## How to Use

### Starting a Game

1. **Long press** the screen for 3 seconds to start a new game
2. You'll feel a short vibration confirming the game started
3. Select your color:
   - **Single tap**: Play as White (you go first)
   - **Double tap**: Play as Black (Stockfish goes first)

### Making a Move (Slider System)

Each move consists of 4 parts (plus optional promotion):

1. **From File** (a-h): Touch the slider and drag up/down. You'll feel a vibration at each checkpoint (a, b, c, d, e, f, g, h). Release when you reach the desired file.

2. **From Rank** (1-8): Same process, but selecting the rank number (1-8).

3. **To File** (a-h): Select destination file.

4. **To Rank** (1-8): Select destination rank.

5. **Promotion** (if needed): If you're moving a pawn to the last rank, select Q/R/B/N for Queen/Rook/Bishop/Knight.

### Receiving Opponent Moves

When Stockfish makes a move, you'll receive it the same way:
- The slider will automatically animate through each part of the move
- You'll feel a vibration at each checkpoint
- The sequence shows: From File → From Rank → To File → To Rank → (Promotion if applicable)

### Vibration Patterns

- **Short vibration (50ms)**: Moving to a slider checkpoint
- **Medium vibration (200ms)**: Confirming a selection
- **Long vibration (500ms)**: Completing a full move
- **Double vibration**: Error or invalid selection

### Visual Feedback (Testing)

For browser testing, all vibrations are accompanied by a green flash on the screen. The status panel in the top-right corner shows:
- Game state
- Current turn (White/Black)
- Current move being input
- Move history count

## Technical Details

- Built with vanilla JavaScript
- Uses Stockfish.js for chess engine
- Vibration API for haptic feedback
- Touch events for mobile support
- Mouse events for desktop testing

## Browser Compatibility

- Best experience on mobile devices with vibration support
- Desktop browsers show visual feedback instead of vibration
- Requires modern browser with ES6 support

## File Structure

```
chess4blind/
├── index.html    # Main HTML structure
├── app.js        # Game logic and interaction
└── README.md     # This file
```

## Future Enhancements

- Save game state
- Move validation feedback
- Time controls
- Game difficulty settings
- Move history replay
