import { Zap, Shield, Code2, Smartphone, Layers, Gauge } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Hızlı Dönüşüm',
    description: 'Blender ve Assimp tabanlı pipeline ile saniyeler içinde optimize edilmiş GLB üretimi.',
    color: 'from-yellow-400 to-orange-500'
  },
  {
    icon: Layers,
    title: '15+ Format Desteği',
    description: 'FBX, OBJ, STL, STEP, DAE, GLTF, BLEND ve daha fazla formatı destekliyoruz.',
    color: 'from-emerald-400 to-cyan-500'
  },
  {
    icon: Gauge,
    title: 'Otomatik Optimizasyon',
    description: 'Draco sıkıştırma, meshopt ve texture optimizasyonu ile %80\'e kadar boyut azaltma.',
    color: 'from-blue-400 to-cyan-500'
  },
  {
    icon: Smartphone,
    title: 'AR Hazır',
    description: 'WebXR, AR Quick Look ve Scene Viewer desteği ile mobil AR deneyimi.',
    color: 'from-pink-400 to-rose-500'
  },
  {
    icon: Code2,
    title: 'Embed Kodu',
    description: 'Tek satır kodla sitenize entegre edin. Özelleştirilebilir viewer tasarımı.',
    color: 'from-violet-400 to-purple-500'
  },
  {
    icon: Shield,
    title: 'Güvenli & Hızlı CDN',
    description: 'S3/Wasabi + Cloudflare CDN ile dünya çapında hızlı ve güvenli dağıtım.',
    color: 'from-teal-400 to-emerald-500'
  }
];

export default function Features() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Güçlü Özellikler
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Profesyonel 3D web deneyimi için ihtiyacınız olan her şey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`inline-flex p-3 bg-gradient-to-br ${feature.color} rounded-xl mb-5 shadow-lg`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {feature.title}
              </h3>

              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>

              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
