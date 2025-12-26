import { argv } from "process";
import { fromMarkdownToPdf } from "./markdownParser.mjs";
import { generatePDF } from "./pdfGenerator.mjs";
import { createSpinner } from "./spinner.mjs";


const spinner = createSpinner({
  loadingText: 'Generating PDF...',
  completionText: 'PDF generated successfully',
  errorText: 'Failed to generate PDF',
  animationType: 'dots'
});

/**
 * CLI for the invoicer application.
 * @param {string[]} argv - The command line arguments.
 * @returns {void}
 */
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

(async () => {
  try {
    spinner.start();
    const invoice = fromMarkdownToPdf(inputFilePath);
    await generatePDF(invoice, outputFilePath);
    spinner.succeed(`PDF generated successfully at ${outputFilePath}`);
  } catch (err) {
    spinner.fail("An error occurred:", err);
    process.exit(1);
  }
})();

