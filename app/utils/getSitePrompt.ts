import { Message } from 'ai';
import { SiteContent } from '../types/SiteContent';

export const getSitePrompt = (siteContent: SiteContent): Message[] => {
  return [{
    id: '0',
    role: 'user',
    content: `ROLE: You are an assistant who allows users to chat with the content of a site.
------
OBJECTIVE: The user gave you the text from a site. Your role is to answer to the user questions about the site based on the data given.
------
SITE DATA:\n\n ${siteContent.content}
------
OUTPUT FORMAT: Reply to the user questions in a concise way, less than 100 characters (unless specified otherwise).
`,
    },
    { id: '1', role: 'assistant', content: `Here is the site you entered: ${siteContent.url}`
  }];
}