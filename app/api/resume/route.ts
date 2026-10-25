import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { isPublishedLocale } from "@/lib/locale";

/**
 * PDF resume generator — renders the print-optimized /[lang]/resume page.
 *
 * GET /api/resume?lang=en → Ferdinand_Dero_Saputra_Resume.pdf
 * Puppeteer uses the @media print styles already in globals.css.
 *
 * Only *published* locales are accepted. `ja` has a dictionary skeleton but no
 * routes, so `isLocale` let it through and Chromium happily paginated the 404
 * document into a file named `..._Resume.pdf`. Routing is the predicate that
 * decides this question everywhere else on the site, so it decides here too.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const lang = searchParams.get("lang") || "en";

  if (!isPublishedLocale(lang)) {
    return NextResponse.json(
      { error: `Unsupported locale: ${lang}` },
      { status: 400 },
    );
  }

  const resumeUrl = `${origin}/${lang}/resume`;

  let browser;
  try {
    // Vercel-compatible Chromium launch
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1280, height: 720 },
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();

    // Wait for network idle to ensure fonts and content load
    await page.goto(resumeUrl, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Generate PDF with print media emulation
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0.5in",
        right: "0.5in",
        bottom: "0.5in",
        left: "0.5in",
      },
    });

    await browser.close();

    // Return PDF with appropriate headers
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Ferdinand_Dero_Saputra_Resume.pdf"`,
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    if (browser) await browser.close();
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}
