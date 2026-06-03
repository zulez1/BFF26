'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getCurrentUser, logout } from '@/lib/store'
import { AuthState } from '@/lib/types'
import { Menu, X, User, LogOut, Plus, Ticket, LayoutDashboard } from 'lucide-react'

export default function Header() {
  const pathname = usePathname()
  const [user, setUser] = useState<AuthState['user']>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setUser(getCurrentUser())
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handler = () => setUser(getCurrentUser())
    window.addEventListener('auth-change', handler)
    return () => window.removeEventListener('auth-change', handler)
  }, [])

  function handleLogout() {
    logout()
    setUser(null)
    window.dispatchEvent(new Event('auth-change'))
    setDropdownOpen(false)
  }

  const navLinks = [
    { href: '/', label: 'Главная' },
    { href: '/events', label: 'Мероприятия' },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl text-emerald-600 tracking-wide">
            <span className="text-2xl">⚡</span>
            <span>SportMarket</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`font-medium text-sm transition-colors ${
                  pathname === l.href
                    ? 'text-emerald-600'
                    : 'text-gray-600 hover:text-emerald-600'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/create-event"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-emerald-600 border border-emerald-600 rounded-xl hover:bg-emerald-50 transition-colors"
                >
                  <Plus size={15} />
                  Создать событие
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-800">{user.name.split(' ')[0]}</span>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-1 animate-fade-in">
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LayoutDashboard size={15} className="text-emerald-600" />
                        Личный кабинет
                      </Link>
                      <Link
                        href="/dashboard?tab=tickets"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Ticket size={15} className="text-emerald-600" />
                        Мои билеты
                      </Link>
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
                      >
                        <LogOut size={15} />
                        Выйти
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
                >
                  Войти
                </Link>
                <Link
                  href="/auth?mode=register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4 animate-fade-in">
          <nav className="flex flex-col gap-1 pt-3">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl font-medium text-sm ${
                  pathname === l.href
                    ? 'text-emerald-600 bg-emerald-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="border-t border-gray-100 mt-2 pt-2">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl"
                  >
                    <User size={15} />
                    {user.name}
                  </Link>
                  <Link
                    href="/create-event"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-emerald-600 hover:bg-emerald-50 rounded-xl"
                  >
                    <Plus size={15} />
                    Создать событие
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMenuOpen(false) }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl"
                  >
                    <LogOut size={15} />
                    Выйти
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/auth"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 py-2.5 text-center text-sm font-medium border border-emerald-600 text-emerald-600 rounded-xl"
                  >
                    Войти
                  </Link>
                  <Link
                    href="/auth?mode=register"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 py-2.5 text-center text-sm font-semibold bg-emerald-600 text-white rounded-xl"
                  >
                    Регистрация
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
