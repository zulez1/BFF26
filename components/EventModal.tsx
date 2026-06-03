'use client'

import { useState, useEffect } from 'react'
import { SportEvent, SPORT_LABELS, SPORT_EMOJIS, SPORT_COLORS } from '@/lib/types'
import { formatDate, formatPrice, getAvailability } from '@/lib/utils'
import { getCurrentUser, purchaseTicket, toggleWishlist, isInWishlist } from '@/lib/store'
import {
  X, MapPin, Calendar, Ticket, Users, Tag, Heart, CheckCircle, Minus, Plus,
} from 'lucide-react'
import Link from 'next/link'

interface Props {
  event: SportEvent | null
  onClose: () => void
  onPurchased?: () => void
}

export default function EventModal({ event, onClose, onPurchased }: Props) {
  const [quantity, setQuantity] = useState(1)
  const [step, setStep] = useState<'detail' | 'purchase' | 'success'>('detail')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [wished, setWished] = useState(false)
  const user = getCurrentUser()

  useEffect(() => {
    if (event) {
      setStep('detail')
      setQuantity(1)
      setError('')
      setWished(isInWishlist(event.id))
    }
  }, [event])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!event) return null

  const { available, pct } = getAvailability(event.totalTickets, event.soldTickets)
  const isFull = available === 0

  async function handleBuy() {
    if (!user || !event) return
    setLoading(true)
    setError('')
    await new Promise((r) => setTimeout(r, 800))
    const result = purchaseTicket(event.id, user.id, quantity)
    setLoading(false)
    if (result.ok) {
      setStep('success')
      onPurchased?.()
    } else {
      setError(result.error || 'Ошибка покупки')
    }
  }

  function handleWishlist() {
    const next = toggleWishlist(event!.id)
    setWished(next)
  }

  const totalPrice = event.price * quantity

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#141414] border border-white/[0.08] w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[95vh] flex flex-col animate-slide-up shadow-2xl">
        {/* Header image */}
        {step !== 'success' && (
          <div className="relative h-52 flex-shrink-0 bg-[#1a1a1a]">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover opacity-70"
              onError={(e) => {
                const t = e.target as HTMLImageElement
                t.style.display = 'none'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-all border border-white/10"
            >
              <X size={16} />
            </button>
            <div className="absolute bottom-4 left-4 right-16">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-2 backdrop-blur-sm ${SPORT_COLORS[event.sport]}`}>
                {SPORT_EMOJIS[event.sport]} {SPORT_LABELS[event.sport]}
              </span>
              <h2 className="text-white text-xl font-bold leading-tight line-clamp-2">
                {event.title}
              </h2>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {step === 'detail' && (
            <>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <InfoItem icon={<Calendar size={14} className="text-[#D4FF00]" />} label="Дата">
                  {formatDate(event.date)}
                  {event.endDate && event.endDate !== event.date && ` — ${formatDate(event.endDate)}`}
                </InfoItem>
                <InfoItem icon={<MapPin size={14} className="text-[#D4FF00]" />} label="Место">
                  {event.city}, {event.location}
                </InfoItem>
                <InfoItem icon={<Ticket size={14} className="text-[#D4FF00]" />} label="Доступно">
                  {isFull
                    ? <span className="text-red-400 font-semibold">Нет мест</span>
                    : `${available.toLocaleString('ru')} мест`}
                </InfoItem>
                <InfoItem icon={<Users size={14} className="text-[#D4FF00]" />} label="Организатор">
                  {event.organizerName}
                </InfoItem>
              </div>

              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {event.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-white/[0.06] border border-white/[0.08] rounded-full text-xs text-white/40">
                      <Tag size={9} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-white/50 text-sm leading-relaxed mb-5">{event.description}</p>

              <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4 mb-5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/40">Продано билетов</span>
                  <span className="font-semibold text-white/70">{event.soldTickets.toLocaleString('ru')} / {event.totalTickets.toLocaleString('ru')}</span>
                </div>
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: pct >= 90 ? '#ef4444' : pct >= 70 ? '#f97316' : '#D4FF00',
                    }}
                  />
                </div>
                <p className="text-xs text-white/25 mt-1.5">{pct}% продано</p>
              </div>
            </>
          )}

          {step === 'purchase' && (
            <div className="py-2">
              <h3 className="font-bold text-white text-lg mb-1">{event.title}</h3>
              <p className="text-sm text-white/40 mb-6">{formatDate(event.date)} · {event.city}</p>

              <label className="block mb-3 text-sm font-medium text-white/60">Количество билетов</label>
              <div className="flex items-center gap-5 mb-6">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
                >
                  <Minus size={16} />
                </button>
                <span className="text-3xl font-bold text-white w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(10, q + 1, available))}
                  className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="bg-[#D4FF00]/[0.06] border border-[#D4FF00]/20 rounded-2xl p-4 mb-5">
                <div className="flex justify-between text-sm text-white/50 mb-1.5">
                  <span>{formatPrice(event.price)} × {quantity} шт.</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-[#D4FF00]/10 pt-2 mt-2">
                  <span className="text-white">Итого</span>
                  <span className="text-[#D4FF00]">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm mb-4">
                  {error}
                </div>
              )}

              <p className="text-xs text-white/25 mb-5">
                Нажимая «Оплатить», вы соглашаетесь с условиями использования. Оплата демонстрационная.
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center text-center py-8">
              <div className="w-20 h-20 rounded-full bg-[#D4FF00]/10 border border-[#D4FF00]/30 flex items-center justify-center mb-5">
                <CheckCircle size={40} className="text-[#D4FF00]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Оплата прошла!</h3>
              <p className="text-white/50 mb-1 text-sm">
                {quantity} {quantity === 1 ? 'билет' : 'билета'} на <strong className="text-white/70">{event.title}</strong>
              </p>
              <p className="text-[#D4FF00] font-bold text-xl mb-6">{formatPrice(totalPrice)}</p>
              <p className="text-sm text-white/30 mb-6">
                Билеты доступны в вашем личном кабинете
              </p>
              <div className="flex gap-3 w-full">
                <Link
                  href="/dashboard?tab=tickets"
                  className="flex-1 py-3 text-center text-sm font-semibold bg-[#D4FF00] text-black rounded-xl hover:bg-[#c8f000] transition-colors"
                  onClick={onClose}
                >
                  Мои билеты
                </Link>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 text-sm font-semibold border border-white/10 text-white/50 rounded-xl hover:bg-white/[0.06] transition-colors"
                >
                  Закрыть
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        {step === 'detail' && (
          <div className="px-6 pb-6 pt-3 border-t border-white/[0.06] flex gap-3">
            <button
              onClick={handleWishlist}
              className={`p-3 rounded-xl border transition-all ${
                wished
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : 'border-white/[0.08] text-white/30 hover:text-red-400 hover:border-red-500/20'
              }`}
            >
              <Heart size={17} fill={wished ? 'currentColor' : 'none'} />
            </button>
            {isFull ? (
              <button disabled className="flex-1 py-3 bg-white/[0.05] text-white/20 rounded-xl font-semibold text-sm cursor-not-allowed border border-white/[0.05]">
                Билеты закончились
              </button>
            ) : user ? (
              <button
                onClick={() => setStep('purchase')}
                className="flex-1 py-3 bg-[#D4FF00] text-black rounded-xl font-bold text-sm hover:bg-[#c8f000] transition-colors"
              >
                Купить билет — {formatPrice(event.price)}
              </button>
            ) : (
              <Link
                href="/auth"
                className="flex-1 py-3 text-center bg-[#D4FF00] text-black rounded-xl font-bold text-sm hover:bg-[#c8f000] transition-colors"
                onClick={onClose}
              >
                Войдите, чтобы купить
              </Link>
            )}
          </div>
        )}

        {step === 'purchase' && (
          <div className="px-6 pb-6 pt-3 border-t border-white/[0.06] flex gap-3">
            <button
              onClick={() => setStep('detail')}
              className="px-5 py-3 rounded-xl border border-white/[0.08] text-sm font-medium text-white/50 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              Назад
            </button>
            <button
              onClick={handleBuy}
              disabled={loading}
              className="flex-1 py-3 bg-[#D4FF00] text-black rounded-xl font-bold text-sm hover:bg-[#c8f000] transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Обработка...
                </span>
              ) : (
                `Оплатить ${formatPrice(totalPrice)}`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoItem({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[10px] text-white/30 font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-medium text-white/70">{children}</p>
    </div>
  )
}
