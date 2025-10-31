type SceneConfig = {
  background?: string;
  environmentImage?: string;
  shadowIntensity?: number;
  exposure?: number;
};

type SceneTabProps = {
  config: SceneConfig;
  onChange: (config: Partial<SceneConfig>) => void;
};

export default function SceneTab({ config, onChange }: SceneTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Arka Plan Rengi</label>
        <input
          type="color"
          value={config.background || '#1e293b'}
          onChange={(e) => onChange({ background: e.target.value })}
          className="w-full h-12 rounded-xl cursor-pointer bg-slate-800 border border-slate-700"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Gölge Yoğunluğu: {config.shadowIntensity || 0.5}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={config.shadowIntensity || 0.5}
          onChange={(e) => onChange({ shadowIntensity: parseFloat(e.target.value) })}
          className="w-full accent-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Pozlama: {config.exposure || 1}
        </label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={config.exposure || 1}
          onChange={(e) => onChange({ exposure: parseFloat(e.target.value) })}
          className="w-full accent-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Environment Map</label>
        <select
          value={config.environmentImage || 'none'}
          onChange={(e) => onChange({ environmentImage: e.target.value })}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="none">Yok</option>
          <option value="studio">Studio</option>
          <option value="sunset">Sunset</option>
          <option value="forest">Forest</option>
          <option value="warehouse">Warehouse</option>
        </select>
      </div>
    </div>
  );
}
