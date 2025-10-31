import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Project } from '../lib/supabase';
import { Plus, Upload, Settings, Box, Clock, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import FileUploadModal from '../components/FileUploadModal';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user?.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm('Bu projeyi silmek istediğinizden emin misiniz?')) return;

    const { error } = await supabase
      .from('projects')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', projectId);

    if (error) {
      console.error('Error deleting project:', error);
    } else {
      fetchProjects();
    }
  };

  const getStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Tamamlandı
          </span>
        );
      case 'processing':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            İşleniyor
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            Başarısız
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
            <Upload className="w-3 h-3" />
            Yükleniyor
          </span>
        );
    }
  };

  const getPlanLimits = () => {
    switch (profile?.plan) {
      case 'Pro':
        return { monthly: 50, fileSize: 200 };
      case 'Studio':
        return { monthly: Infinity, fileSize: 1000 };
      default:
        return { monthly: 5, fileSize: 50 };
    }
  };

  const limits = getPlanLimits();
  const usagePercentage = profile ? (profile.uploaded_this_month / limits.monthly) * 100 : 0;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Giriş Yapmanız Gerekiyor</h2>
          <a href="/" className="text-emerald-400 hover:text-emerald-300">
            Ana sayfaya dön
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-slate-400">3D modellerinizi yönetin ve düzenleyin</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-semibold text-white hover:shadow-xl hover:shadow-emerald-500/50 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            Yeni Proje
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-400 text-sm font-medium">Aktif Plan</h3>
              <Settings className="w-5 h-5 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{profile?.plan}</div>
            <p className="text-sm text-slate-500">
              {limits.monthly === Infinity ? 'Sınırsız' : `${limits.monthly} dönüşüm/ay`}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-400 text-sm font-medium">Bu Ay</h3>
              <Box className="w-5 h-5 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {profile?.uploaded_this_month || 0} / {limits.monthly === Infinity ? '∞' : limits.monthly}
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-3">
              <div
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-400 text-sm font-medium">Toplam Proje</h3>
              <Upload className="w-5 h-5 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{projects.length}</div>
            <p className="text-sm text-slate-500">
              {projects.filter(p => p.status === 'completed').length} tamamlandı
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
            <Box className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Henüz proje yok</h3>
            <p className="text-slate-400 mb-6">İlk 3D modelinizi yükleyerek başlayın</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-semibold text-white hover:shadow-xl hover:shadow-emerald-500/50 transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              Yeni Proje Oluştur
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all duration-300 group"
              >
                <div className="aspect-video bg-slate-800 relative overflow-hidden">
                  {project.poster_url ? (
                    <img
                      src={project.poster_url}
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Box className="w-12 h-12 text-slate-700" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(project.status)}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-2 truncate">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                    <span className="uppercase">{project.original_format}</span>
                    <span>•</span>
                    <span>{(project.file_size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <div className="flex gap-2">
                    {project.status === 'completed' && (
                      <a
                        href={`/designer/${project.id}`}
                        className="flex-1 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg font-medium hover:bg-emerald-500/30 transition-colors text-center text-sm"
                      >
                        Düzenle
                      </a>
                    )}
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {project.error_message && (
                    <p className="mt-3 text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded">
                      {project.error_message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showUploadModal && (
        <FileUploadModal
          onClose={() => setShowUploadModal(false)}
          onUploadComplete={fetchProjects}
        />
      )}
    </div>
  );
}
