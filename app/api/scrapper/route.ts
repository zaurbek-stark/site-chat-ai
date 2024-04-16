import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

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
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const scrapingAntApiKey = process.env.SCRAPINGANT_API_KEY;
  const apiEndpoint = `https://api.scrapingant.com/v2/general?url=${encodeURIComponent(url)}&x-api-key=${scrapingAntApiKey}&browser=false&block_resource=stylesheet&block_resource=image&block_resource=media&block_resource=font&block_resource=texttrack&block_resource=xhr&block_resource=fetch&block_resource=eventsource&block_resource=websocket&block_resource=manifest`;

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  try {
    const response = await fetch(apiEndpoint);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Send an initial response within the first 25 seconds
    writer.write(JSON.stringify({ status: 'processing' }));
    writer.write('\n');

    const htmlContent = await response.text();

    // Stream the scraped data once it becomes available
    writer.write(JSON.stringify({ textContent: htmlContent }));
    writer.write('\n');

    writer.close();
  } catch (error) {
    console.error('Error while calling ScrapingAnt:', error);
    writer.write(JSON.stringify({ error: 'An error occurred during scraping', details: error }));
    writer.write('\n');
    writer.close();
  }

  return new NextResponse(stream.readable, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Transfer-Encoding': 'chunked',
    },
  });
}