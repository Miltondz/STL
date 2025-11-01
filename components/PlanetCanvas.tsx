import React, { useEffect, useRef } from 'react';
import { createCamera } from '../vendor/pixelplanets/camera.js';
import { createClock, createScene, createWebGlRenderer } from '../vendor/pixelplanets/Three.js';
import { generatePlanetByType } from '../vendor/pixelplanets/utils.js';

interface PlanetCanvasProps {
  type?: 'Earth Planet';
  seed: number;
  className?: string;
}

// Animated pixel planet canvas with transparent background
export const PlanetCanvas: React.FC<PlanetCanvasProps> = ({ type = 'Earth Planet', seed, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<ReturnType<typeof createWebGlRenderer> | null>(null);
  const planetGroupRef = useRef<any>(null);
  const stopRef = useRef<() => void>();

  useEffect(() => {
    const el = containerRef.current!;
    const scene = createScene();
    const clock = createClock();
    const aspect = el.clientWidth / el.clientHeight;
    const camera = createCamera(75, aspect, 0.1, 1000);
    camera.position.z = 1;

    const renderer = createWebGlRenderer();
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;
    el.appendChild(renderer.domElement);

    const planet = generatePlanetByType(type);
    planetGroupRef.current = planet;
    scene.add(planet);

    // Apply seed to all layers that support it
    planet.children?.forEach((layer: any) => {
      const uniforms = layer?.material?.uniforms;
      if (uniforms) {
        if (uniforms['seed']) uniforms['seed'].value = seed % 1000;
        if (uniforms['time_speed']) uniforms['time_speed'].value = 0.05; // slow spin
      }
    });

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      planet.children?.forEach((layer: any) => {
        const uniforms = layer?.material?.uniforms;
        if (uniforms && uniforms['time']) uniforms['time'].value = t;
      });
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!rendererRef.current) return;
      const w = el.clientWidth, h = el.clientHeight;
      rendererRef.current.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(el);

    stopRef.current = () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      el.innerHTML = '';
    };

    return () => stopRef.current?.();
  }, [type, seed]);

  return <div ref={containerRef} className={className} />;
};
