'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getEvents } from '@/lib/store'
import { SportEvent, Sport, SPORT_LABELS, SPORT_EMOJIS } from '@/lib/types'
import { CITIES } from '@/lib/mockData'
import { formatPrice } from '@/lib/utils'
import EventCard from '@/components/EventCard'
import EventModal from '@/components/EventModal'
import { Search, MapPin, ArrowRight, Zap, TrendingUp, Shield } from 'lucide-react'

const SPORTS_NAV: { sport: Sport | 'all'; label: string; emoji: string }[] = [
  { sport: 'all', label: 'Все', emoji: '🏅' },
  { sport: 'football', label: 'Футбол', emoji: '⚽' },
  { sport: 'running', label: 'Бег', emoji: '🏃' },
  { sport: 'basketball', label: 'Баскетбол', emoji: '🏀' },
  { sport: 'tennis', label: 'Теннис', emoji: '🎾' },
  { sport: 'hockey', label: 'Хоккей', emoji: '🏒' },
  { sport: 'boxing', label: 'Бокс', emoji: '🥊' },
  { sport: 'cycling', label: 'Вело', emoji: '🚴' },
  { sport: 'yoga', label: 'Йога', emoji: '🧘' },
]

export default function HomePage() {
  const router = useRouter()
  const [events, setEvents] = useState<SportEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<SportEvent | null>(null)
  const [activeSport, setActiveSport] = useState<Sport | 'all'>('all')
  const [searchCity, setSearchCity] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setEvents(getEvents())
  }, [])

  const featured = events.filter((e) => e.featured)
  const filtered = events.filter((e) => {
    if (activeSport !== 'all' && e.sport !== activeSport) return false
    if (searchCity && e.city !== searchCity) return false
    return true
  })

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (searchCity) params.set('city', searchCity)
    if (activeSport !== 'all') params.set('sport', activeSport)
    router.push(`/events?${params.toString()}`)
  }

  const stats = {
    events: events.length,
    cities: new Set(events.map((e) => e.city)).size,
    tickets: events.reduce((a, e) => a + e.soldTickets, 0),
  }

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[#080808]">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(212,255,0,0.08) 0%, transparent 60%)',
          }} />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none'/%3E%3Cpath d='M0 0v60M60 0v60M0 0h60M0 60h60' stroke='%23fff' stroke-width='0.5'/%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#D4FF00]/10 border border-[#D4FF00]/20 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF00] animate-pulse" />
              <span className="text-[#D4FF00] text-xs font-medium tracking-widest uppercase">
                Маркетплейс спортивных мероприятий
              </span>
            </div>

            <h1 className="font-display text-7xl sm:text-8xl lg:text-[110px] font-normal text-white leading-[0.9] tracking-wide mb-8">
              НАЙДИ<br />
              СВОЁ <span className="text-[#D4FF00]">СОБЫТИЕ</span>
            </h1>

            <p className="text-white/40 text-lg sm:text-xl mb-10 max-w-xl leading-relaxed">
              Билеты на спортивные мероприятия по всей России — футбол, марафоны, единоборства и многое другое.
            </p>

            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-3 max-w-2xl"
            >
              <div className="flex-1 flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-2xl px-4 py-3.5 focus-within:border-[#D4FF00]/40 transition-colors">
                <Search size={16} className="text-white/30 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск мероприятий..."
                  className="flex-1 bg-transparent text-white placeholder-white/25 text-sm outline-none"
                />
              </div>
              <div className="flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-2xl px-4 py-3.5 sm:w-44 focus-within:border-[#D4FF00]/40 transition-colors">
                <MapPin size={14} className="text-white/30 flex-shrink-0" />
                <select
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="text-sm text-white/50 bg-transparent outline-none flex-1 cursor-pointer"
                >
                  <option value="">Все города</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="px-8 py-3.5 bg-[#D4FF00] text-black font-bold rounded-2xl hover:bg-[#c8f000] transition-colors text-sm"
              >
                Найти
              </button>
            </form>

            {/* Stats */}
            <div className="flex gap-8 mt-12">
              {[
                { value: `${stats.events}+`, label: 'Мероприятий' },
                { value: `${stats.cities}`, label: 'Городов' },
                { value: `${stats.tickets.toLocaleString('ru')}`, label: 'Билетов продано' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-display text-4xl text-white">{s.value}</p>
                  <p className="text-white/30 text-xs uppercase tracking-wider mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20">
          <span className="text-xs uppercase tracking-widest">Прокрути</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </section>

      {/* Sport filter tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {SPORTS_NAV.map((s) => (
            <button
              key={s.sport}
              onClick={() => setActiveSport(s.sport)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all border ${
                activeSport === s.sport
                  ? 'bg-[#D4FF00] text-black border-transparent'
                  : 'bg-white/[0.04] border-white/[0.06] text-white/50 hover:text-white hover:border-white/10'
              }`}
            >
              <span>{s.emoji}</span>
              {s.label}
            </button>
          ))}
        </div>
      </section>

      {/* Featured events */}
      {featured.length > 0 && activeSport === 'all' && !searchCity && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Топ мероприятия</h2>
              <p className="text-white/30 text-sm mt-1">Самые популярные события сезона</p>
            </div>
            <button
              onClick={() => router.push('/events')}
              className="flex items-center gap-1.5 text-sm font-medium text-[#D4FF00]/70 hover:text-[#D4FF00] transition-colors"
            >
              Все <ArrowRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.slice(0, 3).map((event) => (
              <EventCard key={event.id} event={event} onClick={setSelectedEvent} />
            ))}
          </div>
        </section>
      )}

      {/* Filtered events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {activeSport !== 'all'
                ? `${SPORT_EMOJIS[activeSport]} ${SPORT_LABELS[activeSport]}`
                : 'Все мероприятия'}
            </h2>
            <p className="text-white/30 text-sm mt-1">
              {filtered.length} {filtered.length === 1 ? 'событие' : 'событий'}
            </p>
          </div>
          <button
            onClick={() => router.push('/events')}
            className="flex items-center gap-1.5 text-sm font-medium text-white/30 hover:text-white/60 transition-colors"
          >
            Каталог <ArrowRight size={14} />
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-white/20">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg font-medium text-white/40">Ничего не найдено</p>
            <p className="text-sm mt-1">Попробуйте изменить фильтры</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.slice(0, 8).map((event) => (
              <EventCard key={event.id} event={event} onClick={setSelectedEvent} />
            ))}
          </div>
        )}

        {filtered.length > 8 && (
          <div className="text-center mt-10">
            <button
              onClick={() => router.push('/events')}
              className="px-8 py-3.5 border border-white/10 text-white/60 font-semibold rounded-2xl hover:border-[#D4FF00]/30 hover:text-[#D4FF00] transition-all"
            >
              Показать все {filtered.length} мероприятий
            </button>
          </div>
        )}
      </section>

      {/* Features section */}
      <section className="border-t border-white/[0.05] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display text-5xl text-white mb-3">КАК ЭТО РАБОТАЕТ</h2>
            <p className="text-white/30">Купить билет — просто</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Search size={22} />,
                step: '01',
                title: 'Найди мероприятие',
                desc: 'Фильтры по виду спорта, городу, дате и цене — найди именно то, что тебе нужно.',
              },
              {
                icon: <Zap size={22} />,
                step: '02',
                title: 'Купи билет',
                desc: 'Мгновенная покупка без лишних шагов. Все данные сохранятся в личном кабинете.',
              },
              {
                icon: <Shield size={22} />,
                step: '03',
                title: 'Иди на событие',
                desc: 'Электронный билет всегда с тобой. Просто покажи на входе и наслаждайся.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-[#141414] border border-white/[0.06] rounded-2xl p-7 hover:border-[#D4FF00]/20 transition-colors group"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-[#D4FF00]/10 border border-[#D4FF00]/20 flex items-center justify-center text-[#D4FF00] group-hover:bg-[#D4FF00]/20 transition-colors">
                    {item.icon}
                  </div>
                  <span className="font-display text-4xl text-white/[0.06]">{item.step}</span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-white/35 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div
          className="rounded-3xl p-10 sm:p-14 text-center overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #1a1a00 0%, #141400 50%, #0c0c0c 100%)' }}
        >
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(212,255,0,0.07) 0%, transparent 70%)',
          }} />
          <div className="relative">
            <p className="text-[#D4FF00]/60 text-xs uppercase tracking-widest mb-4">Для организаторов</p>
            <h2 className="font-display text-5xl sm:text-6xl text-white mb-4">
              ПРОВОДИШЬ<br />МЕРОПРИЯТИЕ?
            </h2>
            <p className="text-white/40 mb-8 max-w-md mx-auto text-sm leading-relaxed">
              Разместите своё событие на платформе бесплатно и продавайте билеты тысячам любителей спорта по всей России
            </p>
            <button
              onClick={() => router.push('/create-event')}
              className="px-8 py-4 bg-[#D4FF00] text-black font-bold rounded-2xl hover:bg-[#c8f000] transition-colors text-sm"
            >
              Создать мероприятие →
            </button>
          </div>
        </div>
      </section>

      <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </>
  )
}
