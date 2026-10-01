import { Outfit, Inter, IBM_Plex_Mono } from 'next/font/google';
import '@/styles/globals.css';
import { Toaster } from '@/components/ui/feedback';
import { ThemeProvider } from '@/components/ui/utilities';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
  display: 'swap',
});

export { metadata, viewport } from './metadata';

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${inter.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
