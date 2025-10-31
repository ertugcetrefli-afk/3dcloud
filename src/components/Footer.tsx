import { Box, Github, Twitter, Linkedin, Mail } from 'lucide-react';

const footerLinks = {
  product: {
    title: 'Ürün',
    links: [
      { name: 'Özellikler', href: '#features' },
      { name: 'Fiyatlandırma', href: '#pricing' },
      { name: 'API Dokümantasyonu', href: '#' },
      { name: 'Viewer Designer', href: '#' }
    ]
  },
  company: {
    title: 'Şirket',
    links: [
      { name: 'Hakkımızda', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Kariyer', href: '#' },
      { name: 'İletişim', href: '#' }
    ]
  },
  resources: {
    title: 'Kaynaklar',
    links: [
      { name: 'Dokümantasyon', href: '#' },
      { name: 'Destek', href: '#' },
      { name: 'Topluluk', href: '#' },
      { name: 'Durum', href: '#' }
    ]
  },
  legal: {
    title: 'Yasal',
    links: [
      { name: 'Gizlilik', href: '#' },
      { name: 'Kullanım Şartları', href: '#' },
      { name: 'Çerezler', href: '#' },
      { name: 'KVKK', href: '#' }
    ]
  }
};

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2">
            <a href="/" className="flex items-center gap-2 mb-4 w-fit">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl">
                <Box className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">3DCloud</span>
            </a>
            <p className="text-slate-400 mb-6 max-w-sm leading-relaxed">
              3D modellerinizi web'e taşımanın en hızlı ve kolay yolu.
              Profesyonel dönüşüm, optimize etme ve embed çözümleri.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              © 2025 3DCloud. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                Gizlilik Politikası
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                Kullanım Şartları
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                Çerezler
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
