type ThemeConfig = {
  mode?: 'light' | 'dark';
  primaryColor?: string;
  showControls?: boolean;
  showLogo?: boolean;
};

type ThemeTabProps = {
  config: ThemeConfig;
  onChange: (config: Partial<ThemeConfig>) => void;
};

export default function ThemeTab({ config, onChange }: ThemeTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Tema Modu</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onChange({ mode: 'light' })}
            className={`p-4 rounded-xl border-2 transition-all ${
              config.mode === 'light'
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-slate-700 bg-slate-800 hover:border-slate-600'
            }`}
          >
            <div className="text-3xl mb-2">☀️</div>
            <p className="text-white text-sm font-medium">Light</p>
          </button>
          <button
            onClick={() => onChange({ mode: 'dark' })}
            className={`p-4 rounded-xl border-2 transition-all ${
              config.mode === 'dark' || !config.mode
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-slate-700 bg-slate-800 hover:border-slate-600'
            }`}
          >
            <div className="text-3xl mb-2">🌙</div>
            <p className="text-white text-sm font-medium">Dark</p>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Ana Renk</label>
        <input
          type="color"
          value={config.primaryColor || '#10b981'}
          onChange={(e) => onChange({ primaryColor: e.target.value })}
          className="w-full h-12 rounded-xl cursor-pointer bg-slate-800 border border-slate-700"
        />
      </div>

      <div className="space-y-4">
        <label className="flex items-center justify-between cursor-pointer p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
          <div>
            <span className="text-sm font-medium text-white block mb-1">Kontrolleri Göster</span>
            <span className="text-xs text-slate-400">Zoom, fullscreen butonları</span>
          </div>
          <input
            type="checkbox"
            checked={config.showControls !== false}
            onChange={(e) => onChange({ showControls: e.target.checked })}
            className="w-5 h-5 accent-emerald-500 rounded"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
          <div>
            <span className="text-sm font-medium text-white block mb-1">Logo Göster</span>
            <span className="text-xs text-slate-400">Kendi markanızı ekleyin (Studio)</span>
          </div>
          <input
            type="checkbox"
            checked={config.showLogo || false}
            onChange={(e) => onChange({ showLogo: e.target.checked })}
            className="w-5 h-5 accent-emerald-500 rounded"
          />
        </label>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <h4 className="text-sm font-medium text-white mb-3">Önizleme</h4>
        <div
          className={`p-6 rounded-lg border ${
            config.mode === 'light' ? 'bg-white border-gray-300' : 'bg-slate-900 border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: config.primaryColor || '#10b981' }}
            />
            <div className="flex gap-2">
              {config.showControls !== false && (
                <>
                  <div className="w-8 h-8 bg-slate-700 rounded-lg" />
                  <div className="w-8 h-8 bg-slate-700 rounded-lg" />
                </>
              )}
            </div>
          </div>
          <div className={`h-32 rounded-lg ${config.mode === 'light' ? 'bg-gray-200' : 'bg-slate-800'}`} />
        </div>
      </div>
    </div>
  );
}
