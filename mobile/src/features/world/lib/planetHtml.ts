import type { GrowthStage, TreeState } from '../../../lib/api-types';

/**
 * Self-contained HTML/JS document rendered inside a WebView: a Three.js
 * planet sphere with one marker per tree, positioned by (planet_lat,
 * planet_lon) and rotatable by dragging with a thumb.
 *
 * Loaded once per WorldScreen mount; subsequent tree updates (e.g. after a
 * daily press) are pushed in-place via `postMessage` from `PlanetView`
 * rather than rebuilding this HTML, so rotation state isn't lost.
 */

const STAGE_COLOR: Record<GrowthStage, string> = {
  budding: '#8bc98b',
  small: '#4caf6b',
  large: '#2e8b4f',
  mature: '#1f6b3a',
};

// Base marker scale per stage; `stage_progress` (and budding_substage)
// interpolate within these so growth feels continuous, not a sudden jump.
const STAGE_BASE_SCALE: Record<GrowthStage, number> = {
  budding: 0.08,
  small: 0.16,
  large: 0.32,
  mature: 0.46,
};
const STAGE_NEXT_SCALE: Record<GrowthStage, number> = {
  budding: 0.16,
  small: 0.32,
  large: 0.46,
  mature: 0.46,
};

function markerScaleFor(tree: TreeState): number {
  if (tree.growth_stage === 'budding') {
    const substage = tree.budding_substage ?? 0;
    const withinBudding = substage / 5;
    const base = STAGE_BASE_SCALE.budding;
    const next = STAGE_NEXT_SCALE.budding;
    return base + (next - base) * withinBudding;
  }
  const base = STAGE_BASE_SCALE[tree.growth_stage];
  const next = STAGE_NEXT_SCALE[tree.growth_stage];
  return base + (next - base) * tree.stage_progress;
}

interface MarkerSpec {
  id: string;
  lat: number;
  lon: number;
  color: string;
  scale: number;
}

function toMarkerSpecs(trees: TreeState[]): MarkerSpec[] {
  return trees.map((tree) => ({
    id: tree.patient_medication_id,
    lat: tree.planet_lat,
    lon: tree.planet_lon,
    color: STAGE_COLOR[tree.growth_stage],
    scale: markerScaleFor(tree),
  }));
}

export function buildPlanetHtml(trees: TreeState[]): string {
  const initialMarkers = JSON.stringify(toMarkerSpecs(trees));

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <style>
    html, body { margin: 0; padding: 0; overflow: hidden; background: #0b1021; touch-action: none; }
    canvas { display: block; }
  </style>
</head>
<body>
  <script src="https://unpkg.com/three@0.160.0/build/three.min.js"></script>
  <script>
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 3.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    document.body.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const sun = new THREE.DirectionalLight(0xfff2d8, 1.05);
    sun.position.set(3, 2, 4);
    scene.add(sun);

    // Faint starfield so the planet reads as floating in space.
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 300;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 12 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    scene.add(new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xffffff, size: 0.035 })));

    const planetGroup = new THREE.Group();
    scene.add(planetGroup);

    const PLANET_RADIUS = 1;
    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(PLANET_RADIUS, 48, 48),
      new THREE.MeshStandardMaterial({ color: 0x2f6f7a, roughness: 0.85, metalness: 0.05 }),
    );
    planetGroup.add(planet);

    // Loose lat/lon grid — an inert visual reference, not a data field.
    const gridMaterial = new THREE.LineBasicMaterial({ color: 0x5fb8c9, transparent: true, opacity: 0.18 });
    for (let i = 1; i < 6; i++) {
      const lat = -90 + (i * 180) / 6;
      const ringRadius = PLANET_RADIUS * Math.cos((lat * Math.PI) / 180) * 1.001;
      const y = PLANET_RADIUS * Math.sin((lat * Math.PI) / 180);
      const ringPoints = [];
      for (let a = 0; a <= 64; a++) {
        const t = (a / 64) * Math.PI * 2;
        ringPoints.push(new THREE.Vector3(ringRadius * Math.cos(t), y, ringRadius * Math.sin(t)));
      }
      planetGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ringPoints), gridMaterial));
    }

    const markersGroup = new THREE.Group();
    planetGroup.add(markersGroup);

    function latLonToVector3(lat, lon, radius) {
      const latRad = (lat * Math.PI) / 180;
      const lonRad = (lon * Math.PI) / 180;
      return new THREE.Vector3(
        radius * Math.cos(latRad) * Math.cos(lonRad),
        radius * Math.sin(latRad),
        radius * Math.cos(latRad) * Math.sin(lonRad),
      );
    }

    function buildTreeMesh(spec) {
      const group = new THREE.Group();
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.045, 0.18, 6),
        new THREE.MeshStandardMaterial({ color: 0x6b4a2f, roughness: 0.9 }),
      );
      trunk.position.y = 0.09;
      const canopy = new THREE.Mesh(
        new THREE.ConeGeometry(0.16, 0.28, 8),
        new THREE.MeshStandardMaterial({ color: spec.color, roughness: 0.7 }),
      );
      canopy.position.y = 0.28;
      group.add(trunk, canopy);
      group.scale.setScalar(spec.scale / 0.3);
      return group;
    }

    function setMarkers(specs) {
      while (markersGroup.children.length) {
        markersGroup.remove(markersGroup.children[0]);
      }
      for (const spec of specs) {
        const position = latLonToVector3(spec.lat, spec.lon, PLANET_RADIUS);
        const mesh = buildTreeMesh(spec);
        mesh.position.copy(position);
        mesh.lookAt(position.clone().multiplyScalar(2));
        mesh.rotateX(Math.PI / 2);
        mesh.userData.treeId = spec.id;
        markersGroup.add(mesh);
      }
    }

    setMarkers(${initialMarkers});

    // --- Drag-to-rotate (thumb-friendly) + tap-to-select -------------------
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    let moved = false;
    let idleSpin = true;

    function onPointerDown(event) {
      isDragging = true;
      idleSpin = false;
      moved = false;
      lastX = event.clientX;
      lastY = event.clientY;
    }

    function onPointerMove(event) {
      if (!isDragging) return;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
      planetGroup.rotation.y += dx * 0.005;
      planetGroup.rotation.x = Math.max(
        -1.3,
        Math.min(1.3, planetGroup.rotation.x + dy * 0.005),
      );
      lastX = event.clientX;
      lastY = event.clientY;
    }

    const raycaster = new THREE.Raycaster();
    function onPointerUp(event) {
      isDragging = false;
      idleSpin = true;
      if (moved) return;
      const pointer = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(markersGroup.children, true);
      if (hits.length > 0) {
        let node = hits[0].object;
        while (node && !node.userData.treeId && node.parent) node = node.parent;
        if (node && node.userData.treeId) {
          post({ type: 'treeTap', patientMedicationId: node.userData.treeId });
        }
      }
    }

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointercancel', onPointerUp);

    function post(message) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
      }
    }

    function handleIncomingMessage(event) {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'setMarkers') {
          setMarkers(message.markers);
        }
      } catch (err) {
        // ignore malformed messages
      }
    }
    document.addEventListener('message', handleIncomingMessage);
    window.addEventListener('message', handleIncomingMessage);

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    function animate() {
      requestAnimationFrame(animate);
      if (idleSpin) planetGroup.rotation.y += 0.0009;
      renderer.render(scene, camera);
    }
    animate();

    post({ type: 'ready' });
  </script>
</body>
</html>`;
}

export function buildSetMarkersMessage(trees: TreeState[]): string {
  return JSON.stringify({ type: 'setMarkers', markers: toMarkerSpecs(trees) });
}
