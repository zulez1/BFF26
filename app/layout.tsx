import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'SportMarket — маркетплейс спортивных мероприятий',
  description:
    'Найдите и купите билеты на спортивные мероприятия: футбол, баскетбол, бег, теннис и многое другое по всей России.',
  keywords: 'спорт, мероприятия, билеты, маркетплейс, футбол, бег, баскетбол',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>
        <Header />
        <main className="min-h-screen pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
