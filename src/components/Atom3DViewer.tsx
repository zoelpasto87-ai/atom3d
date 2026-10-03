import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { ChemicalElement } from '../types/element';
import { calculateAtomicStructure, getShellDetails } from '../utils/chemistry';
import { CATEGORIES } from '../utils/categories';
import { SHELL_NAMES } from '../data/elements';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  Layers,
  Sparkles,
  Info,
  Atom,
  CheckSquare,
  Square,
  X,
  Disc,
  CircleDot,
  CheckCircle2,
} from 'lucide-react';

interface Atom3DViewerProps {
  element: ChemicalElement;
  heightClass?: string;
  onOpenAR?: () => void;
}

interface SelectedElectronData {
  shellLetter: string;
  shellIndex: number;
  electronCount: number;
  isValence: boolean;
  electronIndex: number;
}

// Helper to create crisp 3D text sprite for shell labels (K, L, M...)
function createShellSprite(text: string, color: string = '#38bdf8'): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    // rounded rectangle if supported, else fallback to standard rect
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(4, 4, 248, 56, 14);
    } else {
      ctx.rect(4, 4, 248, 56);
    }
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 28px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 32);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0.95,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(2.4, 0.6, 1);
  return sprite;
}

export const Atom3DViewer: React.FC<Atom3DViewerProps> = ({
  element,
  heightClass = 'h-[340px] sm:h-[400px] md:h-[460px]',
  onOpenAR,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const atomGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Dynamic electron animation tracking
  const electronObjectsRef = useRef<
    Array<{
      mesh: THREE.Mesh;
      radius: number;
      speed: number;
      angle: number;
      tiltX: number;
      tiltZ: number;
      isValence: boolean;
      shellIndex: number;
      shellLetter: string;
      electronCount: number;
      electronIndex: number;
    }>
  >([]);

  // Interactive controls state (Phase 3 Requirements)
  const [modelType, setModelType] = useState<'3d' | 'bohr'>('3d');
  const [showOrbits, setShowOrbits] = useState<boolean>(true);
  const [showElectrons, setShowElectrons] = useState<boolean>(true);
  const [showShellLabels, setShowShellLabels] = useState<boolean>(true);
  const [highlightValence, setHighlightValence] = useState<boolean>(true);
  const [isAnimating, setIsAnimating] = useState<boolean>(true); // Animation toggle
  const [isRotating, setIsRotating] = useState<boolean>(true); // Auto-rotation toggle
  const [selectedShell, setSelectedShell] = useState<string | null>(null); // Interactive shell filter
  const [selectedElectron, setSelectedElectron] = useState<SelectedElectronData | null>(null);
  const [webglError, setWebglError] = useState<string | null>(null);

  const structure = calculateAtomicStructure(element);
  const shellDetails = useMemo(() => getShellDetails(element.electronShells), [element.electronShells]);
  const catInfo = CATEGORIES[element.category];

  // Mouse & Touch interaction state refs
  const isPointerDownRef = useRef<boolean>(false);
  const pointerDownPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const previousPointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pinchDistRef = useRef<number | null>(null);
  const hasMovedSignificantlyRef = useRef<boolean>(false);

  // Setup / Rebuild Atom in Scene
  const buildAtomScene = useCallback(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Clean up existing atom group
    if (atomGroupRef.current) {
      scene.remove(atomGroupRef.current);
      atomGroupRef.current.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Sprite) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => {
              if ('map' in m && m.map) m.map.dispose();
              m.dispose();
            });
          } else if (obj.material) {
            if ('map' in obj.material && obj.material.map) obj.material.map.dispose();
            obj.material.dispose();
          }
        }
      });
    }

    electronObjectsRef.current = [];
    const atomGroup = new THREE.Group();
    atomGroupRef.current = atomGroup;

    const atomicNum = element.atomicNumber;
    const neutronCount = structure.neutrons;
    const shells = element.electronShells;
    const numShells = shells.length;

    // Shared sphere geometries for high performance
    const protonGeo = new THREE.SphereGeometry(0.38, 16, 16);
    const neutronGeo = new THREE.SphereGeometry(0.36, 16, 16);
    const electronGeo = new THREE.SphereGeometry(0.24, 16, 16);
    const valenceElectronGeo = new THREE.SphereGeometry(0.32, 16, 16);

    const protonMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0x991b1b,
      emissiveIntensity: 0.35,
      roughness: 0.3,
      metalness: 0.2,
    });

    const neutronMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.4,
      metalness: 0.1,
    });

    const electronMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.4,
    });

    const valenceMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.95,
      roughness: 0.2,
      metalness: 0.4,
    });

    const selectedElectronMat = new THREE.MeshStandardMaterial({
      color: 0xec4899,
      emissive: 0xdb2777,
      emissiveIntensity: 1.2,
      roughness: 0.1,
      metalness: 0.5,
    });

    // 1. NUCLEUS (Protons + Neutrons clustered in center)
    const nucleusGroup = new THREE.Group();

    // Representative cluster capped for mobile performance
    const maxDisplayedNucleons = 46;
    const totalActualNucleons = atomicNum + neutronCount;
    const scaleFactor =
      totalActualNucleons > maxDisplayedNucleons
        ? maxDisplayedNucleons / totalActualNucleons
        : 1;

    const displayProtons = Math.max(1, Math.round(atomicNum * scaleFactor));
    const displayNeutrons = Math.max(
      totalActualNucleons > 1 ? 1 : 0,
      Math.round(neutronCount * scaleFactor)
    );

    const nucleons: Array<'proton' | 'neutron'> = [];
    for (let i = 0; i < displayProtons; i++) nucleons.push('proton');
    for (let i = 0; i < displayNeutrons; i++) nucleons.push('neutron');

    // Shuffle nucleons for natural interspersed packing
    for (let i = nucleons.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nucleons[i], nucleons[j]] = [nucleons[j], nucleons[i]];
    }

    const clusterRadiusBase = 0.55 * Math.cbrt(nucleons.length);
    nucleons.forEach((type, idx) => {
      const phi = Math.acos(1 - (2 * (idx + 0.5)) / nucleons.length);
      const theta = Math.PI * (1 + Math.sqrt(5)) * idx;
      const r = clusterRadiusBase * (0.6 + 0.4 * Math.cbrt((idx + 1) / nucleons.length));

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      const mesh = new THREE.Mesh(
        type === 'proton' ? protonGeo : neutronGeo,
        type === 'proton' ? protonMat : neutronMat
      );
      mesh.position.set(x, y, z);
      nucleusGroup.add(mesh);
    });

    // Soft central glow for nucleus
    const nucleusGlowGeo = new THREE.SphereGeometry(clusterRadiusBase * 1.15, 16, 16);
    const nucleusGlowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.12,
      wireframe: true,
    });
    nucleusGroup.add(new THREE.Mesh(nucleusGlowGeo, nucleusGlowMat));

    atomGroup.add(nucleusGroup);

    // 2. ELECTRON SHELLS & ORBITING ELECTRONS
    const baseRadius = Math.max(2.4, clusterRadiusBase + 1.6);
    const shellStep = 1.6;

    shells.forEach((electronCount, shellIdx) => {
      const shellLetter = SHELL_NAMES[shellIdx] || `N${shellIdx + 1}`;
      const shellRadius = baseRadius + shellIdx * shellStep;
      const isValence = shellIdx === numShells - 1;
      const isThisShellSelected = selectedShell === shellLetter;
      const isAnotherShellSelected = selectedShell !== null && !isThisShellSelected;

      // In Bohr mode, all orbits are aligned on flat plane (tilt=0)
      // In 3D mode, each shell has pleasant pedagogic multi-angle tilt
      const tiltX = modelType === 'bohr' ? 0 : (shellIdx * 0.38) % (Math.PI / 3);
      const tiltZ =
        modelType === 'bohr' ? 0 : ((shellIdx * 0.62) % (Math.PI / 4)) - 0.2;

      // A. Orbit Ring
      if (showOrbits) {
        const ringGeo = new THREE.TorusGeometry(
          shellRadius,
          isThisShellSelected ? 0.065 : 0.035,
          8,
          80
        );

        let ringColor = 0x334155;
        let ringOpacity = 0.45;

        if (isThisShellSelected) {
          ringColor = 0x06b6d4; // bright cyan
          ringOpacity = 0.95;
        } else if (isValence && highlightValence) {
          ringColor = 0xf59e0b; // amber
          ringOpacity = 0.85;
        }

        if (isAnotherShellSelected) {
          ringOpacity = 0.15;
        }

        const ringMat = new THREE.MeshBasicMaterial({
          color: ringColor,
          transparent: true,
          opacity: ringOpacity,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2 + tiltX;
        ringMesh.rotation.z = tiltZ;
        atomGroup.add(ringMesh);
      }

      // B. Shell 3D Labels (Requirement 10)
      if (showShellLabels) {
        const labelText = `${shellLetter} — ${electronCount} e⁻`;
        const labelColor = isThisShellSelected
          ? '#22d3ee'
          : isValence && highlightValence
          ? '#f59e0b'
          : '#94a3b8';

        const sprite = createShellSprite(labelText, labelColor);
        // Position sprite at perimeter of orbit
        const labelPos = new THREE.Vector3(shellRadius, 0, 0);
        labelPos.applyAxisAngle(new THREE.Vector3(1, 0, 0), tiltX);
        labelPos.applyAxisAngle(new THREE.Vector3(0, 0, 1), tiltZ);
        sprite.position.copy(labelPos);
        atomGroup.add(sprite);
      }

      // C. Electrons in this shell
      if (showElectrons) {
        for (let eIdx = 0; eIdx < electronCount; eIdx++) {
          const initialAngle = (2 * Math.PI * eIdx) / electronCount;
          const isHighlightThisValence = isValence && highlightValence;
          const isSpecificSelectedElectron =
            selectedElectron !== null &&
            selectedElectron.shellLetter === shellLetter &&
            selectedElectron.electronIndex === eIdx;

          let targetMat = isHighlightThisValence ? valenceMat : electronMat;
          if (isSpecificSelectedElectron) {
            targetMat = selectedElectronMat;
          }

          const eMesh = new THREE.Mesh(
            isHighlightThisValence || isThisShellSelected ? valenceElectronGeo : electronGeo,
            targetMat
          );

          // Tag mesh with metadata for Raycasting interaction
          eMesh.userData = {
            isElectron: true,
            shellLetter,
            shellIndex: shellIdx,
            electronCount,
            isValence,
            electronIndex: eIdx,
          };

          const x = shellRadius * Math.cos(initialAngle);
          const z = shellRadius * Math.sin(initialAngle);
          const pos = new THREE.Vector3(x, 0, z);

          pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), tiltX);
          pos.applyAxisAngle(new THREE.Vector3(0, 0, 1), tiltZ);
          eMesh.position.copy(pos);

          atomGroup.add(eMesh);

          // Register for animation & Raycasting
          electronObjectsRef.current.push({
            mesh: eMesh,
            radius: shellRadius,
            speed: (0.7 + (numShells - shellIdx) * 0.2) * (shellIdx % 2 === 0 ? 1 : -1),
            angle: initialAngle,
            tiltX,
            tiltZ,
            isValence,
            shellIndex: shellIdx,
            shellLetter,
            electronCount,
            electronIndex: eIdx,
          });
        }
      }
    });

    scene.add(atomGroup);

    // Adjust camera position based on total size of atom and mode
    if (cameraRef.current) {
      const maxRadius = baseRadius + (numShells - 1) * shellStep;
      const targetDist = Math.max(9, maxRadius * 2.3);

      if (modelType === 'bohr') {
        // Flat top-down/slight angle for Bohr concentric circles
        cameraRef.current.position.set(0, targetDist * 0.95, targetDist * 0.3);
      } else {
        // Perspective 3D angle
        cameraRef.current.position.set(0, maxRadius * 0.7, targetDist);
      }
      cameraRef.current.lookAt(0, 0, 0);
    }
  }, [
    element,
    structure,
    modelType,
    showOrbits,
    showElectrons,
    showShellLabels,
    highlightValence,
    selectedShell,
    selectedElectron,
  ]);

  // Reset Camera View
  const handleResetView = useCallback(() => {
    if (!cameraRef.current || !atomGroupRef.current) return;
    const numShells = element.electronShells.length;
    const baseRadius = 2.4;
    const shellStep = 1.6;
    const maxRadius = baseRadius + (numShells - 1) * shellStep;
    const targetDist = Math.max(9, maxRadius * 2.3);

    if (modelType === 'bohr') {
      cameraRef.current.position.set(0, targetDist * 0.95, targetDist * 0.3);
    } else {
      cameraRef.current.position.set(0, maxRadius * 0.7, targetDist);
    }
    cameraRef.current.lookAt(0, 0, 0);
    atomGroupRef.current.rotation.set(0, 0, 0);
  }, [element.electronShells.length, modelType]);

  // Zoom In / Out
  const handleZoom = useCallback((factor: number) => {
    if (!cameraRef.current) return;
    const cam = cameraRef.current;
    cam.position.multiplyScalar(factor);
    const dist = cam.position.length();
    if (dist < 3.5) cam.position.setLength(3.5);
    if (dist > 50) cam.position.setLength(50);
  }, []);

  // Initialize Three.js WebGL Engine
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'default',
      });
    } catch {
      setWebglError(
        'Perangkat ini tidak mendukung visualisasi 3D WebGL. Silakan gunakan browser modern yang mendukung WebGL.'
      );
      return;
    }

    rendererRef.current = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x020617, 1);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      1000
    );
    cameraRef.current = camera;
    camera.position.set(0, 5, 14);
    camera.lookAt(0, 0, 0);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(12, 18, 15);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.8);
    dirLight2.position.set(-12, -10, -10);
    scene.add(dirLight2);

    const centerPointLight = new THREE.PointLight(0x38bdf8, 1.2, 30);
    centerPointLight.position.set(0, 0, 0);
    scene.add(centerPointLight);

    // Build the visual atom
    buildAtomScene();

    // Raycaster for Electron Click/Tap (Requirement 5)
    const raycaster = new THREE.Raycaster();
    const mousePos = new THREE.Vector2();

    // Animation Loop
    let lastTime = performance.now();
    const animate = (currentTime: number) => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Slow auto-rotation of atom model if enabled (and not currently dragging)
      if (isRotating && atomGroupRef.current && !isPointerDownRef.current) {
        atomGroupRef.current.rotation.y += delta * 0.22;
      }

      // Revolution of electrons along their orbits (Animasi ON/OFF - Requirement 8)
      if (isAnimating && electronObjectsRef.current.length > 0) {
        electronObjectsRef.current.forEach((item) => {
          item.angle += delta * item.speed;
          const x = item.radius * Math.cos(item.angle);
          const z = item.radius * Math.sin(item.angle);
          const pos = new THREE.Vector3(x, 0, z);

          pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), item.tiltX);
          pos.applyAxisAngle(new THREE.Vector3(0, 0, 1), item.tiltZ);
          item.mesh.position.copy(pos);
        });
      }

      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // Responsive Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = width / height;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(width, height);
        }
      }
    });
    resizeObserver.observe(container);

    // Mouse & Touch Gestures on canvas
    const domEl = renderer.domElement;

    const onPointerDown = (e: PointerEvent) => {
      isPointerDownRef.current = true;
      pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
      previousPointerPosRef.current = { x: e.clientX, y: e.clientY };
      hasMovedSignificantlyRef.current = false;
      pinchDistRef.current = null;
      domEl.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isPointerDownRef.current || !atomGroupRef.current) return;
      const deltaX = e.clientX - previousPointerPosRef.current.x;
      const deltaY = e.clientY - previousPointerPosRef.current.y;
      previousPointerPosRef.current = { x: e.clientX, y: e.clientY };

      const totalDist = Math.hypot(
        e.clientX - pointerDownPosRef.current.x,
        e.clientY - pointerDownPosRef.current.y
      );
      if (totalDist > 5) {
        hasMovedSignificantlyRef.current = true;
      }

      atomGroupRef.current.rotation.y += deltaX * 0.008;
      atomGroupRef.current.rotation.x += deltaY * 0.008;
    };

    const onPointerUp = (e: PointerEvent) => {
      isPointerDownRef.current = false;
      pinchDistRef.current = null;
      try {
        domEl.releasePointerCapture?.(e.pointerId);
      } catch {
        // ignore
      }

      // If user tapped/clicked without dragging, raycast to select electron! (Requirement 5)
      if (!hasMovedSignificantlyRef.current && cameraRef.current) {
        const rect = domEl.getBoundingClientRect();
        mousePos.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mousePos.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mousePos, cameraRef.current);
        const electronMeshes = electronObjectsRef.current.map((item) => item.mesh);
        const intersects = raycaster.intersectObjects(electronMeshes, false);

        if (intersects.length > 0) {
          const hitMesh = intersects[0].object as THREE.Mesh;
          const hitData = electronObjectsRef.current.find((item) => item.mesh === hitMesh);
          if (hitData) {
            setSelectedElectron({
              shellLetter: hitData.shellLetter,
              shellIndex: hitData.shellIndex,
              electronCount: hitData.electronCount,
              isValence: hitData.isValence,
              electronIndex: hitData.electronIndex,
            });
            return;
          }
        }
      }
    };

    // Touch Pinch Zoom listener
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && cameraRef.current) {
        e.preventDefault(); // prevent parent scrolling during 2-finger pinch
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);

        if (pinchDistRef.current !== null) {
          const deltaDist = dist - pinchDistRef.current;
          if (Math.abs(deltaDist) > 1) {
            handleZoom(deltaDist > 0 ? 0.97 : 1.03);
          }
        }
        pinchDistRef.current = dist;
      }
    };

    const onTouchEnd = () => {
      pinchDistRef.current = null;
    };

    // Desktop Mouse Wheel Zoom
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      handleZoom(e.deltaY > 0 ? 1.08 : 0.92);
    };

    domEl.addEventListener('pointerdown', onPointerDown);
    domEl.addEventListener('pointermove', onPointerMove);
    domEl.addEventListener('pointerup', onPointerUp);
    domEl.addEventListener('pointercancel', onPointerUp);
    domEl.addEventListener('touchmove', onTouchMove, { passive: false });
    domEl.addEventListener('touchend', onTouchEnd);
    domEl.addEventListener('wheel', onWheel, { passive: false });

    // Cleanup when component unmounts
    return () => {
      resizeObserver.disconnect();
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      domEl.removeEventListener('pointerdown', onPointerDown);
      domEl.removeEventListener('pointermove', onPointerMove);
      domEl.removeEventListener('pointerup', onPointerUp);
      domEl.removeEventListener('pointercancel', onPointerUp);
      domEl.removeEventListener('touchmove', onTouchMove);
      domEl.removeEventListener('touchend', onTouchEnd);
      domEl.removeEventListener('wheel', onWheel);

      if (sceneRef.current) {
        sceneRef.current.traverse((obj) => {
          if (obj instanceof THREE.Mesh || obj instanceof THREE.Sprite) {
            obj.geometry?.dispose();
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => {
                if ('map' in m && m.map) m.map.dispose();
                m.dispose();
              });
            } else if (obj.material) {
              if ('map' in obj.material && obj.material.map) obj.material.map.dispose();
              obj.material.dispose();
            }
          }
        });
      }

      renderer.dispose();
      if (container.contains(domEl)) {
        container.removeChild(domEl);
      }
    };
  }, [buildAtomScene, handleZoom]);

  // Rebuild 3D objects whenever element or visual toggles change
  useEffect(() => {
    buildAtomScene();
  }, [buildAtomScene]);

  // Reset selected electron and shell when element changes
  useEffect(() => {
    setSelectedElectron(null);
    setSelectedShell(null);
  }, [element.atomicNumber]);

  if (webglError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-300">
        <Atom className="w-12 h-12 text-rose-400 mb-3" />
        <h4 className="text-base font-bold text-white mb-1">Dukungan WebGL Tidak Tersedia</h4>
        <p className="text-xs text-slate-400 max-w-md">{webglError}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-3xl bg-slate-950/95 border border-slate-800 overflow-hidden shadow-2xl space-y-3">
      {/* 1. HEADER INFORMASI (Requirement 11) */}
      <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              ATOM 3D
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {element.name} ({element.symbol})
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Nomor Atom: <strong className="text-cyan-400">{element.atomicNumber}</strong> • Golongan: {element.group ?? 'Lant/Akt'} • Periode: {element.period}
          </p>
        </div>

        {/* MODE VISUALISASI & AR BUTTON: [ BOHR ] [ 3D ] [ 🥽 Lihat dalam AR ] */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenAR && (
            <button
              type="button"
              onClick={onOpenAR}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 border border-cyan-400/40"
              title="Buka visualisasi atom dalam lingkungan nyata dengan kamera smartphone (WebXR AR)"
            >
              <span>🥽</span>
              <span>Lihat dalam AR</span>
            </button>
          )}

          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 shadow">
            <button
              type="button"
              onClick={() => setModelType('bohr')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                modelType === 'bohr'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Disc className="w-3.5 h-3.5" />
              <span>BOHR</span>
            </button>
            <button
              type="button"
              onClick={() => setModelType('3d')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                modelType === '3d'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CircleDot className="w-3.5 h-3.5" />
              <span>3D</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 3D CANVAS CONTAINER */}
      <div className={`relative w-full ${heightClass} select-none overflow-hidden bg-slate-950`}>
        {/* Canvas mount point */}
        <div
          ref={containerRef}
          className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
          style={{ touchAction: 'none' }}
        />

        {/* Floating Top Left Badge */}
        <div className="absolute top-2.5 left-3 pointer-events-none flex flex-col gap-1">
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-900/90 text-cyan-300 border border-slate-700/80 shadow">
            Mode: {modelType === '3d' ? '3D Multi-Orbit' : 'Model Bohr Konsentris'}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {structure.protons}p⁺ • {structure.neutrons}n⁰ • {element.atomicNumber}e⁻
          </span>
        </div>

        {/* Floating Interactive Electron Detail Popup (Requirement 5) */}
        {selectedElectron && (
          <div className="absolute top-3 right-3 z-20 p-3 rounded-2xl bg-slate-900/95 border border-cyan-500/50 shadow-2xl backdrop-blur-md max-w-[210px] text-xs space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                ELEKTRON
              </span>
              <button
                type="button"
                onClick={() => setSelectedElectron(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1 text-slate-300 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Kulit:</span>
                <span className="font-bold text-white">Kulit {selectedElectron.shellLetter} (n={selectedElectron.shellIndex + 1})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Elektron pd kulit:</span>
                <span className="font-bold text-cyan-300">{selectedElectron.electronCount} e⁻</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Elektron valensi:</span>
                <span className={`font-bold ${selectedElectron.isValence ? 'text-amber-400' : 'text-slate-300'}`}>
                  {selectedElectron.isValence ? 'Ya (Terluar)' : 'Tidak'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Floating Bottom Left Legend */}
        <div className="absolute bottom-2.5 left-3 pointer-events-none flex items-center gap-2 text-[10.5px] px-2.5 py-1 rounded-lg bg-slate-950/85 border border-slate-800/80 backdrop-blur-sm shadow">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            <span className="text-slate-300 font-medium">Proton ({structure.protons})</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
            <span className="text-slate-300 font-medium">Neutron ({structure.neutrons}*)</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
            <span className="text-slate-300 font-medium">Elektron ({element.atomicNumber})</span>
          </div>
          {highlightValence && (
            <>
              <span className="text-slate-600 hidden xs:inline">•</span>
              <div className="hidden xs:flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse" />
                <span className="text-amber-300 font-semibold">
                  Valensi ({element.valenceElectrons ?? 0})
                </span>
              </div>
            </>
          )}
        </div>

        {/* Floating Bottom Right Interactive Control Palette */}
        <div className="absolute bottom-2.5 right-3 flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800/90 shadow-xl backdrop-blur-md">
          <button
            type="button"
            onClick={handleResetView}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Reset Posisi Kamera (Reset View)"
            aria-label="Reset View"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
          </button>
          <button
            type="button"
            onClick={() => handleZoom(0.85)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Perbesar (Zoom In)"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleZoom(1.15)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Perkecil (Zoom Out)"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsRotating(!isRotating)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isRotating ? 'text-teal-400 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-300'
            }`}
            title={isRotating ? 'Jeda Putaran Otomatis' : 'Mulai Putaran Otomatis'}
            aria-label="Toggle Auto-rotate"
          >
            {isRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 3. KONTROL VISUAL CHECKBOXES & TOGGLES (Requirement 8) */}
      <div className="px-4 py-2 border-y border-slate-800/80 bg-slate-900/50 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowElectrons(!showElectrons)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              showElectrons
                ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            {showElectrons ? <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> : <Square className="w-3.5 h-3.5" />}
            <span>Elektron</span>
          </button>

          <button
            type="button"
            onClick={() => setShowOrbits(!showOrbits)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              showOrbits
                ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            {showOrbits ? <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> : <Square className="w-3.5 h-3.5" />}
            <span>Kulit</span>
          </button>

          <button
            type="button"
            onClick={() => setShowShellLabels(!showShellLabels)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              showShellLabels
                ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            {showShellLabels ? <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> : <Square className="w-3.5 h-3.5" />}
            <span>Label Kulit</span>
          </button>

          <button
            type="button"
            onClick={() => setHighlightValence(!highlightValence)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              highlightValence
                ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            {highlightValence ? <CheckSquare className="w-3.5 h-3.5 text-amber-400" /> : <Square className="w-3.5 h-3.5" />}
            <span>Elektron Valensi</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAnimating(!isAnimating)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              isAnimating
                ? 'bg-teal-950/60 border-teal-500/50 text-teal-300 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            {isAnimating ? <CheckSquare className="w-3.5 h-3.5 text-teal-400" /> : <Square className="w-3.5 h-3.5" />}
            <span>Animasi</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleResetView}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors shadow-sm ml-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Reset View</span>
        </button>
      </div>

      {/* 4. INTERAKSI KULIT ELEKTRON: [K] [L] [M] [N] (Requirement 6) */}
      <div className="px-4 py-2 bg-slate-900/40 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400">Pilih Kulit:</span>
          <button
            type="button"
            onClick={() => setSelectedShell(null)}
            className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all cursor-pointer border ${
              selectedShell === null
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Semua
          </button>
          {shellDetails.map((shell) => {
            const isSelected = selectedShell === shell.shellLetter;
            return (
              <button
                key={shell.shellLetter}
                type="button"
                onClick={() => setSelectedShell(isSelected ? null : shell.shellLetter)}
                className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md scale-105'
                    : shell.isValence
                    ? 'bg-amber-950/40 text-amber-300 border-amber-700/60 hover:bg-amber-900/60'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
                }`}
                title={`Kulit ${shell.shellLetter} (${shell.electronCount} elektron)`}
              >
                [{shell.shellLetter}] {shell.electronCount}e⁻
              </button>
            );
          })}
        </div>

        {selectedShell && (
          <div className="text-[11px] font-mono text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800 flex items-center gap-1">
            <span>Terpilih: Kulit {selectedShell} ({element.electronShells[SHELL_NAMES.indexOf(selectedShell)]} elektron)</span>
            <button
              type="button"
              onClick={() => setSelectedShell(null)}
              className="text-slate-400 hover:text-white ml-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* 5. INFORMASI UTAMA & EDUKATIF (Requirements 3, 4, 7, 11) */}
      <div className="p-4 space-y-3">
        {/* Quick summary line (Requirement 11) */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Distribusi Elektron:</span>
            <span className="text-cyan-300 font-bold font-mono">
              [{element.electronShells.join(', ')}]
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Elektron Valensi:</span>
            <span className="text-amber-300 font-bold font-mono">
              {element.valenceElectrons ?? 0}
            </span>
          </div>
        </div>

        {/* 2-Column Responsive Grid (Requirement 14): Distribusi Kulit & Partikel Subatom */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* A. KARTU DISTRIBUSI ELEKTRON (Requirement 3) */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Distribusi Elektron</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                Total: {element.atomicNumber} e⁻
              </span>
            </div>

            <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 text-center">
              {shellDetails.map((shell) => (
                <div
                  key={shell.shellLetter}
                  onClick={() => setSelectedShell(selectedShell === shell.shellLetter ? null : shell.shellLetter)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    selectedShell === shell.shellLetter
                      ? 'bg-cyan-500/20 border-cyan-400 shadow-sm'
                      : shell.isValence && highlightValence
                      ? 'bg-amber-950/30 border-amber-500/50 text-amber-300'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-mono font-bold block text-white">
                    Kulit {shell.shellLetter}
                  </span>
                  <span className="text-sm font-mono font-black text-cyan-300 block">
                    {shell.electronCount} e⁻
                  </span>
                  <span className="text-[9px] text-slate-500 block">
                    (Maks. {shell.maxElectrons})
                  </span>
                  {shell.isValence && (
                    <span className="text-[8px] font-semibold text-amber-400 block mt-0.5">
                      ★ Valensi
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Valence Highlight Status (Requirement 4) */}
            {highlightValence && (
              <div className="p-2 rounded-xl bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-200/90 flex items-center justify-between">
                <span>Kulit terluar ({SHELL_NAMES[element.electronShells.length - 1]}):</span>
                <strong className="text-amber-300 font-mono">
                  Elektron Valensi: {element.valenceElectrons ?? 0}
                </strong>
              </div>
            )}
          </div>

          {/* B. KARTU PARTIKEL SUBATOM (Requirement 7) */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Atom className="w-3.5 h-3.5 text-rose-400" />
                <span>Partikel Subatom</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Atom Netral Z={element.atomicNumber}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Proton (p⁺)</span>
                <span className="text-base font-bold text-rose-400 font-mono">
                  {structure.protons}
                </span>
                <span className="text-[9px] text-slate-500 block">Muatan +1</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <span className="text-[10px] text-slate-400">Neutron (n⁰)</span>
                </div>
                <span className="text-base font-bold text-slate-300 font-mono">
                  {structure.neutrons}*
                </span>
                <span className="text-[8px] font-semibold text-amber-300/90 block mt-0.5 px-1 py-0.2 rounded bg-amber-950/50 border border-amber-800/40">
                  Representasi isotop
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Elektron (e⁻)</span>
                <span className="text-base font-bold text-cyan-400 font-mono">
                  {element.atomicNumber}
                </span>
                <span className="text-[9px] text-slate-500 block">Muatan -1</span>
              </div>
            </div>

            {/* Neutron footnote (Requirement 5) */}
            <p className="text-[10.5px] text-slate-400 leading-snug">
              <strong className="text-slate-300">*</strong> Jumlah neutron dihitung berdasarkan isotop representatif paling umum (Nomor Massa A ≈ {structure.massNumber}). Jumlah neutron bukan nilai mutlak tunggal suatu unsur karena adanya berbagai isotop alami.
            </p>
          </div>
        </div>

        {/* Pedagogical disclaimer footer (Requirement 4) */}
        <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-200/90 leading-relaxed flex items-start gap-2.5 shadow-sm">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-300">
              Keterangan Edukatif:
            </p>
            <p>
              Model atom pada aplikasi ini merupakan visualisasi pembelajaran untuk membantu memahami struktur atom dan distribusi elektron. Visualisasi ini bukan representasi literal orbital mekanika kuantum.
            </p>
            <p className="text-[10.5px] text-slate-400 pt-0.5">
              <strong className="text-cyan-300">Petunjuk Interaktif: </strong>
              Klik/tap bola elektron di ruang 3D untuk melihat info spesifik kulit. Gunakan tombol kulit [K], [L], [M]... untuk meng-highlight kulit tertentu. Sentuh dan seret untuk rotasi 3D, cubit/scroll untuk zoom.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
