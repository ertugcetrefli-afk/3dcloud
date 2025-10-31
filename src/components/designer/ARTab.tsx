type ARConfig = {
  quickLook?: boolean;
  sceneViewer?: boolean;
  webXR?: boolean;
  scale?: number;
  placement?: 'floor' | 'wall' | 'free';
};

type ARTabProps = {
  config: ARConfig;
  onChange: (config: Partial<ARConfig>) => void;
};

export default function ARTab({ config, onChange }: ARTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <p className="text-sm text-slate-300">
          AR özellikleri mobil cihazlarda çalışır. iOS için Quick Look, Android için Scene Viewer kullanılır.
        </p>
      </div>

      <div className="space-y-4">
        <label className="flex items-center justify-between cursor-pointer p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
          <div>
            <span className="text-sm font-medium text-white block mb-1">Quick Look (iOS)</span>
            <span className="text-xs text-slate-400">Apple AR görüntüleyici</span>
          </div>
          <input
            type="checkbox"
            checked={config.quickLook || false}
            onChange={(e) => onChange({ quickLook: e.target.checked })}
            className="w-5 h-5 accent-emerald-500 rounded"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
          <div>
            <span className="text-sm font-medium text-white block mb-1">Scene Viewer (Android)</span>
            <span className="text-xs text-slate-400">Google AR görüntüleyici</span>
          </div>
          <input
            type="checkbox"
            checked={config.sceneViewer || false}
            onChange={(e) => onChange({ sceneViewer: e.target.checked })}
            className="w-5 h-5 accent-emerald-500 rounded"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
          <div>
            <span className="text-sm font-medium text-white block mb-1">WebXR</span>
            <span className="text-xs text-slate-400">Tarayıcı tabanlı AR</span>
          </div>
          <input
            type="checkbox"
            checked={config.webXR || false}
            onChange={(e) => onChange({ webXR: e.target.checked })}
            className="w-5 h-5 accent-emerald-500 rounded"
          />
        </label>
      </div>

      <div className="border-t border-slate-800 pt-6">
        <label className="block text-sm font-medium text-slate-300 mb-3">
          AR Ölçeği: {config.scale || 1}x
        </label>
        <input
          type="range"
          min="0.1"
          max="5"
          step="0.1"
          value={config.scale || 1}
          onChange={(e) => onChange({ scale: parseFloat(e.target.value) })}
          className="w-full accent-emerald-500"
        />
        <p className="text-xs text-slate-400 mt-2">
          AR görünümünde modelin gerçek dünya boyutu
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Yerleştirme Modu</label>
        <select
          value={config.placement || 'floor'}
          onChange={(e) => onChange({ placement: e.target.value as ARConfig['placement'] })}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="floor">Zemin</option>
          <option value="wall">Duvar</option>
          <option value="free">Serbest</option>
        </select>
      </div>
    </div>
  );
}
