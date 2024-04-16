import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import cheerio from 'cheerio';

export const runtime = 'edge';

type RequestBody = {
  url: string;
};

export async function POST(req: NextRequest) {
  const body: RequestBody = await req.json();
  const { url } = body;

  if (!url) {
    return new NextResponse(JSON.stringify({ error: 'URL is required' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  const scrapingAntApiKey = process.env.SCRAPINGANT_API_KEY;
  const apiEndpoint = `https://api.scrapingant.com/v2/general?url=${encodeURIComponent(url)}&x-api-key=${scrapingAntApiKey}`;

  try {
    const response = await fetch(apiEndpoint);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const htmlContent = await response.text();

    const textContent = processHtmlContent(htmlContent);

    return new NextResponse(JSON.stringify({ textContent }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error while calling ScrapingAnt:', error);
    return new NextResponse(JSON.stringify({ error: 'An error occurred during scraping', details: error }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

function processHtmlContent(html: string): string {
  try {
    // Safely remove script and style elements
    html = html.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');
    html = html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '');

    // Remove headers, footers, and navigation elements
    html = html.replace(/<header[^>]*>([\s\S]*?)<\/header>/gi, '');
    html = html.replace(/<footer[^>]*>([\s\S]*?)<\/footer>/gi, '');
    html = html.replace(/<nav[^>]*>([\s\S]*?)<\/nav>/gi, '');

    // Attempt to extract main content areas
    let contentMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                        html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
                        html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

    let content = contentMatch ? contentMatch[1] : html; // Fallback to full HTML if specific tags not found

    // Strip all remaining HTML tags to get clean text
    content = content.replace(/<[^>]+>/g, '');

    // Normalize spaces and clean up the text
    content = content.replace(/\s\s+/g, ' ').trim();

    // Limit the text to the first 2000 words to prevent excessive processing
    const words = content.split(/\s+/);
    const limitedWords = words.slice(0, 2000);
    const limitedText = limitedWords.join(' ');

    return limitedText;
  } catch (error) {
    // Log error and return a default message or empty string to prevent app crash
    console.error('Error processing HTML content:', error);
    return '';  // Or return a default fallback text if preferred
  }
}

