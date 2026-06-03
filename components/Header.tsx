'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getCurrentUser, logout } from '@/lib/store'
import { AuthState } from '@/lib/types'
import { Menu, X, LogOut, Plus, Ticket, LayoutDashboard, Heart } from 'lucide-react'

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
    { href: '/events', label: 'Мероприятия' },
    { href: '/dashboard?tab=tickets', label: 'Билеты' },
  ]

  const isActive = (href: string) => pathname === href.split('?')[0]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0c0c0c]/95 backdrop-blur-xl border-b border-white/[0.06]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-display text-2xl tracking-wider text-white group-hover:text-[#D4FF00] transition-colors">
              SPORT<span className="text-[#D4FF00]">MKT</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive(l.href)
                    ? 'text-white bg-white/10'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link
                  href="/dashboard?tab=wishlist"
                  className="p-2 rounded-xl text-white/40 hover:text-[#D4FF00] hover:bg-white/[0.06] transition-all"
                  title="Избранное"
                >
                  <Heart size={18} />
                </Link>
                <Link
                  href="/create-event"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-black bg-[#D4FF00] rounded-xl hover:bg-[#c8f000] transition-colors"
                >
                  <Plus size={14} />
                  Создать
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/[0.08] transition-all"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#D4FF00] flex items-center justify-center text-black text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-white/80">{user.name.split(' ')[0]}</span>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a1a] rounded-2xl shadow-2xl border border-white/[0.08] py-1 animate-fade-in">
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        <LayoutDashboard size={14} className="text-[#D4FF00]" />
                        Личный кабинет
                      </Link>
                      <Link
                        href="/dashboard?tab=tickets"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        <Ticket size={14} className="text-[#D4FF00]" />
                        Мои билеты
                      </Link>
                      <Link
                        href="/dashboard?tab=wishlist"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        <Heart size={14} className="text-[#D4FF00]" />
                        Избранное
                      </Link>
                      <div className="border-t border-white/[0.06] my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={14} />
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
                  className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
                >
                  Войти
                </Link>
                <Link
                  href="/auth?mode=register"
                  className="px-4 py-2 text-sm font-semibold text-black bg-[#D4FF00] rounded-xl hover:bg-[#c8f000] transition-colors"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/[0.06] transition-all"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#111] border-t border-white/[0.06] px-4 pb-4 animate-fade-in">
          <nav className="flex flex-col gap-1 pt-3">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium ${
                  isActive(l.href)
                    ? 'text-white bg-white/10'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="border-t border-white/[0.06] mt-2 pt-2">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white rounded-xl hover:bg-white/[0.06]"
                  >
                    <LayoutDashboard size={15} />
                    {user.name}
                  </Link>
                  <Link
                    href="/create-event"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-black bg-[#D4FF00] rounded-xl font-semibold mt-1"
                  >
                    <Plus size={15} />
                    Создать событие
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMenuOpen(false) }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl mt-1"
                  >
                    <LogOut size={15} />
                    Выйти
                  </button>
                </>
              ) : (
                <div className="flex gap-2 mt-1">
                  <Link
                    href="/auth"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 py-2.5 text-center text-sm font-medium border border-white/10 text-white/70 rounded-xl hover:bg-white/[0.06]"
                  >
                    Войти
                  </Link>
                  <Link
                    href="/auth?mode=register"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 py-2.5 text-center text-sm font-semibold bg-[#D4FF00] text-black rounded-xl"
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
