import puppeteer from "puppeteer";
import { generateCVHtml, type CVData } from "./cv-template";

export async function generateCVPdf(data: CVData): Promise<Buffer> {
  const html = generateCVHtml(data);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Set content and wait for fonts to load
    await page.setContent(html, {
      waitUntil: "domcontentloaded",
    });

    // Wait a bit for fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Generate PDF with A4 size
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

// Preview HTML (for development/testing)
export function generateCVPreviewHtml(data: CVData): string {
  return generateCVHtml(data);
}
