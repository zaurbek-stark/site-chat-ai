import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import type { Browser } from 'puppeteer';

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

  try {
    const textContent = await scrapeAllTextWithPuppeteer(url);

    if (textContent) {
      return new NextResponse(JSON.stringify({ textContent }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      return new NextResponse(JSON.stringify({ error: 'Failed to scrape the text content' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'An error occurred during scraping' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

async function scrapeAllTextWithPuppeteer(url: string): Promise<string | null> {
  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    } catch (error) {
      console.error('Navigation error:', error);
      throw error;
    }
    
    const textContent = await page.evaluate(() => {
      const articleElement = document.querySelector('article');
      const mainElement = document.querySelector('main');
      const contentElement = articleElement || mainElement || document.body;

      let text = contentElement.innerText;

      // Remove headers, footers, and navigation elements
      const elementsToRemove = ['header', 'footer', 'nav'];
      elementsToRemove.forEach((selector) => {
        const elements = contentElement.querySelectorAll(selector);
        elements.forEach((element) => element.remove());
      });

      // Limit the text to the first 2000 words
      const words = text.trim().split(/\s+/);
      const limitedWords = words.slice(0, 2000);
      const limitedText = limitedWords.join(' ');

      return limitedText;
    });

    const cleanedText = textContent.replace(/\s+/g, ' ').trim();

    return cleanedText;
  } catch (error) {
    console.error('Error scraping with Puppeteer:', error);
    return null;
  } finally {
    await browser?.close();
  }
}