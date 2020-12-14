// Assignment 3

import * as THREE from "../moduleLibs/build/three.module.js";
import { TrackballControls } from "../moduleLibs/examples/jsm/controls/TrackballControls.js";


// Initialize WebGL renderer
const canvas = document.getElementById("canvas");
const renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:true});
renderer.setClearColor('white');  // background color


// Create a new Three.js scene
const scene = new THREE.Scene();
// Just for debugging: delete for the final version!
const axesHelper = new THREE.AxesHelper();
scene.add( axesHelper );

// Add a camera
const camera = new THREE.PerspectiveCamera( 75, canvas.width / canvas.height, 0.1, 500 );
camera.position.set(1,2,5);
const controls = new TrackballControls(camera, canvas);
// full screen app:
function resizeWin() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resizeWin);
resizeWin();


// Render the scene
function render() {
  requestAnimationFrame(render);

  controls.update();
  renderer.render(scene, camera);
}
render();
