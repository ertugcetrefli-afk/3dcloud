import { Box } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="text-center">
        <Box className="w-24 h-24 text-slate-700 mx-auto mb-6" />
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-slate-400 mb-8">Sayfa bulunamadı</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-semibold text-white hover:shadow-xl hover:shadow-emerald-500/50 transition-all duration-300"
        >
          Ana Sayfaya Dön
        </a>
      </div>
    </div>
  );
}
