# Spinner Utility Usage

The spinner utility provides a simple way to add loading animations to your Node.js CLI applications.

## Installation

The spinner is included in the project at `src/spinner.mjs`.

## Basic Usage

```javascript
import { createSpinner } from './spinner.mjs';

// Create a spinner instance
const spinner = createSpinner({
  loadingText: 'Processing data...',
  completionText: 'Data processed successfully',
  errorText: 'Failed to process data',
  animationType: 'dots' // or 'progress'
});

// Start the spinner
spinner.start();

// Perform your async operation
try {
  await someAsyncOperation();
  spinner.succeed(); // Show success message
} catch (error) {
  spinner.fail(); // Show error message
}
```

## Animation Types

### Dots Animation

The dots animation displays a rotating series of spinner characters followed by the loading text.

```javascript
const spinner = createSpinner({
  loadingText: 'Loading...',
  completionText: 'Done!',
  errorText: 'Error!',
  animationType: 'dots'
});

spinner.start();
// ... perform work ...
spinner.succeed();
```

### Progress Bar Animation

The progress bar animation shows a visual progress bar with percentage.

```javascript
const spinner = createSpinner({
  loadingText: 'Uploading file...',
  completionText: 'Upload complete',
  errorText: 'Upload failed',
  animationType: 'progress'
});

spinner.start();

// Update progress as work completes
for (let i = 0; i <= 100; i += 10) {
  await someWork();
  spinner.updateProgress(i);
}

spinner.succeed();
```

## API

### `createSpinner(options)`

Creates a new spinner instance.

**Options:**
- `loadingText` (string): Text to display while loading
- `completionText` (string): Text to display on success
- `errorText` (string): Text to display on error
- `animationType` ('dots' | 'progress'): Type of animation (default: 'dots')

**Returns:** Spinner instance with the following methods:

### `spinner.start()`

Starts the spinner animation.

### `spinner.stop()`

Stops the spinner and clears the interval. The line is cleared but no completion message is shown.

### `spinner.succeed()`

Stops the spinner and displays the success message with a checkmark.

### `spinner.fail()`

Stops the spinner and displays the error message with an X mark.

### `spinner.updateProgress(value)`

Updates the progress bar (only for 'progress' animation type).

**Parameters:**
- `value` (number): Progress value between 0 and 100

## Example: Integration with Invoice CLI

Here's how you could integrate the spinner into the existing invoice CLI:

```javascript
import { argv } from "process";
import { fromMarkdownToPdf } from "./markdownParser.mjs";
import { generatePDF } from "./pdfGenerator.mjs";
import { createSpinner } from "./spinner.mjs";

if (argv.length < 4) {
  console.error("Usage: node cli.mjs <input-markdown-file> <output-pdf-file>");
  process.exit(1);
}

const inputFilePath = argv[2];
const outputFilePath = argv[3];

if (!inputFilePath || !outputFilePath) {
  console.error("Input and output file paths are required");
  process.exit(1);
}

const spinner = createSpinner({
  loadingText: 'Generating invoice PDF...',
  completionText: `Invoice PDF generated at: ${outputFilePath}`,
  errorText: 'An error occurred while generating the invoice',
  animationType: 'dots'
});

spinner.start();

try {
  const invoice = fromMarkdownToPdf(inputFilePath);
  generatePDF(invoice, outputFilePath);
  spinner.succeed();
} catch (err) {
  spinner.fail();
  console.error(err);
  process.exit(1);
}
```

## Testing

Run the test script to see all animation types in action:

```bash
node src/test-spinner.mjs
```
