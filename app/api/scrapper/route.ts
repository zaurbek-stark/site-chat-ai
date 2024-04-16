import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import cheerio from 'cheerio';

interface ScrapingAntResponse {
  content?: string;
  error?: string;
}

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
    console.log('textContent:', textContent);

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
  const $ = cheerio.load(html);

  $('script, style').remove();

  const articleElement = $('article');
  const mainElement = $('main');
  const contentElement = articleElement.length > 0 ? articleElement : (mainElement.length > 0 ? mainElement : $('body'));

  ['header', 'footer', 'nav'].forEach(selector => {
    contentElement.find(selector).remove();
  });

  let text = contentElement.text();

  // Normalize spaces and remove any remaining inline CSS or scripts that might have been missed
  text = text.replace(/\s\s+/g, ' ').trim();

  // Limit the text to the first 2000 words
  const words = text.split(/\s+/);
  const limitedWords = words.slice(0, 2000);
  const limitedText = limitedWords.join(' ');

  return limitedText;
}