import { useState, useRef } from 'react';
import { Upload, Check, X, Loader2 } from 'lucide-react';
import { Material } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

type MaterialsTabProps = {
  materials: Material[];
  onUpdate: () => void;
};

export default function MaterialsTab({ materials, onUpdate }: MaterialsTabProps) {
  const { user, profile } = useAuth();
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [roughness, setRoughness] = useState(0.5);
  const [metalness, setMetalness] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [materialName, setMaterialName] = useState('');
  const [baseColor, setBaseColor] = useState('#ffffff');
  const [textureFiles, setTextureFiles] = useState<{
    baseColor?: File;
    normal?: File;
    roughness?: File;
    metallic?: File;
    ao?: File;
  }>({});

  const libraryMaterials = materials.filter(m => m.type === 'library');
  const customMaterials = materials.filter(m => m.type === 'custom');

  const canUploadCustom = profile?.plan === 'Pro' || profile?.plan === 'Studio';

  const handleTextureUpload = (type: keyof typeof textureFiles, file: File) => {
    setTextureFiles(prev => ({ ...prev, [type]: file }));
  };

  const handleCreateMaterial = async () => {
    if (!materialName || !user) return;

    setUploading(true);
    try {
      const materialId = crypto.randomUUID();
      const uploadedUrls: any = {};

      for (const [type, file] of Object.entries(textureFiles)) {
        if (file) {
          const filePath = `${user.id}/materials/${materialId}/${type}.${file.name.split('.').pop()}`;
          const { error: uploadError } = await supabase.storage
            .from('textures')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data } = supabase.storage
            .from('textures')
            .getPublicUrl(filePath);

          uploadedUrls[`${type}_url`] = data.publicUrl;
        }
      }

      const { error } = await supabase.from('materials').insert({
        id: materialId,
        user_id: user.id,
        name: materialName,
        type: 'custom',
        base_color_url: uploadedUrls.baseColor_url,
        normal_url: uploadedUrls.normal_url,
        roughness_url: uploadedUrls.roughness_url,
        metallic_url: uploadedUrls.metallic_url,
        ao_url: uploadedUrls.ao_url,
        parameters: {
          roughness: roughness,
          metalness: metalness,
          color: baseColor,
        },
      });

      if (error) throw error;

      setShowUploadModal(false);
      setMaterialName('');
      setTextureFiles({});
      setBaseColor('#ffffff');
      onUpdate();
    } catch (error) {
      alert('Materyal yüklenirken hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const deleteMaterial = async (materialId: string) => {
    if (!confirm('Bu materyali silmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', materialId);

      if (error) throw error;

      onUpdate();
    } catch (error) {
      alert('Materyal silinirken hata oluştu');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-slate-300 mb-3">Kütüphane Materyalleri</h3>
        <div className="space-y-2">
          {libraryMaterials.map((material) => (
            <button
              key={material.id}
              onClick={() => setSelectedMaterial(material.id)}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                selectedMaterial === material.id
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-700 bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{material.name}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    R: {material.parameters.roughness} / M: {material.parameters.metalness}
                  </p>
                </div>
                {selectedMaterial === material.id && (
                  <Check className="w-5 h-5 text-emerald-400" />
                )}
              </div>
              {material.parameters.color && (
                <div className="mt-3 flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg border border-slate-600"
                    style={{ backgroundColor: material.parameters.color }}
                  />
                  <span className="text-xs text-slate-400">{material.parameters.color}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-800 pt-6">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Özel Materyaller</h3>
        {canUploadCustom ? (
          <>
            <button
              onClick={() => setShowUploadModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:border-slate-600 hover:text-slate-300 transition-colors"
            >
              <Upload className="w-5 h-5" />
              PBR Texture Yükle
            </button>
            {customMaterials.length > 0 && (
              <div className="mt-4 space-y-2">
                {customMaterials.map((material) => (
                  <div
                    key={material.id}
                    className="p-4 bg-slate-800 border border-slate-700 rounded-xl"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-white font-medium">{material.name}</p>
                        <p className="text-xs text-slate-400 mt-1">Özel Materyal</p>
                        {material.parameters.color && (
                          <div className="mt-2 flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded border border-slate-600"
                              style={{ backgroundColor: material.parameters.color }}
                            />
                            <span className="text-xs text-slate-500">
                              R: {material.parameters.roughness} / M: {material.parameters.metalness}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => deleteMaterial(material.id)}
                        className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <p className="text-sm text-slate-400 mb-3">
              Özel materyal yükleme Pro ve Studio planlarında mevcuttur
            </p>
            <a
              href="/#pricing"
              className="inline-block px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg text-white text-sm font-medium hover:shadow-lg transition-all"
            >
              Planı Yükselt
            </a>
          </div>
        )}
      </div>

      <div className="border-t border-slate-800 pt-6">
        <h3 className="text-sm font-medium text-slate-300 mb-4">Materyal Parametreleri</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Roughness: {roughness.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={roughness}
              onChange={(e) => setRoughness(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Parlak</span>
              <span>Mat</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Metalness: {metalness.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={metalness}
              onChange={(e) => setMetalness(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Dielektrik</span>
              <span>Metalik</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/50 rounded-xl p-4">
        <p className="text-sm text-blue-300">
          Materyal değişiklikleri gerçek zamanlı olarak modele uygulanır
        </p>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Özel Materyal Oluştur</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                  disabled={uploading}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Materyal Adı
                </label>
                <input
                  type="text"
                  value={materialName}
                  onChange={(e) => setMaterialName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Örnek: Ahşap Texture"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Base Color
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={baseColor}
                    onChange={(e) => setBaseColor(e.target.value)}
                    className="h-12 w-16 rounded-xl cursor-pointer bg-slate-800 border border-slate-700"
                    disabled={uploading}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleTextureUpload('baseColor', e.target.files[0])}
                    className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-emerald-500 file:text-white file:cursor-pointer hover:file:bg-emerald-600"
                    disabled={uploading}
                  />
                </div>
                {textureFiles.baseColor && (
                  <p className="text-xs text-emerald-400 mt-1">{textureFiles.baseColor.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Normal Map
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleTextureUpload('normal', e.target.files[0])}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-emerald-500 file:text-white file:cursor-pointer hover:file:bg-emerald-600"
                    disabled={uploading}
                  />
                  {textureFiles.normal && (
                    <p className="text-xs text-emerald-400 mt-1">{textureFiles.normal.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Roughness Map
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleTextureUpload('roughness', e.target.files[0])}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-emerald-500 file:text-white file:cursor-pointer hover:file:bg-emerald-600"
                    disabled={uploading}
                  />
                  {textureFiles.roughness && (
                    <p className="text-xs text-emerald-400 mt-1">{textureFiles.roughness.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Metallic Map
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleTextureUpload('metallic', e.target.files[0])}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-emerald-500 file:text-white file:cursor-pointer hover:file:bg-emerald-600"
                    disabled={uploading}
                  />
                  {textureFiles.metallic && (
                    <p className="text-xs text-emerald-400 mt-1">{textureFiles.metallic.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    AO Map
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleTextureUpload('ao', e.target.files[0])}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-emerald-500 file:text-white file:cursor-pointer hover:file:bg-emerald-600"
                    disabled={uploading}
                  />
                  {textureFiles.ao && (
                    <p className="text-xs text-emerald-400 mt-1">{textureFiles.ao.name}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 flex gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                disabled={uploading}
                className="flex-1 px-6 py-3 bg-slate-800 border border-slate-700 rounded-xl font-semibold text-white hover:bg-slate-700 transition-all"
              >
                İptal
              </button>
              <button
                onClick={handleCreateMaterial}
                disabled={uploading || !materialName}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-semibold text-white hover:shadow-xl hover:shadow-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Yükleniyor...
                  </>
                ) : (
                  'Oluştur'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
