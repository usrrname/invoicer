import { argv } from "process";
import { parseMarkdownToInvoice } from "./markdownParser.mjs";
import { generatePDF } from "./pdfGenerator.mjs";

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

try {
  const invoice = parseMarkdownToInvoice(inputFilePath);
  generatePDF(invoice, outputFilePath);
  console.log(`Invoice PDF generated at: ${outputFilePath}`);
} catch (err) {
  console.error("An error occurred:", err);
}

