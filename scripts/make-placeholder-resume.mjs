// Generates public/resume.pdf — a one-page placeholder.
// Replace public/resume.pdf with the real resume; this script is only here
// so the link never 404s before that happens.
import { writeFileSync } from "node:fs";

const lines = [
  "Dvip Patel — Full-stack engineer",
  "dvipatwork@gmail.com | github.com/dvip1",
  "",
  "(placeholder — replace public/resume.pdf with the real resume)",
];

const content = lines
  .map((l, i) => `BT /F1 12 Tf 72 ${720 - i * 18} Td (${l.replace(/[()\\]/g, "\\$&")}) Tj ET`)
  .join("\n");

const objects = [
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
  `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
];

let pdf = "%PDF-1.4\n";
const offsets = [];
objects.forEach((body, i) => {
  offsets.push(pdf.length);
  pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
});
const xrefStart = pdf.length;
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
for (const off of offsets) pdf += `${String(off).padStart(10, "0")} 00000 n \n`;
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

writeFileSync(new URL("../public/resume.pdf", import.meta.url), pdf, "latin1");
console.log("wrote public/resume.pdf");
