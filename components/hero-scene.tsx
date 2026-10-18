import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  calmWave,
  kineticWave,
  blendIdle,
  IDLE_AFTER_S,
  FIELD_COLUMNS,
  FIELD_ROWS,
  CELL_SPACING,
  RELIEF_AMPLITUDE,
} from "@/lib/hero-relief";
import {
  readReliefPalette,
  watchThemeChanges,
  type ReliefPalette,
} from "@/lib/relief-palette";

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

/* Field geometry and the wave functions live in `lib/hero-relief` so the
   maths can be tested as arithmetic; this file only renders it. */

type FieldPointer = { x: number; y: number; active: boolean };

function ReliefField({
  pointer,
  lastPointerMoveAt,
  palette,
}: {
  pointer: React.RefObject<FieldPointer>;
  lastPointerMoveAt: React.RefObject<number>;
  palette: ReliefPalette;
}) {
  const fieldRef = useRef<THREE.InstancedMesh>(null);
  const smoothedPointer = useRef({ x: 0.5, y: 0.5, strength: 0 });
  /* 0 = calm ambient sweep, 1 = idle interference pattern. Lerped per frame so
     the two states dissolve into each other rather than snapping. */
  const idleBlend = useRef(0);
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

    /* Idle breathing: once the pointer has been still for a few seconds the
       ambient wave swaps its slow two-phase sine for a tighter, faster
       interference pattern — the field reads as alive and thinking rather
       than frozen. The blend is a lerp against the same smoothed pointer
       signal, so returning the cursor dissolves it instead of snapping.

       Both sides of this comparison use `performance.now()`: the pointer
       handler writes that clock, and `clock.elapsedTime` is a different
       origin (R3F starts it at mount), so mixing them would make the field
       look idle the moment it mounted. */
    const nowSeconds = performance.now() / 1000;
    const pointerIsIdle = nowSeconds - lastPointerMoveAt.current > IDLE_AFTER_S;
    idleBlend.current = blendIdle(idleBlend.current, pointerIsIdle);
    const idleAmount = idleBlend.current;

    for (let cellIndex = 0; cellIndex < fieldCells.length; cellIndex += 1) {
      const fieldCell = fieldCells[cellIndex];
      if (!fieldCell) continue;
      const { cellX, cellY } = fieldCell;

      /* Ambient relief: two-phase sine travelling slowly across the field. */
      const slowWave = calmWave(cellX, cellY, elapsed);

      const wave = slowWave * (1 - idleAmount) + kineticWave(cellX, cellY, elapsed) * idleAmount;

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
      {/* Colours come from the live theme tokens, so the relief keeps the same
          legibility in either theme instead of being tuned for one. */}
      <meshStandardMaterial
        color={palette.cubeColor}
        emissive={palette.emissiveColor}
        emissiveIntensity={0.7}
        roughness={0.5}
        metalness={0.18}
      />
    </instancedMesh>
  );
}

/** Camera drifts a fraction of the pointer for depth-cue parallax, and sinks
 *  slightly as the hero scrolls away so the relief field reads as receding
 *  under the page rather than sitting flat behind it. Both are pure position
 *  writes on the existing frame loop — one extra read per frame, no listener,
 *  no reflow. */
function DriftingCamera({ pointer }: { pointer: React.RefObject<FieldPointer> }) {
  const cameraRef = useThree((fiberState) => fiberState.camera);
  const scrollDepth = useRef(0);

  useEffect(() => {
    /* Reuse the parent's single scroll source: a passive listener that only
       records a number. The frame loop below consumes it. */
    let frameId: number | null = null;
    const readScrollDepth = () => {
      frameId = null;
      /* 0 at the top, 1 once the hero has been scrolled past. */
      const heroHeight = window.innerHeight;
      scrollDepth.current = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);
    };
    const scheduleScrollDepth = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(readScrollDepth);
    };

    readScrollDepth();
    window.addEventListener("scroll", scheduleScrollDepth, { passive: true });
    return () => {
      window.removeEventListener("scroll", scheduleScrollDepth);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, []);

  useFrame(() => {
    const pointerState = pointer.current;
    const targetX = (pointerState.x - 0.5) * 0.6;
    const targetY = 0.35 + (0.5 - pointerState.y) * 0.35;
    /* The camera pulls back a little and drops as the hero leaves: enough to
       feel the relief recede, small enough that the field never leaves frame. */
    const targetZ = 3.4 + scrollDepth.current * 0.9;
    cameraRef.position.x += (targetX - cameraRef.position.x) * 0.04;
    cameraRef.position.y += (targetY - cameraRef.position.y) * 0.04;
    cameraRef.position.z += (targetZ - cameraRef.position.z) * 0.06;
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
  /* Written by the pointer listener, read by the frame loop: the relief field
     needs its own elapsed time, and it must not allocate or re-render. */
  const lastPointerMoveAtRef = useRef(0);
  const frameRef = useRef<HTMLDivElement | null>(null);
  /* Start from the dark values and correct on mount, so the first frame is
     never rendered with an undefined colour. */
  const [palette, setPalette] = useState<ReliefPalette | null>(null);
  /* A lost WebGL context leaves a canvas that still exists, still reports a
     size, and draws nothing. Unmounting it puts the poster back on screen —
     which is the same fallback a device that never supported WebGL gets. */
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    const syncPalette = () => setPalette(readReliefPalette());
    syncPalette();
    /* Re-read when the visitor flips the theme, so the field re-colours in
       place instead of staying on the palette it mounted with. */
    return watchThemeChanges(syncPalette);
  }, []);

  useEffect(() => {
    const frameElement = frameRef.current;
    if (!frameElement) return;

    /* `webglcontextlost` does not bubble, so it is captured at the frame. The
       default action is to keep a permanently dead context, which is why it is
       prevented: the browser may then restore, and the scene remounts. */
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setContextLost(true);
    };
    const handleContextRestored = () => setContextLost(false);

    frameElement.addEventListener("webglcontextlost", handleContextLost, true);
    frameElement.addEventListener(
      "webglcontextrestored",
      handleContextRestored,
      true,
    );
    return () => {
      frameElement.removeEventListener(
        "webglcontextlost",
        handleContextLost,
        true,
      );
      frameElement.removeEventListener(
        "webglcontextrestored",
        handleContextRestored,
        true,
      );
    };
  }, []);

  useEffect(() => {
    const frameElement = frameRef.current;
    if (!frameElement) return;

    const followPointer = (pointerEvent: PointerEvent) => {
      const frameRect = frameElement.getBoundingClientRect();
      pointerRef.current = {
        x: (pointerEvent.clientX - frameRect.left) / frameRect.width,
        y: (pointerEvent.clientY - frameRect.top) / frameRect.height,
        active: true,
      };
      lastPointerMoveAtRef.current = performance.now() / 1000;
    };

    const releasePointer = () => {
      pointerRef.current.active = false;
    };

    window.addEventListener("pointermove", followPointer, { passive: true });
    /* Leaving the window entirely counts as leaving the field. */
    document.addEventListener("pointerleave", releasePointer);
    return () => {
      window.removeEventListener("pointermove", followPointer);
      document.removeEventListener("pointerleave", releasePointer);
    };
  }, []);

  return (
    /* Listens on `window`, not on this element. `.hero-scene-slot` sets
      `pointer-events: none` so the canvas can never block the headline, and
      that kills `onPointerMove` here — the whole layer, children included,
      is transparent to the pointer. Reading the frame's own rect from a
      window listener keeps the coordinates honest while letting the field
      react to the pointer anywhere over the hero. */
    <div ref={frameRef} className="hero-scene-frame" aria-hidden="true">
      {contextLost ? null : (
        <Canvas
        camera={{ position: [0, 0.35, 3.4], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        style={{ position: "absolute", inset: 0 }}
      >
        {/* The palette is read from the theme tokens on mount, so nothing is
            rendered for the single frame before it is known. */}
        {palette ? (
          <>
            <ambientLight intensity={palette.ambientIntensity} />
            <directionalLight
              position={[3, 4, 5]}
              intensity={palette.lightIntensity}
            />
            <directionalLight
              position={[-4, -2, 2]}
              intensity={palette.lightIntensity * 0.35}
              color="#5a7bd8"
            />
            <ReliefField
              pointer={pointerRef}
              lastPointerMoveAt={lastPointerMoveAtRef}
              palette={palette}
            />
          </>
        ) : null}
        <DriftingCamera pointer={pointerRef} />
        <CadenceTicker />
        </Canvas>
      )}
    </div>
  );
}
