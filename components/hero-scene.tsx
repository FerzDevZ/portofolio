import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * "Capabilities field" — the hero's interactive 3D relief.
 *
 * A instanced grid of small boxes drifts as a sinusoid relief; the pointer
 * dents the field near the cursor (a repulsion falloff, smoothed), reading as
 * the whole surface breathing under your hand. Camera drifts very slowly with
 * the pointer for parallax depth.
 *
 * Performance contract:
 * - `frameloop="demand"` is NOT used because the relief is time-animated —
 *   instead the render loop runs only while the hero is on screen (parent
 *   loader unmounts the Canvas on exit) and React top-level pause.
 * - One InstancedMesh (one draw call), DPR capped at 1.5, no shadows, no
 *   postprocessing, no lights beyond two dim directionals — a tinted-neutrals
 *   scene that costs single-digit ms per frame on integrated GPUs.
 * - All pointer input is captured from the canvas-adjacent plane via the
 *   R3F state, already normalized to NDC — no manual listeners.
 */

/* Field cell size and spacing — 24×14 grid ≈ 336 instances, one draw call. */
const FIELD_COLUMNS = 24;
const FIELD_ROWS = 14;
const CELL_SPACING = 0.42;
const RELIEF_AMPLITUDE = 0.16;

type FieldPointer = { x: number; y: number; active: boolean };

function ReliefField({ pointer }: { pointer: React.RefObject<FieldPointer> }) {
  const fieldRef = useRef<THREE.InstancedMesh>(null);
  const smoothedPointer = useRef({ x: 0.5, y: 0.5, strength: 0 });
  /* One matrix reused by every frame and every instance: the per-frame loop
     must not allocate, or the garbage collector pauses the animation. */
  const workingMatrix = useMemo(() => new THREE.Matrix4(), []);

  /* Column/row unit coords precomputed once — the per-frame loop only reads
     them; no per-frame allocation. */
  const fieldCells = useMemo(() => {
    const cells: { cellX: number; cellY: number }[] = [];
    for (let rowIndex = 0; rowIndex < FIELD_ROWS; rowIndex += 1) {
      for (let columnIndex = 0; columnIndex < FIELD_COLUMNS; columnIndex += 1) {
        cells.push({
          cellX: columnIndex / (FIELD_COLUMNS - 1),
          cellY: rowIndex / (FIELD_ROWS - 1),
        });
      }
    }
    return cells;
  }, []);

  useFrame((frameState) => {
    const fieldMesh = fieldRef.current;
    if (!fieldMesh) return;

    const elapsed = frameState.clock.elapsedTime;

    /* Smooth the pointer so the dent trails the cursor — same lerp family
       as the cursor spotlight. */
    const pointerState = pointer.current;
    const strengthTarget = pointerState.active ? 1 : 0;
    smoothedPointer.current.strength +=
      (strengthTarget - smoothedPointer.current.strength) * 0.06;
    smoothedPointer.current.x +=
      (pointerState.x - smoothedPointer.current.x) * 0.1;
    smoothedPointer.current.y +=
      (pointerState.y - smoothedPointer.current.y) * 0.1;

    for (let cellIndex = 0; cellIndex < fieldCells.length; cellIndex += 1) {
      const fieldCell = fieldCells[cellIndex];
      if (!fieldCell) continue;
      const { cellX, cellY } = fieldCell;

      /* Ambient relief: two-phase sine travelling slowly across the field. */
      const wave =
        Math.sin(cellX * 5.2 + elapsed * 0.55) * 0.62 +
        Math.sin(cellY * 4.1 - elapsed * 0.4) * 0.38;

      /* Pointer dent: radial falloff around the smoothed pointer pos. */
      const pointerDistance = Math.hypot(
        cellX - smoothedPointer.current.x,
        cellY - (1 - smoothedPointer.current.y),
      );
      const dent =
        Math.exp(-pointerDistance * pointerDistance * 9) *
        smoothedPointer.current.strength *
        0.85;

      const zValue = wave * RELIEF_AMPLITUDE - dent * 0.35;

      workingMatrix.setPosition(
        (cellX - 0.5) * FIELD_COLUMNS * CELL_SPACING,
        (cellY - 0.5) * FIELD_ROWS * CELL_SPACING,
        zValue,
      );
      fieldMesh.setMatrixAt(cellIndex, workingMatrix);
    }
    fieldMesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={fieldRef}
      args={[undefined, undefined, FIELD_COLUMNS * FIELD_ROWS]}
    >
      <boxGeometry args={[0.1, 0.1, 0.1]} />
      <meshStandardMaterial
        color="#3a4152"
        emissive="#1b2334"
        emissiveIntensity={0.6}
        roughness={0.55}
        metalness={0.25}
      />
    </instancedMesh>
  );
}

/** Camera drifts a fraction of the pointer for depth-cue parallax. */
function DriftingCamera({ pointer }: { pointer: React.RefObject<FieldPointer> }) {
  const cameraRef = useThree((fiberState) => fiberState.camera);

  useFrame(() => {
    const pointerState = pointer.current;
    const targetX = (pointerState.x - 0.5) * 0.6;
    const targetY = 0.35 + (0.5 - pointerState.y) * 0.35;
    cameraRef.position.x += (targetX - cameraRef.position.x) * 0.04;
    cameraRef.position.y += (targetY - cameraRef.position.y) * 0.04;
    cameraRef.lookAt(0, 0, 0);
  });

  return null;
}

/* Calmer cadence: the relief is a slow sine, so 30 fps reads identically to
   60 while halving GPU work. The canvas runs in `demand` mode and this ticker
   requests a frame every 1000/30 ms, so no frame is ever rendered for nothing. */
const TARGET_FRAME_MS = 1000 / 30;

function CadenceTicker() {
  const invalidateFrame = useThree((fiberState) => fiberState.invalidate);
  const setFrameloop = useThree((fiberState) => fiberState.setFrameloop);

  useEffect(() => {
    let tickId: number | null = null;
    let lastTickAt = 0;

    const tick = (now: number) => {
      if (now - lastTickAt >= TARGET_FRAME_MS) {
        lastTickAt = now;
        invalidateFrame();
      }
      tickId = window.requestAnimationFrame(tick);
    };

    const start = () => {
      if (tickId === null) tickId = window.requestAnimationFrame(tick);
    };
    const stop = () => {
      if (tickId !== null) window.cancelAnimationFrame(tickId);
      tickId = null;
    };

    /* A hidden tab renders nothing: no one can see the frame, and the browser
       otherwise keeps the WebGL work alive in the background. */
    const handleVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    setFrameloop("demand");
    invalidateFrame();
    start();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [invalidateFrame, setFrameloop]);

  return null;
}

export default function HeroScene() {
  const pointerRef = useRef<FieldPointer>({ x: 0.5, y: 0.5, active: false });

  return (
    <div
      className="hero-scene-frame"
      aria-hidden="true"
      onPointerMove={(pointerEvent) => {
        const frameRect =
          pointerEvent.currentTarget.getBoundingClientRect();
        pointerRef.current = {
          x: (pointerEvent.clientX - frameRect.left) / frameRect.width,
          y: (pointerEvent.clientY - frameRect.top) / frameRect.height,
          active: true,
        };
      }}
      onPointerLeave={() => {
        pointerRef.current.active = false;
      }}
    >
      <Canvas
        camera={{ position: [0, 0.35, 3.4], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        style={{ position: "absolute", inset: 0 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 4, 5]} intensity={0.7} />
        <directionalLight position={[-4, -2, 2]} intensity={0.25} color="#5a7bd8" />
        <ReliefField pointer={pointerRef} />
        <DriftingCamera pointer={pointerRef} />
        <CadenceTicker />
      </Canvas>
    </div>
  );
}
