import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">⚡</span>
              <span className="text-white font-display font-bold text-xl tracking-wide">SportMarket</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Платформа для поиска спортивных мероприятий и покупки билетов. Найди событие, которое тебя вдохновит.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Навигация</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-emerald-400 transition-colors">Главная</Link></li>
              <li><Link href="/events" className="hover:text-emerald-400 transition-colors">Мероприятия</Link></li>
              <li><Link href="/create-event" className="hover:text-emerald-400 transition-colors">Создать событие</Link></li>
              <li><Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Личный кабинет</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Поддержка</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="hover:text-emerald-400 cursor-pointer">Помощь</span></li>
              <li><span className="hover:text-emerald-400 cursor-pointer">Условия использования</span></li>
              <li><span className="hover:text-emerald-400 cursor-pointer">Политика конфиденциальности</span></li>
              <li><span className="hover:text-emerald-400 cursor-pointer">Контакты</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>© 2026 SportMarket. Все права защищены.</p>
          <div className="flex items-center gap-4">
            <span>🇷🇺 Россия</span>
            <span>·</span>
            <span>support@sportmarket.ru</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
