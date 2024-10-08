import type { Metadata, Viewport } from 'next';
import Script from 'next/script';

import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry';

import './globals.css';
import Header from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'zvt-ui',
  description: 'Generated by create next app',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="">
        <ThemeRegistry>
          <Script src="/config.js" strategy="beforeInteractive" />
          <Header />
          <div className="my-4 w-container mx-auto mb-20">{children}</div>
          {/* <div className="h-[100px] bg-[#f3f3f3] mt-8">
            <div className="w-container mx-auto pt-[40px]">@2024 zvt-ui</div>
          </div> */}
        </ThemeRegistry>
      </body>
    </html>
  );
}
