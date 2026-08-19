import PDFDocument from "pdfkit";

export type CaseStudyProject = {
  title: string;
  client: string;
  category: string;
  summary: string;
  metrics: string;
};

export function generateCaseStudyPdf(project: CaseStudyProject) {
  return new Promise<Buffer>((resolve, reject) => {
    const document = new PDFDocument({ size: "A4", margin: 54, info: { Title: `${project.title} — Zyvenox Lab case study`, Author: "Zyvenox Lab" } });
    const chunks: Buffer[] = [];
    document.on("data", (chunk: Buffer) => chunks.push(chunk));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);

    document.rect(0, 0, 595, 842).fill("#0b0f14");
    document.fillColor("#69ddff").fontSize(10).font("Helvetica-Bold").text("ZYVENOX LAB", 54, 64, { characterSpacing: 2 });
    document.fillColor("#5f727f").fontSize(8).font("Helvetica").text("DIGITAL SYSTEMS · CYBERSECURITY · AI", 54, 82, { characterSpacing: 1 });
    document.moveTo(54, 110).lineTo(541, 110).strokeColor("#20414f").stroke();

    document.fillColor("#98a6b2").fontSize(9).font("Helvetica-Bold").text(`CASE STUDY / ${project.category.toUpperCase()}`, 54, 158, { characterSpacing: 1.4 });
    document.fillColor("#f3f7f9").fontSize(32).font("Helvetica-Bold").text(project.title, 54, 187, { width: 470, lineGap: 6 });
    document.fillColor("#69ddff").fontSize(11).font("Helvetica-Bold").text(`Delivered with ${project.client}`, 54, 300);

    document.roundedRect(54, 350, 487, 78, 4).fillAndStroke("#101a22", "#234a59");
    document.fillColor("#7f96a3").fontSize(8).font("Helvetica-Bold").text("OUTCOME", 74, 372, { characterSpacing: 1.2 });
    document.fillColor("#69ddff").fontSize(22).font("Helvetica-Bold").text(project.metrics, 74, 391);

    document.fillColor("#a8b6bd").fontSize(12).font("Helvetica-Bold").text("The brief", 54, 480);
    document.fillColor("#dce8ec").fontSize(13).font("Helvetica").text(project.summary, 54, 510, { width: 460, lineGap: 7 });

    document.fillColor("#a8b6bd").fontSize(12).font("Helvetica-Bold").text("Zyvenox Lab perspective", 54, 610);
    document.fillColor("#a4b5be").fontSize(11).font("Helvetica").text("We pair deep technical fluency with observable delivery. Every system is designed to hold up under real operational pressure, with the constraints and trade-offs made visible to the people who own the outcome.", 54, 638, { width: 460, lineGap: 7 });

    document.moveTo(54, 768).lineTo(541, 768).strokeColor("#20414f").stroke();
    document.fillColor("#5f727f").fontSize(8).font("Helvetica").text("zyvenoxlab.com  ·  contact@zyvenoxlab.com", 54, 789);
    document.fillColor("#5f727f").text("CONFIDENTIAL PROJECT BRIEF", 382, 789);
    document.end();
  });
}
