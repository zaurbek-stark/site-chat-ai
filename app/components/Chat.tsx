import React, { useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import MarkdownRenderer from './MarkdownRenderer';
import { useUser, useClerk } from '@clerk/nextjs';
import { useChat } from 'ai/react';
import { SiteContent } from '../types/SiteContent';
import { getSitePrompt } from '../utils/getSitePrompt';

type ChatProps = {
  siteContent: SiteContent;
};

const Chat: React.FC<ChatProps> = ({ siteContent }) => {
  const chatContainer = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
    initialMessages: getSitePrompt(siteContent),
  });

  const { user } = useUser();
  const { openSignUp } = useClerk();

  const scroll = useCallback(() => {
    const { offsetHeight, scrollHeight, scrollTop } = chatContainer.current as HTMLDivElement;
    if (scrollHeight >= scrollTop + offsetHeight) {
      chatContainer.current?.scrollTo?.(0, scrollHeight + 200);
    }
  }, []);

  useEffect(() => {
    scroll();
  }, [messages, scroll]);

  const onSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!user) {
        openSignUp();
        return;
      }

      await handleSubmit(event);
    },
    [user, openSignUp, handleSubmit]
  );

  const renderResponse = useCallback(() => {
    return (
      <div ref={chatContainer} className="response">
        {messages.map((m, index) => {
          if (index === 0 || m.role !== 'user' && m.role !== 'assistant') {
            return null;
          }
          return (
            <div key={index} className={`chat-line ${m.role === 'user' ? 'user-chat' : 'ai-chat'}`}>
              <Image className="avatar" alt="avatar" src={`/${m.role}.jpg`} width={32} height={32} />
              <div style={{ marginLeft: '16px', width: '100%' }}>
                <div className="message">
                  <MemoizedMarkdownRenderer>{m.content}</MemoizedMarkdownRenderer>
                </div>
                {index < messages.length - 1 && <div className="horizontal-line" />}
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [messages]);

  const MemoizedMarkdownRenderer = React.memo(MarkdownRenderer);

  return (
    <div className="chat">
      {renderResponse()}
      <form onSubmit={onSubmit} className="chat-form">
        <input
          name="input-field"
          type="text"
          placeholder="Ask anything about the site"
          onChange={handleInputChange}
          value={input}
        />
        <button type="submit" className="send-button" />
      </form>
    </div>
  );
};

export default Chat;