import { Box, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const { user, profile, signOut } = useAuth();

  const handleSignIn = () => {
    setAuthMode('signin');
    setShowAuthModal(true);
  };

  const handleSignUp = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl">
              <Box className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">3DCloud</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-300 hover:text-white transition-colors font-medium">
              Özellikler
            </a>
            <a href="#how-it-works" className="text-slate-300 hover:text-white transition-colors font-medium">
              Nasıl Çalışır
            </a>
            <a href="#pricing" className="text-slate-300 hover:text-white transition-colors font-medium">
              Fiyatlandırma
            </a>
            <a href="#faq" className="text-slate-300 hover:text-white transition-colors font-medium">
              SSS
            </a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors font-medium">
              Dokümantasyon
            </a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <a href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white transition-colors font-medium">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </a>
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-800 rounded-lg">
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">{profile?.full_name}</div>
                    <div className="text-xs text-emerald-400">{profile?.plan}</div>
                  </div>
                  <button
                    onClick={signOut}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    title="Çıkış Yap"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={handleSignIn}
                  className="px-6 py-2 text-slate-300 hover:text-white transition-colors font-medium"
                >
                  Giriş Yap
                </button>
                <button
                  onClick={handleSignUp}
                  className="group px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105"
                >
                  Başla
                  <span className="inline-block ml-1 group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-slate-800 pt-4">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-slate-300 hover:text-white transition-colors font-medium">
                Özellikler
              </a>
              <a href="#how-it-works" className="text-slate-300 hover:text-white transition-colors font-medium">
                Nasıl Çalışır
              </a>
              <a href="#pricing" className="text-slate-300 hover:text-white transition-colors font-medium">
                Fiyatlandırma
              </a>
              <a href="#faq" className="text-slate-300 hover:text-white transition-colors font-medium">
                SSS
              </a>
              <a href="#" className="text-slate-300 hover:text-white transition-colors font-medium">
                Dokümantasyon
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-slate-800">
                {user ? (
                  <>
                    <a href="/dashboard" className="flex items-center gap-2 px-6 py-2 text-slate-300 hover:text-white transition-colors font-medium">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </a>
                    <div className="px-6 py-3 bg-slate-800 rounded-lg">
                      <div className="text-sm font-medium text-white">{profile?.full_name}</div>
                      <div className="text-xs text-emerald-400">{profile?.plan}</div>
                    </div>
                    <button
                      onClick={signOut}
                      className="flex items-center gap-2 px-6 py-2 text-red-400 hover:text-red-300 transition-colors font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Çıkış Yap
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSignIn}
                      className="px-6 py-2 text-slate-300 hover:text-white transition-colors font-medium text-left"
                    >
                      Giriş Yap
                    </button>
                    <button
                      onClick={handleSignUp}
                      className="group px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105"
                    >
                      Başla
                      <span className="inline-block ml-1 group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      )}
    </header>
  );
}
