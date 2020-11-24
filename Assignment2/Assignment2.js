"use strict";
//Clock module
const clock = () => {
  const sizes = {
    cylinder: {
      radius: 2.5,
      height: 0.5,
      segments: 60
    },
    tick: {
      width: 0.05,
      height: 0.55,
      offsetZHours: 2.2,
      offsetZMinutes: 2.3,
      sizeHour: 0.35,
      sizeMinute: 0.2
    },
    blob: {
      radius: 2.5 / 20,
      height: 0.7,
      segments: 60
    },
    hands: {
      seconds: {
        height: 0.3,
        depth: 1.8,
      },
      minutes: {
        scaleX: 0.03,
        scaleY: 0.04,
        scaleZ: 0.5,
      },
      hours: {
        scaleX: 0.06,
        scaleY: 0.04,
        scaleZ: 0.5,
      },
      offsetYSide1: 0.2,
      offsetYSide2: -0.2,
      offsetZ: 1,
      radius: 2.4,
    },
    outerRing: {
      innerRadius: 2.4,
      outerRadius: 2.6,
      height: 0.6,
      latheSegments: 40,
      offsetY: 0.3,
    }
  }
  const initialDate = new Date();
  const TIMEZONE_OFFSET = 5;
  const state = {
    side1: {
      seconds: initialDate.getSeconds(),
      minutes: initialDate.getMinutes(),
      hoursInitial: (initialDate.getHours() % 12 || 12) + TIMEZONE_OFFSET,
      direction: 1,
    },
    side2: {
      seconds: initialDate.getSeconds(),
      minutes: initialDate.getMinutes(),
      hoursInitial: initialDate.getHours() % 12 || 12,
      direction: -1,
    },
  }
  const hands = {
    handHours1: null,
    handHours2: null,
    handMinutes1: null,
    handMinutes2: null,
    handSeconds1: null,
    handSeconds2: null,
  }

  function getCylinder() {
    const cylinderGeometry = new THREE.CylinderGeometry(
      sizes.cylinder.radius,
      sizes.cylinder.radius,
      sizes.cylinder.height,
      sizes.cylinder.segments);
    const materialWhite = new THREE.MeshBasicMaterial({ color: 'white', side: THREE.DoubleSide });
    return new THREE.Mesh(cylinderGeometry, materialWhite);
  }
  function getTick(rotationY, size, offsetZ, color = 'black') {
    const geometry = new THREE.BoxGeometry(sizes.tick.width, sizes.tick.height, size);
    const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
    const box = new THREE.Mesh(geometry, material);
    box.position.z += offsetZ;
    const a = new THREE.Euler(0, rotationY, 0);
    const m = new THREE.Matrix4();
    m.makeRotationFromEuler(a);
    box.applyMatrix4(m);
    return box;
  }
  function populateSceneWithTicks(scene) {
    const FULL_CIRCLE = Math.PI * 2;
    const ONE_HOUR = Math.PI / 6;
    const ONE_MINUTE = Math.PI / 30;
    for (let i = 0; i < FULL_CIRCLE; i += ONE_HOUR) {
      if (i == 0) {
        scene.add(getTick(i, sizes.tick.sizeHour, sizes.tick.offsetZHours, 'blue'));
      } else {
        scene.add(getTick(i, sizes.tick.sizeHour, sizes.tick.offsetZHours));
      }
    }
    for (let i = ONE_MINUTE; i < FULL_CIRCLE - ONE_MINUTE; i += ONE_MINUTE) {
      scene.add(getTick(i, sizes.tick.sizeMinute, sizes.tick.offsetZMinutes));
    }
  }
  function getBlob(){
    const cylinderGeometry = new THREE.CylinderGeometry(
      sizes.blob.radius,
      sizes.blob.radius,
      sizes.blob.height,
      sizes.blob.segments);
    const materialWhite = new THREE.MeshBasicMaterial({ color: 'brown', side: THREE.DoubleSide });
    return new THREE.Mesh(cylinderGeometry, materialWhite);

  }
  function getHandSeconds(positionY, rotationY = 0) {
    const geometry = new THREE.BoxGeometry(sizes.tick.width, sizes.hands.seconds.height, sizes.hands.seconds.depth);
    const material = new THREE.MeshBasicMaterial({ color: 'black', side: THREE.DoubleSide });
    const box = new THREE.Mesh(geometry, material);
    box.position.y += positionY;
    box.position.z += sizes.hands.offsetZ;
    const a = new THREE.Euler(0, rotationY, 0);
    const m = new THREE.Matrix4();
    m.makeRotationFromEuler(a);
    box.applyMatrix4(m);
    return box;
  }
  function rotateHandSeconds(handSeconds, clockState) {
    const seconds = new Date().getSeconds();
    if (seconds === clockState.seconds) {
      return;
    }
    const step = Math.PI / 30;
    let mRotationY = step * clockState.direction;
    clockState.seconds = seconds;
    const a = new THREE.Euler(0, mRotationY, 0);
    const m = new THREE.Matrix4();
    m.makeRotationFromEuler(a);
    handSeconds.applyMatrix4(m);
  }
  function getHandMinutes(positionY, rotationY = 0) {
    const geometry = new THREE.SphereGeometry(sizes.hands.radius);
    const material = new THREE.MeshBasicMaterial({ color: 'black', side: THREE.DoubleSide });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.y += positionY;
    sphere.position.z += sizes.hands.offsetZ;
    const a = new THREE.Euler(0, rotationY, 0);
    const m = new THREE.Matrix4();
    m.makeRotationFromEuler(a);
    sphere.applyMatrix4(m);
    sphere.scale.x=sizes.hands.minutes.scaleX;
    sphere.scale.y=sizes.hands.minutes.scaleY;
    sphere.scale.z=sizes.hands.minutes.scaleZ;
    return sphere;
  }
  function rotateHandMinutes(handMinutes, clockState) {
    const minutes = new Date().getMinutes();
    if (minutes === clockState.minutes) {
      return;
    }
    const step = Math.PI / 30;
    let mRotationY = step * clockState.direction;
    clockState.minutes = minutes;
    const a = new THREE.Euler(0, mRotationY, 0);
    const m = new THREE.Matrix4();
    m.makeRotationFromEuler(a);
    handMinutes.applyMatrix4(m);
  }
  function getHandHours(positionY, rotationY = 0) {
    const geometry = new THREE.SphereGeometry(sizes.hands.radius);
    const material = new THREE.MeshBasicMaterial({ color: 'black', side: THREE.DoubleSide });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.y += positionY;
    sphere.position.z += sizes.hands.offsetZ;
    const a = new THREE.Euler(0, rotationY, 0);
    const m = new THREE.Matrix4();
    m.makeRotationFromEuler(a);
    sphere.applyMatrix4(m);
    sphere.scale.x=sizes.hands.hours.scaleX;
    sphere.scale.y=sizes.hands.hours.scaleY;
    sphere.scale.z=sizes.hands.hours.scaleZ;
    return sphere;
  }
  function rotateHandHours(handHours, clockState) {
    const minutes = new Date().getMinutes();
    if (minutes === clockState.minutes) {
      return;
    }
    const step = Math.PI / 360;
    let mRotationY = (step * clockState.minutes) * clockState.direction;
    clockState.minutes = minutes;
    const a = new THREE.Euler(0, mRotationY, 0);
    const m = new THREE.Matrix4();
    m.makeRotationFromEuler(a);
    handHours.applyMatrix4(m);
  }
  function getOuterRing() {
    const points = [];
    points.push( new THREE.Vector2(sizes.outerRing.outerRadius, sizes.outerRing.height));
    points.push( new THREE.Vector2(sizes.outerRing.innerRadius, sizes.outerRing.height));
    points.push( new THREE.Vector2(sizes.outerRing.innerRadius, 0));
    points.push( new THREE.Vector2(sizes.outerRing.outerRadius, 0));
    points.push( new THREE.Vector2(sizes.outerRing.outerRadius, sizes.outerRing.height));
    const geometry = new THREE.LatheGeometry(points, sizes.outerRing.latheSegments);
    const material = new THREE.MeshBasicMaterial({ color: '#90B8B8' });
    material.side = THREE.DoubleSide;
    const lathe = new THREE.Mesh(geometry, material);
    lathe.position.y -= sizes.outerRing.offsetY;
    return lathe;
  }

  function getClock() {
    const clock = new THREE.Object3D();
    clock.add(getCylinder());
    populateSceneWithTicks(clock);
    clock.add(getBlob());
    const stepSeconds = Math.PI / 30;
    const stepHours = Math.PI / 6;
    const stepMinutes = Math.PI / 360;
    hands.handSeconds1 = getHandSeconds(sizes.hands.offsetYSide2, stepSeconds * state.side1.seconds);
    hands.handSeconds2 = getHandSeconds(sizes.hands.offsetYSide1, -stepSeconds * state.side2.seconds);
    hands.handMinutes1 = getHandMinutes(sizes.hands.offsetYSide2, stepSeconds * state.side1.minutes);
    hands.handMinutes2 = getHandMinutes(sizes.hands.offsetYSide1, -stepSeconds * state.side2.minutes);
    hands.handHours1 = getHandHours(sizes.hands.offsetYSide2, stepHours * state.side1.hoursInitial + stepMinutes * state.side1.minutes);
    hands.handHours2 = getHandHours(sizes.hands.offsetYSide1, -(stepHours * state.side2.hoursInitial + stepMinutes * state.side2.minutes));
    clock.add(hands.handSeconds1);
    clock.add(hands.handSeconds2);
    clock.add(hands.handMinutes1);
    clock.add(hands.handMinutes2);
    clock.add(hands.handHours1);
    clock.add(hands.handHours2);
    clock.add(getOuterRing());

    return clock;
  }

  function updateClockState() {
    rotateHandSeconds(hands.handSeconds1, state.side1);
    rotateHandSeconds(hands.handSeconds2, state.side2);
    rotateHandMinutes(hands.handMinutes1, state.side1);
    rotateHandMinutes(hands.handMinutes2, state.side2);
    rotateHandHours(hands.handHours1, state.side1);
    rotateHandHours(hands.handHours2, state.side2);
  }

  return {
    getClock: getClock,
    updateClockState: updateClockState,
  }
}

(function draw() {
  const canvas1 = document.getElementById("canvas1");
  const renderer1 = new THREE.WebGLRenderer({ canvas: canvas1, antialias: true });
  renderer1.setClearColor('black');
  const scene = new THREE.Scene();
  const camera1 = new THREE.PerspectiveCamera(75, canvas1.width / canvas1.height, 0.1, 500);
  camera1.position.set(1, 2, 5);
  const controls = new THREE.TrackballControls(camera1, renderer1.domElement);

  const clockModule = clock();
  scene.add(clockModule.getClock());

  (function render() {
    requestAnimationFrame(render);
    clockModule.updateClockState();
    controls.update();
    renderer1.render(scene, camera1);
  })();
}());
