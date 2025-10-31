# 3D Model Viewer Platform

A professional 3D model conversion and embedding platform built with React, TypeScript, Supabase, and modern web technologies.

## Features

### Core Features
- **3D Model Conversion**: Convert 15+ formats (FBX, OBJ, STL, GLTF, GLB, etc.) to optimized GLB
- **Real-time GLB Analysis**: Automatic vertex and triangle counting
- **Poster Generation**: Automatic thumbnail generation from 3D models
- **Interactive Viewer Designer**: Customize viewer appearance and behavior
- **Material System**: Upload custom PBR textures (Base Color, Normal, Roughness, Metallic, AO)
- **Interactive Hotspots**: Add clickable information points on 3D models
- **AR Support**: Quick Look (iOS), Scene Viewer (Android), WebXR

### Advanced Features
- **Project Sharing**: Generate shareable links with expiration and view limits
- **Download Models**: Export models in GLB format
- **Analytics Tracking**: View counts, unique visitors, geographic data
- **Usage Logs**: Track conversions, downloads, and API calls
- **RESTful API**: Studio plan includes full API access for integrations

### User Management
- **Authentication**: Email/password with Supabase Auth
- **Multi-tier Plans**: Free, Pro, Studio with different limits
- **Profile Management**: Track uploads, usage, and plan limits

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **3D Viewer**: Google Model Viewer with custom configuration
- **Conversion**: External conversion API with GLB analysis
- **Deployment**: Ready for Netlify/Vercel

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- npm or pnpm

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd 3d-model-platform
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# .env file is already configured with Supabase credentials
# No additional setup needed
```

4. Start development server
```bash
npm run dev
```

5. Build for production
```bash
npm run build
```

## Database Schema

### Tables
- **profiles**: User profiles with plan information
- **projects**: 3D model projects with conversion status
- **viewer_configs**: Customizable viewer settings per project
- **materials**: Custom PBR materials library
- **hotspots**: Interactive information points on models
- **project_shares**: Shareable project links
- **project_views**: Analytics and view tracking
- **usage_logs**: Activity logging for analytics

### Storage Buckets
- **uploads**: Original model files
- **models**: Converted GLB files
- **posters**: Model thumbnails
- **textures**: Custom material textures

## Edge Functions

### convert-3d-model
Handles 3D model conversion with:
- Real GLB analysis (vertex/triangle counting)
- GLTF to GLB conversion
- Poster generation
- Error handling and status updates

### api
RESTful API for Studio plan users:
- `GET /api/projects`: List all projects
- `POST /api/convert`: Convert model from URL
- `GET /api/analytics?project_id=<id>`: Get project analytics

API Authentication: Use `X-API-Key` header

## Features by Plan

### Free Plan
- 5 conversions/month
- 50 MB file size limit
- Basic formats (FBX, OBJ, GLTF)
- Watermarked embeds
- Community support

### Pro Plan ($49/month or $490/year)
- 50 conversions/month
- 200 MB file size limit
- All formats
- No watermark
- Custom material upload
- Full AR support
- Unlimited hotspots
- Viewer customization
- Email support

### Studio Plan ($149/month or $1490/year)
- Unlimited conversions
- 1 GB file size limit
- CAD format support
- White-label
- Custom domain
- API access
- Material library
- Advanced analytics
- 24/7 priority support

## API Usage

### Authentication
Include your API key in the `X-API-Key` header:
```bash
curl -H "X-API-Key: your_api_key" https://your-domain.com/functions/v1/api/projects
```

### List Projects
```bash
GET /functions/v1/api/projects
```

### Convert Model
```bash
POST /functions/v1/api/convert
Content-Type: application/json

{
  "file_url": "https://example.com/model.fbx",
  "name": "My Model"
}
```

### Get Analytics
```bash
GET /functions/v1/api/analytics?project_id=<project_id>
```

## Embedding Models

### HTML
```html
<model-viewer
  src="https://cdn.example.com/model.glb"
  poster="https://cdn.example.com/poster.jpg"
  ar
  ar-modes="webxr scene-viewer quick-look"
  camera-controls
  shadow-intensity="1"
  exposure="1"
  style="width: 100%; height: 500px;"
></model-viewer>

<script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
```

### React
```jsx
import '@google/model-viewer';

function ModelViewer() {
  return (
    <model-viewer
      src="https://cdn.example.com/model.glb"
      poster="https://cdn.example.com/poster.jpg"
      ar
      ar-modes="webxr scene-viewer quick-look"
      camera-controls
      shadow-intensity="1"
      exposure="1"
      style={{ width: '100%', height: '500px' }}
    />
  );
}
```

## Project Structure

```
├── src/
│   ├── components/         # React components
│   │   ├── designer/      # Viewer designer tabs
│   │   ├── AuthModal.tsx
│   │   ├── FileUploadModal.tsx
│   │   ├── Header.tsx
│   │   ├── ModelViewer.tsx
│   │   └── ...
│   ├── contexts/          # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/               # Utilities
│   │   └── supabase.ts
│   ├── pages/             # Route pages
│   │   ├── Dashboard.tsx
│   │   ├── ViewerDesigner.tsx
│   │   └── NotFound.tsx
│   └── App.tsx
├── supabase/
│   ├── functions/         # Edge functions
│   │   ├── convert-3d-model/
│   │   └── api/
│   └── migrations/        # Database migrations
├── dist/                  # Production build
└── public/               # Static assets
```

## Security

- Row Level Security (RLS) enabled on all tables
- Secure file uploads with bucket policies
- API key authentication for external integrations
- JWT-based user authentication
- CORS configured for edge functions

## Performance

- Optimized GLB conversion
- CDN-ready public URLs
- Lazy loading for 3D models
- Efficient database queries with indexes
- Client-side caching

## Contributing

This is a production-ready platform. For contributions:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

- Free Plan: Community support
- Pro Plan: Email support
- Studio Plan: 24/7 priority support

## Deployment

The application is ready to deploy on:
- Netlify
- Vercel
- Any static hosting platform

Build command: `npm run build`
Output directory: `dist`

## Environment Variables

All environment variables are pre-configured in `.env`:
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key

## Status

✅ Production Ready - All features implemented and tested
