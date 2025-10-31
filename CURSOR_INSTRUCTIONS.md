# 3DCloud - Cursor AI Geliştirme Talimatları

## Proje Genel Bakış

Bu proje, Toggle3D ve SANCAK 3D Studio benzeri profesyonel bir 3D model viewer ve konfiguratör platformudur.

### Temel Özellikler
- 3D model yükleme ve otomatik GLB dönüştürme
- Parça bazlı seçim ve renk atama sistemi
- PBR materyal yönetimi
- Gerçek zamanlı 3D preview
- AR desteği
- Hotspot sistemi
- Paylaşım ve embed özellikleri

## Teknoloji Stack

### Frontend
- **React 18.3** + **TypeScript 5.5**
- **Vite 5.4** (build tool)
- **Tailwind CSS 3.4** (styling)
- **Lucide React** (icons)
- **React Router 7.9** (routing)
- **@google/model-viewer** (3D rendering - CDN'den yüklü)

### Backend
- **Supabase** (BaaS)
  - PostgreSQL veritabanı
  - Authentication
  - Storage (uploads, models, posters, textures buckets)
  - Edge Functions (Deno runtime)

### Key Dependencies
```json
{
  "@supabase/supabase-js": "^2.57.4",
  "lucide-react": "^0.344.0",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^7.9.5"
}
```

## Proje Yapısı

```
src/
├── components/
│   ├── designer/          # Viewer designer tabs
│   │   ├── ARTab.tsx
│   │   ├── CameraTab.tsx
│   │   ├── EmbedCodeModal.tsx
│   │   ├── HotspotsTab.tsx
│   │   ├── MaterialsTab.tsx
│   │   ├── PartsTab.tsx     # PARÇA SEÇME SİSTEMİ
│   │   ├── SceneTab.tsx
│   │   └── ThemeTab.tsx
│   ├── AuthModal.tsx
│   ├── FAQ.tsx
│   ├── Features.tsx
│   ├── FileUploadModal.tsx
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── HowItWorks.tsx
│   ├── ModelViewer.tsx      # 3D VIEWER COMPONENT
│   └── Pricing.tsx
├── contexts/
│   └── AuthContext.tsx
├── lib/
│   └── supabase.ts          # Supabase client & types
├── pages/
│   ├── AdminPanel.tsx
│   ├── Dashboard.tsx        # PROJE YÖNETİMİ
│   ├── NotFound.tsx
│   └── ViewerDesigner.tsx   # ANA DESIGNER SAYFASI
├── App.tsx
├── main.tsx
└── index.css

supabase/
├── functions/
│   ├── api/
│   │   └── index.ts
│   └── convert-3d-model/    # 3D DÖNÜŞTÜRME
│       └── index.ts
└── migrations/              # Veritabanı şemaları
```

## Veritabanı Şeması

### Ana Tablolar

#### `profiles`
Kullanıcı profilleri ve plan bilgileri
- Plan türleri: Free (5/ay), Pro (50/ay), Studio (sınırsız)
- Monthly upload limitleri
- API keys

#### `projects`
3D model projeleri
- Status: uploading, processing, completed, failed
- GLB ve poster URL'leri
- Triangle/vertex count
- Soft delete (deleted_at)

#### `viewer_configs`
Viewer konfigürasyonları (versiyonlu)
- Scene (ışık, gölge, environment)
- Camera (FOV, auto-rotate, zoom limits)
- AR (quick-look, scene-viewer, webxr)
- Theme (renkler, butonlar)

#### `part_configurations`
**ÖNEMLİ:** Parça bazlı renk/materyal ayarları
- project_id ile ilişkili
- part_id, part_name
- color (hex), visible
- material_id (opsiyonel)
- position (sıralama)

#### `materials`
PBR materyal kütüphanesi
- type: 'library' | 'custom'
- PBR texture URL'leri (base_color, normal, roughness, metallic, ao)
- parameters (roughness, metalness, color)

#### `hotspots`
3D model üzerinde interaktif noktalar
- Position (x, y, z)
- Title, description, link

#### `usage_logs`
Kullanım istatistikleri
- event_type: conversion, download, view, share

#### `project_shares`
Proje paylaşım linkleri
- share_token (unique)
- is_active, expires_at

## Kritik Kod Örnekleri

### 1. ModelViewer Component (src/components/ModelViewer.tsx)

**PARÇA SEÇİMİ VE RENK ATAMA ÖZELLİĞİ:**

```typescript
type ModelViewerProps = {
  src: string;
  poster?: string;
  config: ViewerConfig['config'];
  selectedPartId?: string | null;        // Seçili parça ID
  partColors?: Record<string, string>;   // Parça renkleri
  onPartClick?: (partId: string) => void; // Tıklama handler
};

export default function ModelViewer({
  src, poster, config, selectedPartId, partColors, onPartClick
}: ModelViewerProps) {
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    // Model yüklendiğinde renkleri uygula
    const handleLoad = () => {
      if (viewer.model && partColors) {
        const materials = viewer.model.materials;
        materials.forEach((material: any, index: number) => {
          const partId = `part_${index + 1}`;
          if (partColors[partId]) {
            const color = partColors[partId];
            const r = parseInt(color.slice(1, 3), 16) / 255;
            const g = parseInt(color.slice(3, 5), 16) / 255;
            const b = parseInt(color.slice(5, 7), 16) / 255;
            material.pbrMetallicRoughness.setBaseColorFactor([r, g, b, 1]);
          }
        });
      }
    };

    // Model tıklaması ile parça seçimi
    const handleClick = (event: any) => {
      if (!onPartClick || !viewer.model) return;

      const modelIntersection = event.detail.intersection;
      if (modelIntersection) {
        const material = modelIntersection.material;
        if (material && viewer.model.materials) {
          const materialIndex = viewer.model.materials.indexOf(material);
          if (materialIndex >= 0) {
            const partId = `part_${materialIndex + 1}`;
            onPartClick(partId);
          }
        }
      }
    };

    viewer.addEventListener('load', handleLoad);
    viewer.addEventListener('click', handleClick);

    return () => {
      viewer.removeEventListener('load', handleLoad);
      viewer.removeEventListener('click', handleClick);
    };
  }, [config, src, partColors, selectedPartId, onPartClick]);

  return (
    <model-viewer
      ref={viewerRef}
      src={src}
      poster={poster}
      camera-controls
      touch-action="pan-y"
      disable-zoom={config.camera?.disableZoom}
      disable-pan={config.camera?.disablePan}
      shadow-intensity={config.scene?.shadowIntensity || 0.5}
      exposure={config.scene?.exposure || 1}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: config.scene?.background || '#1e293b',
        borderRadius: '1rem',
      }}
      environment-image="neutral"
    />
  );
}
```

**ÖNEMLİ:** `@google/model-viewer` index.html'de CDN'den yüklü:
```html
<script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
```

### 2. PartsTab Component (src/components/designer/PartsTab.tsx)

**SOL PANEL PARÇA LİSTESİ:**

```typescript
type Part = {
  id: string;
  name: string;
  visible: boolean;
  color?: string;
  materialId?: string;
};

export default function PartsTab({
  projectId,
  onPartSelect,
  onPartUpdate,
  selectedPartId
}: PartsTabProps) {
  const [parts, setParts] = useState<Part[]>([
    { id: 'part_1', name: 'Parça 1', visible: true, color: '#808080' },
    // ... 12 parça
  ]);

  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  const updateColor = (partId: string, color: string) => {
    setParts(prev => prev.map(part =>
      part.id === partId ? { ...part, color } : part
    ));
    onPartUpdate(partId, { color });
  };

  return (
    <div className="space-y-1">
      {parts.map((part) => (
        <div key={part.id}>
          <div
            onClick={() => onPartSelect(part.id)}
            className={selectedPartId === part.id
              ? 'border-emerald-500 bg-emerald-500/20'
              : 'border-slate-700 bg-slate-800'
            }
          >
            {/* Visibility toggle */}
            <button onClick={() => toggleVisibility(part.id)}>
              {part.visible ? <Eye /> : <EyeOff />}
            </button>

            <span>{part.name}</span>

            {/* Color picker button */}
            <button onClick={() => setShowColorPicker(part.id)}>
              <div style={{ backgroundColor: part.color }} />
            </button>
          </div>

          {/* Color picker modal */}
          {showColorPicker === part.id && (
            <div className="color-picker">
              <input
                type="color"
                value={part.color}
                onChange={(e) => updateColor(part.id, e.target.value)}
              />
              {/* Preset colors grid */}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

### 3. ViewerDesigner Integration (src/pages/ViewerDesigner.tsx)

**PARÇA SİSTEMİNİ BAĞLAMA:**

```typescript
export default function ViewerDesigner() {
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [partColors, setPartColors] = useState<Record<string, string>>({});

  const handlePartSelect = (partId: string) => {
    setSelectedPartId(partId);
  };

  const handlePartUpdate = (partId: string, updates: { color?: string }) => {
    if (updates.color) {
      setPartColors(prev => ({ ...prev, [partId]: updates.color! }));
    }
  };

  const tabs = [
    { id: 'parts', label: 'Parçalar', icon: '🧩' },
    { id: 'scene', label: 'Sahne', icon: '🌅' },
    // ...
  ];

  return (
    <div className="grid grid-cols-12">
      {/* Left Panel */}
      <div className="col-span-3">
        {activeTab === 'parts' && (
          <PartsTab
            projectId={projectId}
            onPartSelect={handlePartSelect}
            onPartUpdate={handlePartUpdate}
            selectedPartId={selectedPartId}
          />
        )}
        {/* Other tabs */}
      </div>

      {/* 3D Viewer */}
      <div className="col-span-9">
        <ModelViewer
          src={project.glb_url}
          poster={project.poster_url}
          config={config}
          selectedPartId={selectedPartId}
          partColors={partColors}
          onPartClick={handlePartSelect}
        />
      </div>
    </div>
  );
}
```

## Supabase Client Kullanımı

### Authentication
```typescript
import { supabase } from './lib/supabase';

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Get session
const { data: { session } } = await supabase.auth.getSession();

// Sign out
await supabase.auth.signOut();
```

### Database Queries
```typescript
// Select with RLS
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('user_id', user.id)
  .is('deleted_at', null)
  .order('created_at', { ascending: false });

// Insert
const { data, error } = await supabase
  .from('projects')
  .insert({
    user_id: user.id,
    name: 'My Project',
    original_format: 'glb',
    status: 'processing'
  })
  .select()
  .single();

// Update
const { error } = await supabase
  .from('projects')
  .update({ status: 'completed' })
  .eq('id', projectId);

// ALWAYS use .maybeSingle() instead of .single() when expecting 0-1 rows
const { data, error } = await supabase
  .from('viewer_configs')
  .select('*')
  .eq('project_id', projectId)
  .maybeSingle(); // Won't throw error if no rows
```

### Storage
```typescript
// Upload
const { error } = await supabase.storage
  .from('uploads')
  .upload(`${userId}/${projectId}/model.glb`, file, {
    cacheControl: '3600',
    upsert: false
  });

// Download
const { data, error } = await supabase.storage
  .from('uploads')
  .download(path);

// Get public URL
const { data } = supabase.storage
  .from('models')
  .getPublicUrl(path);
```

## Edge Functions

### convert-3d-model Function

**SORUN:** Harici API (api.gltf.report) 404 veriyor.

**MEVCUT ÇÖZÜM:** Alternatif API'ler deneniyor:
```typescript
const alternativeApis = [
  'https://convert.gltf.report/v2/convert',
  'https://api.gltf-transform.dev/v1/convert'
];
```

**GEÇİCİ ÇÖZÜM:**
- GLB dosyaları direkt kullanılıyor
- GLTF dosyaları manuel olarak GLB'ye dönüştürülüyor
- OBJ ve diğer formatlar için çalışan ücretsiz API bulunamadı

**DAHA İYİ ÇÖZÜM ÖNERİSİ:**
1. Kullanıcıdan sadece GLB/GLTF formatı isteyin
2. Veya assimp/three.js kullanarak Deno Edge Function'da dönüştürme yapın
3. Veya Python mikroservis oluşturun (trimesh, pymeshlab)

## Önemli Notlar

### 1. Row Level Security (RLS)
TÜM tablolarda RLS aktif! Her tablo için politikalar var:
```sql
-- Example
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

### 2. Environment Variables
`.env` dosyasında:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. TypeScript Types
`src/lib/supabase.ts` dosyasında tüm tipler tanımlı:
```typescript
export type Project = {
  id: string;
  user_id: string;
  name: string;
  original_filename: string;
  original_format: string;
  glb_url: string | null;
  poster_url: string | null;
  file_size: number;
  triangle_count: number | null;
  vertex_count: number | null;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  error_message: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};
```

### 4. Model-Viewer Attributes
```html
<model-viewer
  src="model.glb"
  camera-controls          // Mouse/touch controls
  auto-rotate             // Auto rotation
  auto-rotate-delay="0"   // Start immediately
  rotation-per-second="30deg"
  disable-zoom={false}
  disable-pan={false}
  shadow-intensity="0.5"
  exposure="1"
  environment-image="neutral"
  ar                      // AR mode
  ar-modes="webxr scene-viewer quick-look"
/>
```

## Bilinen Sorunlar ve Çözümleri

### 1. OBJ Dönüştürme Çalışmıyor
**Sorun:** Harici conversion API 404 veriyor
**Geçici Çözüm:** GLB/GLTF kullanın
**Kalıcı Çözüm:** Alternatif dönüştürme servisi entegre edin

### 2. Parça Seçimi Çalışmıyorsa
**Kontrol edin:**
- Model GLB formatında mı?
- Model birden fazla mesh içeriyor mu?
- Browser console'da hata var mı?
- `viewer.model.materials` array'i dolu mu?

**Debug:**
```typescript
viewer.addEventListener('load', () => {
  console.log('Materials:', viewer.model.materials.length);
  console.log('Meshes:', viewer.model.scene.children);
});
```

### 3. Renkler Uygulanmıyorsa
**Kontrol edin:**
- `partColors` state'i doğru güncellenmiş mi?
- `useEffect` dependencies doğru mu?
- PBR material'de baseColorFactor değiştirilebiliyor mu?

### 4. Database RLS Hataları
**Sorun:** "Row level security policy violated"
**Çözüm:**
- `auth.uid()` doğru kullanıcı ID'sini döndürüyor mu?
- Policy'ler doğru yazılmış mı?
- Service role key yerine anon key kullanıyor musunuz?

## Geliştirme Komutları

```bash
# Development
npm run dev

# Build
npm run build

# Type check
npm run typecheck

# Lint
npm run lint
```

## Stil ve Tasarım Kuralları

### Tailwind Classes
- Dark theme: `bg-slate-950`, `bg-slate-900`, `bg-slate-800`
- Primary color: `emerald-500`, `emerald-400`
- Secondary: `cyan-500`
- Borders: `border-slate-800`, `border-slate-700`
- Text: `text-white`, `text-slate-300`, `text-slate-400`

### Component Structure
```tsx
export default function Component() {
  // 1. Hooks
  const [state, setState] = useState();

  // 2. Effects
  useEffect(() => {}, []);

  // 3. Handlers
  const handleClick = () => {};

  // 4. Render
  return <div></div>;
}
```

## Test Senaryoları

### 1. Parça Seçimi Testi
1. ViewerDesigner'a git
2. "Parçalar" sekmesine tıkla
3. Listeden bir parça seç → Yeşil highlight olmalı
4. 3D model üzerine tıkla → İlgili parça seçilmeli
5. Renk butonuna tıkla → Color picker açılmalı
6. Renk seç → Model üzerinde anında değişmeli

### 2. Model Yükleme Testi
1. Dashboard'da "Yeni Proje" tıkla
2. GLB dosyası yükle
3. Progress bar gösterilmeli
4. Tamamlandığında dashboard'da görünmeli
5. Thumbnail ve stats doğru olmalı

### 3. Materyal Testi
1. Designer → Materyaller
2. Kütüphane materyali seç
3. Roughness/Metalness değiştir
4. Model üzerinde değişiklik görülmeli

## API Endpoints (Edge Functions)

### POST /functions/v1/convert-3d-model
```typescript
// Request
{
  projectId: string;
  originalFormat: string;
  uploadPath: string;
}

// Response
{
  success: boolean;
  glbUrl: string;
  posterUrl: string;
  stats: {
    triangleCount: number;
    vertexCount: number;
    boundingBox: object;
  }
}

// Headers
Authorization: Bearer <access_token>
Content-Type: application/json
```

## En İyi Pratikler

1. **Her zaman `.maybeSingle()` kullan** tek satır beklerken
2. **RLS policy'leri test et** her yeni tablo için
3. **TypeScript tipleri kullan** her yerde
4. **Error handling** her async işlemde
5. **Loading states** her veri çekme işleminde
6. **Cleanup functions** useEffect'lerde
7. **Memoization** gereksiz render'ları önlemek için
8. **Supabase client singleton** olarak kullan

## Hızlı Başvuru Komutları

```typescript
// Supabase imports
import { supabase } from './lib/supabase';
import { useAuth } from './contexts/AuthContext';

// Auth
const { user, profile } = useAuth();

// Query
const { data, error } = await supabase
  .from('table')
  .select('*')
  .eq('user_id', user.id)
  .maybeSingle();

// Insert
const { data, error } = await supabase
  .from('table')
  .insert({ ...data })
  .select()
  .single();

// Update
await supabase
  .from('table')
  .update({ field: value })
  .eq('id', id);

// Delete (soft)
await supabase
  .from('table')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', id);
```

---

Bu doküman projenin tüm kritik bilgilerini içeriyor. Cursor AI ile geliştirirken bu talimatları referans alın.
