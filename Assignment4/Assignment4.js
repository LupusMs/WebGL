"use strict";

// * Initialize webGL
const canvas = document.getElementById("mycanvas");
const renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:true});
renderer.setClearColor('rgb(255, 255, 255)');    // set background color

// * Create a new Three.js scene with camera and light
const scene = new THREE.Scene();
const fov = 45;
const aspect = canvas.width / canvas.height;
// play with 'near' parameter to see the effect on z component in NDC space
// (compare slide 71 of chapter 4)
const near = 0.1;
const far = 100;
const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
camera.position.set(8,18,8);
camera.lookAt(scene.position);
const light = new THREE.PointLight();
light.position.copy(camera.position.clone());
scene.add( light );
scene.add(new THREE.AmbientLight(0x606060));

// * Place balls randomly within outerRadius from center of world
const nBalls =10;
const outerRadius = 8;
const ballMinRadius = 0.5;
const ballMaxRadius = 1.5;
const balls = [];
for(let k=1; k<=nBalls; ++k) {
  // random color
  const rdColor = new THREE.Color(Math.random(), Math.random(), Math.random());
  // random radius
  const rdRadius = ballMinRadius + Math.random() * (ballMaxRadius - ballMinRadius);
  // random position
  const rd = () => 2*Math.random() - 1;  // just a helper function
  let rdPos;
  while(true) {
    rdPos = new THREE.Vector3(outerRadius*rd(), outerRadius*rd(), outerRadius*rd());
    if(rdPos.lengthSq() <= outerRadius*outerRadius) {
      break;
    }
  }

  // store all the balls within balls array
  const ball = new THREE.Mesh(new THREE.SphereBufferGeometry(rdRadius, 32, 32),
                              new THREE.MeshPhongMaterial( {color: rdColor}));
  ball.userData.radius = rdRadius;
  ball.position.copy(rdPos);
  scene.add(ball);
  balls.push(ball);
}

// * Implement picking and dragging dragging functionality

let pickData = {};   // store data to be used across different 'pickOrDragBall' calls

canvas.addEventListener('mousedown', event => {
  // calculate viewport pixel position:
  const rect = canvas.getBoundingClientRect();
  const xvp = event.clientX - rect.left;
  const yvp = event.clientY - rect.top;

  balls.forEach((b, idx) => pickOrDragBall(xvp, yvp, b, idx, false));
});


canvas.addEventListener('mousemove', event => {
    const rect = canvas.getBoundingClientRect();
    const xvp = event.clientX - rect.left;
    const yvp = event.clientY - rect.top;
    balls.forEach((b,idx) => pickOrDragBall(xvp, yvp, b, idx, true));
});


/**
 * Find out if a ball is picked with the mouse. If it is, highlight the ball
 * @param {Number} xvp the viewport x-coordinate (pixel units)
 * @param {Number} yvp the viewport x-coordinate (pixel units)
 * @param {Object} ball a THREE.Mesh storing the ball and its radius as ball.userData.radius.
 * @param {idx} number idx of ball in balls array
 * @param {isMoveEvent} boolean indicates whether it's a mousemove or mousedown event
 */
function pickOrDragBall(xvp, yvp, ball, idx, isMoveEvent) {

  console.assert(xvp>=0 && xvp<=canvas.width, 'xvp='+xvp);
  console.assert(yvp>=0 && yvp<=canvas.height, 'yvp='+yvp);

  // insert your code here:

}



canvas.addEventListener('mouseup', event => {
  // insert your code here:

});


// * Render loop
// const controls = new THREE.TrackballControls(camera, renderer.domElement);
function render() {
  requestAnimationFrame(render);

  // controls.update();
  renderer.render(scene, camera);
}
render();
