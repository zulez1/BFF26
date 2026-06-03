'use client'

import { useState, useEffect } from 'react'
import { SportEvent, SPORT_LABELS, SPORT_EMOJIS, SPORT_COLORS } from '@/lib/types'
import { formatDate, formatPrice, getAvailability } from '@/lib/utils'
import { getCurrentUser, purchaseTicket } from '@/lib/store'
import {
  X, MapPin, Calendar, Ticket, Users, Tag, Share2, CheckCircle,
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
  const user = getCurrentUser()

  useEffect(() => {
    if (event) {
      setStep('detail')
      setQuantity(1)
      setError('')
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

  const totalPrice = event.price * quantity

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[95vh] flex flex-col animate-slide-up shadow-2xl">
        {/* Header image */}
        {step !== 'success' && (
          <div className="relative h-52 flex-shrink-0 bg-gray-100">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const t = e.target as HTMLImageElement
                t.style.display = 'none'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            >
              <X size={18} />
            </button>
            <div className="absolute bottom-4 left-4 right-16">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold mb-2 ${SPORT_COLORS[event.sport]}`}>
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
              {/* Meta */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <InfoItem icon={<Calendar size={16} className="text-emerald-500" />} label="Дата">
                  {formatDate(event.date)}
                  {event.endDate && event.endDate !== event.date && ` — ${formatDate(event.endDate)}`}
                </InfoItem>
                <InfoItem icon={<MapPin size={16} className="text-emerald-500" />} label="Место">
                  {event.city}, {event.location}
                </InfoItem>
                <InfoItem icon={<Ticket size={16} className="text-emerald-500" />} label="Билеты">
                  {isFull ? <span className="text-red-500 font-semibold">Нет мест</span> : `${available.toLocaleString('ru')} доступно`}
                </InfoItem>
                <InfoItem icon={<Users size={16} className="text-emerald-500" />} label="Организатор">
                  {event.organizerName}
                </InfoItem>
              </div>

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {event.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                      <Tag size={10} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed mb-5">{event.description}</p>

              {/* Progress */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Продано билетов</span>
                  <span className="font-semibold text-gray-800">{event.soldTickets.toLocaleString('ru')} / {event.totalTickets.toLocaleString('ru')}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </>
          )}

          {step === 'purchase' && (
            <div className="py-2">
              <h3 className="font-bold text-gray-900 text-lg mb-1">{event.title}</h3>
              <p className="text-sm text-gray-500 mb-6">{formatDate(event.date)} · {event.city}</p>

              <label className="block mb-2 text-sm font-medium text-gray-700">Количество билетов</label>
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold flex items-center justify-center transition-colors"
                >
                  −
                </button>
                <span className="text-2xl font-bold text-gray-900 w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(10, q + 1, available))}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold flex items-center justify-center transition-colors"
                >
                  +
                </button>
              </div>

              <div className="bg-emerald-50 rounded-2xl p-4 mb-5">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{formatPrice(event.price)} × {quantity} шт.</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-lg">
                  <span>Итого</span>
                  <span className="text-emerald-600">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">
                  {error}
                </div>
              )}

              <p className="text-xs text-gray-400 mb-5">
                Нажимая «Оплатить», вы соглашаетесь с условиями использования платформы. Оплата демонстрационная.
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center text-center py-8">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-5">
                <CheckCircle size={44} className="text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Оплата прошла!</h3>
              <p className="text-gray-500 mb-1">
                {quantity} {quantity === 1 ? 'билет' : 'билета'} на <strong>{event.title}</strong>
              </p>
              <p className="text-emerald-600 font-bold text-lg mb-6">{formatPrice(totalPrice)}</p>
              <p className="text-sm text-gray-400 mb-6">
                Билеты доступны в вашем личном кабинете
              </p>
              <div className="flex gap-3 w-full">
                <Link
                  href="/dashboard?tab=tickets"
                  className="flex-1 py-3 text-center text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                  onClick={onClose}
                >
                  Мои билеты
                </Link>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 text-sm font-semibold border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Закрыть
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        {step === 'detail' && (
          <div className="px-6 pb-6 pt-2 border-t border-gray-100 flex gap-3">
            <button
              onClick={onClose}
              className="p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Share2 size={18} className="text-gray-500" />
            </button>
            {isFull ? (
              <button disabled className="flex-1 py-3 bg-gray-200 text-gray-400 rounded-xl font-semibold text-sm cursor-not-allowed">
                Билеты закончились
              </button>
            ) : user ? (
              <button
                onClick={() => setStep('purchase')}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors"
              >
                Купить билет — {formatPrice(event.price)}
              </button>
            ) : (
              <Link
                href="/auth"
                className="flex-1 py-3 text-center bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors"
                onClick={onClose}
              >
                Войдите, чтобы купить билет
              </Link>
            )}
          </div>
        )}

        {step === 'purchase' && (
          <div className="px-6 pb-6 pt-2 border-t border-gray-100 flex gap-3">
            <button
              onClick={() => setStep('detail')}
              className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Назад
            </button>
            <button
              onClick={handleBuy}
              disabled={loading}
              className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Обработка...' : `Оплатить ${formatPrice(totalPrice)}`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoItem({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-xs text-gray-400 font-medium">{label}</span>
      </div>
      <p className="text-sm font-medium text-gray-800">{children}</p>
    </div>
  )
}
