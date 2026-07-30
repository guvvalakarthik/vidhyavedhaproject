import PDFDocument from "pdfkit";

export const renderDraftPdf = (draft) => new Promise((resolve, reject) => {
  const document = new PDFDocument({ size: "A4", margin: 56, info: { Title: `${draft.draftId} - ${draft.subject}`, Author: "Vidhya Vedha" } });
  const chunks = [];
  document.on("data", (chunk) => chunks.push(chunk));
  document.on("end", () => resolve(Buffer.concat(chunks)));
  document.on("error", reject);

  document.fontSize(10).fillColor("#9a3412").text("DRAFT - NOT SUBMITTED", { align: "center" });
  document.moveDown(0.5).fontSize(9).fillColor("#475569").text(
    "Review every detail and verify current requirements with the responsible provider or authority before using this draft.",
    { align: "center" },
  );
  document.moveDown(2).fillColor("#0f172a").fontSize(11).text(`Draft ID: ${draft.draftId}`);
  document.text(`Service: ${draft.serviceTitle}`);
  document.text(`Type: ${draft.draftType.replaceAll("-", " ")}`);
  document.moveDown(1.5).fontSize(12).text(`Subject: ${draft.content.subject}`, { bold: true });
  document.moveDown().fontSize(11).text(draft.content.salutation);
  draft.content.paragraphs.forEach((paragraph) => {
    document.moveDown().text(paragraph, { align: "left", lineGap: 3 });
  });
  document.moveDown().text(draft.content.closing);
  document.moveDown(2).fontSize(8).fillColor("#64748b").text(
    `Created with Vidhya Vedha on ${new Date(draft.createdAt).toLocaleDateString("en-IN")}. This file is a preparation aid and proof of neither submission nor official status.`,
  );
  document.end();
});
