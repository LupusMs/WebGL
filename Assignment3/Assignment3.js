// Assignment 3
"use strict";

function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

//Table module
const table = () => {
  const sizes = {
    tableBottom: {
      length: 2.84,
      width: 1.42,
    },
    cushion: {
      width: 0.15,
      height:0.2,
    },
    leg: {
      width: 0.2,
      length: 0.2,
      height: 1,
    },
    ballRadius: 0.08,
    ballSegments: 10,
  };
  const state = {
    balls: [],
  };
  const table = new THREE.Object3D();

  function isPlaceOccupied(x, y) {
    let isOccupied = false;
    state.balls.forEach((ball) => {
      const OFFSET = sizes.ballRadius * 2;
      if ((ball.obj.position.x <= x + OFFSET) && (ball.obj.position.x >= x - OFFSET)
        && (ball.obj.position.y <= y + OFFSET) && (ball.obj.position.y >= y - OFFSET)) {
        isOccupied = true;
      }
    });

    return isOccupied;
  }

  function getTableBottom() {
    const bottom = new THREE.Object3D();
    const BOX_HEIGHT = 0.1;
    const boxGeometry = new THREE.BoxGeometry(sizes.tableBottom.length + sizes.cushion.width,
      sizes.tableBottom.width + sizes.cushion.width, BOX_HEIGHT);
    const materialGreen = new THREE.MeshLambertMaterial({ color: 'green', side: THREE.DoubleSide });
    const topPart = new THREE.Mesh(boxGeometry, materialGreen);
    topPart.receiveShadow = true;
    topPart.castShadow = false;
    topPart.position.z = topPart.position.z - (BOX_HEIGHT / 2);
    const planeGeometry = new THREE.PlaneGeometry(sizes.tableBottom.length, sizes.tableBottom.width);
    const bottomPart = new THREE.Mesh(planeGeometry, materialGreen);
    bottomPart.castShadow = true;
    const BOTTOM_OFFSET = 0.02;
    bottomPart.position.z = bottomPart.position.z - BOTTOM_OFFSET;
    bottom.add(topPart, bottomPart);

    return bottom;
  }
  function getCushion(length, rotation, offsetY, offsetX) {
    const boxGeometry = new THREE.BoxGeometry(sizes.cushion.width, length, sizes.cushion.height);
    const materialDarkGreen = new THREE.MeshStandardMaterial({ color: 'darkgreen', side: THREE.DoubleSide });
    const cushion = new THREE.Mesh(boxGeometry, materialDarkGreen);
    cushion.position.y = offsetY;
    cushion.position.x = offsetX;
    cushion.position.z = sizes.cushion.height / 2;
    cushion.rotation.z = rotation;
    cushion.receiveShadow = true;
    cushion.castShadow = false;
    return cushion;
  }
  function getLeg(offsetX = 0, offsetY = 0) {
    const boxGeometry = new THREE.BoxGeometry(sizes.leg.width, sizes.leg.length, sizes.leg.height);
    const materialBrown = new THREE.MeshStandardMaterial({ color: 'brown', side: THREE.DoubleSide });
    const leg = new THREE.Mesh(boxGeometry, materialBrown);
    leg.position.x = offsetX;
    leg.position.y = offsetY;
    const OFFSET = sizes.leg.height / 2 + 0.01;
    leg.position.z = - OFFSET;
    leg.castShadow = true;
    leg.receiveShadow = true;
    return leg;
  }
  function getTable() {
    return table;
  }
  function placeBall(image) {
    const x = getRandomNumber(-(sizes.tableBottom.length / 2 - sizes.ballRadius), sizes.tableBottom.length / 2 - sizes.ballRadius);
    const y = getRandomNumber(-(sizes.tableBottom.width / 2 - sizes.ballRadius), sizes.tableBottom.width / 2 - sizes.ballRadius);
    if (isPlaceOccupied(x, y)) {
      return false;
    }
    const geometry = new THREE.SphereBufferGeometry( sizes.ballRadius, sizes.ballSegments, sizes.ballSegments );
    const img = new Image();
    img.src = image;
    const txt = new THREE.Texture(img);
    txt.needsUpdate = true;
    const materialWhite = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: txt
    });
    const mBall = new THREE.Mesh(geometry, materialWhite);
    mBall.position.x = x;
    mBall.position.y = y;
    mBall.position.z = sizes.ballRadius;
    mBall.matrixAutoUpdate = false;
    mBall.castShadow = true;
    mBall.receiveShadow = false;
    table.add(mBall);
    const ballSpeed = new THREE.Vector3(1 * Math.random(), 1 * Math.random(), 0);
    state.balls.push({ obj: mBall, speed: ballSpeed });
    return true;
  }

  function getState() {
    return state;
  }

  (function init() {
    table.add(getTableBottom());
    table.add(
      getCushion(sizes.tableBottom.length, Math.PI / 2, (sizes.tableBottom.width / 2) + (sizes.cushion.width / 2), 0)
    );
    table.add(
      getCushion(sizes.tableBottom.length, Math.PI / 2, -(sizes.tableBottom.width / 2) - (sizes.cushion.width / 2), 0)
    );
    table.add(
      getCushion(sizes.tableBottom.width + sizes.cushion.width * 2, 0, 0, -(sizes.tableBottom.length / 2) - (sizes.cushion.width / 2))
    );
    table.add(
      getCushion(sizes.tableBottom.width + sizes.cushion.width * 2, 0, 0, (sizes.tableBottom.length / 2) + (sizes.cushion.width / 2))
    );
    table.add(getLeg(sizes.tableBottom.length / 2, sizes.tableBottom.width / 2));
    table.add(getLeg(sizes.tableBottom.length / 2, - sizes.tableBottom.width / 2));
    table.add(getLeg(- sizes.tableBottom.length / 2, sizes.tableBottom.width / 2));
    table.add(getLeg(- sizes.tableBottom.length / 2, - sizes.tableBottom.width / 2));
    const OFFSET = 0.01;
    table.position.z = sizes.leg.height + OFFSET;
  })();

  return {
    getTable: getTable,
    placeBall: placeBall,
    getState: getState,
    sizes: sizes,
  };
};

//Room module
const room = () => {
  const sizes = {
    length: 10,
    width: 10,
    height: 4,
    cord: {
      height: 1,
      radius: 0.01,
      segments: 6,
    },
    bulb: {
      radius: 0.1,
      segments: 10,
    }
  };
  const room = new THREE.Object3D();

  function getGround() {
    const planeGeometry = new THREE.PlaneGeometry(sizes.length, sizes.width);
    const materialGreen = new THREE.MeshStandardMaterial({ color: 'grey', side: THREE.DoubleSide });
    const ground = new THREE.Mesh(planeGeometry, materialGreen);
    ground.receiveShadow = true;

    return ground ;
  }
  function getCeiling() {
    const planeGeometry = new THREE.PlaneGeometry(sizes.length, sizes.width);
    const materialGreen = new THREE.MeshStandardMaterial({ color: 'gray', side: THREE.DoubleSide });
    const ceiling = new THREE.Mesh(planeGeometry, materialGreen);
    ceiling.position.z = sizes.height;
    ceiling.castShadow = false;

    return ceiling;
  }
  function getCord() {
    const cylinderGeometry = new THREE.CylinderGeometry(
      sizes.cord.radius,
      sizes.cord.radius,
      sizes.cord.height,
      sizes.cord.segments);
    const materialBlack = new THREE.MeshStandardMaterial({ color: 'black', side: THREE.DoubleSide });
    const cord = new THREE.Mesh(cylinderGeometry, materialBlack);
    cord.rotation.x = Math.PI / 2;
    const OFFSET = 0.01;
    cord.position.z = sizes.height - (sizes.cord.height / 2) - OFFSET;
    cord.receiveShadow = false;
    cord.castShadow = false;
    return cord;
  }
  function getBulb() {
    const geometry = new THREE.SphereBufferGeometry( sizes.bulb.radius, sizes.bulb.segments, sizes.bulb.segments );
    const materialYellow = new THREE.MeshStandardMaterial({ color: 'yellow', side: THREE.DoubleSide });
    const bulb = new THREE.Mesh(geometry, materialYellow);
    bulb.position.z = sizes.height - sizes.cord.height - sizes.bulb.radius;
    bulb.receiveShadow = false;
    bulb.castShadow = false;
    return bulb;
  }
  function placeObject(obj) {
    room.add(obj);
  }
  function getRoom() {
    return room;
  }

  (function init() {
    room.add(getGround());
    room.add(getCeiling());
    room.add(getCord());
    room.add(getBulb());
  })();

  return {
    getRoom: getRoom,
    placeObject: placeObject,
  };
};

window.onload = function draw() {

  const canvas = document.getElementById("canvas");
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  const scene = new THREE.Scene();
  renderer.shadowMap.enabled = true;
  const tableModule = table();
  const roomModule = room();
  roomModule.placeObject(tableModule.getTable());

  const BALLS_NUMBER = 8;
  let idx = 0;
  while (idx < BALLS_NUMBER) {
    if (tableModule.placeBall(imgBase64Array[idx])) {
      ++idx;
    }
  }

  roomModule.getRoom().rotation.x = 3 * Math.PI / 2;
  scene.add(roomModule.getRoom());

  const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 500);
  camera.position.set(1, 2.5, 1.5);
  camera.lookAt(tableModule.getTable());
  const controls = new THREE.TrackballControls(camera, canvas);

  function resizeWin() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resizeWin);
  resizeWin();
  
  const light = new THREE.PointLight( 0xffffff, 2, 8 );
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  light.position.set(0, 2.5, 0);
  light.castShadow = true;
  scene.add(light);

  const ambLight = new THREE.AmbientLight(0x404040);
  scene.add(ambLight);

  // speed and current position of translational motion
  const computerClock = new THREE.Clock();
  const planeNormal = new THREE.Vector3(0,0,1);
  
  (function reduceSpeed() {
    tableModule.getState().balls.forEach((ball) => {
      const SPEED_REDUCTION = 20;
      const SPEED_COEFFICIENT = 1 - SPEED_REDUCTION / 100;
      ball.speed.multiplyScalar(SPEED_COEFFICIENT);
    });
    setTimeout(reduceSpeed, 1000);
  })();

  function render() {
    requestAnimationFrame(render);
    const collidedBalls = [];

    function handleCollisions(ball, idx) {
      const BORDER_LENGTH = (tableModule.sizes.tableBottom.length / 2) - tableModule.sizes.ballRadius;
      const BORDER_WIDTH = (tableModule.sizes.tableBottom.width / 2) - tableModule.sizes.ballRadius;
      const SPEED_DROP = 20;
      const SPEED_COEFFICIENT = 1 - SPEED_DROP / 100;
      if (ball.obj.position.x > BORDER_LENGTH) {
        ball.obj.position.x = BORDER_LENGTH;
        ball.speed.x = - SPEED_COEFFICIENT * ball.speed.x;
        ball.speed.y = SPEED_COEFFICIENT * ball.speed.y;
      } else if (ball.obj.position.x < -BORDER_LENGTH) {
        ball.obj.position.x = -BORDER_LENGTH;
        ball.speed.x = - SPEED_COEFFICIENT * ball.speed.x;
        ball.speed.y = SPEED_COEFFICIENT * ball.speed.y;
      }
      if (ball.obj.position.y > BORDER_WIDTH) {
        ball.obj.position.y = BORDER_WIDTH;
        ball.speed.y = - SPEED_COEFFICIENT * ball.speed.y;
        ball.speed.x = SPEED_COEFFICIENT * ball.speed.x;
      } else if (ball.obj.position.y < -BORDER_WIDTH) {
        ball.obj.position.y = -BORDER_WIDTH;
        ball.speed.y = - SPEED_COEFFICIENT * ball.speed.y;
        ball.speed.x = SPEED_COEFFICIENT * ball.speed.x;
      }
      tableModule.getState().balls.forEach((otherBall, otherIdx) => {
        if (otherIdx === idx) {
          return;
        }

        const distanceBetweenBalls = ball.obj.position.clone().sub(otherBall.obj.position);
        const radius = tableModule.sizes.ballRadius;
        const dLength = distanceBetweenBalls.length();
        if (dLength < 2 * radius) {
          const speedDiff = ball.speed.clone().sub(otherBall.speed);
          const commonFactor = speedDiff.dot(distanceBetweenBalls) / distanceBetweenBalls.lengthSq();
          ball.speed.sub(distanceBetweenBalls.clone().multiplyScalar(commonFactor));
          otherBall.speed.add(distanceBetweenBalls.clone().multiplyScalar(commonFactor));
          ball.obj.position.add(ball.speed.clone().multiplyScalar(2 * radius - dLength));
          otherBall.obj.position.add(otherBall.speed.clone().multiplyScalar(2 * radius - dLength));
          collidedBalls.push(ball);
          collidedBalls.push(otherBall);
        }
      });
    }

    const h = computerClock.getDelta();
    computerClock.getElapsedTime();

    tableModule.getState().balls.forEach((ball, idx) => {
      ball.obj.position.add(ball.speed.clone().multiplyScalar(h));
      handleCollisions(ball, idx);
      const om = ball.speed.length() / tableModule.sizes.ballRadius;
      const axis = planeNormal.clone().cross(ball.speed).normalize();
      const dR = new THREE.Matrix4().makeRotationAxis(axis, om * h);
      ball.obj.matrix.premultiply(dR);
      ball.obj.matrix.setPosition(ball.obj.position);
    });

    collidedBalls.forEach((ball) => {
      const SPEED_REDUCTION = 30;
      const SPEED_COEFFICIENT = 1 - SPEED_REDUCTION / 100;
      ball.speed.multiplyScalar(SPEED_COEFFICIENT);
    });

    controls.update();
    renderer.render(scene, camera);
  }
  render();

};
