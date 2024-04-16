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
    const responseData = await response.json();
    const textContent = processHtmlContent(responseData.textContent);
    setSiteContent({content: textContent, url});
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