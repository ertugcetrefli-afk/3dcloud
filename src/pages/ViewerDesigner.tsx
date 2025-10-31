import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Project, ViewerConfig, Material, Hotspot } from '../lib/supabase';
import { Save, Code, Undo, Redo, RotateCcw, ArrowLeft } from 'lucide-react';
import SceneTab from '../components/designer/SceneTab';
import CameraTab from '../components/designer/CameraTab';
import ARTab from '../components/designer/ARTab';
import HotspotsTab from '../components/designer/HotspotsTab';
import MaterialsTab from '../components/designer/MaterialsTab';
import ThemeTab from '../components/designer/ThemeTab';
import PartsTab from '../components/designer/PartsTab';
import EmbedCodeModal from '../components/designer/EmbedCodeModal';
import ModelViewer from '../components/ModelViewer';

type Tab = 'scene' | 'camera' | 'ar' | 'hotspots' | 'materials' | 'theme' | 'parts';

export default function ViewerDesigner() {
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [config, setConfig] = useState<ViewerConfig['config']>({});
  const [activeTab, setActiveTab] = useState<Tab>('scene');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [partColors, setPartColors] = useState<Record<string, string>>({});

  const projectId = window.location.pathname.split('/').pop() || '';

  const loadProject = useCallback(async () => {
    if (!projectId || !user?.id) return;

    setLoading(true);
    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (projectError) throw projectError;

      setProject(projectData);

      if (projectData) {
        const { data: configData } = await supabase
          .from('viewer_configs')
          .select('*')
          .eq('project_id', projectId)
          .eq('is_active', true)
          .maybeSingle();

        if (configData) {
          setConfig(configData.config);
        }
      }
    } catch (error) {
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, user?.id]);

  const loadMaterials = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data } = await supabase
        .from('materials')
        .select('*')
        .or(`user_id.eq.${user.id},type.eq.library`);

      if (data) {
        setMaterials(data);
      }
    } catch (error) {
      setMaterials([]);
    }
  }, [user?.id]);

  const loadHotspots = useCallback(async () => {
    if (!projectId) return;

    try {
      const { data } = await supabase
        .from('hotspots')
        .select('*')
        .eq('project_id', projectId);

      if (data) {
        setHotspots(data);
      }
    } catch (error) {
      setHotspots([]);
    }
  }, [projectId]);

  useEffect(() => {
    if (user && projectId) {
      loadProject();
      loadMaterials();
      loadHotspots();
    }
  }, [user, projectId, loadProject, loadMaterials, loadHotspots]);

  const handleSave = async () => {
    if (!projectId || !user) return;

    setSaving(true);
    try {
      await supabase.from('viewer_configs').update({ is_active: false }).eq('project_id', projectId);

      const { data: existingConfig } = await supabase
        .from('viewer_configs')
        .select('version')
        .eq('project_id', projectId)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

      const newVersion = (existingConfig?.version || 0) + 1;

      const { error } = await supabase.from('viewer_configs').insert({
        project_id: projectId,
        user_id: user.id,
        config: config,
        version: newVersion,
        is_active: true,
      });

      if (error) throw error;

      alert('Değişiklikler kaydedildi!');
    } catch (error) {
      alert('Kaydetme başarısız oldu');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Tüm ayarları varsayılana döndürmek istediğinizden emin misiniz?')) {
      setConfig({});
    }
  };

  const updateConfig = (section: keyof ViewerConfig['config'], value: any) => {
    setConfig((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...value },
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Proje bulunamadı</h2>
          <a href="/dashboard" className="text-emerald-400 hover:text-emerald-300">
            Dashboard'a dön
          </a>
        </div>
      </div>
    );
  }

  const handlePartSelect = (partId: string) => {
    setSelectedPartId(partId);
  };

  const handlePartUpdate = (partId: string, updates: { visible?: boolean; color?: string }) => {
    if (updates.color) {
      setPartColors(prev => ({ ...prev, [partId]: updates.color! }));
    }
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'parts', label: 'Parçalar', icon: '🧩' },
    { id: 'scene', label: 'Sahne', icon: '🌅' },
    { id: 'camera', label: 'Kamera', icon: '📷' },
    { id: 'ar', label: 'AR', icon: '📱' },
    { id: 'hotspots', label: 'Hotspots', icon: '📍' },
    { id: 'materials', label: 'Materyaller', icon: '🎨' },
    { id: 'theme', label: 'Tema', icon: '🎭' },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-[2000px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a
                href="/dashboard"
                className="p-2 text-slate-400 hover:text-white transition-colors"
                title="Dashboard'a dön"
              >
                <ArrowLeft className="w-5 h-5" />
              </a>
              <div>
                <h1 className="text-xl font-bold text-white">{project.name}</h1>
                <p className="text-sm text-slate-400">Viewer Designer</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                title="Varsayılanlara dön"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg font-medium hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
              <button
                onClick={() => setShowEmbedModal(true)}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-medium text-white hover:shadow-lg hover:shadow-emerald-500/50 transition-all"
              >
                <Code className="w-4 h-4" />
                Embed Kodu
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[2000px] mx-auto">
        <div className="grid grid-cols-12 gap-0 min-h-[calc(100vh-73px)]">
          <div className="col-span-3 bg-slate-900 border-r border-slate-800 overflow-y-auto">
            <div className="border-b border-slate-800">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full px-6 py-4 text-left flex items-center gap-3 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-slate-800 text-white border-l-4 border-emerald-500'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <span className="text-2xl">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'parts' && (
                <PartsTab
                  projectId={projectId!}
                  onPartSelect={handlePartSelect}
                  onPartUpdate={handlePartUpdate}
                  selectedPartId={selectedPartId}
                />
              )}
              {activeTab === 'scene' && (
                <SceneTab config={config.scene || {}} onChange={(val) => updateConfig('scene', val)} />
              )}
              {activeTab === 'camera' && (
                <CameraTab config={config.camera || {}} onChange={(val) => updateConfig('camera', val)} />
              )}
              {activeTab === 'ar' && (
                <ARTab config={config.ar || {}} onChange={(val) => updateConfig('ar', val)} />
              )}
              {activeTab === 'hotspots' && (
                <HotspotsTab
                  projectId={projectId!}
                  hotspots={hotspots}
                  onUpdate={loadHotspots}
                />
              )}
              {activeTab === 'materials' && (
                <MaterialsTab materials={materials} onUpdate={loadMaterials} />
              )}
              {activeTab === 'theme' && (
                <ThemeTab config={config.theme || {}} onChange={(val) => updateConfig('theme', val)} />
              )}
            </div>
          </div>

          <div className="col-span-9 bg-slate-950 flex items-center justify-center p-8">
            <div className="w-full max-w-4xl">
              <div className="aspect-video bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden">
                {project.glb_url ? (
                  <ModelViewer
                    src={project.glb_url}
                    poster={project.poster_url || undefined}
                    config={config}
                    selectedPartId={selectedPartId}
                    partColors={partColors}
                    onPartClick={handlePartSelect}
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900"></div>
                    {project.poster_url && (
                      <img
                        src={project.poster_url}
                        alt={project.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-50"
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-2 border-emerald-500/50 flex items-center justify-center">
                          <span className="text-5xl">🎨</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Model İşleniyor</h3>
                        <p className="text-slate-400 max-w-md">
                          3D model dönüştürme işlemi tamamlandıktan sonra önizleme görüntülenecek
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <p className="text-sm text-slate-400 mb-1">Üçgen Sayısı</p>
                  <p className="text-xl font-bold text-white">{project.triangle_count?.toLocaleString()}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <p className="text-sm text-slate-400 mb-1">Format</p>
                  <p className="text-xl font-bold text-white uppercase">{project.original_format}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <p className="text-sm text-slate-400 mb-1">Boyut</p>
                  <p className="text-xl font-bold text-white">{(project.file_size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showEmbedModal && (
        <EmbedCodeModal
          project={project}
          config={config}
          onClose={() => setShowEmbedModal(false)}
        />
      )}
    </div>
  );
}
