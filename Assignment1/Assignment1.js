// Assignment 1

// Initialize WebGL renderer
const canvas1 = document.getElementById("canvas1");
const renderer1 = new THREE.WebGLRenderer({canvas:canvas1, antialias:true});
renderer1.setClearColor('white');  // background color


// Create a new Three.js scene
const scene = new THREE.Scene();
// Just for debugging: delete for the final version!
const axesHelper = new THREE.AxesHelper();
scene.add( axesHelper );

// Add a camera
const camera1 = new THREE.PerspectiveCamera( 75, canvas1.width / canvas1.height, 0.1, 500 );
camera1.position.set(1,2,5);


// Render the scene
function render() {
  requestAnimationFrame(render);

  renderer1.render(scene, camera1);
}
render();
