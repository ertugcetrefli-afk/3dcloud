import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'Hangi 3D formatları destekleniyor?',
    answer: 'FBX, OBJ, STL, STEP, DAE, GLTF, GLB, BLEND, 3DS, COLLADA ve daha fazlası olmak üzere 15\'ten fazla popüler 3D formatı destekliyoruz. Tüm formatlar otomatik olarak optimize edilmiş GLB formatına dönüştürülür.'
  },
  {
    question: 'Dönüşüm süreci ne kadar sürüyor?',
    answer: 'Dosya boyutuna ve karmaşıklığına bağlı olarak çoğu dönüşüm 30 saniye ile 3 dakika arasında tamamlanır. Büyük ve karmaşık modeller daha fazla zaman alabilir. Pro plan kullanıcıları öncelikli işleme hakkına sahiptir.'
  },
  {
    question: 'Dosya boyutu limitleri nedir?',
    answer: 'Free plan ile 50 MB, Starter plan ile 300 MB, Pro plan ile 1 GB\'a kadar dosya yükleyebilirsiniz. Daha büyük dosyalar için kurumsal çözümlerimiz mevcuttur.'
  },
  {
    question: 'AR (Artırılmış Gerçeklik) nasıl çalışıyor?',
    answer: 'Starter ve Pro planlarda, modelleriniz otomatik olarak AR uyumlu hale getirilir. iOS\'ta AR Quick Look, Android\'de Scene Viewer ve modern tarayıcılarda WebXR desteği sunarız. Kullanıcılar tek dokunuşla modelinizi kendi ortamlarında görüntüleyebilir.'
  },
  {
    question: 'Embed kodu nasıl kullanılır?',
    answer: 'Her dönüşümden sonra size özel bir embed kodu verilir. Bu kodu HTML sayfanıza kopyala-yapıştır yapmanız yeterli. Viewer Designer aracımızla görünümü, ışıkları, renkleri özelleştirebilir ve hotspot\'lar ekleyebilirsiniz.'
  },
  {
    question: 'Verilerim güvende mi?',
    answer: 'Evet. Tüm dosyalarınız şifrelenmiş bağlantı üzerinden yüklenir ve AWS S3/Wasabi\'de güvenli şekilde saklanır. Cloudflare CDN ile dünya çapında hızlı erişim sağlanır. İstediğiniz zaman dosyalarınızı silebilirsiniz.'
  },
  {
    question: 'API erişimi var mı?',
    answer: 'Pro plan ile REST API erişimi sağlanır. Otomatik dönüşümler, toplu işlemler ve kendi uygulamanıza entegrasyon için API dokümantasyonumuzu kullanabilirsiniz.'
  },
  {
    question: 'İptal ve iade politikası nedir?',
    answer: 'Tüm planlar 14 gün para iade garantisi ile gelir. Aboneliğinizi istediğiniz zaman iptal edebilirsiniz. İptal sonrası mevcut dönem sonuna kadar hizmetiniz devam eder.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Sıkça Sorulan Sorular
          </h2>
          <p className="text-xl text-slate-600">
            Merak ettiklerinizin yanıtları burada
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-8 py-6 flex items-center justify-between text-left bg-white hover:bg-slate-50 transition-colors"
              >
                <span className="text-lg font-semibold text-slate-900 pr-8">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-6 h-6 text-slate-400 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-8 pb-6 text-slate-600 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-600 mb-4">
            Başka sorularınız mı var?
          </p>
          <button className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
            Bize ulaşın →
          </button>
        </div>
      </div>
    </section>
  );
}
