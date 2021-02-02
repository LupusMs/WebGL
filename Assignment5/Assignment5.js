// Solar-System Simulation
import * as THREE from "../moduleLibs/build/three.module.js";
import * as dat from "../moduleLibs/build/dat.gui.module.js";
import {OrbitControls } from "../moduleLibs/examples/jsm/controls/OrbitControls.js";

const DISTANCE_SCALE = 20;
const TIME_SCALE = 0.1;
const DAY_SCALE = 10;
const data = {
  showOrbits: true,
  r: 5,
  earthDay: 5,
  earthRadius: 1,
};

function SpaceObjects() {

  const planetsSettings = {
    mars: {
      radius: 0.38,
      distToSun: 1.5,
      year: 1.88,
      day: 1.03,
      tilt: 25.2,
    },
    earth: {
      radius: 1,
      distToSun: 1,
      year: 1,
      day: 1,
      tilt: 23.5,
    },
    jupiter: {
      radius: 11.2,
      distToSun: 5.2,
      year: 11.8,
      day: 0.41,
      tilt: 3.1,
    },
    mercury: {
      radius: 0.38,
      distToSun: 0.39,
      year: 0.24,
      day: 58,
      tilt: 0,
    },
    saturn: {
      radius: 9.4,
      distToSun: 9.5,
      year: 29.5,
      day: 0.45,
      tilt: 26.7,
    },
    venus: {
      radius: 0.95,
      distToSun: 0.72,
      year: 0.62,
      day: 240,
      tilt: 3,
    },
    sun: {
      radius: 110,
      day: 25,
      tilt: 7.3,
    },
    moon : {
      radius: 0.27,
      distToSun: 0.1,
      day: 27.3,
      year: 27.3,
      distToEarth: 0.08,
      tilt: 6.68,
    }
  };

  const planets = new Map();
  const otherObjects = new Map();
  const orbits = [];
  let moonOrbit = {};
  let earth = {};
  let saturnRings = {};

  function createSphere(name, properties) {
    const props = {};
    for (const [key, value] of Object.entries(properties)) {
      props[key] = getTexture(value);
    }
    const sphereGeo = new THREE.SphereBufferGeometry(planetsSettings[name].radius * data.earthRadius, 48, 48);
    const material = new THREE.MeshPhongMaterial(props);
    const mesh = new THREE.Mesh(sphereGeo, material);
    mesh.matrixAutoUpdate = false;
    if (name === 'earth') {
      earth = mesh;
      const cloudsTexture = getTexture('earth_clouds_1024.png');
      const cloudsMaterial = new THREE.MeshPhongMaterial({map: cloudsTexture, transparent: true });
      const cloudsGeometry = new THREE.SphereBufferGeometry(planetsSettings[name].radius * data.earthRadius + 0.05, 48, 48);
      const meshClouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
      const earthMoonObj = new THREE.Object3D();
      earthMoonObj.add(mesh);
      const moonMesh = createMoon();
      moonMesh.matrixAutoUpdate = false;
      const moonOrbitMesh = createMoonOrbit();
      earthMoonObj.add(moonOrbitMesh);
      earthMoonObj.add(meshClouds);
      earthMoonObj.add(moonMesh);
      moonMesh.position.x = planetsSettings.moon.distToEarth * DISTANCE_SCALE;
      orbits.push(moonOrbitMesh);
      moonOrbit = moonOrbitMesh;
      earthMoonObj.matrixAutoUpdate = false;
      planets.set(name, earthMoonObj);
      otherObjects.set('moon', moonMesh);
      otherObjects.set('earth_clouds', meshClouds);

    } else {
      planets.set(name, mesh);
    }
  }

  function createMoon() {
    const moonGeo = new THREE.SphereBufferGeometry(planetsSettings.moon.radius * data.earthRadius, 48, 48);
    const moonMesh = new THREE.Mesh(moonGeo, new THREE.MeshPhongMaterial({
      map: getTexture("moon.jpg"),
      bumpMap: getTexture("moonbump1k.jpg")
    }));
    return moonMesh;
  }

  function createMoonOrbit() {
    const material = new THREE.LineBasicMaterial({ color: 'red' });
    const geometry = createMoonOrbitGeometry();
    const lineLoop = new THREE.LineLoop( geometry, material );
    lineLoop.rotation.x = Math.PI / 2;

    return lineLoop;
  }

  function createMoonOrbitGeometry() {
    const geometry = new THREE.CircleGeometry(DISTANCE_SCALE *
      planetsSettings.moon.distToEarth * planetsSettings.earth.distToSun * data.earthRadius, 64);
    geometry.vertices.shift();

    return geometry;
  }

  function addOtherObject(name, obj) {
    otherObjects.set(name, obj);
  }

  function rotateObjects(time) {
    for (const [key, value] of planets) {
    
      const spherePos = new THREE.Vector3(
        planetsSettings[key].distToSun * Math.sin( TIME_SCALE * time / planetsSettings[key].year / data.earthDay ) * DISTANCE_SCALE,
        0,
        planetsSettings[key].distToSun * Math.cos( TIME_SCALE * time / planetsSettings[key].year / data.earthDay ) * DISTANCE_SCALE);
      const T = new THREE.Matrix4().setPosition(spherePos);
      const R = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0),
        (DAY_SCALE * time / data.earthDay / planetsSettings[key].day));
      value.matrix.copy(R.premultiply(T));
    }

    otherObjects.get('sun').rotation.y = DAY_SCALE * time / data.earthDay / planetsSettings.sun.day;
    rotateMoon(time);
    moonOrbit.position.z = planetsSettings.earth.distToSun * Math.cos( TIME_SCALE * time / planetsSettings.earth.year / data.earthDay ) * DISTANCE_SCALE;
    moonOrbit.position.x = planetsSettings.earth.distToSun * Math.sin( TIME_SCALE * time / planetsSettings.earth.year / data.earthDay) * DISTANCE_SCALE;

    saturnRings.position.z = planetsSettings.saturn.distToSun * Math.cos( TIME_SCALE * time / planetsSettings.saturn.year / data.earthDay ) * DISTANCE_SCALE;
    saturnRings.position.x = planetsSettings.saturn.distToSun * Math.sin( TIME_SCALE * time / planetsSettings.saturn.year / data.earthDay) * DISTANCE_SCALE;
    
    otherObjects.get('earth_clouds').rotation.z = TIME_SCALE * time / planetsSettings['earth'].day;
    otherObjects.get('earth_clouds').position.z = planetsSettings.earth.distToSun * Math.cos( TIME_SCALE * time / planetsSettings.earth.year / data.earthDay ) * DISTANCE_SCALE;
    otherObjects.get('earth_clouds').position.x = planetsSettings.earth.distToSun * Math.sin( TIME_SCALE * time / planetsSettings.earth.year / data.earthDay ) * DISTANCE_SCALE;
  }

  function rotateMoon(time) {
    const moonPos = new THREE.Vector3(planetsSettings.moon.distToEarth *
      Math.sin(TIME_SCALE * time * planetsSettings.moon.year / data.earthDay) *
      DISTANCE_SCALE,
      0,
      planetsSettings.moon.distToEarth *
      Math.cos(TIME_SCALE * time * planetsSettings.moon.year / data.earthDay) * DISTANCE_SCALE);
    const T = new THREE.Matrix4().setPosition(moonPos);
    const R = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), (TIME_SCALE * time * planetsSettings.moon.year / data.earthDay));
    otherObjects.get('moon').matrix.copy(R.premultiply(T));
  }

  function getTexture (imgName) {
    const txt = new THREE.TextureLoader().load('images/' + imgName);
    txt.needsUpdate = true;

    return txt;
  }

  function getPlanet(name, properties) {
    createSphere(name, properties);
    addOrbit(planetsSettings[name].distToSun * DISTANCE_SCALE);
    return planets.get(name);
  }

  function addOrbit(radius) {
    const segments = 64;
    const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const geometry = new THREE.CircleGeometry(radius, segments);
    geometry.vertices.shift();
    const lineLoop = new THREE.LineLoop( geometry, material );
    lineLoop.rotation.x = Math.PI / 2;
    orbits.push(lineLoop);
  }

  function getOrbits() {
    return orbits;
  }

  function hideOrbits() {
    for (let i = 0; i < orbits.length; i++) {
      orbits[i].visible = false;
    }
  }

  function showOrbits() {
    for (let i = 0; i < orbits.length; i++) {
      orbits[i].visible = true;
    }
  }

  function getOtherObject(name) {
    return otherObjects.get(name);
  }

  function rescalePlanets() {
    for (const [key, value] of planets) {
      if (key !== 'earth') {
        value.geometry = new THREE.SphereBufferGeometry(data.earthRadius * planetsSettings[key].radius, 48, 48);
      } else {
        otherObjects.get('earth_clouds').geometry = new THREE.SphereBufferGeometry(data.earthRadius, 48, 48);
        otherObjects.get('moon').geometry = new THREE.SphereBufferGeometry(data.earthRadius * planetsSettings.moon.radius, 48, 48);
        otherObjects.get('moon').position.x = data.earthRadius * planetsSettings.moon.distToEarth * DISTANCE_SCALE;
        moonOrbit.geometry = createMoonOrbitGeometry();
        earth.geometry = new THREE.SphereBufferGeometry(data.earthRadius, 48, 48);
      }
      
    }
    saturnRings.geometry = new THREE.TorusGeometry(1.75 * planetsSettings.saturn.radius * data.earthRadius,
      planetsSettings.saturn.radius * data.earthRadius / 2, 2, 20);
  }

  function getSaturnRings() {
    const geometry = new THREE.TorusGeometry(1.75 * planetsSettings.saturn.radius, planetsSettings.saturn.radius / 2, 2, 20);
    const txt = new THREE.TextureLoader().load('images/saturnringpattern.gif');
    txt.rotation = Math.PI / 2;
    txt.needsUpdate = true;
    const material = new THREE.MeshBasicMaterial({ map: txt });
    const torus = new THREE.Mesh(geometry, material);
    torus.rotation.x = Math.PI / 2;
    saturnRings = torus;
    return torus;
  }

  return { getPlanet, getOtherObject, rotateObjects, addOtherObject, getOrbits, hideOrbits, showOrbits, rescalePlanets,
  getSaturnRings };
}

function BackgroundLoader() {
  function getTextureMaterialArray() {

    let txt = new THREE.TextureLoader().load('MilkyWay/dark-s_nx.jpg');
    txt.needsUpdate = true;
    const materialArray = [];
    materialArray.push(new THREE.MeshBasicMaterial({ map: txt, side: THREE.BackSide }));

    txt = new THREE.TextureLoader().load('MilkyWay/dark-s_ny.jpg');
    txt.needsUpdate = true;
    materialArray.push(new THREE.MeshBasicMaterial({ map: txt, side: THREE.BackSide }));

    txt = new THREE.TextureLoader().load('MilkyWay/dark-s_nz.jpg');
    txt.needsUpdate = true;
    materialArray.push(new THREE.MeshBasicMaterial({ map: txt, side: THREE.BackSide }));

    txt = new THREE.TextureLoader().load('MilkyWay/dark-s_px.jpg');
    txt.needsUpdate = true;
    materialArray.push(new THREE.MeshBasicMaterial({ map: txt, side: THREE.BackSide }));

    txt = new THREE.TextureLoader().load('MilkyWay/dark-s_py.jpg');
    txt.needsUpdate = true;
    materialArray.push(new THREE.MeshBasicMaterial({ map: txt, side: THREE.BackSide }));

    txt = new THREE.TextureLoader().load('MilkyWay/dark-s_pz.jpg');
    txt.needsUpdate = true;
    materialArray.push(new THREE.MeshBasicMaterial({ map: txt, side: THREE.BackSide }));

    return materialArray;
  }

  function loadBackground(scene) {
    const skyboxGeo = new THREE.BoxGeometry(2000, 2000, 2000);
    const skybox = new THREE.Mesh(skyboxGeo, getTextureMaterialArray());
    skybox.rotation.y = 3 * Math.PI / 6;
    skybox.rotation.z = Math.PI / 2;
    scene.add(skybox);
  }

  return {
    loadBackground
  };
}

(() => {
  // * Initialize webGL
  const canvas = document.getElementById("mycanvas");
  const renderer = new THREE.WebGLRenderer({ canvas: canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000);

  // create scene, camera and light
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight,
    0.1, 2000);
  camera.position.set(-10, -10, 80);
  scene.add(camera);

  function resizeCB() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  resizeCB();
  window.addEventListener("resize", resizeCB);

  // Light
  const pointLight = new THREE.PointLight(0xffffff);
  scene.add(pointLight);
  const ambLight = new THREE.AmbientLight();
  ambLight.color = new THREE.Color('#404040');
  scene.add(ambLight);

  //Background
  const backgroundLoader = BackgroundLoader();
  backgroundLoader.loadBackground(scene);

  //Planets
  const spaceObjectsModule = new SpaceObjects();
  const mercury = spaceObjectsModule.getPlanet("mercury", { map: "mercury.jpg" });
  const venus = spaceObjectsModule.getPlanet("venus", { map: "venus.jpg" });
  const earth = spaceObjectsModule.getPlanet("earth", {
    map: "earth_surface_2048.jpg",
    normalMap: "earth_normal_2048.jpg",
    specularMap: "earth_specular_2048.jpg"
  });
  const mars = spaceObjectsModule.getPlanet("mars", { map: "mars.jpg" });
  const jupiter = spaceObjectsModule.getPlanet("jupiter", { map: "jupiter.jpg" });
  const saturn = spaceObjectsModule.getPlanet("saturn", { map: "saturn.jpg" });
  scene.add(mercury);
  scene.add(venus);
  scene.add(earth);
  scene.add(mars);
  scene.add(jupiter);
  scene.add(saturn);
  scene.add(...spaceObjectsModule.getOrbits());
  scene.add(spaceObjectsModule.getSaturnRings());
  scene.add(spaceObjectsModule.getOtherObject('earth_clouds'));

  const txt = new THREE.TextureLoader().load('images/sunmap.jpg');
  txt.needsUpdate = true;
  const sphereGeo = new THREE.SphereBufferGeometry(data.r, 48, 48);
  const sphere = new THREE.Mesh(sphereGeo,
    new THREE.MeshBasicMaterial({ map: txt }));
  scene.add(sphere);

  spaceObjectsModule.addOtherObject("sun", sphere);

  function updateSphere() {
    sphere.geometry = new THREE.SphereBufferGeometry(data.r, 48, 48);
  }

  // * dat.gui
  window.onload = function () {
    const gui = new dat.GUI();
    gui.add(data, 'showOrbits').onChange(function () {
      if (data.showOrbits) {
        spaceObjectsModule.showOrbits();
      } else {
        spaceObjectsModule.hideOrbits();
      }
    });
    gui.add(data, 'r', 1.0, 10.0).onChange(updateSphere);
    gui.add(data, 'earthDay', 0.1, 200.0);
    gui.add(data, 'earthRadius', 0.2, 3).onChange(spaceObjectsModule.rescalePlanets);
  };

  // * Render loop
  const controls = new OrbitControls(camera, canvas);
  function render(tms) {

    requestAnimationFrame(render);
    const time = tms / 1000;
    spaceObjectsModule.rotateObjects(time);

    renderer.render(scene, camera);
  }

  render();

})();
