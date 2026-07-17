const hero = document.querySelector(".hero");
const canvas = document.getElementById("hero-3d");

if (!hero || !canvas) {
  throw new Error("Hero veya #hero-3d canvas bulunamadı.");
}

/* -------------------------------------------------
   SAHNE
------------------------------------------------- */

const scene = new THREE.Scene();

scene.fog = new THREE.FogExp2(
  0x090909,
  0.052
);

/* -------------------------------------------------
   KAMERA
------------------------------------------------- */

const camera = new THREE.PerspectiveCamera(
  46,
  1,
  0.1,
  100
);

camera.position.set(0, 1.2, 7.4);

/* -------------------------------------------------
   RENDERER
------------------------------------------------- */

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: "high-performance"
});

renderer.setClearColor(0x090909, 0);

if ("outputColorSpace" in renderer) {
  renderer.outputColorSpace = THREE.SRGBColorSpace;
}

if ("toneMapping" in renderer) {
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
}

/* -------------------------------------------------
   ANA HEYKEL GRUBU
------------------------------------------------- */

const sculpture = new THREE.Group();
scene.add(sculpture);

/*
 * Akışkan şeritler.
 * Torus knot yerine birbirinin çevresinde hareket eden
 * organik eğriler kullanılıyor.
 */

const ribbonColors = [
  0xd47736,
  0xe68b4c,
  0xffad73,
  0xb95824,
  0xf09255,
  0x8f3f1c
];

const ribbons = [];

function createRibbon(index) {
  const points = [];
  const pointCount = 86;

  for (
    let pointIndex = 0;
    pointIndex < pointCount;
    pointIndex += 1
  ) {
    const progress =
      pointIndex / (pointCount - 1);

    const angle =
      progress * Math.PI * 3.4 +
      index * 0.72;

    const radius =
      1.04 +
      Math.sin(
        progress * Math.PI * 5 +
        index
      ) * 0.19;

    const x =
      Math.cos(angle) *
      radius;

    const y =
      (progress - 0.5) * 3.35 +
      Math.sin(
        angle * 1.35 + index
      ) * 0.2;

    const z =
      Math.sin(angle) *
      radius *
      0.82;

    points.push(
      new THREE.Vector3(x, y, z)
    );
  }

  const curve =
    new THREE.CatmullRomCurve3(
      points
    );

  const geometry =
    new THREE.TubeGeometry(
      curve,
      180,
      0.045 + index * 0.003,
      8,
      false
    );

  const color =
    ribbonColors[
      index % ribbonColors.length
    ];

  const material =
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity:
        index % 2 === 0 ? 0.48 : 0.25,
      metalness: 0.55,
      roughness: 0.3,
      transparent: true,
      opacity:
        index === 0 ? 1 : 0.78
    });

  const ribbon = new THREE.Mesh(
    geometry,
    material
  );

  ribbon.userData = {
    speed: 0.055 + index * 0.008,
    offset: index * 0.7
  };

  ribbons.push(ribbon);
  sculpture.add(ribbon);
}

for (let index = 0; index < 6; index += 1) {
  createRibbon(index);
}

/* -------------------------------------------------
   İÇ ÇEKİRDEK
------------------------------------------------- */

const coreGeometry =
  new THREE.IcosahedronGeometry(
    0.55,
    3
  );

const coreMaterial =
  new THREE.MeshPhysicalMaterial({
    color: 0x5d2412,
    emissive: 0xd47736,
    emissiveIntensity: 1.5,
    metalness: 0.45,
    roughness: 0.23,
    clearcoat: 0.9,
    clearcoatRoughness: 0.2
  });

const core = new THREE.Mesh(
  coreGeometry,
  coreMaterial
);

sculpture.add(core);

/* Çekirdek wireframe */

const coreWireMaterial =
  new THREE.MeshBasicMaterial({
    color: 0xffc093,
    wireframe: true,
    transparent: true,
    opacity: 0.3,
    depthWrite: false
  });

const coreWire = new THREE.Mesh(
  coreGeometry,
  coreWireMaterial
);

coreWire.scale.setScalar(1.06);
sculpture.add(coreWire);

/* -------------------------------------------------
   YÖRÜNGE HALKALARI
------------------------------------------------- */

function createOrbit(
  radius,
  opacity,
  rotation
) {
  const geometry =
    new THREE.TorusGeometry(
      radius,
      0.009,
      5,
      180
    );

  const material =
    new THREE.MeshBasicMaterial({
      color: 0xd47736,
      transparent: true,
      opacity,
      depthWrite: false
    });

  const orbit = new THREE.Mesh(
    geometry,
    material
  );

  orbit.rotation.set(
    rotation.x,
    rotation.y,
    rotation.z
  );

  sculpture.add(orbit);

  return orbit;
}

const orbitOne = createOrbit(
  1.75,
  0.34,
  {
    x: Math.PI / 2.4,
    y: 0.25,
    z: 0.1
  }
);

const orbitTwo = createOrbit(
  2.25,
  0.17,
  {
    x: Math.PI / 2.1,
    y: -0.45,
    z: 0.6
  }
);

const orbitThree = createOrbit(
  2.72,
  0.08,
  {
    x: 0.45,
    y: Math.PI / 2.5,
    z: -0.15
  }
);

/* -------------------------------------------------
   UYDULAR
------------------------------------------------- */

const satelliteGroup = new THREE.Group();
sculpture.add(satelliteGroup);

const satelliteGeometry =
  new THREE.OctahedronGeometry(
    0.065,
    0
  );

const satellites = [];

for (let index = 0; index < 4; index += 1) {
  const material =
    new THREE.MeshBasicMaterial({
      color:
        index % 2 === 0
          ? 0xffc093
          : 0xd47736
    });

  const satellite = new THREE.Mesh(
    satelliteGeometry,
    material
  );

  satellite.userData = {
    radius: 1.75 + index * 0.23,
    speed: 0.19 + index * 0.035,
    offset: index * 1.45,
    height: 0.22 + index * 0.06
  };

  satellites.push(satellite);
  satelliteGroup.add(satellite);
}

/* -------------------------------------------------
   PARÇACIKLAR
------------------------------------------------- */

const particleCount = 330;

const particlePositions =
  new Float32Array(
    particleCount * 3
  );

for (
  let index = 0;
  index < particleCount;
  index += 1
) {
  const positionIndex = index * 3;

  const radius =
    2.2 + Math.random() * 4.5;

  const angle =
    Math.random() *
    Math.PI *
    2;

  particlePositions[positionIndex] =
    Math.cos(angle) * radius;

  particlePositions[positionIndex + 1] =
    (Math.random() - 0.5) * 6;

  particlePositions[positionIndex + 2] =
    Math.sin(angle) * radius;
}

const particleGeometry =
  new THREE.BufferGeometry();

particleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(
    particlePositions,
    3
  )
);

const particleMaterial =
  new THREE.PointsMaterial({
    color: 0xe68b4c,
    size: 0.022,
    transparent: true,
    opacity: 0.34,
    sizeAttenuation: true,
    depthWrite: false
  });

const particles = new THREE.Points(
  particleGeometry,
  particleMaterial
);

sculpture.add(particles);

/* -------------------------------------------------
   ZEMİN GRID
------------------------------------------------- */

const grid = new THREE.GridHelper(
  34,
  68,
  0x7a3c20,
  0x251912
);

grid.position.set(
  0,
  -2.35,
  -1.4
);

grid.material.transparent = true;
grid.material.opacity = 0.23;
grid.material.depthWrite = false;

scene.add(grid);

/* -------------------------------------------------
   IŞIKLAR
------------------------------------------------- */

const hemisphereLight =
  new THREE.HemisphereLight(
    0xffd1ad,
    0x090909,
    1.15
  );

scene.add(hemisphereLight);

const keyLight =
  new THREE.DirectionalLight(
    0xffead8,
    1.9
  );

keyLight.position.set(
  4,
  6,
  5
);

scene.add(keyLight);

const orangeLight =
  new THREE.PointLight(
    0xd47736,
    18,
    13,
    2
  );

orangeLight.position.set(
  2.8,
  1.3,
  3.5
);

scene.add(orangeLight);

const rimLight =
  new THREE.PointLight(
    0xffb47d,
    9,
    10,
    2
  );

rimLight.position.set(
  -2,
  1.5,
  -2
);

scene.add(rimLight);

/* -------------------------------------------------
   ETKİLEŞİM
------------------------------------------------- */

const pointerTarget =
  new THREE.Vector2();

const pointerCurrent =
  new THREE.Vector2();

const reducedMotion =
  window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

const clock = new THREE.Clock();

let sceneVisible = true;

let basePositionX = 2.25;
let basePositionY = 0.1;
let baseCameraY = 1.25;
let baseCameraZ = 7.3;
let baseScale = 1;

hero.addEventListener(
  "pointermove",
  (event) => {
    const bounds =
      hero.getBoundingClientRect();

    pointerTarget.x =
      (
        (event.clientX - bounds.left) /
        bounds.width
      ) * 2 - 1;

    pointerTarget.y =
      -(
        (
          (event.clientY - bounds.top) /
          bounds.height
        ) * 2 - 1
      );
  }
);

hero.addEventListener(
  "pointerleave",
  () => {
    pointerTarget.set(0, 0);
  }
);

/* -------------------------------------------------
   RESPONSIVE
------------------------------------------------- */

function updateSceneLayout() {
  const width = hero.clientWidth;
  const height = hero.clientHeight;

  if (!width || !height) return;

  camera.aspect = width / height;

  if (width <= 700) {
    camera.fov = 55;

    basePositionX = 0.85;
    basePositionY = 1.55;

    baseCameraY = 1.25;
    baseCameraZ = 9.2;

    baseScale = 0.58;

    /*
     * Mobilde detay azaltma
     */
    ribbons.forEach(
      (ribbon, index) => {
        ribbon.visible = index < 4;
      }
    );

    particles.visible = false;
    orbitThree.visible = false;

    grid.position.y = -2.6;
    grid.material.opacity = 0.12;
  } else if (width <= 1050) {
    camera.fov = 50;

    basePositionX = 1.4;
    basePositionY = 0.65;

    baseCameraY = 1.25;
    baseCameraZ = 8.2;

    baseScale = 0.8;

    ribbons.forEach(
      (ribbon, index) => {
        ribbon.visible = index < 5;
      }
    );

    particles.visible = true;
    particleMaterial.opacity = 0.22;
    orbitThree.visible = true;

    grid.position.y = -2.45;
    grid.material.opacity = 0.17;
  } else {
    camera.fov = 46;

    basePositionX = 2.25;
    basePositionY = 0.1;

    baseCameraY = 1.25;
    baseCameraZ = 7.3;

    baseScale = 1;

    ribbons.forEach((ribbon) => {
      ribbon.visible = true;
    });

    particles.visible = true;
    particleMaterial.opacity = 0.34;
    orbitThree.visible = true;

    grid.position.y = -2.35;
    grid.material.opacity = 0.23;
  }

  sculpture.scale.setScalar(
    baseScale
  );

  camera.position.set(
    0,
    baseCameraY,
    baseCameraZ
  );

  camera.updateProjectionMatrix();

  renderer.setSize(
    width,
    height,
    false
  );

  /*
   * Mobilde 1.5 DPR sınırı performansı artırır.
   */
  const maximumPixelRatio =
    width <= 700 ? 1.5 : 2;

  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio || 1,
      maximumPixelRatio
    )
  );
}

const resizeObserver =
  new ResizeObserver(
    updateSceneLayout
  );

resizeObserver.observe(hero);

/* Hero görünmüyorsa render yükünü azalt */

const sceneObserver =
  new IntersectionObserver(
    ([entry]) => {
      sceneVisible =
        entry.isIntersecting;
    },
    {
      threshold: 0.01
    }
  );

sceneObserver.observe(hero);

/* -------------------------------------------------
   ANİMASYON
------------------------------------------------- */

function animateCanvas() {
  if (!sceneVisible || document.hidden) {
    clock.getDelta();
    return;
  }

  const delta = Math.min(
    clock.getDelta(),
    0.04
  );

  const elapsed = clock.elapsedTime;

  pointerCurrent.lerp(
    pointerTarget,
    0.045
  );

  const motion =
    reducedMotion.matches ? 0 : 1;

  ribbons.forEach(
    (ribbon, index) => {
      ribbon.rotation.y +=
        delta *
        ribbon.userData.speed *
        motion;

      ribbon.rotation.z =
        Math.sin(
          elapsed * 0.17 +
          ribbon.userData.offset
        ) * 0.075 * motion;

      ribbon.position.y =
        Math.sin(
          elapsed * 0.42 +
          index * 0.7
        ) * 0.025 * motion;
    }
  );

  core.rotation.x +=
    delta * 0.13 * motion;

  core.rotation.y -=
    delta * 0.19 * motion;

  coreWire.rotation.copy(
    core.rotation
  );

  orbitOne.rotation.z +=
    delta * 0.065 * motion;

  orbitTwo.rotation.z -=
    delta * 0.045 * motion;

  orbitThree.rotation.x +=
    delta * 0.026 * motion;

  particles.rotation.y +=
    delta * 0.012 * motion;

  satellites.forEach(
    (satellite, index) => {
      const data =
        satellite.userData;

      const angle =
        elapsed * data.speed +
        data.offset;

      satellite.position.x =
        Math.cos(angle) *
        data.radius;

      satellite.position.z =
        Math.sin(angle) *
        data.radius;

      satellite.position.y =
        Math.sin(
          angle * 1.6 + index
        ) * data.height;

      satellite.rotation.x +=
        delta * 0.7 * motion;

      satellite.rotation.y +=
        delta * 0.5 * motion;
    }
  );

  const corePulse =
    reducedMotion.matches
      ? 1
      : 1 +
        Math.sin(elapsed * 1.45) *
        0.035;

  core.scale.setScalar(corePulse);

  coreWire.scale.setScalar(
    corePulse * 1.06
  );

  const floatingY =
    reducedMotion.matches
      ? 0
      : Math.sin(elapsed * 0.6) *
        0.07;

  sculpture.position.x =
    basePositionX +
    pointerCurrent.x * 0.2;

  sculpture.position.y =
    basePositionY +
    floatingY +
    pointerCurrent.y * 0.12;

  sculpture.rotation.z +=
    (
      pointerCurrent.x * 0.07 -
      sculpture.rotation.z
    ) * 0.035;

  sculpture.rotation.x +=
    (
      pointerCurrent.y * 0.035 -
      sculpture.rotation.x
    ) * 0.025;

  camera.position.x +=
    (
      pointerCurrent.x * 0.16 -
      camera.position.x
    ) * 0.025;

  camera.position.y +=
    (
      baseCameraY +
      pointerCurrent.y * 0.06 -
      camera.position.y
    ) * 0.025;

  camera.position.z +=
    (
      baseCameraZ -
      camera.position.z
    ) * 0.025;

  camera.lookAt(
    basePositionX * 0.25,
    0.1,
    0
  );

  orangeLight.position.x =
    2.8 +
    Math.sin(elapsed * 0.45) *
    0.65;

  orangeLight.position.y =
    1.3 +
    Math.cos(elapsed * 0.38) *
    0.3;

  renderer.render(
    scene,
    camera
  );
}

/* Kendi animasyon döngüsü */

renderer.setAnimationLoop(
  animateCanvas
);

updateSceneLayout();