import { Upload, Cog, Code, Rocket } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Yükle',
    description: 'FBX, OBJ, STEP veya desteklenen herhangi bir formatı sürükle-bırak ile yükleyin.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Cog,
    title: 'Dönüştür',
    description: 'Sunucularımız otomatik olarak optimize edilmiş GLB formatına dönüştürür.',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    icon: Code,
    title: 'Özelleştir',
    description: 'Viewer Designer ile görünümü, ışıkları, malzemeleri ve AR ayarlarını düzenleyin.',
    color: 'from-violet-500 to-purple-500'
  },
  {
    icon: Rocket,
    title: 'Yayınla',
    description: 'Embed kodunu kopyalayın, sitenize yapıştırın. Hepsi bu kadar!',
    color: 'from-orange-500 to-red-500'
  }
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Nasıl Çalışır?
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            4 basit adımda 3D modellerinizi web'e taşıyın
          </p>
        </div>

        <div className="relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-emerald-200 via-violet-200 to-orange-200 transform -translate-y-1/2 hidden lg:block"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 relative z-10">
                  <div className={`inline-flex p-4 bg-gradient-to-br ${step.color} rounded-2xl mb-6 shadow-lg relative`}>
                    <step.icon className="w-8 h-8 text-white" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-slate-900 shadow-md">
                      {index + 1}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    {step.title}
                  </h3>

                  <p className="text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                    <div className="w-8 h-8 border-t-2 border-r-2 border-slate-300 transform rotate-45"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
