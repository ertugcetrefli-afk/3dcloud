import { useState, useEffect } from 'react';
import { Box, ChevronRight, Palette, Eye, EyeOff } from 'lucide-react';

type Part = {
  id: string;
  name: string;
  visible: boolean;
  color?: string;
  materialId?: string;
};

type PartsTabProps = {
  projectId: string;
  onPartSelect: (partId: string) => void;
  onPartUpdate: (partId: string, updates: Partial<Part>) => void;
  selectedPartId: string | null;
};

export default function PartsTab({ projectId, onPartSelect, onPartUpdate, selectedPartId }: PartsTabProps) {
  const [parts, setParts] = useState<Part[]>([
    { id: 'part_1', name: 'Parça 1', visible: true, color: '#808080' },
    { id: 'part_2', name: 'Parça 2', visible: true, color: '#808080' },
    { id: 'part_3', name: 'Parça 3', visible: true, color: '#808080' },
    { id: 'part_4', name: 'Parça 4', visible: true, color: '#808080' },
    { id: 'part_5', name: 'Parça 5', visible: true, color: '#808080' },
    { id: 'part_6', name: 'Parça 6', visible: true, color: '#808080' },
    { id: 'part_7', name: 'Parça 7', visible: true, color: '#808080' },
    { id: 'part_8', name: 'Parça 8', visible: true, color: '#808080' },
    { id: 'part_9', name: 'Parça 9', visible: true, color: '#808080' },
    { id: 'part_10', name: 'Parça 10', visible: true, color: '#808080' },
    { id: 'part_11', name: 'Parça 11', visible: true, color: '#808080' },
    { id: 'part_12', name: 'Parça 12', visible: true, color: '#808080' },
  ]);

  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  const toggleVisibility = (partId: string) => {
    setParts(prev => prev.map(part =>
      part.id === partId ? { ...part, visible: !part.visible } : part
    ));
    const part = parts.find(p => p.id === partId);
    if (part) {
      onPartUpdate(partId, { visible: !part.visible });
    }
  };

  const updateColor = (partId: string, color: string) => {
    setParts(prev => prev.map(part =>
      part.id === partId ? { ...part, color } : part
    ));
    onPartUpdate(partId, { color });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
          <Box className="w-4 h-4" />
          Model Parçaları
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Parça seçerek renk ve görünürlük ayarlarını değiştirebilirsiniz
        </p>
      </div>

      <div className="space-y-1 max-h-[500px] overflow-y-auto pr-2">
        {parts.map((part) => (
          <div key={part.id}>
            <div
              className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all ${
                selectedPartId === part.id
                  ? 'bg-emerald-500/20 border-2 border-emerald-500'
                  : 'bg-slate-800 border-2 border-slate-700 hover:border-slate-600'
              }`}
              onClick={() => onPartSelect(part.id)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVisibility(part.id);
                }}
                className="p-1 hover:bg-slate-700 rounded transition-colors"
                title={part.visible ? 'Gizle' : 'Göster'}
              >
                {part.visible ? (
                  <Eye className="w-4 h-4 text-slate-400" />
                ) : (
                  <EyeOff className="w-4 h-4 text-slate-600" />
                )}
              </button>

              <div className="flex-1 flex items-center justify-between">
                <span className={`text-sm font-medium ${
                  part.visible ? 'text-white' : 'text-slate-600'
                }`}>
                  {part.name}
                </span>
                <ChevronRight className={`w-4 h-4 ${
                  selectedPartId === part.id ? 'text-emerald-400' : 'text-slate-600'
                }`} />
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowColorPicker(showColorPicker === part.id ? null : part.id);
                }}
                className="relative p-1 hover:bg-slate-700 rounded transition-colors"
                title="Renk Değiştir"
              >
                <div
                  className="w-6 h-6 rounded border-2 border-slate-600"
                  style={{ backgroundColor: part.color }}
                />
              </button>
            </div>

            {showColorPicker === part.id && (
              <div className="mt-2 p-4 bg-slate-900 border border-slate-700 rounded-lg space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">
                    Renk Seçin
                  </label>
                  <input
                    type="color"
                    value={part.color}
                    onChange={(e) => updateColor(part.id, e.target.value)}
                    className="w-full h-12 rounded-lg cursor-pointer bg-slate-800 border border-slate-700"
                  />
                </div>

                <div className="grid grid-cols-6 gap-2">
                  {[
                    '#FFFFFF', '#E5E7EB', '#9CA3AF', '#4B5563', '#1F2937', '#000000',
                    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
                    '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
                    '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E', '#DC2626',
                  ].map((color) => (
                    <button
                      key={color}
                      onClick={() => updateColor(part.id, color)}
                      className="w-full aspect-square rounded border-2 border-slate-700 hover:border-slate-500 transition-colors"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setShowColorPicker(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Tamam
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-slate-800 pt-4">
        <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-3">
          <p className="text-xs text-blue-300">
            Parça üzerine tıklayarak seçim yapabilir, renk atayabilir veya gizleyebilirsiniz
          </p>
        </div>
      </div>
    </div>
  );
}
