import React, { useState } from 'react';
import Chat from './Chat';
import RequestForm from './RequestForm';

const SiteGPT = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [siteContent, setSiteContent] = useState({url: '', content: ''});

  const instructions = siteContent.content?.trim()
    ? 'Ask any questions you want about the site'
    : 'Enter the site you want to chat with';

  return (
    <div className="form-wrapper">
      <p className="instructions-text">{instructions}</p>
      {siteContent.content ? (
        <Chat siteContent={siteContent} />
      ) : (
        <RequestForm setIsLoading={setIsLoading} setSiteContent={setSiteContent} isLoading={isLoading} />
      )}
    </div>
  );
};

export default SiteGPT;