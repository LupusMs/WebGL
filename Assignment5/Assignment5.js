// Solar-System Simulation

import * as THREE from "../moduleLibs/build/three.module.js";
import * as dat from "../moduleLibs/build/dat.gui.module.js";
import {OrbitControls } from "../moduleLibs/examples/jsm/controls/OrbitControls.js";


// * Initialize webGL
const canvas = document.getElementById("mycanvas");
const renderer = new THREE.WebGLRenderer({canvas:canvas});
// renderer.setSize(canvas.width, canvas.height);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);

// create scene, camera and light
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight,
                                           0.1, 2000);
camera.position.set(40,3,2);
scene.add(camera);
scene.add(new THREE.AxesHelper(10));   // remove this for final version!


function resizeCB() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
}
resizeCB();
window.addEventListener("resize", resizeCB);

// Light
const pointLight = new THREE.PointLight(0xffffff);
scene.add(pointLight);
const ambLight = new THREE.AmbientLight();
ambLight.color =  new THREE.Color('#404040');
scene.add(ambLight);


// Add a sphere with variable radius
const data = {
  flag:true,
  r:5
};

const sphereGeo = new THREE.SphereBufferGeometry(data.r, 48,48);
const sphere = new THREE.Mesh(sphereGeo,
                              new THREE.MeshBasicMaterial({color:'red'}));
scene.add(sphere);

function updateSphere() {
  sphere.geometry = new THREE.SphereBufferGeometry(data.r, 48,48);
}

// * dat.gui
window.onload = function() {
  const gui = new dat.GUI();
  gui.add(data, 'flag').onChange(function() {
    console.log('flag has changed to ', data.flag);
  });
  const rSlider = gui.add(data, 'r', 1.0, 10.0).onChange(updateSphere);
 };

// * Render loop
const clock = new THREE.Clock();
const controls = new OrbitControls( camera, canvas );
function render() {

  requestAnimationFrame(render);
  const h = clock.getDelta();
  const t = clock.getElapsedTime();

  renderer.render(scene, camera);
}

render();
