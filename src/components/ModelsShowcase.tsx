import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowRight } from 'lucide-react';

type ShowcaseModel = {
  id: string;
  title: string;
  description: string | null;
  auto_rotate: boolean;
  rotation_speed: number;
  glb_url?: string;
  poster_url?: string;
};

export default function ModelsShowcase() {
  const [models, setModels] = useState<ShowcaseModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const { data, error } = await supabase
        .from('showcase_models')
        .select(`
          *,
          projects (
            glb_url,
            poster_url
          )
        `)
        .eq('is_active', true)
        .order('position', { ascending: true })
        .limit(3);

      if (error) throw error;

      setModels(data?.map(m => ({
        ...m,
        glb_url: m.projects?.glb_url,
        poster_url: m.projects?.poster_url
      })) || []);
    } catch (error) {
      console.error('Error loading showcase models:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (models.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            3D Deneyimi Yaşayın
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Platformumuzda oluşturulan interaktif 3D modelleri keşfedin
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {models.map((model) => (
            <div
              key={model.id}
              className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300 group"
            >
              <div className="aspect-square bg-slate-800 relative overflow-hidden">
                {model.glb_url && (
                  <model-viewer
                    src={model.glb_url}
                    poster={model.poster_url || undefined}
                    camera-controls
                    auto-rotate={model.auto_rotate}
                    auto-rotate-delay="0"
                    rotation-per-second={`${model.rotation_speed}deg`}
                    shadow-intensity="0.5"
                    exposure="1"
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#1e293b'
                    }}
                    environment-image="neutral"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                  {model.title}
                </h3>
                {model.description && (
                  <p className="text-slate-400 mb-4 line-clamp-2">
                    {model.description}
                  </p>
                )}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-sm text-slate-500">
                      {model.auto_rotate ? '360° Döner' : 'İnteraktif'}
                    </span>
                  </div>
                  <button className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors text-sm font-medium">
                    Detaylı İncele
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/20"
          >
            Kendi 3D Modelinizi Oluşturun
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
