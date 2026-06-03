'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getEvents } from '@/lib/store'
import { SportEvent, Sport, SPORT_LABELS, SPORT_EMOJIS } from '@/lib/types'
import { CITIES } from '@/lib/mockData'
import { formatDate, formatPrice } from '@/lib/utils'
import EventCard from '@/components/EventCard'
import EventModal from '@/components/EventModal'
import { Search, MapPin, Calendar, TrendingUp, Users, Ticket, ArrowRight, ChevronRight } from 'lucide-react'

const SPORTS_NAV: { sport: Sport | 'all'; label: string; emoji: string }[] = [
  { sport: 'all', label: 'Все', emoji: '🏅' },
  { sport: 'football', label: 'Футбол', emoji: '⚽' },
  { sport: 'running', label: 'Бег', emoji: '🏃' },
  { sport: 'basketball', label: 'Баскетбол', emoji: '🏀' },
  { sport: 'tennis', label: 'Теннис', emoji: '🎾' },
  { sport: 'swimming', label: 'Плавание', emoji: '🏊' },
  { sport: 'hockey', label: 'Хоккей', emoji: '🏒' },
  { sport: 'yoga', label: 'Йога', emoji: '🧘' },
  { sport: 'boxing', label: 'Бокс', emoji: '🥊' },
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
    const matchSport = activeSport === 'all' || e.sport === activeSport
    const matchCity = !searchCity || e.city === searchCity
    return matchSport && matchCity
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
      <section className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-emerald-300 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <p className="text-emerald-300 text-sm font-semibold uppercase tracking-widest mb-4">
            Маркетплейс спортивных мероприятий
          </p>
          <h1 className="font-display text-5xl sm:text-7xl font-bold mb-6 leading-tight">
            Найди своё<br />
            <span className="text-emerald-300">событие</span>
          </h1>
          <p className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
            Билеты на спортивные мероприятия по всей России. Футбол, марафоны, хоккей, теннис и многое другое.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto shadow-2xl"
          >
            <div className="flex items-center gap-2 flex-1 px-3">
              <Search size={18} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск мероприятий..."
                className="flex-1 text-gray-800 placeholder-gray-400 text-sm outline-none bg-transparent py-2"
              />
            </div>
            <div className="flex items-center gap-2 border-l border-gray-100 px-3 sm:w-44">
              <MapPin size={16} className="text-gray-400 flex-shrink-0" />
              <select
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="text-sm text-gray-600 outline-none bg-transparent flex-1"
              >
                <option value="">Все города</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Найти
            </button>
          </form>

          {/* Stats */}
          <div className="flex justify-center gap-10 mt-12 text-center">
            {[
              { icon: <Calendar size={20} />, value: stats.events, label: 'Мероприятий' },
              { icon: <MapPin size={20} />, value: stats.cities, label: 'Городов' },
              { icon: <Ticket size={20} />, value: stats.tickets.toLocaleString('ru'), label: 'Билетов продано' },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="text-emerald-300">{s.icon}</div>
                <p className="text-3xl font-display font-bold">{s.value}</p>
                <p className="text-emerald-200 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sport categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {SPORTS_NAV.map((s) => (
            <button
              key={s.sport}
              onClick={() => setActiveSport(s.sport)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                activeSport === s.sport
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-300'
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
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">⭐ Топ мероприятия</h2>
              <p className="text-gray-500 text-sm mt-1">Самые популярные события этого сезона</p>
            </div>
            <button
              onClick={() => router.push('/events')}
              className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              Все <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featured.slice(0, 3).map((event) => (
              <EventCard key={event.id} event={event} onClick={setSelectedEvent} />
            ))}
          </div>
        </section>
      )}

      {/* Filtered events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {activeSport !== 'all'
                ? `${SPORT_EMOJIS[activeSport]} ${SPORT_LABELS[activeSport]}`
                : '🗓️ Все мероприятия'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Найдено: {filtered.length} {filtered.length === 1 ? 'событие' : 'событий'}
            </p>
          </div>
          <button
            onClick={() => router.push('/events')}
            className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Каталог <ArrowRight size={15} />
          </button>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-lg font-medium">Ничего не найдено</p>
            <p className="text-sm">Попробуйте изменить фильтры</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.slice(0, 8).map((event) => (
              <EventCard key={event.id} event={event} onClick={setSelectedEvent} />
            ))}
          </div>
        )}
        {filtered.length > 8 && (
          <div className="text-center mt-8">
            <button
              onClick={() => router.push('/events')}
              className="px-8 py-3 border-2 border-emerald-600 text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-colors"
            >
              Показать все {filtered.length} мероприятий
            </button>
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="bg-white py-16 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Как это работает</h2>
          <p className="text-center text-gray-500 mb-12">Купить билет просто</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Найди мероприятие', desc: 'Используй фильтры по виду спорта, городу и дате', icon: '🔍' },
              { step: '02', title: 'Купи билет', desc: 'Оплати онлайн за несколько секунд', icon: '🎫' },
              { step: '03', title: 'Иди и радуйся', desc: 'Билеты всегда доступны в личном кабинете', icon: '🎉' },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-3xl mb-4">
                  {item.icon}
                </div>
                <p className="text-xs font-bold text-emerald-500 mb-1 tracking-widest">{item.step}</p>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-10 text-white text-center">
          <h2 className="text-3xl font-bold mb-3">Проводишь мероприятие?</h2>
          <p className="text-emerald-100 mb-6 max-w-lg mx-auto">
            Разместите своё событие на платформе и продавайте билеты тысячам любителей спорта
          </p>
          <button
            onClick={() => router.push('/create-event')}
            className="px-8 py-3.5 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-colors"
          >
            Создать мероприятие →
          </button>
        </div>
      </section>

      <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </>
  )
}
