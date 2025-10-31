import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Hero from './Hero';
import Features from './Features';
import HowItWorks from './HowItWorks';
import Pricing from './Pricing';
import FAQ from './FAQ';
import ModelsShowcase from './ModelsShowcase';

type HomepageSection = {
  id: string;
  section_type: 'hero' | 'features' | 'models_showcase' | 'how_it_works' | 'pricing' | 'faq' | 'custom';
  title: string | null;
  subtitle: string | null;
  content: any;
  bg_color: string;
  text_color: string;
  bg_image_url: string | null;
  is_visible: boolean;
  position: number;
};

export default function DynamicHomepage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_sections')
        .select('*')
        .eq('is_visible', true)
        .order('position', { ascending: true });

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error loading sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (section: HomepageSection) => {
    const sectionStyle = {
      backgroundColor: section.bg_color,
      color: section.text_color,
      backgroundImage: section.bg_image_url ? `url(${section.bg_image_url})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };

    const hasCustomStyle = section.bg_color !== '#0f172a' || section.bg_image_url;

    switch (section.section_type) {
      case 'hero':
        if (hasCustomStyle || section.title || section.subtitle) {
          return (
            <section key={section.id} style={sectionStyle}>
              <div className="py-20 px-6">
                <div className="max-w-7xl mx-auto text-center">
                  {section.title && (
                    <h1 className="text-5xl md:text-7xl font-bold mb-6" style={{ color: section.text_color }}>
                      {section.title}
                    </h1>
                  )}
                  {section.subtitle && (
                    <p className="text-xl md:text-2xl mb-8 opacity-90" style={{ color: section.text_color }}>
                      {section.subtitle}
                    </p>
                  )}
                  {section.content?.cta_text && (
                    <a
                      href={section.content.cta_url || '/dashboard'}
                      className="inline-block px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                    >
                      {section.content.cta_text}
                    </a>
                  )}
                </div>
              </div>
            </section>
          );
        }
        return <Hero key={section.id} />;

      case 'features':
        if (hasCustomStyle) {
          return (
            <section key={section.id} style={sectionStyle}>
              <Features />
            </section>
          );
        }
        return <Features key={section.id} />;

      case 'models_showcase':
        if (hasCustomStyle) {
          return (
            <section key={section.id} style={sectionStyle}>
              <ModelsShowcase />
            </section>
          );
        }
        return <ModelsShowcase key={section.id} />;

      case 'how_it_works':
        if (hasCustomStyle) {
          return (
            <section key={section.id} style={sectionStyle}>
              <HowItWorks />
            </section>
          );
        }
        return <HowItWorks key={section.id} />;

      case 'pricing':
        if (hasCustomStyle) {
          return (
            <section key={section.id} style={sectionStyle}>
              <Pricing />
            </section>
          );
        }
        return <Pricing key={section.id} />;

      case 'faq':
        if (hasCustomStyle) {
          return (
            <section key={section.id} style={sectionStyle}>
              <FAQ />
            </section>
          );
        }
        return <FAQ key={section.id} />;

      case 'custom':
        return (
          <section key={section.id} style={sectionStyle} className="py-20">
            <div className="max-w-7xl mx-auto px-6 text-center">
              {section.title && (
                <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: section.text_color }}>
                  {section.title}
                </h2>
              )}
              {section.subtitle && (
                <p className="text-xl opacity-90" style={{ color: section.text_color }}>
                  {section.subtitle}
                </p>
              )}
              {section.content?.html && (
                <div
                  className="mt-8"
                  dangerouslySetInnerHTML={{ __html: section.content.html }}
                  style={{ color: section.text_color }}
                />
              )}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <>
        <Hero />
        <section id="features">
          <Features />
        </section>
        <section id="showcase">
          <ModelsShowcase />
        </section>
        <section id="how-it-works">
          <HowItWorks />
        </section>
        <section id="pricing">
          <Pricing />
        </section>
        <section id="faq">
          <FAQ />
        </section>
      </>
    );
  }

  return (
    <>
      {sections.map(section => renderSection(section))}
    </>
  );
}
