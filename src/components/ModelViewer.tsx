import { useEffect, useRef } from 'react';
import { ViewerConfig } from '../lib/supabase';

type ModelViewerProps = {
  src: string;
  poster?: string;
  config: ViewerConfig['config'];
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

export default function ModelViewer({ src, poster, config }: ModelViewerProps) {
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const handleLoad = () => {
      console.log('Model loaded successfully:', src);
    };

    const handleError = (event: any) => {
      console.error('Model viewer error:', event.detail || event);
    };

    viewer.addEventListener('load', handleLoad);
    viewer.addEventListener('error', handleError);

    if (config.camera?.autoRotate) {
      viewer.setAttribute('auto-rotate', '');
      if (config.camera.autoRotateSpeed) {
        viewer.setAttribute('auto-rotate-delay', '0');
      }
    } else {
      viewer.removeAttribute('auto-rotate');
    }

    if (config.scene?.exposure) {
      viewer.setAttribute('exposure', config.scene.exposure.toString());
    }

    if (config.scene?.shadowIntensity !== undefined) {
      viewer.setAttribute('shadow-intensity', config.scene.shadowIntensity.toString());
    }

    if (config.scene?.environmentImage && config.scene.environmentImage !== 'none') {
      viewer.setAttribute('environment-image', 'neutral');
    }

    return () => {
      viewer.removeEventListener('load', handleLoad);
      viewer.removeEventListener('error', handleError);
    };
  }, [config, src]);

  const arModes = [];
  if (config.ar?.quickLook) arModes.push('quick-look');
  if (config.ar?.sceneViewer) arModes.push('scene-viewer');
  if (config.ar?.webXR) arModes.push('webxr');

  const backgroundColor = config.scene?.background || '#1e293b';

  return (
    <model-viewer
      ref={viewerRef}
      src={src}
      poster={poster}
      alt="3D Model"
      camera-controls
      touch-action="pan-y"
      disable-zoom={false}
      ar={arModes.length > 0 ? true : undefined}
      ar-modes={arModes.length > 0 ? arModes.join(' ') : undefined}
      shadow-intensity={config.scene?.shadowIntensity || 0.5}
      exposure={config.scene?.exposure || 1}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: backgroundColor,
        borderRadius: '1rem',
      }}
      environment-image="neutral"
      skybox-image={config.scene?.environmentImage && config.scene.environmentImage !== 'none' ? 'neutral' : undefined}
    />
  );
}
