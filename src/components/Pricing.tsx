import { Check, Zap } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AuthModal from './AuthModal';

const plans = [
  {
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    description: 'Başlamak için ideal',
    features: [
      'Aylık 5 dönüşüm',
      'Dosya başı 50 MB',
      'Temel formatlar (FBX, OBJ, GLTF)',
      'Watermark ile embed',
      'Topluluk desteği'
    ],
    cta: 'Ücretsiz Başla',
    popular: false,
    gradient: 'from-slate-500 to-slate-600'
  },
  {
    name: 'Pro',
    price: { monthly: 49, yearly: 490 },
    description: 'Profesyoneller için',
    features: [
      'Aylık 50 dönüşüm',
      'Dosya başı 200 MB',
      'Tüm formatlar',
      'Watermark yok',
      'Özel materyal yükleme',
      'AR desteği (Quick Look, Scene Viewer, WebXR)',
      'Sınırsız hotspot',
      'Viewer özelleştirme',
      'E-posta desteği'
    ],
    cta: 'Pro Ol',
    popular: true,
    gradient: 'from-emerald-500 to-cyan-500'
  },
  {
    name: 'Studio',
    price: { monthly: 149, yearly: 1490 },
    description: 'Kurumsal çözümler',
    features: [
      'Sınırsız dönüşüm',
      'Dosya başı 1 GB',
      'CAD format desteği',
      'White-label',
      'Özel domain',
      'API erişimi',
      'Materyal kütüphanesi',
      'Gelişmiş analitik',
      '24/7 öncelikli destek'
    ],
    cta: 'Studio Ol',
    popular: false,
    gradient: 'from-violet-500 to-purple-500'
  }
];

export default function Pricing() {
  const { user, profile, refreshProfile } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  const handlePlanSelect = async (planName: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (planName === 'Free') {
      window.location.href = '/dashboard';
      return;
    }

    setUpgrading(true);
    try {
      await supabase
        .from('profiles')
        .update({ plan: planName })
        .eq('id', user.id);

      await refreshProfile();
      alert(`${planName} planına yükseltildiniz!`);
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error upgrading plan:', error);
      alert('Plan yükseltme başarısız oldu');
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_70%)]"></div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Basit ve Şeffaf Fiyatlandırma
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
            İhtiyacınıza uygun planı seçin, istediğiniz zaman iptal edin
          </p>

          <div className="inline-flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-full p-1.5">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-slate-900 shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Aylık
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
                billingPeriod === 'yearly'
                  ? 'bg-white text-slate-900 shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Yıllık
              <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full">
                2 ay bedava
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-slate-800/50 backdrop-blur-sm border-2 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 ${
                plan.popular
                  ? 'border-emerald-500 shadow-2xl shadow-emerald-500/20'
                  : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                    <Zap className="w-4 h-4" />
                    En Popüler
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-slate-400">{plan.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">
                    ${plan.price[billingPeriod]}
                  </span>
                  {plan.price[billingPeriod] > 0 && (
                    <span className="text-slate-400">
                      /{billingPeriod === 'monthly' ? 'ay' : 'yıl'}
                    </span>
                  )}
                </div>
                {billingPeriod === 'yearly' && plan.price.yearly > 0 && (
                  <p className="text-sm text-emerald-400 mt-2">
                    ${(plan.price.monthly * 12 - plan.price.yearly).toFixed(0)} tasarruf
                  </p>
                )}
              </div>

              <button
                onClick={() => handlePlanSelect(plan.name)}
                disabled={upgrading || profile?.plan === plan.name}
                className={`w-full py-4 rounded-xl font-semibold text-lg mb-8 transition-all duration-300 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                  plan.popular
                    ? `bg-gradient-to-r ${plan.gradient} hover:shadow-emerald-500/50 hover:scale-105`
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                {profile?.plan === plan.name ? 'Mevcut Plan' : plan.cta}
              </button>

              <div className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center mt-0.5`}>
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-slate-400 mb-4">
            Tüm planlar 14 gün para iade garantisi ile gelir
          </p>
          <button className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
            Planları karşılaştır →
          </button>
        </div>
      </div>
      {showAuthModal && (
        <AuthModal
          mode="signup"
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={() => {}}
        />
      )}
    </section>
  );
}
