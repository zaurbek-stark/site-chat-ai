import './globals.css'
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react';
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Chat with Site GPT',
  description: 'AI Agent that allows you to chat with any website',
}

function Header() {
  return (
    <header style={{ position: "absolute", display: "flex", justifyContent: "space-between", padding: 10, width: '100%' }}>
      <div className="block md:flex items-end gap-3">
        <span className="author">Built by <a href='https://twitter.com/ZaurbekStark' target='_blank'>The Codebender</a></span>
      </div>
      <div className="flex space-x-4 justify-center items-center">
        <SignedIn>
          <UserButton appearance={{baseTheme: dark}} afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="text-white border border-white hover:text-white hover:bg-[#2d06ff4a] py-2 px-4 rounded-3xl transition duration-300 ease-in-out">Sign in</button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="bg-white py-2 px-4 rounded-3xl transition duration-300 ease-in-out">Sign up</button>
          </SignUpButton>
        </SignedOut>
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark
      }}
    >
      <html lang="en">
        <body>
          <Header />
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}