'use client'

import { SportEvent, SPORT_LABELS, SPORT_EMOJIS, SPORT_COLORS } from '@/lib/types'
import { formatDate, formatPrice, getAvailability } from '@/lib/utils'
import { MapPin, Calendar, Ticket } from 'lucide-react'

interface Props {
  event: SportEvent
  onClick: (event: SportEvent) => void
}

export default function EventCard({ event, onClick }: Props) {
  const { available, pct } = getAvailability(event.totalTickets, event.soldTickets)
  const isAlmostFull = pct >= 80
  const isFull = available === 0

  return (
    <div
      onClick={() => onClick(event)}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:border-emerald-300 transition-all duration-200 flex flex-col"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            if (target.parentElement) {
              target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-6xl bg-emerald-50">${SPORT_EMOJIS[event.sport]}</div>`
            }
          }}
        />
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${SPORT_COLORS[event.sport]}`}>
            {SPORT_EMOJIS[event.sport]} {SPORT_LABELS[event.sport]}
          </span>
          {event.featured && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
              ⭐ Топ
            </span>
          )}
        </div>
        {isFull && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-lg bg-red-500 px-4 py-2 rounded-full">
              Билеты закончились
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-base leading-snug mb-3 line-clamp-2">
          {event.title}
        </h3>
        <div className="space-y-1.5 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-emerald-500 flex-shrink-0" />
            <span>
              {formatDate(event.date)}
              {event.endDate && event.endDate !== event.date && ` — ${formatDate(event.endDate)}`}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-emerald-500 flex-shrink-0" />
            <span className="truncate">{event.city}, {event.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Ticket size={14} className="text-emerald-500 flex-shrink-0" />
            <span>
              {isFull ? (
                <span className="text-red-500 font-medium">Нет мест</span>
              ) : (
                <>
                  <span className={isAlmostFull ? 'text-orange-500 font-medium' : ''}>
                    {available.toLocaleString('ru')} мест
                  </span>
                  {isAlmostFull && !isFull && ' — почти нет'}
                </>
              )}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-orange-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{pct}% продано</p>
        </div>

        {/* Price & CTA */}
        <div className="mt-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">от</p>
            <p className="text-lg font-bold text-emerald-600">{formatPrice(event.price)}</p>
          </div>
          <button className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
            Подробнее
          </button>
        </div>
      </div>
    </div>
  )
}
