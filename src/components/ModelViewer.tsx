import { useEffect, useRef } from 'react';
import { ViewerConfig } from '../lib/supabase';

type ModelViewerProps = {
  src: string;
  poster?: string;
  config: ViewerConfig['config'];
  selectedPartId?: string | null;
  partColors?: Record<string, string>;
  onPartClick?: (partId: string) => void;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

export default function ModelViewer({ src, poster, config, selectedPartId, partColors, onPartClick }: ModelViewerProps) {
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const handleLoad = () => {
      console.log('Model loaded successfully');

      if (viewer.model && partColors) {
        try {
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
        } catch (error) {
          console.error('Error applying part colors:', error);
        }
      }
    };

    const handleError = (event: any) => {
      console.error('Model loading error:', event);
    };

    const handleClick = (event: any) => {
      if (!onPartClick || !viewer.model) return;

      const modelIntersection = event.detail.intersection;
      if (modelIntersection) {
        try {
          const material = modelIntersection.material;
          if (material && viewer.model.materials) {
            const materialIndex = viewer.model.materials.indexOf(material);
            if (materialIndex >= 0) {
              const partId = `part_${materialIndex + 1}`;
              onPartClick(partId);
            }
          }
        } catch (error) {
          console.error('Error handling part click:', error);
        }
      }
    };

    viewer.addEventListener('load', handleLoad);
    viewer.addEventListener('error', handleError);
    viewer.addEventListener('click', handleClick);

    try {
      if (config.camera?.autoRotate) {
        viewer.setAttribute('auto-rotate', '');
        viewer.setAttribute('auto-rotate-delay', '0');
        if (config.camera.autoRotateSpeed) {
          viewer.setAttribute('rotation-per-second', `${config.camera.autoRotateSpeed * 30}deg`);
        }
      } else {
        viewer.removeAttribute('auto-rotate');
      }

      if (config.scene?.exposure !== undefined) {
        viewer.setAttribute('exposure', config.scene.exposure.toString());
      }

      if (config.scene?.shadowIntensity !== undefined) {
        viewer.setAttribute('shadow-intensity', config.scene.shadowIntensity.toString());
      }

      if (config.scene?.environmentImage && config.scene.environmentImage !== 'none') {
        viewer.setAttribute('environment-image', 'neutral');
      } else {
        viewer.removeAttribute('environment-image');
      }

      if (config.camera?.fieldOfView) {
        viewer.setAttribute('field-of-view', `${config.camera.fieldOfView}deg`);
      }

      if (config.camera?.minDistance || config.camera?.maxDistance) {
        if (config.camera.minDistance) {
          viewer.setAttribute('min-camera-orbit', `auto auto ${config.camera.minDistance}m`);
        }
        if (config.camera.maxDistance) {
          viewer.setAttribute('max-camera-orbit', `auto auto ${config.camera.maxDistance}m`);
        }
      }
    } catch (error) {
      console.error('Config application error:', error);
    }

    return () => {
      if (viewer) {
        viewer.removeEventListener('load', handleLoad);
        viewer.removeEventListener('error', handleError);
        viewer.removeEventListener('click', handleClick);
      }
    };
  }, [config, src, partColors, selectedPartId, onPartClick]);

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
      disable-zoom={config.camera?.disableZoom ? true : false}
      disable-pan={config.camera?.disablePan ? true : false}
      ar={arModes.length > 0 ? true : undefined}
      ar-modes={arModes.length > 0 ? arModes.join(' ') : undefined}
      shadow-intensity={config.scene?.shadowIntensity !== undefined ? config.scene.shadowIntensity : 0.5}
      exposure={config.scene?.exposure !== undefined ? config.scene.exposure : 1}
      camera-orbit={config.camera?.orbit || 'auto auto auto'}
      animation-name={config.scene?.animationName || undefined}
      autoplay={config.scene?.autoplay ? true : undefined}
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
