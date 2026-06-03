'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { login, register, getCurrentUser } from '@/lib/store'
import { Eye, EyeOff, User, Mail, Lock, ArrowRight } from 'lucide-react'

function AuthContent() {
  const router = useRouter()
  const params = useSearchParams()
  const [mode, setMode] = useState<'login' | 'register'>(
    params.get('mode') === 'register' ? 'register' : 'login'
  )
  const [role, setRole] = useState<'user' | 'organizer'>('user')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (getCurrentUser()) router.replace('/')
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    const result =
      mode === 'login'
        ? login(email, password)
        : register(name, email, password, role)
    setLoading(false)
    if (result.ok) {
      window.dispatchEvent(new Event('auth-change'))
      router.push('/dashboard')
    } else {
      setError(result.error || 'Ошибка')
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex">
      {/* Left — decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#080808] text-white p-12 flex-col justify-between relative overflow-hidden border-r border-white/[0.05]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(ellipse 80% 60% at 20% 80%, rgba(212,255,0,0.06) 0%, transparent 60%)',
        }} />
        <div className="relative">
          <div className="mb-16">
            <span className="font-display text-3xl tracking-wider text-white">
              SPORT<span className="text-[#D4FF00]">MKT</span>
            </span>
          </div>
          <h1 className="font-display text-6xl font-normal leading-[0.9] tracking-wide mb-8">
            СПОРТ<br />ОБЪЕДИНЯЕТ<br /><span className="text-[#D4FF00]">ЛЮДЕЙ</span>
          </h1>
          <p className="text-white/40 text-base leading-relaxed max-w-xs">
            Присоединяйтесь к тысячам любителей спорта, которые находят и покупают билеты на любимые мероприятия.
          </p>
        </div>
        <div className="relative grid grid-cols-3 gap-3">
          {[
            { num: '20+', label: 'Мероприятий' },
            { num: '10', label: 'Городов' },
            { num: '30K', label: 'Билетов' },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4 text-center">
              <p className="font-display text-3xl text-[#D4FF00] mb-1">{s.num}</p>
              <p className="text-white/30 text-xs uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#0c0c0c]">
        <div className="w-full max-w-md">
          {/* Mode tabs */}
          <div className="flex bg-white/[0.04] border border-white/[0.06] rounded-2xl p-1 mb-8">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                  mode === m
                    ? 'bg-[#D4FF00] text-black'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                {m === 'login' ? 'Войти' : 'Регистрация'}
              </button>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">
            {mode === 'login' ? 'Добро пожаловать' : 'Создайте аккаунт'}
          </h2>
          <p className="text-white/30 text-sm mb-8">
            {mode === 'login' ? 'Войдите в свой аккаунт' : 'Быстрая регистрация за 30 секунд'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <DarkField label="Ваше имя" icon={<User size={15} />}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Иван Иванов"
                  required
                  className={inputCls}
                />
              </DarkField>
            )}

            <DarkField label="Email" icon={<Mail size={15} />}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ivan@example.ru"
                required
                className={inputCls}
              />
            </DarkField>

            <div>
              <label className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">Пароль</label>
              <div className="flex items-center bg-white/[0.05] border border-white/[0.07] rounded-xl focus-within:border-[#D4FF00]/30 transition-colors">
                <div className="pl-3.5 text-white/25"><Lock size={15} /></div>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  required
                  minLength={6}
                  className="flex-1 px-3 py-3 text-sm text-white placeholder-white/20 outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="pr-3.5 text-white/25 hover:text-white/50 transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">Тип аккаунта</label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: 'user', label: 'Участник', emoji: '🎫', desc: 'Покупаю билеты' },
                    { value: 'organizer', label: 'Организатор', emoji: '📋', desc: 'Создаю события' },
                  ] as const).map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`p-3.5 text-left rounded-xl border-2 transition-all ${
                        role === r.value
                          ? 'border-[#D4FF00]/50 bg-[#D4FF00]/[0.06]'
                          : 'border-white/[0.06] bg-white/[0.03] hover:border-white/10'
                      }`}
                    >
                      <p className="text-lg mb-1">{r.emoji}</p>
                      <p className="font-semibold text-white text-sm">{r.label}</p>
                      <p className="text-xs text-white/30 mt-0.5">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#D4FF00] text-black font-bold rounded-xl hover:bg-[#c8f000] transition-colors disabled:opacity-50 text-sm mt-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Войти' : 'Создать аккаунт'}
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-white/20 mt-6">
            Нажимая кнопку, вы соглашаетесь с{' '}
            <span className="text-[#D4FF00]/50 cursor-pointer hover:text-[#D4FF00] transition-colors">условиями использования</span>
          </p>

          <div className="mt-6 p-4 bg-[#D4FF00]/[0.04] border border-[#D4FF00]/10 rounded-xl">
            <p className="text-xs text-[#D4FF00]/60 font-medium mb-1">💡 Демо-режим</p>
            <p className="text-xs text-white/25">
              Данные хранятся в браузере. Создайте любой аккаунт для тестирования.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const inputCls = 'w-full px-3 py-3 text-sm text-white placeholder-white/20 outline-none bg-transparent'

function DarkField({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">{label}</label>
      <div className="flex items-center bg-white/[0.05] border border-white/[0.07] rounded-xl focus-within:border-[#D4FF00]/30 transition-colors">
        <div className="pl-3.5 text-white/25">{icon}</div>
        {children}
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthContent />
    </Suspense>
  )
}
