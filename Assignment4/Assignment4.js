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
const nearH = 2 * near * Math.sin((fov / 2) * Math.PI / 180);
const nearW = aspect * nearH;
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

const pickData = [];   // store data to be used across different 'pickOrDragBall' calls

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

  function fromViewportToCameraSpace(xvp, yvp, zClickCameraSpace) {
    const xNDC = xvp * 2 / canvas.width - 1;
    const yNDC = - yvp * 2 / canvas.height + 1;

    const xClickCameraSpace = -(xNDC * nearW * zClickCameraSpace) / (2 * near);
    const yClickCameraSpace = -(yNDC * nearH * zClickCameraSpace) / (2 * near);
    
    return new THREE.Vector3(xClickCameraSpace, yClickCameraSpace, zClickCameraSpace);
  }
  function fromCameraSpacetoNDC(vector) {
    const xNDC = (-2 * near * vector.x) / (nearW * vector.z);
    const yNDC = (-2 * near * vector.y) / (nearH * vector.z);
    const zNDC = (far + near) / (far - near) + (2 * near * far) / ((far - near) * vector.z);
    return new THREE.Vector3(xNDC, yNDC, zNDC);
  }
  function printData(distance,ballCoordinates, ballCameraSpace) {
    console.log('Distance: ' + distance);
    console.log('Ball center(world): ' + JSON.stringify(ballCoordinates));
    console.log('Ball center(camera): ' + JSON.stringify(ballCameraSpace));
    const ndcVector = fromCameraSpacetoNDC(ballCameraSpace);
    console.log('Ball center(NDC): ' + JSON.stringify(ndcVector));
  }

  // insert your code here:
  const ballCameraSpace = ball.position.clone().applyMatrix4(camera.matrixWorldInverse);
  if (isMoveEvent) {
    const clickCameraSpace = fromViewportToCameraSpace(xvp, yvp, ballCameraSpace.z);
    if (ball == pickData[0]) {
      const clickWorld = clickCameraSpace.clone().applyMatrix4(camera.matrixWorld);
      ball.position.x = clickWorld.x;
      ball.position.y = clickWorld.y;
      ball.position.z = clickWorld.z;
    }
  } else {
    const pNear = fromViewportToCameraSpace(xvp, yvp, -near);
    const n = pNear.clone().normalize();
    const dist = ballCameraSpace.clone().add(n.clone().multiplyScalar(-n.clone().dot(ballCameraSpace))).length();
    if (dist <= ball.userData.radius) {
      pickData.push(ball);
      ball.material.emissive = { r: ball.material.color.r * 3 / 4, g: ball.material.color.g * 3 / 4, b: ball.material.color.b * 3 / 4 };
      printData(dist, ball.position, ballCameraSpace);
    }
  }

}



canvas.addEventListener('mouseup', event => {
  // insert your code here:
  pickData.length = 0;
  balls.forEach((b, idx) => { b.material.emissive = { r: 0, g: 0, b: 0 }; });
});


// * Render loop
// const controls = new THREE.TrackballControls(camera, renderer.domElement);
function render() {
  requestAnimationFrame(render);

  // controls.update();
  renderer.render(scene, camera);
}
render();
