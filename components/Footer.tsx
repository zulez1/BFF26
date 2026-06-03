import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-white/[0.06] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="mb-4">
              <span className="font-display text-3xl tracking-wider text-white">
                SPORT<span className="text-[#D4FF00]">MKT</span>
              </span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Платформа для поиска спортивных мероприятий и покупки билетов по всей России.
            </p>
            <div className="flex gap-3 mt-6">
              {['ВКонтакте', 'Telegram', 'YouTube'].map((s) => (
                <button
                  key={s}
                  className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/10 border border-white/[0.08] rounded-lg text-xs text-white/40 hover:text-white/60 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white/80 font-semibold mb-4 text-sm uppercase tracking-wider">Навигация</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '/', label: 'Главная' },
                { href: '/events', label: 'Мероприятия' },
                { href: '/create-event', label: 'Создать событие' },
                { href: '/dashboard', label: 'Личный кабинет' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/40 hover:text-[#D4FF00] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white/80 font-semibold mb-4 text-sm uppercase tracking-wider">Поддержка</h4>
            <ul className="space-y-2.5 text-sm">
              {['Помощь', 'Условия использования', 'Политика конфиденциальности', 'Контакты'].map((l) => (
                <li key={l}>
                  <span className="text-white/40 hover:text-[#D4FF00] transition-colors cursor-pointer">{l}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/[0.05] mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/25">
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
