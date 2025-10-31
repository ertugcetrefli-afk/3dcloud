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
    setMobileMenuOpen(false);
  };

  const handleSignUp = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
    setMobileMenuOpen(false);
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl">
                <Box className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-white">3DCloud</span>
            </a>

            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <a href="#features" className="text-slate-300 hover:text-white transition-colors font-medium text-sm lg:text-base">
                Özellikler
              </a>
              <a href="#how-it-works" className="text-slate-300 hover:text-white transition-colors font-medium text-sm lg:text-base">
                Nasıl Çalışır
              </a>
              <a href="#pricing" className="text-slate-300 hover:text-white transition-colors font-medium text-sm lg:text-base">
                Fiyatlandırma
              </a>
              <a href="#faq" className="text-slate-300 hover:text-white transition-colors font-medium text-sm lg:text-base">
                SSS
              </a>
              <a href="#" className="text-slate-300 hover:text-white transition-colors font-medium text-sm lg:text-base">
                Dokümantasyon
              </a>
            </div>

            <div className="hidden md:flex items-center gap-3 lg:gap-4">
              {user ? (
                <>
                  <a href="/dashboard" className="flex items-center gap-2 px-3 lg:px-4 py-2 text-slate-300 hover:text-white transition-colors font-medium text-sm lg:text-base">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </a>
                  <div className="flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 bg-slate-800 rounded-lg">
                    <div className="text-right">
                      <div className="text-xs lg:text-sm font-medium text-white">{profile?.full_name}</div>
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
                    className="px-4 lg:px-6 py-2 text-slate-300 hover:text-white transition-colors font-medium text-sm lg:text-base"
                  >
                    Giriş Yap
                  </button>
                  <button
                    onClick={handleSignUp}
                    className="group px-4 lg:px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-105 text-sm lg:text-base"
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
                <a href="#features" className="text-slate-300 hover:text-white transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Özellikler
                </a>
                <a href="#how-it-works" className="text-slate-300 hover:text-white transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Nasıl Çalışır
                </a>
                <a href="#pricing" className="text-slate-300 hover:text-white transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Fiyatlandırma
                </a>
                <a href="#faq" className="text-slate-300 hover:text-white transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>
                  SSS
                </a>
                <a href="#" className="text-slate-300 hover:text-white transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Dokümantasyon
                </a>
                <div className="flex flex-col gap-3 pt-4 border-t border-slate-800">
                  {user ? (
                    <>
                      <a href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-slate-300 hover:text-white transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </a>
                      <div className="px-4 py-3 bg-slate-800 rounded-lg">
                        <div className="text-sm font-medium text-white">{profile?.full_name}</div>
                        <div className="text-xs text-emerald-400 mt-1">{profile?.plan}</div>
                      </div>
                      <button
                        onClick={() => {
                          signOut();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 text-red-400 hover:text-red-300 transition-colors font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Çıkış Yap
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleSignIn}
                        className="px-4 py-2.5 text-slate-300 hover:text-white transition-colors font-medium text-left"
                      >
                        Giriş Yap
                      </button>
                      <button
                        onClick={handleSignUp}
                        className="group px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300"
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
      </header>

      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={handleCloseAuthModal}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      )}
    </>
  );
}
