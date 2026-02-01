import './globals.css'
import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { ModalProvider } from '@/components/providers/modal-provider'
import { AppProvider } from '@/components/providers/query-provider'

export const metadata: Metadata = {
  title: 'Mentis',
  description: 'The connected workspace where better, faster work happens.',
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: [
      {
        url: "/logo.svg",
        type: "image/svg+xml",
      },
    ],
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressContentEditableWarning>
      <body>
        <AppProvider>
          <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange storageKey='mentis-theme-2'>
              <Toaster position='bottom-center' />
              <ModalProvider />
              {children}
            </ThemeProvider>
        </AppProvider>
        </body>
    </html>
  )
}
