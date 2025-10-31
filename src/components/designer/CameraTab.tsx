type CameraConfig = {
  initialYaw?: number;
  initialPitch?: number;
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
};

type CameraTabProps = {
  config: CameraConfig;
  onChange: (config: Partial<CameraConfig>) => void;
};

export default function CameraTab({ config, onChange }: CameraTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Başlangıç Yaw: {config.initialYaw || 0}°
        </label>
        <input
          type="range"
          min="-180"
          max="180"
          step="5"
          value={config.initialYaw || 0}
          onChange={(e) => onChange({ initialYaw: parseFloat(e.target.value) })}
          className="w-full accent-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Başlangıç Pitch: {config.initialPitch || 0}°
        </label>
        <input
          type="range"
          min="-90"
          max="90"
          step="5"
          value={config.initialPitch || 0}
          onChange={(e) => onChange({ initialPitch: parseFloat(e.target.value) })}
          className="w-full accent-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Başlangıç Zoom: {config.initialZoom || 1}x
        </label>
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.1"
          value={config.initialZoom || 1}
          onChange={(e) => onChange({ initialZoom: parseFloat(e.target.value) })}
          className="w-full accent-emerald-500"
        />
      </div>

      <div className="border-t border-slate-800 pt-6">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium text-slate-300">Otomatik Döndürme</span>
          <input
            type="checkbox"
            checked={config.autoRotate || false}
            onChange={(e) => onChange({ autoRotate: e.target.checked })}
            className="w-5 h-5 accent-emerald-500 rounded"
          />
        </label>
      </div>

      {config.autoRotate && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Döndürme Hızı: {config.autoRotateSpeed || 1}x
          </label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={config.autoRotateSpeed || 1}
            onChange={(e) => onChange({ autoRotateSpeed: parseFloat(e.target.value) })}
            className="w-full accent-emerald-500"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Min Zoom: {config.minZoom || 0.5}x
        </label>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={config.minZoom || 0.5}
          onChange={(e) => onChange({ minZoom: parseFloat(e.target.value) })}
          className="w-full accent-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Max Zoom: {config.maxZoom || 3}x
        </label>
        <input
          type="range"
          min="2"
          max="10"
          step="0.5"
          value={config.maxZoom || 3}
          onChange={(e) => onChange({ maxZoom: parseFloat(e.target.value) })}
          className="w-full accent-emerald-500"
        />
      </div>
    </div>
  );
}
