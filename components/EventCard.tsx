'use client'

import { useState, useEffect } from 'react'
import { SportEvent, SPORT_LABELS, SPORT_EMOJIS, SPORT_COLORS } from '@/lib/types'
import { formatDate, formatPrice, getAvailability } from '@/lib/utils'
import { isInWishlist, toggleWishlist } from '@/lib/store'
import { MapPin, Calendar, Heart } from 'lucide-react'

interface Props {
  event: SportEvent
  onClick: (event: SportEvent) => void
}

export default function EventCard({ event, onClick }: Props) {
  const { available, pct } = getAvailability(event.totalTickets, event.soldTickets)
  const isAlmostFull = pct >= 80
  const isFull = available === 0
  const [wished, setWished] = useState(false)

  useEffect(() => {
    setWished(isInWishlist(event.id))
  }, [event.id])

  function handleWishlist(e: React.MouseEvent) {
    e.stopPropagation()
    const next = toggleWishlist(event.id)
    setWished(next)
  }

  return (
    <div
      onClick={() => onClick(event)}
      className="group bg-[#141414] rounded-2xl border border-white/[0.06] overflow-hidden cursor-pointer hover:-translate-y-1.5 hover:border-[#D4FF00]/30 hover:shadow-[0_0_40px_rgba(212,255,0,0.06)] transition-all duration-200 flex flex-col"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-[#1a1a1a] flex-shrink-0">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            if (target.parentElement) {
              target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-5xl bg-[#1a1a1a]">${SPORT_EMOJIS[event.sport]}</div>`
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent opacity-70" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${SPORT_COLORS[event.sport]}`}>
            {SPORT_EMOJIS[event.sport]} {SPORT_LABELS[event.sport]}
          </span>
          {event.featured && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#D4FF00]/20 text-[#D4FF00] border border-[#D4FF00]/30 backdrop-blur-sm">
              ТОП
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${
            wished
              ? 'bg-red-500/20 border border-red-500/40 text-red-400'
              : 'bg-black/30 border border-white/10 text-white/40 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30'
          }`}
        >
          <Heart size={13} fill={wished ? 'currentColor' : 'none'} />
        </button>

        {isFull && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white/70 font-semibold text-sm bg-white/10 border border-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
              Билеты закончились
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-white text-sm leading-snug mb-3 line-clamp-2 group-hover:text-white transition-colors">
          {event.title}
        </h3>
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-1.5 text-white/40 text-xs">
            <Calendar size={11} className="text-[#D4FF00]/60 flex-shrink-0" />
            <span>
              {formatDate(event.date)}
              {event.endDate && event.endDate !== event.date && ` — ${formatDate(event.endDate)}`}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-white/40 text-xs">
            <MapPin size={11} className="text-[#D4FF00]/60 flex-shrink-0" />
            <span className="truncate">{event.city}, {event.location}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${pct}%`,
                background: pct >= 90 ? '#ef4444' : pct >= 70 ? '#f97316' : '#D4FF00',
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <p className="text-[10px] text-white/25">{pct}% продано</p>
            {isAlmostFull && !isFull && (
              <p className="text-[10px] text-orange-400">Почти нет мест</p>
            )}
          </div>
        </div>

        {/* Price & CTA */}
        <div className="mt-auto flex items-center justify-between">
          <div>
            <p className="text-[10px] text-white/25 uppercase tracking-wider">от</p>
            <p className="text-base font-bold text-[#D4FF00]">{formatPrice(event.price)}</p>
          </div>
          <button className="px-4 py-2 bg-[#D4FF00]/10 text-[#D4FF00] border border-[#D4FF00]/20 text-xs font-semibold rounded-xl group-hover:bg-[#D4FF00] group-hover:text-black transition-all duration-200">
            Подробнее
          </button>
        </div>
      </div>
    </div>
  )
}
