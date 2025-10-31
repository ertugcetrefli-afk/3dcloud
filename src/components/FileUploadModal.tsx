import { useState, useRef } from 'react';
import { X, Upload, File, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type FileUploadModalProps = {
  onClose: () => void;
  onUploadComplete: () => void;
};

const SUPPORTED_FORMATS = ['glb', 'gltf', 'fbx', 'obj', 'stl', '3ds', 'dae', 'ply', 'usd', 'usda', 'usdc', 'ustz'];

type UploadProgress = {
  stage: 'uploading' | 'processing' | 'converting' | 'generating' | 'completed';
  message: string;
  progress: number;
};

export default function FileUploadModal({ onClose, onUploadComplete }: FileUploadModalProps) {
  const { user, profile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getPlanLimits = () => {
    switch (profile?.plan) {
      case 'Pro':
        return { monthly: 50, fileSize: 200 * 1024 * 1024 };
      case 'Studio':
        return { monthly: Infinity, fileSize: 1000 * 1024 * 1024 };
      default:
        return { monthly: 5, fileSize: 50 * 1024 * 1024 };
    }
  };

  const limits = getPlanLimits();

  const validateFile = (file: File): string | null => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !SUPPORTED_FORMATS.includes(extension)) {
      return `Desteklenmeyen format. Desteklenen: ${SUPPORTED_FORMATS.join(', ')}`;
    }

    if (file.size > limits.fileSize) {
      return `Dosya boyutu çok büyük. Maksimum: ${limits.fileSize / 1024 / 1024} MB`;
    }

    if (profile && profile.uploaded_this_month >= limits.monthly) {
      return `Aylık limitinizi aştınız. Plan: ${profile.plan}`;
    }

    return null;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    setError('');
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setFile(selectedFile);
    if (!projectName) {
      setProjectName(selectedFile.name.split('.')[0]);
    }
  };

  const simulateProgress = async (projectId: string) => {
    const stages: UploadProgress[] = [
      { stage: 'uploading', message: 'Dosya yükleniyor...', progress: 20 },
      { stage: 'processing', message: 'Model işleniyor...', progress: 40 },
      { stage: 'converting', message: 'GLB formatına dönüştürülüyor...', progress: 60 },
      { stage: 'generating', message: 'Önizleme oluşturuluyor...', progress: 80 },
      { stage: 'completed', message: 'Tamamlandı!', progress: 100 },
    ];

    for (const stage of stages) {
      setUploadProgress(stage);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const handleUpload = async () => {
    if (!file || !projectName || !user) return;

    setUploading(true);
    setError('');
    setUploadProgress({ stage: 'uploading', message: 'Başlıyor...', progress: 0 });

    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
      const isAlreadyGLB = extension === 'glb';

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: projectName,
          original_filename: file.name,
          original_format: extension,
          file_size: file.size,
          status: 'processing',
        })
        .select()
        .single();

      if (projectError) throw projectError;

      const uploadPath = `${user.id}/${project.id}/${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(uploadPath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      await supabase
        .from('profiles')
        .update({ uploaded_this_month: (profile?.uploaded_this_month || 0) + 1 })
        .eq('id', user.id);

      setUploadProgress({ stage: 'uploading', message: 'Dosya yükleniyor...', progress: 20 });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      setUploadProgress({ stage: 'processing', message: 'Model işleniyor...', progress: 40 });

      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/convert-3d-model`;

      const conversionResponse = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: project.id,
          originalFormat: extension,
          uploadPath: uploadPath,
        }),
      });

      if (!conversionResponse.ok) {
        const errorData = await conversionResponse.json();
        throw new Error(errorData.error || 'Conversion failed');
      }

      setUploadProgress({ stage: 'converting', message: 'GLB formatına dönüştürülüyor...', progress: 60 });

      await new Promise(resolve => setTimeout(resolve, 1000));

      setUploadProgress({ stage: 'generating', message: 'Önizleme oluşturuluyor...', progress: 80 });

      await new Promise(resolve => setTimeout(resolve, 1000));

      setUploadProgress({ stage: 'completed', message: 'Tamamlandı!', progress: 100 });

      onUploadComplete();
      onClose();
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Yükleme başarısız oldu');
      setUploading(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl relative">
        {!uploading && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        <div className="p-8">
          {!uploading ? (
            <>
              <h2 className="text-3xl font-bold text-white mb-2">Yeni Proje Oluştur</h2>
              <p className="text-slate-400 mb-8">
                3D modelinizi yükleyin ve dönüştürme işlemini başlatın
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Proje Adı
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Örnek: Modern Koltuk"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    3D Model Dosyası
                  </label>
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      dragActive
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={SUPPORTED_FORMATS.map(f => `.${f}`).join(',')}
                      onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                      className="hidden"
                    />

                    {file ? (
                      <div className="flex items-center justify-center gap-3">
                        <File className="w-8 h-8 text-emerald-400" />
                        <div className="text-left">
                          <p className="text-white font-medium">{file.name}</p>
                          <p className="text-sm text-slate-400">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                        <p className="text-white font-medium mb-2">
                          Dosyayı sürükleyip bırakın veya tıklayın
                        </p>
                        <p className="text-sm text-slate-400 mb-2">
                          Desteklenen formatlar: {SUPPORTED_FORMATS.join(', ').toUpperCase()}
                        </p>
                        <p className="text-xs text-slate-500 mb-3">
                          Maksimum dosya boyutu: {limits.fileSize / 1024 / 1024} MB
                        </p>
                        <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
                          <span>✨ Tüm formatlar otomatik olarak GLB'ye dönüştürülür</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-slate-300">
                      <p className="font-medium text-white mb-1">Plan Kullanımı</p>
                      <p>
                        Bu ay: {profile?.uploaded_this_month || 0} / {limits.monthly === Infinity ? '∞' : limits.monthly} dönüşüm
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 rounded-xl px-4 py-3 text-red-400 text-sm flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 bg-slate-800 border border-slate-700 rounded-xl font-semibold text-white hover:bg-slate-700 transition-all duration-300"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!file || !projectName || uploading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-semibold text-white hover:shadow-xl hover:shadow-emerald-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Yükle ve Dönüştür
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12">
              <div className="text-center mb-8">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-2 border-emerald-500/50 flex items-center justify-center">
                  <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {uploadProgress?.message || 'İşleniyor...'}
                </h3>
                <p className="text-slate-400">
                  Lütfen bekleyin, modeliniz dönüştürülüyor
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500 rounded-full"
                    style={{ width: `${uploadProgress?.progress || 0}%` }}
                  />
                </div>

                <div className="space-y-2">
                  {['uploading', 'processing', 'converting', 'generating'].map((stage, index) => {
                    const isActive = uploadProgress?.stage === stage;
                    const isCompleted = uploadProgress && ['uploading', 'processing', 'converting', 'generating'].indexOf(uploadProgress.stage) > index;

                    return (
                      <div
                        key={stage}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                          isActive ? 'bg-emerald-500/20 border border-emerald-500/50' :
                          isCompleted ? 'bg-emerald-500/10' : 'bg-slate-800/50'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${
                          isActive ? 'bg-emerald-400 animate-pulse' :
                          isCompleted ? 'bg-emerald-400' : 'bg-slate-600'
                        }`} />
                        <span className={`text-sm ${
                          isActive || isCompleted ? 'text-white' : 'text-slate-500'
                        }`}>
                          {stage === 'uploading' && 'Dosya yükleniyor'}
                          {stage === 'processing' && 'Model işleniyor'}
                          {stage === 'converting' && 'GLB formatına dönüştürülüyor'}
                          {stage === 'generating' && 'Önizleme oluşturuluyor'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
