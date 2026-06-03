'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { getEvents } from '@/lib/store'
import { SportEvent, Sport, SPORT_LABELS, SPORT_EMOJIS, FilterOptions } from '@/lib/types'
import { CITIES } from '@/lib/mockData'
import { formatPrice } from '@/lib/utils'
import EventCard from '@/components/EventCard'
import EventModal from '@/components/EventModal'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'

const ALL_SPORTS: { value: Sport | 'all'; label: string; emoji: string }[] = [
  { value: 'all', label: 'Все виды', emoji: '🏅' },
  { value: 'football', label: 'Футбол', emoji: '⚽' },
  { value: 'basketball', label: 'Баскетбол', emoji: '🏀' },
  { value: 'running', label: 'Бег', emoji: '🏃' },
  { value: 'tennis', label: 'Теннис', emoji: '🎾' },
  { value: 'swimming', label: 'Плавание', emoji: '🏊' },
  { value: 'hockey', label: 'Хоккей', emoji: '🏒' },
  { value: 'volleyball', label: 'Волейбол', emoji: '🏐' },
  { value: 'boxing', label: 'Бокс', emoji: '🥊' },
  { value: 'yoga', label: 'Йога', emoji: '🧘' },
  { value: 'skiing', label: 'Лыжи', emoji: '⛷️' },
]

const SORT_OPTIONS = [
  { value: 'date-asc', label: 'Дата: раньше' },
  { value: 'date-desc', label: 'Дата: позже' },
  { value: 'price-asc', label: 'Цена: дешевле' },
  { value: 'price-desc', label: 'Цена: дороже' },
  { value: 'popular', label: 'По популярности' },
]

function EventsContent() {
  const params = useSearchParams()
  const [events, setEvents] = useState<SportEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<SportEvent | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sort, setSort] = useState('date-asc')

  const [filters, setFilters] = useState<FilterOptions>({
    sport: (params.get('sport') as Sport) || 'all',
    city: params.get('city') || '',
    dateFrom: '',
    dateTo: '',
    priceMin: 0,
    priceMax: 10000,
    search: params.get('q') || '',
  })

  useEffect(() => {
    setEvents(getEvents())
  }, [])

  function updateFilter<K extends keyof FilterOptions>(key: K, val: FilterOptions[K]) {
    setFilters((f) => ({ ...f, [key]: val }))
  }

  function resetFilters() {
    setFilters({ sport: 'all', city: '', dateFrom: '', dateTo: '', priceMin: 0, priceMax: 10000, search: '' })
  }

  const filtered = events.filter((e) => {
    if (filters.sport !== 'all' && e.sport !== filters.sport) return false
    if (filters.city && e.city !== filters.city) return false
    if (filters.dateFrom && e.date < filters.dateFrom) return false
    if (filters.dateTo && e.date > filters.dateTo) return false
    if (e.price < filters.priceMin || e.price > filters.priceMax) return false
    if (filters.search) {
      const q = filters.search.toLowerCase()
      if (!e.title.toLowerCase().includes(q) && !e.city.toLowerCase().includes(q) && !e.description.toLowerCase().includes(q)) return false
    }
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime()
    if (sort === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime()
    if (sort === 'price-asc') return a.price - b.price
    if (sort === 'price-desc') return b.price - a.price
    if (sort === 'popular') return b.soldTickets - a.soldTickets
    return 0
  })

  const activeFilterCount = [
    filters.sport !== 'all',
    filters.city !== '',
    filters.dateFrom !== '',
    filters.dateTo !== '',
    filters.priceMin > 0,
    filters.priceMax < 10000,
  ].filter(Boolean).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Мероприятия</h1>
        <p className="text-gray-500 mt-1">Найдено: {sorted.length} событий</p>
      </div>

      {/* Search + Sort bar */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus-within:border-emerald-400 transition-colors">
          <Search size={17} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Поиск по названию, городу..."
            className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
          />
          {filters.search && (
            <button onClick={() => updateFilter('search', '')} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
            activeFilterCount > 0 ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-300'
          }`}
        >
          <SlidersHorizontal size={16} />
          Фильтры
          {activeFilterCount > 0 && (
            <span className="bg-white text-emerald-600 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
        <div className="relative hidden sm:flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-sm text-gray-700 outline-none bg-transparent pr-4 appearance-none cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="text-gray-400 pointer-events-none absolute right-3" />
        </div>
      </div>

      {/* Filters panel */}
      {filtersOpen && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Sport */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Вид спорта</label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_SPORTS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => updateFilter('sport', s.value)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filters.sport === s.value ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {s.emoji} {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Город</label>
              <select
                value={filters.city}
                onChange={(e) => updateFilter('city', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-emerald-400"
              >
                <option value="">Все города</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Dates */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Дата</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => updateFilter('dateFrom', e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-2.5 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400"
                />
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => updateFilter('dateTo', e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-2.5 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                Цена: {formatPrice(filters.priceMin)} — {formatPrice(filters.priceMax)}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.priceMin}
                  onChange={(e) => updateFilter('priceMin', +e.target.value)}
                  min={0}
                  placeholder="от"
                  className="flex-1 border border-gray-200 rounded-xl px-2.5 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400"
                />
                <input
                  type="number"
                  value={filters.priceMax}
                  onChange={(e) => updateFilter('priceMax', +e.target.value)}
                  min={0}
                  placeholder="до"
                  className="flex-1 border border-gray-200 rounded-xl px-2.5 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button onClick={resetFilters} className="text-sm text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1">
              <X size={14} />
              Сбросить всё
            </button>
          </div>
        </div>
      )}

      {/* Sport tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {ALL_SPORTS.map((s) => (
          <button
            key={s.value}
            onClick={() => updateFilter('sport', s.value)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all ${
              filters.sport === s.value
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-300'
            }`}
          >
            <span>{s.emoji}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Events grid */}
      {sorted.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-xl font-semibold text-gray-700 mb-2">Ничего не найдено</p>
          <p className="text-gray-400 mb-6">Попробуйте изменить параметры поиска</p>
          <button onClick={resetFilters} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {sorted.map((event) => (
            <EventCard key={event.id} event={event} onClick={setSelectedEvent} />
          ))}
        </div>
      )}

      <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} onPurchased={() => setEvents(getEvents())} />
    </div>
  )
}

export default function EventsPage() {
  return (
    <Suspense>
      <EventsContent />
    </Suspense>
  )
}
