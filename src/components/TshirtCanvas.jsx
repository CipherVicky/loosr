import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default function TshirtCanvas({
  scrollProgress,
  colorTint = null,
  isAutoSpin = false,
  autoSpinSpeed = 0.01,
  onLoaded = () => {},
}) {
  const mountRef = useRef(null);
  const modelRef = useRef(null);
  const originalColorRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // Mouse drag / hover interaction
  const mouseRef = useRef({ x: 0, y: 0, isDragging: false, lastX: 0, manualOffset: 0 });
  const autoSpinAngleRef = useRef(0);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 450;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup - optimized for 16:9 widescreen framing
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.3);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 4. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.3);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
    fillLight.position.set(-4, 2, 4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 2.0);
    rimLight.position.set(0, 4, -5);
    scene.add(rimLight);

    const accentLight = new THREE.DirectionalLight(0xd7ff36, 0.6);
    accentLight.position.set(-3, -2, -2);
    scene.add(accentLight);

    // 5. Pivot group for centering and rotation
    const pivot = new THREE.Group();
    scene.add(pivot);

    // 6. Load GLB Model
    const loader = new GLTFLoader();
    loader.load(
      '/models/t-shirt.glb',
      (gltf) => {
        const model = gltf.scene;

        // Auto-compute bounding box to center & normalize scale
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Center the geometry around (0, 0, 0)
        model.position.x = -center.x;
        model.position.y = -center.y;
        model.position.z = -center.z;

        // Scale model to comfortably fill 16:9 viewport
        const maxDim = Math.max(size.x, size.y, size.z);
        const desiredSize = 2.3;
        const scale = desiredSize / maxDim;
        pivot.scale.setScalar(scale);

        // Adjust materials for photorealistic soft cotton look
        model.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.roughness = 0.85;
            child.material.metalness = 0.05;
            child.material.side = THREE.DoubleSide;
            if (!originalColorRef.current && child.material.color) {
              originalColorRef.current = child.material.color.clone();
            }
          }
        });

        pivot.add(model);
        modelRef.current = { pivot, model };
        setLoading(false);
        onLoaded();
      },
      undefined,
      (error) => {
        console.error('Error loading 3D GLB model:', error);
        setLoading(false);
      }
    );

    // 7. Mouse drag handlers to allow manual spin inspection
    const handleMouseDown = (e) => {
      mouseRef.current.isDragging = true;
      mouseRef.current.lastX = e.clientX;
    };

    const handleMouseMove = (e) => {
      if (mouseRef.current.isDragging) {
        const deltaX = e.clientX - mouseRef.current.lastX;
        mouseRef.current.manualOffset += deltaX * 0.01;
        mouseRef.current.lastX = e.clientX;
      } else {
        const rect = container.getBoundingClientRect();
        mouseRef.current.x = (e.clientX - rect.left) / rect.width - 0.5;
        mouseRef.current.y = (e.clientY - rect.top) / rect.height - 0.5;
      }
    };

    const handleMouseUp = () => {
      mouseRef.current.isDragging = false;
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Touch support for mobile / touchpads
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        mouseRef.current.isDragging = true;
        mouseRef.current.lastX = e.touches[0].clientX;
      }
    };

    const handleTouchMove = (e) => {
      if (mouseRef.current.isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - mouseRef.current.lastX;
        mouseRef.current.manualOffset += deltaX * 0.012;
        mouseRef.current.lastX = e.touches[0].clientX;
      }
    };

    const handleTouchEnd = () => {
      mouseRef.current.isDragging = false;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // 8. Animation & Render Loop
    let animationFrameId;
    let currentRotY = 0;
    let currentRotX = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (modelRef.current) {
        let scrollRotY = 0;
        if (isAutoSpin) {
          autoSpinAngleRef.current += autoSpinSpeed;
          scrollRotY = autoSpinAngleRef.current;
        } else if (scrollProgress) {
          scrollRotY = scrollProgress.get() * Math.PI * 2;
        }

        const targetRotY = scrollRotY + mouseRef.current.manualOffset + (mouseRef.current.x * 0.4);
        const targetRotX = (mouseRef.current.y * 0.3);

        currentRotY += (targetRotY - currentRotY) * 0.08;
        currentRotX += (targetRotX - currentRotX) * 0.08;

        modelRef.current.pivot.rotation.y = currentRotY;
        modelRef.current.pivot.rotation.x = currentRotX;

        // Subtle dynamic floating bob
        modelRef.current.pivot.position.y = Math.sin(Date.now() * 0.0015) * 0.04;
      }

      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize Observer for exact 16:9 responsive scaling
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isAutoSpin, autoSpinSpeed]);

  // Handle color tinting when user selects a colorway
  useEffect(() => {
    if (!modelRef.current) return;
    modelRef.current.model.traverse((child) => {
      if (child.isMesh && child.material) {
        if (colorTint) {
          child.material.color = new THREE.Color(colorTint);
        } else if (originalColorRef.current) {
          child.material.color = originalColorRef.current.clone();
        }
      }
    });
  }, [colorTint]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* 3D Canvas Mount Point */}
      <div
        ref={mountRef}
        className="w-full h-full min-h-[360px] cursor-grab active:cursor-grabbing flex items-center justify-center relative z-10"
      />

      {/* Loading Spinner */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-paper/70 backdrop-blur-sm z-20 pointer-events-none">
          <div className="w-10 h-10 border-2 border-line border-t-ink rounded-full animate-spin" />
          <span className="text-[10px] font-black tracking-widest uppercase text-ink">
            LOADING REAL 3D MESH (GLB)...
          </span>
        </div>
      )}
    </div>
  );
}
