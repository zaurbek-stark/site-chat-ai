import React, { useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { SiteContent } from '../types/SiteContent';
import { processHtmlContent } from '../utils/processHtmlContent';

type Props = {
  setSiteContent: React.Dispatch<React.SetStateAction<SiteContent>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
};

const RequestForm: React.FC<Props> = ({ setSiteContent, setIsLoading, isLoading }) => {
  const [siteUrl, setSiteUrl] = useState('');
  const [error, setError] = useState('');
  const { user } = useUser();
  const { openSignUp } = useClerk();

  const scrapeSite = async (url: string) => {
    const response = await fetch(`/api/scrapper`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error('Failed to scrape the site');
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullContent = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullContent += chunk;

      // Check if the chunk contains a complete JSON object
      const lines = fullContent.split('\n');
      for (let i = 0; i < lines.length - 1; i++) {
        try {
          const data = JSON.parse(lines[i]);
          if (data.status === 'processing') {
            // Update the loading state or show a progress indicator
            console.log('Processing...');
          } else if (data.textContent) {
            const textContent = processHtmlContent(data.textContent);
            setSiteContent({ content: textContent, url });
          } else if (data.error) {
            throw new Error(data.error);
          }
        } catch (error) {
          // Ignore JSON parsing errors and continue reading the stream
        }
      }

      // Keep the remaining incomplete chunk for the next iteration
      fullContent = lines[lines.length - 1];
    }
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      openSignUp();
      return;
    }

    setError('');
    setIsLoading(true);
    setSiteContent({url: '', content: ''});

    try {
      await scrapeSite(siteUrl);
    } catch (error) {
      setError('There was an error reading the site. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="input-group">
        <input
          className="input-style"
          name="url-input"
          type="url"
          placeholder="Drop the url here"
          value={siteUrl}
          onChange={(e) => setSiteUrl(e.target.value)}
        />
      </div>
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <div>
          <button className="label-style main-btn" type="submit">
            Submit
          </button>
        </div>
      )}
      {error && <p className="error-message">{error}</p>}
    </form>
  );
};

export default RequestForm;