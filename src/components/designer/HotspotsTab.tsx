import { useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { supabase, Hotspot } from '../../lib/supabase';

type HotspotsTabProps = {
  projectId: string;
  hotspots: Hotspot[];
  onUpdate: () => void;
};

export default function HotspotsTab({ projectId, hotspots, onUpdate }: HotspotsTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    positionX: 0,
    positionY: 0,
    positionZ: 0,
    color: '#10b981',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hotspotData = {
      project_id: projectId,
      position: {
        x: formData.positionX,
        y: formData.positionY,
        z: formData.positionZ,
      },
      title: formData.title,
      description: formData.description,
      style: { color: formData.color },
    };

    if (editingId) {
      await supabase.from('hotspots').update(hotspotData).eq('id', editingId);
    } else {
      await supabase.from('hotspots').insert(hotspotData);
    }

    setShowForm(false);
    setEditingId(null);
    setFormData({ title: '', description: '', positionX: 0, positionY: 0, positionZ: 0, color: '#10b981' });
    onUpdate();
  };

  const handleEdit = (hotspot: Hotspot) => {
    setEditingId(hotspot.id);
    setFormData({
      title: hotspot.title,
      description: hotspot.description || '',
      positionX: hotspot.position.x,
      positionY: hotspot.position.y,
      positionZ: hotspot.position.z,
      color: hotspot.style.color || '#10b981',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu hotspot\'u silmek istediğinizden emin misiniz?')) {
      await supabase.from('hotspots').delete().eq('id', id);
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => {
          setShowForm(true);
          setEditingId(null);
          setFormData({ title: '', description: '', positionX: 0, positionY: 0, positionZ: 0, color: '#10b981' });
        }}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500/20 text-emerald-400 rounded-xl font-medium hover:bg-emerald-500/30 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Hotspot Ekle
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Başlık</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Açıklama</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 h-20 resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">X</label>
              <input
                type="number"
                step="0.1"
                value={formData.positionX}
                onChange={(e) => setFormData({ ...formData, positionX: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Y</label>
              <input
                type="number"
                step="0.1"
                value={formData.positionY}
                onChange={(e) => setFormData({ ...formData, positionY: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Z</label>
              <input
                type="number"
                step="0.1"
                value={formData.positionZ}
                onChange={(e) => setFormData({ ...formData, positionZ: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Renk</label>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full h-10 rounded-lg cursor-pointer bg-slate-900 border border-slate-700"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              {editingId ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {hotspots.map((hotspot) => (
          <div
            key={hotspot.id}
            className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="text-white font-medium mb-1">{hotspot.title}</h4>
                {hotspot.description && (
                  <p className="text-sm text-slate-400">{hotspot.description}</p>
                )}
                <p className="text-xs text-slate-500 mt-2">
                  Position: ({hotspot.position.x}, {hotspot.position.y}, {hotspot.position.z})
                </p>
              </div>
              <div
                className="w-6 h-6 rounded-full border-2 border-white/20 flex-shrink-0"
                style={{ backgroundColor: hotspot.style.color }}
              />
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleEdit(hotspot)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600 transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                Düzenle
              </button>
              <button
                onClick={() => handleDelete(hotspot.id)}
                className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {hotspots.length === 0 && !showForm && (
        <div className="text-center py-8">
          <p className="text-slate-500 text-sm">Henüz hotspot eklenmemiş</p>
        </div>
      )}
    </div>
  );
}
