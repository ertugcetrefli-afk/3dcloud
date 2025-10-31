import { useState } from 'react';
import { Upload, Check } from 'lucide-react';
import { Material } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type MaterialsTabProps = {
  materials: Material[];
  onUpdate: () => void;
};

export default function MaterialsTab({ materials, onUpdate }: MaterialsTabProps) {
  const { profile } = useAuth();
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [roughness, setRoughness] = useState(0.5);
  const [metalness, setMetalness] = useState(0);

  const libraryMaterials = materials.filter(m => m.type === 'library');
  const customMaterials = materials.filter(m => m.type === 'custom');

  const canUploadCustom = profile?.plan === 'Pro' || profile?.plan === 'Studio';

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
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:border-slate-600 hover:text-slate-300 transition-colors">
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
                    <p className="text-white font-medium">{material.name}</p>
                    <p className="text-xs text-slate-400 mt-1">Özel Materyal</p>
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
            <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg text-white text-sm font-medium hover:shadow-lg transition-all">
              Planı Yükselt
            </button>
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
    </div>
  );
}
