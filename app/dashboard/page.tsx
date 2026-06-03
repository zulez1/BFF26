'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCurrentUser, getTicketsByUser, getEvents, logout, updateProfile, deleteEvent, getWishlist } from '@/lib/store'
import { AuthState, SportEvent, Ticket } from '@/lib/types'
import { formatDate, formatPrice } from '@/lib/utils'
import EventModal from '@/components/EventModal'
import EventCard from '@/components/EventCard'
import {
  User, Ticket as TicketIcon, Calendar, LogOut, Edit2, Check, X,
  Plus, Trash2, MapPin, Clock, Heart, TrendingUp, Zap,
} from 'lucide-react'
import Link from 'next/link'

type Tab = 'profile' | 'tickets' | 'events' | 'wishlist'

function DashboardContent() {
  const router = useRouter()
  const params = useSearchParams()
  const [user, setUser] = useState<AuthState['user']>(null)
  const [tab, setTab] = useState<Tab>((params.get('tab') as Tab) || 'profile')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [events, setEvents] = useState<SportEvent[]>([])
  const [wishlistEvents, setWishlistEvents] = useState<SportEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<SportEvent | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState('')

  function loadData() {
    const u = getCurrentUser()
    if (!u) { router.replace('/auth'); return }
    setUser(u)
    setNewName(u.name)
    const allTickets = getTicketsByUser(u.id)
    setTickets(allTickets)
    const allEvents = getEvents()
    setEvents(allEvents.filter((e) => e.organizerId === u.id))
    const wishlist = getWishlist()
    setWishlistEvents(allEvents.filter((e) => wishlist.includes(e.id)))
  }

  useEffect(() => {
    loadData()
  }, [router])

  function handleLogout() {
    logout()
    window.dispatchEvent(new Event('auth-change'))
    router.push('/')
  }

  function handleSaveName() {
    if (!user || !newName.trim()) return
    updateProfile(user.id, { name: newName.trim() })
    const updated = getCurrentUser()
    setUser(updated)
    window.dispatchEvent(new Event('auth-change'))
    setEditingName(false)
  }

  function handleDeleteEvent(id: string) {
    if (!confirm('Удалить это мероприятие?')) return
    deleteEvent(id)
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  const allEvents = getEvents()
  const ticketsWithEvents = tickets.map((t) => ({
    ticket: t,
    event: allEvents.find((e) => e.id === t.eventId),
  }))

  if (!user) return null

  const totalSpent = tickets.reduce((a, t) => a + t.totalPrice, 0)

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'profile', label: 'Профиль', icon: <User size={15} /> },
    { id: 'tickets', label: 'Билеты', icon: <TicketIcon size={15} />, count: tickets.length },
    { id: 'events', label: 'События', icon: <Calendar size={15} />, count: events.length },
    { id: 'wishlist', label: 'Избранное', icon: <Heart size={15} />, count: wishlistEvents.length },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-white tracking-wide">КАБИНЕТ</h1>
          <p className="text-white/30 text-sm mt-1">Привет, {user.name.split(' ')[0]}!</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-4 py-2 text-sm text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/10 transition-all"
        >
          <LogOut size={14} />
          Выйти
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/[0.04] border border-white/[0.06] rounded-2xl p-1 mb-8 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              tab === t.id
                ? 'bg-[#D4FF00] text-black'
                : 'text-white/40 hover:text-white'
            }`}
          >
            {t.icon}
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                tab === t.id ? 'bg-black/20 text-black' : 'bg-white/[0.08] text-white/40'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <div className="space-y-4">
          {/* User card */}
          <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-6">
            <div className="flex items-start gap-5">
              <div className="w-18 h-18 w-[72px] h-[72px] rounded-2xl bg-[#D4FF00]/10 border border-[#D4FF00]/20 flex items-center justify-center text-[#D4FF00] text-2xl font-bold font-display flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="bg-white/[0.06] border border-[#D4FF00]/30 rounded-xl px-3 py-1.5 text-sm font-semibold text-white outline-none"
                        autoFocus
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName() }}
                      />
                      <button onClick={handleSaveName} className="p-1.5 bg-[#D4FF00]/10 text-[#D4FF00] rounded-lg hover:bg-[#D4FF00]/20">
                        <Check size={14} />
                      </button>
                      <button onClick={() => { setEditingName(false); setNewName(user.name) }} className="p-1.5 bg-white/[0.06] text-white/40 rounded-lg hover:bg-white/10">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold text-white">{user.name}</h2>
                      <button
                        onClick={() => setEditingName(true)}
                        className="p-1.5 text-white/20 hover:text-[#D4FF00] rounded-lg hover:bg-[#D4FF00]/10 transition-all"
                      >
                        <Edit2 size={13} />
                      </button>
                    </>
                  )}
                </div>
                <p className="text-white/30 text-sm">{user.email}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                    user.role === 'organizer'
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                      : 'bg-[#D4FF00]/10 text-[#D4FF00] border-[#D4FF00]/20'
                  }`}>
                    {user.role === 'organizer' ? '📋 Организатор' : '🎫 Участник'}
                  </span>
                  <span className="text-xs text-white/20">с {formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Билетов куплено', value: tickets.length, icon: <TicketIcon size={18} />, color: 'text-[#D4FF00]' },
              { label: 'Событий создано', value: events.length, icon: <Calendar size={18} />, color: 'text-purple-400' },
              { label: 'Потрачено', value: formatPrice(totalSpent), icon: <TrendingUp size={18} />, color: 'text-blue-400' },
            ].map((s) => (
              <div key={s.label} className="bg-[#141414] border border-white/[0.07] rounded-2xl p-4 text-center">
                <div className={`flex justify-center mb-2 ${s.color}`}>{s.icon}</div>
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-white/25 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {user.role === 'organizer' && (
            <div className="bg-[#141414] border border-[#D4FF00]/15 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
                  <Zap size={16} className="text-[#D4FF00]" />
                  Создайте новое мероприятие
                </h3>
                <p className="text-sm text-white/30">Разместите событие и начните продавать билеты</p>
              </div>
              <Link
                href="/create-event"
                className="flex items-center gap-2 px-4 py-2.5 bg-[#D4FF00] text-black text-sm font-bold rounded-xl hover:bg-[#c8f000] transition-colors"
              >
                <Plus size={15} />
                Создать
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tickets tab */}
      {tab === 'tickets' && (
        <div>
          {ticketsWithEvents.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-5xl mb-4">🎫</p>
              <p className="text-xl font-semibold text-white/50 mb-2">Билетов пока нет</p>
              <p className="text-white/25 mb-6 text-sm">Найдите мероприятие и купите билет</p>
              <Link href="/events" className="px-6 py-3 bg-[#D4FF00] text-black rounded-xl font-bold text-sm hover:bg-[#c8f000] transition-colors">
                Каталог мероприятий
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {ticketsWithEvents.map(({ ticket, event }) => (
                <div key={ticket.id} className="bg-[#141414] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-[#D4FF00]/20 transition-colors">
                  <div className="flex gap-4 p-4">
                    {event ? (
                      <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#1a1a1a]">
                        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover opacity-80" />
                      </div>
                    ) : (
                      <div className="w-20 h-16 rounded-xl bg-[#1a1a1a] flex-shrink-0 flex items-center justify-center text-white/20">
                        <TicketIcon size={20} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-bold text-white text-sm leading-tight mb-1 truncate">
                            {event?.title || 'Событие удалено'}
                          </h3>
                          {event && (
                            <div className="flex items-center gap-3 text-xs text-white/30">
                              <span className="flex items-center gap-1">
                                <Calendar size={10} />
                                {formatDate(event.date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin size={10} />
                                {event.city}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 border ${
                          ticket.status === 'active'
                            ? 'bg-[#D4FF00]/10 text-[#D4FF00] border-[#D4FF00]/20'
                            : 'bg-white/[0.04] text-white/30 border-white/[0.06]'
                        }`}>
                          {ticket.status === 'active' ? '✓ Активен' : ticket.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ticket tear line */}
                  <div className="relative mx-4 border-t border-dashed border-white/[0.06]">
                    <div className="absolute -left-4 -top-2 w-4 h-4 rounded-full bg-[#0c0c0c]" />
                    <div className="absolute -right-4 -top-2 w-4 h-4 rounded-full bg-[#0c0c0c]" />
                  </div>

                  <div className="px-4 py-3 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-white/40">{ticket.quantity} {ticket.quantity === 1 ? 'билет' : 'билета'}</span>
                      <span className="font-bold text-[#D4FF00]">{formatPrice(ticket.totalPrice)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-white/20">
                      <Clock size={10} />
                      {formatDate(ticket.purchasedAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My events tab */}
      {tab === 'events' && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <p className="text-white/30 text-sm">Созданные вами мероприятия</p>
            <Link
              href="/create-event"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#D4FF00] text-black text-sm font-bold rounded-xl hover:bg-[#c8f000] transition-colors"
            >
              <Plus size={14} />
              Создать
            </Link>
          </div>
          {events.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-5xl mb-4">📅</p>
              <p className="text-xl font-semibold text-white/50 mb-2">Нет созданных событий</p>
              <p className="text-white/25 mb-6 text-sm">Создайте первое мероприятие</p>
              <Link href="/create-event" className="px-6 py-3 bg-[#D4FF00] text-black rounded-xl font-bold text-sm hover:bg-[#c8f000] transition-colors">
                Создать мероприятие
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="bg-[#141414] border border-white/[0.07] rounded-2xl p-4 flex gap-4 hover:border-[#D4FF00]/15 transition-colors">
                  <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#1a1a1a]">
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover opacity-80" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-bold text-white text-sm mb-1 cursor-pointer hover:text-[#D4FF00] transition-colors truncate"
                      onClick={() => setSelectedEvent(event)}
                    >
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-white/30 mb-2">
                      <span>{formatDate(event.date)}</span>
                      <span>{event.city}</span>
                      <span>{formatPrice(event.price)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-white/[0.05] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#D4FF00] rounded-full"
                          style={{ width: `${Math.round((event.soldTickets / event.totalTickets) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-white/25 flex-shrink-0">
                        {event.soldTickets}/{event.totalTickets}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all self-start"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Wishlist tab */}
      {tab === 'wishlist' && (
        <div>
          {wishlistEvents.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-5xl mb-4">❤️</p>
              <p className="text-xl font-semibold text-white/50 mb-2">Избранное пусто</p>
              <p className="text-white/25 mb-6 text-sm">Добавляйте мероприятия в избранное, нажимая ♡ на карточке</p>
              <Link href="/events" className="px-6 py-3 bg-[#D4FF00] text-black rounded-xl font-bold text-sm hover:bg-[#c8f000] transition-colors">
                Смотреть мероприятия
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {wishlistEvents.map((event) => (
                <EventCard key={event.id} event={event} onClick={setSelectedEvent} />
              ))}
            </div>
          )}
        </div>
      )}

      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onPurchased={loadData}
      />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  )
}
