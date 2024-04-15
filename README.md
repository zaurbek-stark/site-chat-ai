# Chat with any website

> This app was built as part of a challenge in the **Codebender AI Bootcamp**. Learn how to build projects like these [here](https://lastcodebender.com/bootcamp).

This app allows you to chat with any website.

<img src="https://s9.gifyu.com/images/SVJIG.gif" alt="app demo" width=600 />

The app is built with Next.js. It uses Puppeteer to scrape the website and the Claude 3 Haiku for the AI model to chat with the site.

## Author

This project is built by The Codebender [𝕏](https://twitter.com/ZaurbekStark)/[YouTube](https://www.youtube.com/@thecodebendermaster)

## Getting Started

First, duplicate the `.env` file into a new file named `.env.local`. Update the value of your [Anthropic](https://docs.anthropic.com/claude/reference/getting-started-with-the-api) and [Clerk](https://clerk.com/docs/upgrade-guides/api-keys) API keys there.

The first time you are running this project, you will need to install the dependencies. Run this command in your terminal:

```bash
yarn
```

To start the app, run:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.
