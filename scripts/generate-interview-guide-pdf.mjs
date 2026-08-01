import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const sourcePath = path.join(root, "docs", "interview", "Vidhya-Vedha-Technical-Interview-Guide.md");
const outputPath = path.join(root, "docs", "interview", "Vidhya-Vedha-Technical-Interview-Guide.pdf");

const colors = {
  navy: "#17324D",
  blue: "#2C6E9B",
  teal: "#167D7F",
  ink: "#25313C",
  muted: "#64717D",
  light: "#F1F5F7",
  lighter: "#F8FAFB",
  white: "#FFFFFF",
  line: "#D8E1E7",
};

const margin = 48;
const doc = new PDFDocument({
  size: "A4",
  margins: { top: 58, right: margin, bottom: 56, left: margin },
  bufferPages: true,
  autoFirstPage: true,
  info: {
    Title: "Vidhya Vedha Technical Interview Guide",
    Author: "Vidhya Vedha",
    Subject: "Technical lead interview preparation for a senior engineering role",
    Keywords: "system design, security, AI, agentic AI, reliability, interview",
    CreationDate: new Date("2026-08-01T00:00:00+05:30"),
  },
});

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
const output = fs.createWriteStream(outputPath);
doc.pipe(output);

const bodyWidth = doc.page.width - margin * 2;
const bottomY = () => doc.page.height - 56;
const tick = String.fromCharCode(96);
const inlineCodePattern = new RegExp(tick + "([^" + tick + "]+)" + tick, "g");

function cleanInline(text) {
  return text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(inlineCodePattern, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function ensureSpace(height) {
  if (doc.y + height > bottomY()) doc.addPage();
}

function drawPageChrome(pageIndex) {
  if (pageIndex === 0) return;
  const page = doc.page;
  doc.save();
  doc.fillColor(colors.navy).font("Helvetica-Bold").fontSize(8)
    .text("VIDHYA VEDHA  /  TECHNICAL INTERVIEW GUIDE", margin, 24, {
      width: bodyWidth,
      characterSpacing: 0.5,
    });
  doc.fillColor(colors.line).rect(margin, 40, bodyWidth, 1).fill();
  const originalBottomMargin = page.margins.bottom;
  page.margins.bottom = 0;
  doc.fillColor(colors.muted).font("Helvetica").fontSize(8)
    .text("Page " + pageIndex, margin, page.height - 32, {
      width: bodyWidth,
      align: "right",
      lineBreak: false,
    });
  page.margins.bottom = originalBottomMargin;
  doc.restore();
}

function cover() {
  const w = doc.page.width;
  const h = doc.page.height;
  doc.rect(0, 0, w, h).fill(colors.lighter);
  doc.rect(0, 0, w, 18).fill(colors.teal);
  doc.fillColor(colors.navy).font("Helvetica-Bold").fontSize(13)
    .text("VIDHYA VEDHA", margin, 68, { characterSpacing: 1.8 });

  doc.fillColor(colors.navy).font("Helvetica-Bold").fontSize(32)
    .text("Technical Interview Guide", margin, 144, { width: bodyWidth, lineGap: 3 });
  doc.fillColor(colors.blue).font("Helvetica").fontSize(18)
    .text("A technical-lead preparation pack for a 40 LPA engineering bar", margin, 230, {
      width: 420,
      lineGap: 4,
    });

  doc.roundedRect(margin, 330, bodyWidth, 128, 10).fill(colors.navy);
  doc.fillColor(colors.white).font("Helvetica-Bold").fontSize(13)
    .text("How to use this guide", margin + 24, 354);
  doc.fillColor("#E8F0F5").font("Helvetica").fontSize(11)
    .text(
      "Practice the 90-second pitch, select three workflows, draw the architecture, and rehearse the question bank aloud. Use evidence from the repository and state production limitations before the interviewer discovers them.",
      margin + 24,
      386,
      { width: bodyWidth - 48, lineGap: 5 }
    );

  doc.fillColor(colors.ink).font("Helvetica-Bold").fontSize(11)
    .text("Inside", margin, 505);
  doc.fillColor(colors.muted).font("Helvetica").fontSize(10.5)
    .text(
      "Hiring rubric  /  architecture  /  security  /  AI and agentic AI  /  data correctness  /  reliability  /  45 interview questions  /  system-design drills  /  live demo script",
      margin,
      530,
      { width: bodyWidth, lineGap: 6 }
    );

  doc.fillColor(colors.teal).font("Helvetica-Bold").fontSize(10)
    .text("Prepared from the implemented repository - August 2026", margin, h - 86);
  doc.fillColor(colors.muted).font("Helvetica").fontSize(8.5)
    .text("Verify test counts, live integrations, and deployment status again before an interview.", margin, h - 66);
}

function heading(text, level) {
  const clean = cleanInline(text);
  if (level === 2) {
    ensureSpace(58);
    doc.moveDown(0.6);
    doc.fillColor(colors.navy).font("Helvetica-Bold").fontSize(18)
      .text(clean, margin, doc.y, { width: bodyWidth, lineGap: 2 });
    doc.moveDown(0.35);
    doc.rect(margin, doc.y, 42, 3).fill(colors.teal);
    doc.y += 12;
  } else {
    ensureSpace(42);
    doc.moveDown(0.25);
    doc.fillColor(colors.blue).font("Helvetica-Bold").fontSize(12.5)
      .text(clean, margin, doc.y, { width: bodyWidth, lineGap: 2 });
    doc.moveDown(0.3);
  }
}

function paragraph(text) {
  const clean = cleanInline(text);
  if (!clean) return;
  const isStrong = clean.startsWith("Strong answer:");
  const isLabel = /^(Problem|Flow|Design|Requirements|Discuss|Current implementation|Production design|Likely interviewer challenge|Strong response|Narrate the boundary):/.test(clean);
  const fontSize = 9.5;
  doc.font(isStrong || isLabel ? "Helvetica-Bold" : "Helvetica").fontSize(fontSize);
  const h = doc.heightOfString(clean, { width: bodyWidth, lineGap: 3 }) + 8;
  ensureSpace(Math.min(h, 120));

  if (isStrong) {
    const rest = clean.slice("Strong answer:".length).trim();
    const blockHeight = doc.heightOfString(rest, { width: bodyWidth - 24, lineGap: 3 }) + 24;
    ensureSpace(blockHeight + 4);
    const blockY = doc.y;
    doc.fillColor(colors.lighter).roundedRect(margin, blockY - 3, bodyWidth, blockHeight, 6).fill();
    const y = blockY + 7;
    doc.fillColor(colors.teal).font("Helvetica-Bold").fontSize(fontSize)
      .text("Strong answer: ", margin + 12, y, { continued: true });
    doc.fillColor(colors.ink).font("Helvetica").text(rest, {
      width: bodyWidth - 24,
      lineGap: 3,
    });
    doc.y = blockY + blockHeight + 6;
    return;
  }

  if (isLabel) {
    const colon = clean.indexOf(":");
    const label = clean.slice(0, colon + 1);
    const rest = clean.slice(colon + 1).trim();
    doc.fillColor(colors.navy).font("Helvetica-Bold").fontSize(fontSize)
      .text(label + " ", margin, doc.y, { continued: true });
    doc.fillColor(colors.ink).font("Helvetica").text(rest, { width: bodyWidth, lineGap: 3 });
    doc.moveDown(0.45);
    return;
  }

  doc.fillColor(colors.ink).font("Helvetica").fontSize(fontSize)
    .text(clean, margin, doc.y, { width: bodyWidth, lineGap: 3 });
  doc.moveDown(0.55);
}

function quote(text) {
  const clean = cleanInline(text.replace(/^>\s*/, ""));
  doc.font("Helvetica").fontSize(10);
  const height = doc.heightOfString(clean, { width: bodyWidth - 32, lineGap: 4 }) + 42;
  ensureSpace(height);
  const y = doc.y;
  doc.roundedRect(margin, y, bodyWidth, height, 7).fill(colors.light);
  doc.fillColor(colors.navy).font("Helvetica-Bold").fontSize(8)
    .text("INTERVIEW PURPOSE", margin + 16, y + 13, { characterSpacing: 0.8 });
  doc.fillColor(colors.ink).font("Helvetica").fontSize(9.5)
    .text(clean, margin + 16, y + 31, { width: bodyWidth - 32, lineGap: 3 });
  doc.y = y + height + 10;
}

function listItem(text, ordered, number) {
  const clean = cleanInline(text);
  doc.font("Helvetica").fontSize(9.4);
  const prefix = ordered ? String(number) + "." : String.fromCharCode(8226);
  const indent = ordered ? 24 : 18;
  const h = doc.heightOfString(clean, { width: bodyWidth - indent - 8, lineGap: 3 }) + 5;
  ensureSpace(h);
  const y = doc.y;
  doc.fillColor(ordered ? colors.teal : colors.blue).font("Helvetica-Bold")
    .text(prefix, margin, y, { width: indent, align: ordered ? "right" : "left" });
  doc.fillColor(colors.ink).font("Helvetica")
    .text(clean, margin + indent + 7, y, { width: bodyWidth - indent - 7, lineGap: 3 });
  doc.y = Math.max(doc.y, y + h);
}

function parseCells(line) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cleanInline(cell.trim()));
}

function isSeparator(line) {
  return /^\|\s*:?-{3,}/.test(line.trim());
}

function renderTable(lines) {
  const rows = lines.filter((line) => !isSeparator(line)).map(parseCells);
  if (!rows.length) return;
  const columns = Math.max(...rows.map((row) => row.length));
  const gap = 4;
  const columnWidth = (bodyWidth - gap * (columns - 1)) / columns;
  const size = columns >= 4 ? 7.2 : columns === 3 ? 7.8 : 8.3;
  const padding = 6;

  rows.forEach((row, rowIndex) => {
    doc.font(rowIndex === 0 ? "Helvetica-Bold" : "Helvetica").fontSize(size);
    const heights = Array.from({ length: columns }, (_, i) =>
      doc.heightOfString(row[i] || "", { width: columnWidth - padding * 2, lineGap: 1.5 })
    );
    const rowHeight = Math.max(...heights, 12) + padding * 2;
    ensureSpace(rowHeight + 3);
    const y = doc.y;
    doc.fillColor(rowIndex === 0 ? colors.navy : rowIndex % 2 ? colors.lighter : colors.white)
      .rect(margin, y, bodyWidth, rowHeight).fill();

    for (let i = 0; i < columns; i += 1) {
      const x = margin + i * (columnWidth + gap);
      doc.fillColor(rowIndex === 0 ? colors.white : colors.ink)
        .font(rowIndex === 0 ? "Helvetica-Bold" : "Helvetica")
        .fontSize(size)
        .text(row[i] || "", x + padding, y + padding, {
          width: columnWidth - padding * 2,
          lineGap: 1.5,
        });
    }
    doc.y = y + rowHeight;
  });
  doc.y += 10;
}

function arrow(x1, y1, x2, y2) {
  doc.strokeColor(colors.muted).lineWidth(1.3).moveTo(x1, y1).lineTo(x2, y2).stroke();
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = 5;
  doc.fillColor(colors.muted)
    .moveTo(x2, y2)
    .lineTo(x2 - size * Math.cos(angle - Math.PI / 6), y2 - size * Math.sin(angle - Math.PI / 6))
    .lineTo(x2 - size * Math.cos(angle + Math.PI / 6), y2 - size * Math.sin(angle + Math.PI / 6))
    .fill();
}

function nodeBox(x, y, width, height, title, detail, fill) {
  doc.roundedRect(x, y, width, height, 7).fill(fill);
  doc.fillColor(colors.white).font("Helvetica-Bold").fontSize(9.3)
    .text(title, x + 8, y + 10, { width: width - 16, align: "center" });
  doc.fillColor("#E8F0F5").font("Helvetica").fontSize(7.2)
    .text(detail, x + 8, y + 29, { width: width - 16, align: "center", lineGap: 1 });
}

function architectureDiagram() {
  ensureSpace(300);
  const y = doc.y + 4;
  const center = doc.page.width / 2;
  nodeBox(margin, y, 125, 58, "Resident / Provider", "Browser and mobile web", colors.blue);
  nodeBox(center - 63, y, 126, 58, "React + Vite SPA", "Untrusted presentation layer", colors.navy);
  nodeBox(doc.page.width - margin - 125, y, 125, 58, "Express API", "Security + domain modules", colors.teal);
  arrow(margin + 125, y + 29, center - 63, y + 29);
  arrow(center + 63, y + 29, doc.page.width - margin - 125, y + 29);

  nodeBox(center - 63, y + 105, 126, 58, "MongoDB Atlas", "Owner-scoped persistent state", colors.navy);
  arrow(doc.page.width - margin - 63, y + 58, center + 35, y + 105);

  const smallW = 103;
  nodeBox(margin, y + 210, smallW, 55, "Google", "Verified identity token", colors.blue);
  nodeBox(margin + 119, y + 210, smallW, 55, "OpenAI", "Optional grounded output", colors.teal);
  nodeBox(margin + 238, y + 210, smallW, 55, "Document Vault", "Encrypted prototype", colors.navy);
  nodeBox(margin + 357, y + 210, smallW, 55, "Official Sites", "Explicit user handoff", colors.blue);

  arrow(doc.page.width - margin - 63, y + 58, margin + smallW / 2, y + 210);
  arrow(doc.page.width - margin - 63, y + 58, margin + 119 + smallW / 2, y + 210);
  arrow(doc.page.width - margin - 63, y + 58, margin + 238 + smallW / 2, y + 210);
  arrow(center, y + 58, margin + 357 + smallW / 2, y + 210);

  doc.y = y + 283;
  doc.fillColor(colors.muted).font("Helvetica").fontSize(8)
    .text("Solid arrows show request or verified integration boundaries. Official authority pages remain a browser handoff unless a registered adapter exists.", margin, doc.y, {
      width: bodyWidth,
      align: "center",
    });
  doc.y += 28;
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (index < 3 || line === "") {
      index += 1;
      continue;
    }
    if (line === "<!-- PAGE_BREAK -->") {
      doc.addPage();
      index += 1;
      continue;
    }
    if (line === "<!-- ARCHITECTURE_DIAGRAM -->") {
      architectureDiagram();
      index += 1;
      continue;
    }
    if (line.startsWith("|")) {
      const table = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        table.push(lines[index]);
        index += 1;
      }
      renderTable(table);
      continue;
    }
    if (line.startsWith("## ")) {
      heading(line.slice(3), 2);
      index += 1;
      continue;
    }
    if (line.startsWith("### ")) {
      heading(line.slice(4), 3);
      index += 1;
      continue;
    }
    if (line.startsWith(">")) {
      quote(line);
      index += 1;
      continue;
    }
    const ordered = line.match(/^(\d+)\.\s+(.+)$/);
    if (ordered) {
      listItem(ordered[2], true, ordered[1]);
      index += 1;
      continue;
    }
    if (line.startsWith("- ")) {
      listItem(line.slice(2), false);
      index += 1;
      continue;
    }

    const parts = [line];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{2,3}\s|>|- |\d+\.\s|\||<!--)/.test(lines[index].trim())
    ) {
      parts.push(lines[index].trim());
      index += 1;
    }
    paragraph(parts.join(" "));
  }
}

cover();
doc.addPage();
renderMarkdown(fs.readFileSync(sourcePath, "utf8"));

const range = doc.bufferedPageRange();
for (let i = range.start; i < range.start + range.count; i += 1) {
  doc.switchToPage(i);
  drawPageChrome(i);
}

doc.end();

await new Promise((resolve, reject) => {
  output.on("finish", resolve);
  output.on("error", reject);
});

const stats = fs.statSync(outputPath);
if (stats.size < 10000) throw new Error("Generated PDF is unexpectedly small: " + stats.size + " bytes");
console.log("Generated " + path.relative(root, outputPath) + " (" + stats.size.toLocaleString() + " bytes)");