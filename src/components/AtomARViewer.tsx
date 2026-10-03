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
  Info,
  X,
  Sparkles,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Move3d,
  Layers,
  HelpCircle,
  Maximize2,
  Compass,
  ArrowRight,
} from 'lucide-react';

interface AtomARViewerProps {
  element: ChemicalElement;
  onBackTo3D: () => void;
}

export const AtomARViewer: React.FC<AtomARViewerProps> = ({
  element,
  onBackTo3D,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // WebXR support & status state
  const [xrSupported, setXrSupported] = useState<boolean | null>(null);
  const [isSecure, setIsSecure] = useState<boolean>(true);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [cameraPermissionError, setCameraPermissionError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // AR interaction & placement state
  const [isPlaced, setIsPlaced] = useState<boolean>(false);
  const [surfaceDetected, setSurfaceDetected] = useState<boolean>(false);
  const [atomScale, setAtomScale] = useState<number>(1.0); // 0.3 to 2.5
  const [scaleMode, setScaleMode] = useState<'learning' | 'atomic'>('learning');
  const [showInfoPanel, setShowInfoPanel] = useState<boolean>(true);
  const [showActivities, setShowActivities] = useState<boolean>(false);
  const [tappedAtomInfo, setTappedAtomInfo] = useState<boolean>(false);

  // Simulated Room / Tabletop Fallback mode when WebXR is unavailable
  const [simulatedEnvironment, setSimulatedEnvironment] = useState<boolean>(false);
  const [cameraFeedActive, setCameraFeedActive] = useState<boolean>(false);

  // Chemistry data from Single Source of Truth
  const structure = calculateAtomicStructure(element);
  const shellDetails = useMemo(() => getShellDetails(element.electronShells), [element.electronShells]);
  const catInfo = CATEGORIES[element.category];

  // Three.js References
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const reticleRef = useRef<THREE.Mesh | null>(null);
  const atomGroupRef = useRef<THREE.Group | null>(null);
  const xrSessionRef = useRef<any>(null);
  const hitTestSourceRef = useRef<any>(null);
  const hitTestSourceRequestedRef = useRef<boolean>(false);
  const referenceSpaceRef = useRef<any>(null);
  const videoFeedRef = useRef<HTMLVideoElement | null>(null);

  // Animation & Electrons ref
  const electronsRef = useRef<
    Array<{
      mesh: THREE.Mesh;
      radius: number;
      speed: number;
      angle: number;
      inclination: number;
    }>
  >([]);

  // Touch gesture refs
  const touchStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const previousTouchPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pinchStartDistRef = useRef<number | null>(null);

  // Check WebXR Immersive-AR support & Secure Context on mount
  useEffect(() => {
    const isHttpsOrLocal =
      typeof window !== 'undefined' &&
      (window.isSecureContext ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1');
    setIsSecure(isHttpsOrLocal);

    if (!isHttpsOrLocal) {
      setXrSupported(false);
      return;
    }

    if (typeof navigator !== 'undefined' && 'xr' in navigator && (navigator as any).xr?.isSessionSupported) {
      (navigator as any).xr
        .isSessionSupported('immersive-ar')
        .then((supported: boolean) => {
          setXrSupported(supported);
        })
        .catch(() => {
          setXrSupported(false);
        });
    } else {
      setXrSupported(false);
    }
  }, []);

  // Build the 3D Atom Model (protons, neutrons, electron shells)
  const buildAtomModel = useCallback(() => {
    const group = new THREE.Group();
    electronsRef.current = [];

    const atomicNum = element.atomicNumber;
    const neutronCount = structure.neutrons;
    const shells = element.electronShells;
    const numShells = shells.length;

    // Base unit radius for AR (e.g. 0.05m = 5cm base, ideal for tabletops)
    const baseRadius = scaleMode === 'learning' ? 0.08 : 0.04;
    const shellStep = scaleMode === 'learning' ? 0.06 : 0.03;

    // Geometries
    const protonGeo = new THREE.SphereGeometry(0.018, 12, 12);
    const neutronGeo = new THREE.SphereGeometry(0.016, 12, 12);
    const electronGeo = new THREE.SphereGeometry(0.012, 12, 12);
    const valenceGeo = new THREE.SphereGeometry(0.016, 12, 12);

    const protonMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0x991b1b,
      emissiveIntensity: 0.5,
      roughness: 0.3,
    });
    const neutronMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.4,
    });
    const electronMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.9,
      roughness: 0.2,
    });
    const valenceMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 1.0,
      roughness: 0.2,
    });

    // Nucleus cluster
    const nucleusGroup = new THREE.Group();
    const displayProtons = Math.min(atomicNum, 40);
    const displayNeutrons = Math.min(neutronCount, 45);
    const totalNucleons = displayProtons + displayNeutrons;
    const clusterRadius = Math.max(0.02, Math.cbrt(totalNucleons) * 0.01);

    for (let i = 0; i < displayProtons; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * clusterRadius;
      const mesh = new THREE.Mesh(protonGeo, protonMat);
      mesh.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
      nucleusGroup.add(mesh);
    }

    for (let i = 0; i < displayNeutrons; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * clusterRadius;
      const mesh = new THREE.Mesh(neutronGeo, neutronMat);
      mesh.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
      nucleusGroup.add(mesh);
    }
    group.add(nucleusGroup);

    // Electron Shells & Orbiting Electrons
    shells.forEach((electronCount, sIdx) => {
      const shellRadius = baseRadius + sIdx * shellStep;
      const isValence = sIdx === numShells - 1;

      // Orbit Ring Geometry
      const ringGeo = new THREE.RingGeometry(shellRadius - 0.0015, shellRadius + 0.0015, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: isValence ? 0xf59e0b : 0x0284c7,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isValence ? 0.75 : 0.45,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      group.add(ringMesh);

      // Electrons along orbit
      for (let eIdx = 0; eIdx < electronCount; eIdx++) {
        const initialAngle = (eIdx / electronCount) * Math.PI * 2;
        const eMesh = new THREE.Mesh(
          isValence ? valenceGeo : electronGeo,
          isValence ? valenceMat : electronMat
        );
        eMesh.position.set(
          Math.cos(initialAngle) * shellRadius,
          0,
          Math.sin(initialAngle) * shellRadius
        );
        group.add(eMesh);

        electronsRef.current.push({
          mesh: eMesh,
          radius: shellRadius,
          speed: (0.9 / (sIdx + 1)) * 1.5,
          angle: initialAngle,
          inclination: 0,
        });
      }
    });

    return group;
  }, [element, scaleMode, structure.neutrons]);

  // Start Real WebXR Immersive-AR Session
  const startWebXRSession = async () => {
    if (typeof navigator === 'undefined' || !('xr' in navigator)) {
      setErrorMessage('WebXR API tidak tersedia di browser ini.');
      return;
    }

    try {
      setCameraPermissionError(false);
      setErrorMessage(null);

      const session = await (navigator as any).xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay', 'local-floor'],
        domOverlay: { root: overlayRef.current },
      });

      xrSessionRef.current = session;
      setIsSessionActive(true);

      if (!rendererRef.current || !sceneRef.current) return;
      const renderer = rendererRef.current;
      const scene = sceneRef.current;

      renderer.xr.enabled = true;
      await renderer.xr.setSession(session);

      // Create Hit-Test Reticle
      if (!reticleRef.current) {
        const reticleGeo = new THREE.RingGeometry(0.08, 0.095, 32).rotateX(-Math.PI / 2);
        const reticleMat = new THREE.MeshBasicMaterial({
          color: 0x22d3ee,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.9,
        });
        const reticle = new THREE.Mesh(reticleGeo, reticleMat);
        reticle.matrixAutoUpdate = false;
        reticle.visible = false;
        scene.add(reticle);
        reticleRef.current = reticle;
      }

      // Handle controller select (Screen Tap to place atom)
      const controller = renderer.xr.getController(0);
      controller.addEventListener('select', onSelectScreenTap);
      scene.add(controller);

      session.addEventListener('end', onXRSessionEnded);

      // Reference space
      const refSpace = await session.requestReferenceSpace('local-floor').catch(() => {
        return session.requestReferenceSpace('local');
      });
      referenceSpaceRef.current = refSpace;

      // Start XR Animation Loop
      renderer.setAnimationLoop((timestamp, frame) => {
        // Update electron positions
        electronsRef.current.forEach((item) => {
          item.angle += item.speed * 0.015;
          item.mesh.position.x = Math.cos(item.angle) * item.radius;
          item.mesh.position.z = Math.sin(item.angle) * item.radius;
        });

        // Hit-test handling
        if (frame && !isPlaced) {
          if (!hitTestSourceRequestedRef.current) {
            session
              .requestReferenceSpace('viewer')
              .then((viewerSpace: any) => {
                session.requestHitTestSource({ space: viewerSpace }).then((source: any) => {
                  hitTestSourceRef.current = source;
                });
              });
            session.addEventListener('end', () => {
              hitTestSourceRequestedRef.current = false;
              hitTestSourceRef.current = null;
            });
            hitTestSourceRequestedRef.current = true;
          }

          if (hitTestSourceRef.current) {
            const hitTestResults = frame.getHitTestResults(hitTestSourceRef.current);
            if (hitTestResults.length > 0) {
              const hit = hitTestResults[0];
              const pose = hit.getPose(referenceSpaceRef.current);
              if (pose && reticleRef.current) {
                reticleRef.current.visible = true;
                reticleRef.current.matrix.fromArray(pose.transform.matrix);
                setSurfaceDetected(true);
              }
            } else if (reticleRef.current) {
              reticleRef.current.visible = false;
              setSurfaceDetected(false);
            }
          }
        }

        renderer.render(scene, cameraRef.current!);
      });
    } catch (err: any) {
      console.error('Failed to start WebXR session:', err);
      if (err.name === 'NotAllowedError') {
        setCameraPermissionError(true);
      } else {
        setErrorMessage(
          'Tidak dapat memulai AR. Pastikan perangkat Anda mendukung Google Play Services for AR (ARCore).'
        );
      }
      setIsSessionActive(false);
    }
  };

  // Screen Tap in AR to place the atom at reticle pose
  const onSelectScreenTap = () => {
    if (!reticleRef.current || !reticleRef.current.visible) return;
    if (!sceneRef.current) return;

    if (atomGroupRef.current) {
      sceneRef.current.remove(atomGroupRef.current);
    }

    const newAtom = buildAtomModel();
    newAtom.position.setFromMatrixPosition(reticleRef.current.matrix);
    newAtom.scale.setScalar(atomScale);
    sceneRef.current.add(newAtom);
    atomGroupRef.current = newAtom;

    setIsPlaced(true);
    reticleRef.current.visible = false;
  };

  // End XR Session cleanup
  const onXRSessionEnded = () => {
    setIsSessionActive(false);
    setIsPlaced(false);
    setSurfaceDetected(false);
    hitTestSourceRequestedRef.current = false;
    hitTestSourceRef.current = null;

    if (rendererRef.current) {
      rendererRef.current.setAnimationLoop(null);
      rendererRef.current.xr.enabled = false;
    }
    if (reticleRef.current && sceneRef.current) {
      sceneRef.current.remove(reticleRef.current);
      reticleRef.current = null;
    }
  };

  // Exit AR button handler
  const handleExitAR = () => {
    if (xrSessionRef.current) {
      xrSessionRef.current.end().catch(() => {});
    }
    onXRSessionEnded();
    onBackTo3D();
  };

  // Reset Position to allow re-detecting plane and placing atom
  const handleResetPosition = () => {
    setIsPlaced(false);
    if (atomGroupRef.current && sceneRef.current) {
      sceneRef.current.remove(atomGroupRef.current);
      atomGroupRef.current = null;
    }
    if (reticleRef.current) {
      reticleRef.current.visible = true;
    }
  };

  // Initialize Three.js WebGL Renderer on mount
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 20);
    camera.position.set(0, 0.3, 0.8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Lighting for realistic, educational rendering in real environments
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(1, 2, 1);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 1.0, 5);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // Initial preview atom in center
    const previewAtom = buildAtomModel();
    scene.add(previewAtom);
    atomGroupRef.current = previewAtom;

    // Normal render loop before XR starts
    let animId: number;
    const renderLoop = () => {
      if (!renderer.xr.isPresenting) {
        electronsRef.current.forEach((item) => {
          item.angle += item.speed * 0.015;
          item.mesh.position.x = Math.cos(item.angle) * item.radius;
          item.mesh.position.z = Math.sin(item.angle) * item.radius;
        });

        if (atomGroupRef.current) {
          atomGroupRef.current.rotation.y += 0.005;
        }

        renderer.render(scene, camera);
      }
      animId = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (xrSessionRef.current) {
        xrSessionRef.current.end().catch(() => {});
      }
      renderer.dispose();
    };
  }, [buildAtomModel]);

  // Dynamic update when element or scaleMode changes
  useEffect(() => {
    if (!sceneRef.current) return;
    if (atomGroupRef.current) {
      const prevPos = atomGroupRef.current.position.clone();
      const prevRot = atomGroupRef.current.rotation.clone();
      sceneRef.current.remove(atomGroupRef.current);

      const newAtom = buildAtomModel();
      newAtom.position.copy(prevPos);
      newAtom.rotation.copy(prevRot);
      newAtom.scale.setScalar(atomScale);
      sceneRef.current.add(newAtom);
      atomGroupRef.current = newAtom;
    }
  }, [element, scaleMode, buildAtomModel, atomScale]);

  // Adjust atom scale
  const handleScaleChange = (delta: number) => {
    setAtomScale((prev) => {
      const next = Math.max(0.4, Math.min(2.5, prev + delta));
      if (atomGroupRef.current) {
        atomGroupRef.current.scale.setScalar(next);
      }
      return next;
    });
  };

  // Touch Gesture controls on overlay canvas
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      previousTouchPosRef.current = { ...touchStartPosRef.current };
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStartDistRef.current = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && atomGroupRef.current) {
      const currentX = e.touches[0].clientX;
      const deltaX = currentX - previousTouchPosRef.current.x;
      atomGroupRef.current.rotation.y += deltaX * 0.015;
      previousTouchPosRef.current.x = currentX;
    } else if (e.touches.length === 2 && pinchStartDistRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.hypot(dx, dy);
      const ratio = currentDist / pinchStartDistRef.current;
      if (Math.abs(ratio - 1) > 0.05) {
        handleScaleChange((ratio - 1) * 0.1);
        pinchStartDistRef.current = currentDist;
      }
    }
  };

  // Fallback camera stream for devices without WebXR hardware
  const startCameraPassThrough = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoFeedRef.current) {
        videoFeedRef.current.srcObject = stream;
        videoFeedRef.current.play();
        setCameraFeedActive(true);
        setSimulatedEnvironment(true);
      }
    } catch {
      setCameraPermissionError(true);
    }
  };

  const stopCameraPassThrough = () => {
    if (videoFeedRef.current && videoFeedRef.current.srcObject) {
      const stream = videoFeedRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoFeedRef.current.srcObject = null;
    }
    setCameraFeedActive(false);
    setSimulatedEnvironment(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[520px] sm:h-[620px] rounded-2xl bg-slate-950 overflow-hidden border border-slate-800 shadow-2xl flex flex-col select-none"
    >
      {/* Background WebCam Video Feed for Non-WebXR Fallback with Real Camera */}
      <video
        ref={videoFeedRef}
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          cameraFeedActive ? 'opacity-100 z-0' : 'opacity-0 -z-10'
        }`}
      />

      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-10 touch-none cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onClick={() => setTappedAtomInfo((prev) => !prev)}
      />

      {/* DOM Overlay for WebXR & AR Controls */}
      <div
        ref={overlayRef}
        className="relative z-20 w-full h-full flex flex-col justify-between pointer-events-none p-3 sm:p-4"
      >
        {/* Top AR Header Bar */}
        <div className="flex items-center justify-between gap-2 pointer-events-auto">
          {/* Element & AR Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-md shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white tracking-wide">
                  {element.name} ({element.symbol})
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300">
                  Z={element.atomicNumber}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {isSessionActive
                  ? isPlaced
                    ? 'Atom Ditempatkan di Lingkungan Nyata'
                    : 'Arahkan ke permukaan datar...'
                  : xrSupported
                  ? 'AR Siap Digunakan'
                  : 'Mode Simulasi 3D'}
              </span>
            </div>
          </div>

          {/* Action Buttons: Scale Mode, Activities, Exit */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowActivities((prev) => !prev)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 text-cyan-300 border border-cyan-500/30 text-xs font-semibold backdrop-blur-md transition-all shadow-md flex items-center gap-1 cursor-pointer"
              title="Aktivitas Eksplore AR"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Eksplore AR</span>
            </button>

            <button
              type="button"
              onClick={handleExitAR}
              className="p-2 rounded-xl bg-slate-900/90 hover:bg-rose-950/80 text-slate-300 hover:text-rose-300 border border-slate-700/80 backdrop-blur-md transition-all shadow-md cursor-pointer"
              title="Keluar AR (Kembali ke Atom 3D)"
              aria-label="Keluar AR"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Reticle & Status Banner when WebXR is active */}
        {isSessionActive && !isPlaced && (
          <div className="self-center flex flex-col items-center gap-2 p-3 rounded-2xl bg-slate-950/80 border border-cyan-500/40 text-center backdrop-blur-md max-w-xs shadow-2xl animate-in fade-in pointer-events-auto">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-dashed animate-spin flex items-center justify-center text-cyan-300">
              <Move3d className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-white">
              {surfaceDetected
                ? 'Permukaan Terdeteksi! Ketuk layar untuk menempatkan atom.'
                : 'Arahkan kamera ke permukaan datar (meja / lantai).'}
            </p>
            <span className="text-[10px] text-cyan-300/80 font-mono">
              Gerakkan perlahan smartphone Anda
            </span>
          </div>
        )}

        {/* Quick Tapped Atom Info Popup */}
        {tappedAtomInfo && (
          <div className="self-center p-3 rounded-2xl bg-slate-950/90 border border-amber-500/40 text-center backdrop-blur-md shadow-2xl animate-in zoom-in-95 pointer-events-auto max-w-xs">
            <h4 className="text-sm font-extrabold text-amber-300">
              {element.name.toUpperCase()} ({element.symbol})
            </h4>
            <div className="text-xs font-mono text-slate-300 my-1">
              Nomor Atom Z = {element.atomicNumber} • Elektron: {structure.electrons}
            </div>
            <div className="text-xs text-amber-200/90">
              Kulit: [{element.electronShells.join(', ')}] • Valensi: {element.valenceElectrons} e⁻
            </div>
          </div>
        )}

        {/* Floating Minimal AR Controls Ribbon */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          {/* Educational Activities Drawer */}
          {showActivities && (
            <div className="p-3.5 rounded-2xl bg-slate-900/95 border border-slate-700/80 backdrop-blur-lg shadow-2xl text-xs space-y-3 max-h-60 overflow-y-auto scrollbar-thin">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="font-extrabold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wide">
                  <Compass className="w-4 h-4" />
                  <span>Aktivitas Eksplore AR</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowActivities(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2">
                  <span className="font-bold text-cyan-400 font-mono shrink-0">1.</span>
                  <div>
                    <strong className="text-white block">Tempatkan di Meja</strong>
                    <span className="text-slate-400 text-[11px]">
                      Arahkan kamera ke permukaan datar dan ketuk layar untuk meletakkan atom.
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2">
                  <span className="font-bold text-cyan-400 font-mono shrink-0">2.</span>
                  <div>
                    <strong className="text-white block">Amati Jumlah Kulit</strong>
                    <span className="text-slate-400 text-[11px]">
                      Perhatikan cincin konsentris: unsur {element.name} memiliki{' '}
                      {element.electronShells.length} kulit elektron (periode {element.period}).
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2">
                  <span className="font-bold text-cyan-400 font-mono shrink-0">3.</span>
                  <div>
                    <strong className="text-white block">Cari Elektron Valensi</strong>
                    <span className="text-slate-400 text-[11px]">
                      Elektron pada kulit terluar berwarna emas/amber ({element.valenceElectrons} e⁻).
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2">
                  <span className="font-bold text-cyan-400 font-mono shrink-0">4.</span>
                  <div>
                    <strong className="text-white block">Bandingkan Dua Unsur</strong>
                    <span className="text-slate-400 text-[11px]">
                      Coba amati Natrium (Na) dan Klorin (Cl) untuk memahami bagaimana elektron
                      valensi memengaruhi ikatan kimia.
                    </span>
                  </div>
                </div>
              </div>

              {/* Deep Learning Concepts */}
              <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px] text-center font-medium">
                <div className="p-1.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-cyan-300">
                  <strong>MEMAHAMI</strong>
                  <p className="text-[9px] text-slate-300 mt-0.5">Struktur 3D dalam ruang nyata.</p>
                </div>
                <div className="p-1.5 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-300">
                  <strong>APLIKASI</strong>
                  <p className="text-[9px] text-slate-300 mt-0.5">Bandingkan ukuran antar unsur.</p>
                </div>
                <div className="p-1.5 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-indigo-300">
                  <strong>REFLEKSI</strong>
                  <p className="text-[9px] text-slate-300 mt-0.5">Korelasi kulit & nomor periode.</p>
                </div>
              </div>
            </div>
          )}

          {/* Minimal Bottom Control Toolbar */}
          <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-md shadow-2xl">
            {/* Scale Control: [-] [Reset] [+] */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleScaleChange(-0.15)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center transition-all cursor-pointer"
                title="Perkecil Ukuran Atom"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setAtomScale(1.0);
                  if (atomGroupRef.current) atomGroupRef.current.scale.setScalar(1.0);
                }}
                className="px-2 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer"
                title="Reset Ukuran ke 100%"
              >
                {Math.round(atomScale * 100)}%
              </button>
              <button
                type="button"
                onClick={() => handleScaleChange(0.15)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center transition-all cursor-pointer"
                title="Perbesar Ukuran Atom"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Scale Mode Switch: [ Skala Pembelajaran ] vs [ Ukuran Atom ] */}
            <div className="hidden sm:flex items-center p-0.5 rounded-xl bg-slate-950 border border-slate-800 text-[10px]">
              <button
                type="button"
                onClick={() => setScaleMode('learning')}
                className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  scaleMode === 'learning'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Skala Pembelajaran
              </button>
              <button
                type="button"
                onClick={() => setScaleMode('atomic')}
                className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  scaleMode === 'atomic'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Ukuran Atom
              </button>
            </div>

            {/* Reposition & Info Toggle */}
            <div className="flex items-center gap-1.5">
              {isSessionActive && (
                <button
                  type="button"
                  onClick={handleResetPosition}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                  title="Deteksi Ulang Permukaan dan Posisikan Atom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Reset Posisi</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowInfoPanel((prev) => !prev)}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  showInfoPanel
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Buka/Tutup Informasi Atom"
              >
                <Info className="w-4 h-4" />
              </button>

              {/* Main Launch AR Button if not active */}
              {!isSessionActive && (
                <button
                  type="button"
                  onClick={() => {
                    if (xrSupported) {
                      startWebXRSession();
                    } else {
                      startCameraPassThrough();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>🥽 Lihat dalam AR</span>
                </button>
              )}
            </div>
          </div>

          {/* Bottom Information Panel */}
          {showInfoPanel && (
            <div className="p-3 rounded-2xl bg-slate-950/85 border border-slate-800/80 backdrop-blur-md shadow-2xl flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex flex-col items-center justify-center font-bold border shrink-0"
                  style={{
                    borderColor: catInfo.accentColor,
                    backgroundColor: '#020617',
                  }}
                >
                  <span className="text-[9px] text-slate-400 font-mono leading-none">
                    {element.atomicNumber}
                  </span>
                  <span className="text-base font-black text-white leading-none">
                    {element.symbol}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-extrabold text-white">
                      ATOM AR — {element.name} ({element.symbol})
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Z = {element.atomicNumber}
                    </span>
                  </div>
                  <div className="text-[11px] text-cyan-300 font-mono flex items-center gap-2">
                    <span>Elektron: [{element.electronShells.join(', ')}]</span>
                    <span>•</span>
                    <span className="text-amber-300 font-bold">
                      Valensi: {element.valenceElectrons ?? '-'} e⁻
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowInfoPanel(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Tutup Panel Info"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Educational Disclaimer */}
          <div className="text-[10px] text-amber-300/80 bg-slate-950/80 border border-amber-500/30 rounded-xl p-2 text-center font-normal px-3 leading-snug">
            * <strong>Keterangan Pedagogis:</strong> Model atom pada aplikasi ini merupakan visualisasi pembelajaran untuk membantu memahami struktur atom dan distribusi elektron. Visualisasi ini bukan representasi literal orbital mekanika kuantum.
          </div>
        </div>
      </div>

      {/* Fallback Dialog: When WebXR is not supported on this browser/device */}
      {xrSupported === false && !cameraFeedActive && (
        <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md p-5 flex flex-col items-center justify-center text-center animate-in fade-in">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 shadow-xl">
            <Camera className="w-7 h-7" />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">
            Mode AR Belum Didukung pada Perangkat/Browser Ini
          </h3>
          <p className="text-xs text-slate-300 max-w-md leading-relaxed mb-4">
            WebXR Immersive-AR memerlukan browser dengan WebXR (seperti Google Chrome pada Android
            dengan Google Play Services for AR) dan koneksi aman HTTPS.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              onClick={startCameraPassThrough}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Gunakan Kamera Simulasi</span>
            </button>

            <button
              type="button"
              onClick={onBackTo3D}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 active:scale-95 transition-all cursor-pointer"
            >
              <span>⚛ Gunakan Atom 3D</span>
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
            Status: <span className="text-amber-400 font-mono">AR tidak tersedia pada perangkat ini</span>
          </div>
        </div>
      )}

      {/* Camera Permission Denied Notice */}
      {cameraPermissionError && (
        <div className="absolute inset-0 z-30 bg-slate-950/95 backdrop-blur-md p-5 flex flex-col items-center justify-center text-center animate-in fade-in">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3 shadow-xl">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">
            Akses Kamera Ditolak
          </h3>
          <p className="text-xs text-slate-300 max-w-sm leading-relaxed mb-4">
            AR membutuhkan akses kamera. Anda masih dapat menggunakan mode Atom 3D interaktif.
          </p>

          <button
            type="button"
            onClick={onBackTo3D}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <span>[ Kembali ke Atom 3D ]</span>
          </button>
        </div>
      )}
    </div>
  );
};
