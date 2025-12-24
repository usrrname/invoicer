/**
 * A loading spinner utility for Node.js CLI applications in ESM.
 * Supports dots and progress bar animations.
 */

/**
 * @typedef {Object} SpinnerOptions
 * @property {string} loadingText - The text to display with the spinner
 * @property {string} completionText - The text to display when the spinner completes successfully
 * @property {string} errorText - The text to display when the spinner encounters an error
 * @property {'dots' | 'progress'} [animationType='dots'] - The type of animation to use
 */

/**
 * Creates a loading spinner instance
 * @param {SpinnerOptions} options - Configuration options for the spinner
 * @returns {Object} Spinner instance with start, stop, succeed, and fail methods
 */
export function createSpinner(options) {
  const {
    loadingText = 'Loading',
    completionText = 'Done!',
    errorText = 'Error!',
    animationType = 'dots'
  } = options;

  let intervalId = null;
  let frame = 0;
  let isRunning = false;
  let progress = 0;

  // Dots animation frames
  const dotsFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

  /**
   * Clears the current line in the console
   */
  function clearLine() {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
  }

  /**
   * Renders the dots animation
   */
  function renderDots() {
    clearLine();
    const spinner = dotsFrames[frame % dotsFrames.length];
    process.stdout.write(`${spinner} ${loadingText}`);
    frame++;
  }

  /**
   * Renders the progress bar animation
   */
  function renderProgress() {
    clearLine();
    const barLength = 30;
    const filledLength = Math.floor((progress / 100) * barLength);
    const emptyLength = barLength - filledLength;
    const bar = '█'.repeat(filledLength) + '░'.repeat(emptyLength);
    process.stdout.write(`[${bar}] ${progress}% ${loadingText}`);
  }

  /**
   * Updates the progress bar (only for progress animation)
   * @param {number} value - Progress value between 0 and 100
   */
  function updateProgress(value) {
    if (animationType === 'progress') {
      progress = Math.min(100, Math.max(0, value));
      if (isRunning) {
        renderProgress();
      }
    }
  }

  /**
   * Starts the spinner animation
   */
  function start() {
    if (isRunning) {
      return;
    }

    isRunning = true;
    frame = 0;
    progress = 0;

    // Hide cursor
    process.stdout.write('\x1B[?25l');

    if (animationType === 'dots') {
      intervalId = setInterval(renderDots, 80);
    } else if (animationType === 'progress') {
      renderProgress();
      // For progress bar, we'll update on demand via updateProgress
      // but we'll still have an interval to keep the display active
      intervalId = setInterval(() => {
        renderProgress();
      }, 100);
    }
  }

  /**
   * Stops the spinner and clears the interval
   */
  function stop() {
    if (!isRunning) {
      return;
    }

    isRunning = false;
    
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }

    clearLine();
    
    // Show cursor
    process.stdout.write('\x1B[?25h');
  }

  /**
   * Stops the spinner and displays the success message
   */
  function succeed() {
    stop();
    console.log(`✔ ${completionText}`);
  }

  /**
   * Stops the spinner and displays the error message
   */
  function fail() {
    stop();
    console.log(`✖ ${errorText}`);
  }

  return {
    start,
    stop,
    succeed,
    fail,
    updateProgress
  };
}
