import { useState } from 'react';
import { X, Copy, Check, Code2 } from 'lucide-react';
import { Project, ViewerConfig } from '../../lib/supabase';

type EmbedCodeModalProps = {
  project: Project;
  config: ViewerConfig['config'];
  onClose: () => void;
};

type CodeType = 'html' | 'react' | 'javascript';

export default function EmbedCodeModal({ project, config, onClose }: EmbedCodeModalProps) {
  const [codeType, setCodeType] = useState<CodeType>('html');
  const [copied, setCopied] = useState(false);

  const generateHTMLCode = () => {
    const arModes = [];
    if (config.ar?.quickLook) arModes.push('quick-look');
    if (config.ar?.sceneViewer) arModes.push('scene-viewer');
    if (config.ar?.webXR) arModes.push('webxr');

    const attributes = [
      `src="${project.glb_url || 'https://cdn.example.com/model.glb'}"`,
      `poster="${project.poster_url || 'https://cdn.example.com/poster.jpg'}"`,
      arModes.length > 0 ? `ar ar-modes="${arModes.join(' ')}"` : null,
      'camera-controls',
      config.camera?.autoRotate ? 'auto-rotate' : null,
      `shadow-intensity="${config.scene?.shadowIntensity ?? 0.5}"`,
      `exposure="${config.scene?.exposure ?? 1}"`,
      'style="width: 100%; height: 500px;"',
      config.scene?.background ? `background-color="${config.scene.background}"` : null,
    ].filter(Boolean);

    return `<model-viewer\n  ${attributes.join('\n  ')}\n></model-viewer>\n\n<!-- Include model-viewer script -->\n<script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>`;
  };

  const generateReactCode = () => {
    const hasAR = config.ar?.quickLook || config.ar?.sceneViewer || config.ar?.webXR;
    const arModes = [];
    if (config.ar?.quickLook) arModes.push('quick-look');
    if (config.ar?.sceneViewer) arModes.push('scene-viewer');
    if (config.ar?.webXR) arModes.push('webxr');

    return `import '@google/model-viewer';\n\nfunction ModelViewer() {\n  return (\n    <model-viewer\n      src="${project.glb_url || 'https://cdn.example.com/model.glb'}"\n      poster="${project.poster_url || 'https://cdn.example.com/poster.jpg'}"${hasAR ? `\n      ar\n      ar-modes="${arModes.join(' ')}"` : ''}\n      camera-controls${config.camera?.autoRotate ? '\n      auto-rotate' : ''}\n      shadow-intensity="${config.scene?.shadowIntensity ?? 0.5}"\n      exposure="${config.scene?.exposure ?? 1}"\n      style={{ width: '100%', height: '500px' }}${config.scene?.background ? `\n      background-color="${config.scene.background}"` : ''}\n    />\n  );\n}\n\nexport default ModelViewer;`;
  };

  const generateJavaScriptCode = () => {
    return `// Three.js implementation
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();
scene.background = new THREE.Color('${config.scene?.background || '#1e293b'}');

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.toneMappingExposure = ${config.scene?.exposure || 1};
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
${config.camera?.autoRotate ? 'controls.autoRotate = true;' : ''}
${config.camera?.autoRotateSpeed ? `controls.autoRotateSpeed = ${config.camera.autoRotateSpeed};` : ''}

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
light.castShadow = true;
light.shadow.intensity = ${config.scene?.shadowIntensity || 0.5};
scene.add(light);

const loader = new GLTFLoader();
loader.load('${project.glb_url || 'https://cdn.example.com/model.glb'}', (gltf) => {
  scene.add(gltf.scene);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();`;
  };

  const getCode = () => {
    switch (codeType) {
      case 'react':
        return generateReactCode();
      case 'javascript':
        return generateJavaScriptCode();
      default:
        return generateHTMLCode();
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Code2 className="w-6 h-6 text-emerald-400" />
              <h2 className="text-2xl font-bold text-white">Embed Kodu</h2>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCodeType('html')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                codeType === 'html'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              HTML
            </button>
            <button
              onClick={() => setCodeType('react')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                codeType === 'react'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              React
            </button>
            <button
              onClick={() => setCodeType('javascript')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                codeType === 'javascript'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              JavaScript
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="relative">
            <pre className="bg-slate-950 border border-slate-800 rounded-xl p-6 overflow-x-auto text-sm text-slate-300 font-mono">
              <code>{getCode()}</code>
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Kopyalandı!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Kopyala
                </>
              )}
            </button>
          </div>

          <div className="mt-6 bg-blue-500/10 border border-blue-500/50 rounded-xl p-4">
            <h3 className="text-white font-medium mb-2">Kullanım Talimatları</h3>
            <ul className="space-y-2 text-sm text-blue-300">
              <li>• Bu kodu web sitenize yapıştırarak 3D modeli görüntüleyebilirsiniz</li>
              <li>• Model otomatik olarak CDN'den yüklenir ve optimize edilir</li>
              <li>• AR özellikleri mobil cihazlarda otomatik olarak etkinleşir</li>
              <li>• Responsive tasarım ile tüm ekran boyutlarında çalışır</li>
            </ul>
          </div>

          <div className="mt-4 bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <h3 className="text-white font-medium mb-2">Model URL'leri</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-slate-400">GLB:</span>
                <code className="ml-2 text-emerald-400 break-all">
                  {project.glb_url || 'https://cdn.example.com/model.glb'}
                </code>
              </div>
              <div>
                <span className="text-slate-400">Poster:</span>
                <code className="ml-2 text-emerald-400 break-all">
                  {project.poster_url || 'https://cdn.example.com/poster.jpg'}
                </code>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
