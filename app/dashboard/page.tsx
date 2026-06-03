'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCurrentUser, getTicketsByUser, getEvents, logout, updateProfile, deleteEvent } from '@/lib/store'
import { AuthState, SportEvent, Ticket } from '@/lib/types'
import { formatDate, formatPrice } from '@/lib/utils'
import EventModal from '@/components/EventModal'
import {
  User, Ticket as TicketIcon, Calendar, LogOut, Edit2, Check, X,
  Plus, Trash2, MapPin, Clock,
} from 'lucide-react'
import Link from 'next/link'

type Tab = 'profile' | 'tickets' | 'events'

function DashboardContent() {
  const router = useRouter()
  const params = useSearchParams()
  const [user, setUser] = useState<AuthState['user']>(null)
  const [tab, setTab] = useState<Tab>((params.get('tab') as Tab) || 'profile')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [events, setEvents] = useState<SportEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<SportEvent | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState('')

  useEffect(() => {
    const u = getCurrentUser()
    if (!u) { router.replace('/auth'); return }
    setUser(u)
    setNewName(u.name)
    setTickets(getTicketsByUser(u.id))
    const allEvents = getEvents()
    setEvents(allEvents.filter((e) => e.organizerId === u.id))
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

  const ticketsWithEvents = tickets.map((t) => ({
    ticket: t,
    event: getEvents().find((e) => e.id === t.eventId),
  }))

  if (!user) return null

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'profile', label: 'Профиль', icon: <User size={17} /> },
    { id: 'tickets', label: 'Мои билеты', icon: <TicketIcon size={17} />, count: tickets.length },
    { id: 'events', label: 'Мои события', icon: <Calendar size={17} />, count: events.length },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Личный кабинет</h1>
          <p className="text-gray-500 text-sm mt-1">Добро пожаловать, {user.name}!</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-4 py-2 text-sm text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
        >
          <LogOut size={15} />
          Выйти
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.icon}
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <div className="grid gap-5">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="border border-emerald-400 rounded-lg px-3 py-1.5 text-sm font-semibold outline-none"
                        autoFocus
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName() }}
                      />
                      <button onClick={handleSaveName} className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200">
                        <Check size={15} />
                      </button>
                      <button onClick={() => { setEditingName(false); setNewName(user.name) }} className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200">
                        <X size={15} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                      <button onClick={() => setEditingName(true)} className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50">
                        <Edit2 size={14} />
                      </button>
                    </>
                  )}
                </div>
                <p className="text-gray-500 text-sm">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    user.role === 'organizer' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {user.role === 'organizer' ? '📋 Организатор' : '🎫 Участник'}
                  </span>
                  <span className="text-xs text-gray-400">
                    с {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Билетов куплено', value: tickets.length, icon: '🎫' },
              { label: 'Событий создано', value: events.length, icon: '📅' },
              { label: 'Потрачено', value: formatPrice(tickets.reduce((a, t) => a + t.totalPrice, 0)), icon: '💳' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
                <p className="text-2xl mb-1">{s.icon}</p>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {user.role === 'organizer' && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Создайте новое мероприятие</h3>
                <p className="text-sm text-gray-500">Разместите событие и продавайте билеты</p>
              </div>
              <Link
                href="/create-event"
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
              >
                <Plus size={16} />
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
              <p className="text-xl font-semibold text-gray-700 mb-2">Билетов пока нет</p>
              <p className="text-gray-400 mb-6 text-sm">Найдите мероприятие и купите билет</p>
              <Link href="/events" className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors">
                Каталог мероприятий
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {ticketsWithEvents.map(({ ticket, event }) => (
                <div key={ticket.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-emerald-300 transition-colors">
                  <div className="flex gap-4 p-4">
                    {event && (
                      <div className="w-24 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">
                            {event?.title || 'Событие удалено'}
                          </h3>
                          {event && (
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar size={11} />
                                {formatDate(event.date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin size={11} />
                                {event.city}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                          ticket.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {ticket.status === 'active' ? '✓ Активен' : ticket.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-dashed border-gray-200 px-4 py-3 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{ticket.quantity} {ticket.quantity === 1 ? 'билет' : 'билета'}</span>
                      <span className="font-bold text-emerald-600">{formatPrice(ticket.totalPrice)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={11} />
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
            <p className="text-gray-500 text-sm">Созданные вами мероприятия</p>
            <Link
              href="/create-event"
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
            >
              <Plus size={15} />
              Создать
            </Link>
          </div>
          {events.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-5xl mb-4">📅</p>
              <p className="text-xl font-semibold text-gray-700 mb-2">Нет созданных событий</p>
              <p className="text-gray-400 mb-6 text-sm">Создайте первое мероприятие и начните продавать билеты</p>
              <Link href="/create-event" className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors">
                Создать мероприятие
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {events.map((event) => (
                <div key={event.id} className="bg-white rounded-2xl border border-gray-200 p-4 flex gap-4 hover:border-emerald-300 transition-colors">
                  <div className="w-24 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3
                      className="font-bold text-gray-900 text-sm mb-1 cursor-pointer hover:text-emerald-600 transition-colors"
                      onClick={() => setSelectedEvent(event)}
                    >
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                      <span>{formatDate(event.date)}</span>
                      <span>{event.city}</span>
                      <span>{formatPrice(event.price)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.round((event.soldTickets / event.totalTickets) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {event.soldTickets}/{event.totalTickets} билетов
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
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
