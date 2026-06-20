/**
 * Mounts a PixiJS v8 Application inside React and hands the live `app` to a
 * scene-builder callback. PixiJS v8 init is async, so we guard against unmount
 * races and double-init under React StrictMode.
 */
import { useEffect, useRef } from 'react';
import { Application } from 'pixi.js';
import { colors, hexToPixi } from '@morpho/shared';

export interface PixiStageProps {
  /** Build the scene once the app is ready. Return a cleanup fn if needed. */
  onReady: (app: Application) => void | (() => void);
  className?: string;
}

export function PixiStage({ onReady, className }: PixiStageProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let app: Application | null = null;
    let disposed = false;
    let sceneCleanup: void | (() => void);

    const app_ = new Application();
    app = app_;
    app_
      .init({
        background: hexToPixi(colors.bgDeep),
        resizeTo: host,
        antialias: false,
        roundPixels: true,
        autoDensity: true,
        resolution: window.devicePixelRatio || 1,
      })
      .then(() => {
        if (disposed) {
          app_.destroy(true);
          return;
        }
        host.appendChild(app_.canvas);
        sceneCleanup = onReady(app_);
      });

    return () => {
      disposed = true;
      if (typeof sceneCleanup === 'function') sceneCleanup();
      if (app && app.renderer) {
        app.destroy(true, { children: true });
      }
    };
    // onReady is intentionally not a dep — the stage owns one app for its life.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={hostRef} className={className} style={{ inset: 0, position: 'absolute' }} />;
}
