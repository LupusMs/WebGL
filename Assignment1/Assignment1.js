(function draw() {
  const gameModes = { SINGLE_PLAYER: 1, DOUBLE_PLAYER: 2 };
  //Use following line for Game Mode switching
  const gameMode = gameModes.DOUBLE_PLAYER;
  const sizes = {
    fieldLength: 6,
    fieldWidth: 6 / 2,
    racketLength: (6 / 2) / 5,
    cushionHeight: 0.3,
    cushionWidth: 0.1,
    ballRadius: 0.1,
  };
  const positions = {
    ballMaxOffsetX: (sizes.fieldWidth / 2) - sizes.cushionWidth - (sizes.ballRadius / 2),
    ballMinOffsetX: - (sizes.fieldWidth / 2) + sizes.cushionWidth + (sizes.ballRadius / 2),
    ballMaxOffsetY: (sizes.fieldLength / 2) - sizes.cushionWidth - (sizes.ballRadius / 2),
    ballMinOffsetY: - (sizes.fieldLength / 2) + sizes.cushionWidth + (sizes.ballRadius / 2),
  };
  let renderer2 = null;
  let camera2 = null;

  const clock = new THREE.Clock();
  const speed = new THREE.Vector3(getRandomNumber(-1.4, 1.4), - 1.7, 0);

  const canvas1 = document.getElementById("canvas1");
  const renderer1 = new THREE.WebGLRenderer({ canvas: canvas1, antialias: true });
  renderer1.setClearColor('white');  // background color

  if (gameMode === gameModes.DOUBLE_PLAYER) {
    const canvas2 = document.getElementById("canvas2");
    renderer2 = new THREE.WebGLRenderer({ canvas: canvas2, antialias: true });
    renderer2.setClearColor('white');  // background color
    camera2 = new THREE.PerspectiveCamera(75, canvas2.width / canvas2.height, 0.1, 500);
    camera2.position.set(-1, 2, -5);
    camera2.rotation.y = 180 * Math.PI / 180;
    camera2.lookAt(0,0,0);
  }

  const scene = new THREE.Scene();
  const camera1 = new THREE.PerspectiveCamera(75, canvas1.width / canvas1.height, 0.1, 500);
  camera1.position.set(1, 2, 5);
  const controls = new THREE.TrackballControls(camera1, renderer1.domElement);

  const field = new THREE.Object3D();

  const ground = (() => {
    const planeGeometry = new THREE.PlaneGeometry(sizes.fieldWidth, sizes.fieldLength);
    const materialGreen = new THREE.MeshBasicMaterial({ color: 'green', side: THREE.DoubleSide });
    return new THREE.Mesh(planeGeometry, materialGreen);
  })();
  const cushionLeft = (() => {
    const boxGeometry = new THREE.BoxGeometry(sizes.cushionWidth, sizes.fieldLength, sizes.cushionHeight);
    const materialDarkGreen = new THREE.MeshBasicMaterial({ color: 'darkgreen', side: THREE.DoubleSide });
    const mCushionLeft = new THREE.Mesh(boxGeometry, materialDarkGreen);
    mCushionLeft.position.x = -(sizes.fieldWidth / 2) - (sizes.cushionWidth / 2);
    mCushionLeft.position.z = sizes.cushionHeight / 2;
    return mCushionLeft;
  })();
  const cushionRight = (() => {
    const mCushionRight = cushionLeft.clone();
    mCushionRight.position.x = (sizes.fieldWidth / 2) + (sizes.cushionWidth / 2);
    mCushionRight.position.z = sizes.cushionHeight / 2;
    return mCushionRight;
  })();

  if (gameMode === gameModes.SINGLE_PLAYER) {
    const cushionBack = (() => {
      const backCushionGeometry = new THREE.BoxGeometry(sizes.cushionWidth, sizes.fieldWidth, sizes.cushionHeight);
      const materialDarkGreen = new THREE.MeshBasicMaterial({ color: 'darkgreen', side: THREE.DoubleSide });
      const mCushionBack = new THREE.Mesh(backCushionGeometry, materialDarkGreen);
      mCushionBack.rotation.z = - Math.PI / 2;
      mCushionBack.position.y = (sizes.fieldLength / 2) + (sizes.cushionWidth / 2);
      mCushionBack.position.z = sizes.cushionHeight / 2;
      return mCushionBack;
    })();
    field.add(cushionBack);
  } else {
    this.racketBlue = (() => {
      const racketGeometry = new THREE.BoxGeometry(sizes.cushionWidth, sizes.racketLength, sizes.cushionHeight);
      const materialBlue = new THREE.MeshBasicMaterial({ color: 'blue', side: THREE.DoubleSide });
      const mRacketBlue = new THREE.Mesh(racketGeometry, materialBlue);
      mRacketBlue.rotation.z = - Math.PI / 2;
      mRacketBlue.position.y = (sizes.fieldLength / 2) + (sizes.cushionWidth / 2);
      mRacketBlue.position.z = sizes.cushionHeight / 2;
      return mRacketBlue;
    })();
    field.add(racketBlue);
  }

  const racketRed = (() => {
    const racketGeometry = new THREE.BoxGeometry(sizes.cushionWidth, sizes.racketLength, sizes.cushionHeight);
    const materialRed = new THREE.MeshBasicMaterial({ color: 'red', side: THREE.DoubleSide });
    const mRacketRed = new THREE.Mesh(racketGeometry, materialRed);
    mRacketRed.rotation.z = - Math.PI / 2;
    mRacketRed.position.y = - (sizes.fieldLength / 2) - (sizes.cushionWidth / 2);
    mRacketRed.position.z = sizes.cushionHeight / 2;
    return mRacketRed;
  })();
  const line = (() => {
    const materialWhite = new THREE.LineBasicMaterial({ color: 'white' });
    const points = [];
    points.push(new THREE.Vector3(- sizes.fieldWidth / 2, 0, 0));
    points.push(new THREE.Vector3(sizes.fieldWidth / 2, 0, 0));
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.Line(lineGeometry, materialWhite);
  })();
  const ball = (() => {
    const ballGeometry = new THREE.SphereGeometry(0.1, 20, 20);
    const materialYellow = new THREE.MeshBasicMaterial({ color: 'yellow' });
    const mBall = new THREE.Mesh(ballGeometry, materialYellow);
    mBall.position.z = sizes.ballRadius;
    mBall.position.x = getRandomNumber(positions.ballMinOffsetX, positions.ballMaxOffsetX);
    return mBall;
  })();

  field.add(ground)
    .add(cushionLeft)
    .add(cushionRight)
    .add(racketRed)
    .add(ball)
    .add(line);
  field.rotation.x = - Math.PI / 2;
  scene.add(field);

  document.addEventListener("keydown", event => {    
    const LEFT_ARROW = 37;
    const RIGHT_ARROW = 39;
    const KEY_A = 65;
    const KEY_D = 68;

    function getActionForKey(key) {
      const keys = {
        [LEFT_ARROW]: () => racketRed.position.x -= 0.4,
        [RIGHT_ARROW]: () => racketRed.position.x += 0.4,
        'default': () => {return;},
      };
      if (gameMode === gameModes.DOUBLE_PLAYER) {
        keys[[KEY_A]] = () => racketBlue.position.x += 0.4;
        keys[[KEY_D]] = () => racketBlue.position.x -= 0.4;
      }
      return (keys[key] || keys['default'])();
    }

    event.preventDefault();
    getActionForKey(event.keyCode);
  });

  function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
  }

  (function render() {
    requestAnimationFrame(render);
    function reflectSpeed(axis){
      speed[axis] = -speed[axis];
    }
    const isBallHitsSideCushion = (ball.position.x >= positions.ballMaxOffsetX) || (ball.position.x <= positions.ballMinOffsetX);
    if (isBallHitsSideCushion) {
      reflectSpeed('x');
    }
    const isBallHitsBackCushion = ball.position.y >= positions.ballMaxOffsetY;
    if ((gameMode === gameModes.SINGLE_PLAYER) && isBallHitsBackCushion) {
      reflectSpeed('y');
    }
    const isBallHitsRedRacket = (ball.position.y <= positions.ballMinOffsetY) &&
     (ball.position.x >= (racketRed.position.x - (sizes.racketLength / 2))) && (ball.position.x <= (racketRed.position.x + (sizes.racketLength / 2)));
    if (isBallHitsRedRacket) {
      reflectSpeed('y');
    }
    const isBallHitsBlueRacket = (gameMode === gameModes.DOUBLE_PLAYER) && (ball.position.y >= positions.ballMaxOffsetY) &&
      (ball.position.x >= (racketBlue.position.x - (sizes.racketLength / 2))) &&
      (ball.position.x <= (racketBlue.position.x + (sizes.racketLength / 2)));
    if (isBallHitsBlueRacket) {
      reflectSpeed('y');
    }
    const isPlayer2Loose = (gameMode === gameModes.DOUBLE_PLAYER) && (ball.position.y >= (positions.ballMaxOffsetY + sizes.ballRadius)) &&
      !((ball.position.x >= (racketBlue.position.x - (sizes.racketLength / 2))) &&
        (ball.position.x <= (racketBlue.position.x + (sizes.racketLength / 2))));
    if (isPlayer2Loose) {
      document.getElementById('alerts').innerText = 'Game over! Player 1 won.';
      return;
    }    
    const isBallOutOfFrontLine = ball.position.y <= (positions.ballMinOffsetY - sizes.ballRadius);
    if (isBallOutOfFrontLine) {
      if (gameMode === gameModes.DOUBLE_PLAYER) {
        document.getElementById('alerts').innerText = 'Game over! Player 2 won.';
      } else {
        document.getElementById('alerts').innerText = 'Game over!';
      }
      return;
    }
    ball.position.add(speed.clone().multiplyScalar(clock.getDelta()));
    controls.update();
    renderer1.render(scene, camera1);
    if (gameMode === gameModes.DOUBLE_PLAYER) {
      renderer2.render(scene, camera2);
    }
  })();
})();
