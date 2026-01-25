const canvas = document.getElementById('hero-3d');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0f1a);


const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 2, 6);
camera.lookAt(0, 0, 0);


const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


const gridSize = 40;
const gridDivisions = 80;

const grid = new THREE.GridHelper(
  gridSize,
  gridDivisions,
  0x3a4a6a,
  0x1e2a44
);
grid.position.y = -1.2;
scene.add(grid);

const wallGeometry = new THREE.PlaneGeometry(60, 30);
const wallMaterial = new THREE.MeshBasicMaterial({
  color: 0x0b0f1a,
});
const wall = new THREE.Mesh(wallGeometry, wallMaterial);
wall.position.z = -20;
wall.position.y = 5;
scene.add(wall);


const geometry = new THREE.TorusKnotGeometry(1.2, 0.35, 180, 24);

const material = new THREE.MeshBasicMaterial({
  color: 0x6fa8ff,
  wireframe: true,
  transparent: true,
  opacity: 0.9,
});

const core = new THREE.Mesh(geometry, material);

core.position.set(1.6, 0.2, 0);

scene.add(core);


const edges = new THREE.EdgesGeometry(geometry);
const lineMaterial = new THREE.LineBasicMaterial({
  color: 0x9bbcff,
  transparent: true,
  opacity: 0.6,
});
const wire = new THREE.LineSegments(edges, lineMaterial);

wire.position.set(1.6, 0.2, 0);

scene.add(wire);


const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
keyLight.position.set(3, 6, 4);
scene.add(keyLight);


export function animateCanvas() {


  core.rotation.x += 0.003;
  core.rotation.y += 0.004;

  wire.rotation.copy(core.rotation);

  renderer.render(scene, camera);

}

function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

window.addEventListener('resize', onResize);
onResize();
