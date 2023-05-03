import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { CinematicCamera } from 'three/addons/cameras/CinematicCamera.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { LightProbeGenerator } from 'three/addons/lights/LightProbeGenerator.js';
import { TDSLoader } from 'three/addons/loaders/TDSLoader.js';
import * as BufferGeometryUtils from '../jsm/utils/BufferGeometryUtils.js';



let camera, scene, renderer, stats, controls;
let bIsMesh;

const clock = new THREE.Clock();
var mat;
var model;

var geo;
let texture;
let mixer;let lightProbe;
let dirLight;
let cameraPosition ;
let numVertices;

//let path = require('./models/cave/test60.fbx');

init();

function init() {

    const container = document.createElement( 'div' );
    document.body.appendChild( container );


    //camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 2000 );
    //camera.position.set( 100, 50, 100 );
    camera = new CinematicCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
    camera.setLens( 20 );
    camera.position.set( 100, 50, 100 );
    cameraPosition = camera.position.z;

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x000000   );
    scene.fog = new THREE.Fog( 0x000000 , 300, 800 );

    const hemiLight = new THREE.HemisphereLight( 0xa0a0a0, 0x444444, 1.2 );
    hemiLight.position.set( 0, 200, 0 );
    scene.add(hemiLight);
    //

    lightProbe = new THREE.LightProbe();
    scene.add(lightProbe);
    scene.add(new THREE.AmbientLight(0x404040,5));
    dirLight = new THREE.DirectionalLight(0xffffff,1.5);
    dirLight.position.set(0, 500, 100);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 180;
    dirLight.shadow.camera.bottom = - 100;
    dirLight.shadow.camera.left = - 120;
    dirLight.shadow.camera.right = 120;
    scene.add(dirLight);

    // model
    const loader = new TDSLoader( );
    //const path = require('models/cave/test60.fbx');
    loader.setResourcePath( '../models/cave/' );
    loader.load('../models/cave/cave00.3ds', function (object) {
        //const model = gltf.scene;

        /*
        object.position.set(0, 100, 0);
        object.scale.multiplyScalar(1); 
        
        object.traverse(function (object) {
            if ((object instanceof THREE.Mesh)) {
                mat = object.material;
                object.material.metalness = 0;
                mat.side = THREE.DoubleSide;
                //object.material.colorWrite = false;
            }
        });


        scene.add(object);*/

        numVertices = object.children[0].geometry.attributes.position.count;
        var alphas = new Float32Array(numVertices*1);
        for (var i =0;i<numVertices;i++){
            alphas[i]=Math.random;
        }

        //object.children[0].geometry.addAttribute('alpha', new THREE.BufferAttribute(alphas,1));
        let material = new THREE.PointsMaterial({color:0xFFFFFF, size: 0.55})
        let lineMat = new THREE.PointsMaterial({color:0x575656  , size: 0.05})
        console.debug(object.children.length);

        //let geom = new THREE.BufferGeometry();
        
        const geometries = [];
        for(var i =0;i<object.children.length;i++){
            //var geo = object.children[i].geometry;

            geometries.push(object.children[i].geometry);
            //var geo = object.children.geometry.clone();
            //console.debug(i);
            //var bufGeo = new THREE.BufferGeometry(object.children[i].geometry);
            //geom =  BufferGeometryUtils.mergeBufferGeometries(bufGeo);
        }

        const mergedGeo = BufferGeometryUtils.mergeBufferGeometries(geometries);
        var mesh = new THREE.Points(mergedGeo, material);
        var linesMesh = new THREE.LineSegments( mergedGeo, lineMat );
        //var mesh = new THREE.Points(object.children[2].geometry, material)
        scene.add(mesh)
        //scene.add(linesMesh);
    } );

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    renderer.physicallyCorrectLights = true;
    renderer.gammaOutput = true;
    //renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild( renderer.domElement );

    controls = new OrbitControls( camera, renderer.domElement );
    controls.target.set( 0, 0, 0 );
    //controls.enablePan = false;
    controls.zoomSpeed = 0.5;
    controls.update();
    //controls = new FirstPersonControls( camera, renderer.domElement );
    //controls.movementSpeed = 150;
    //controls.lookSpeed = 0.1;

    window.addEventListener( 'resize', onWindowResize );

    // stats
    //stats = new Stats();
    //container.appendChild( stats.dom );
    //setupGui();

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}




function updateCamera(ev) {
    //let div1 = document.getElementById("div1");
    
    camera.position.z = 10 - window.scrollY / 1.0;
}

//window.addEventListener("scroll", updateCamera);
// Add an event listener for mouse movement events
let mousePosition = new THREE.Vector2();
window.addEventListener('mousemove', (event) => {
  mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
  mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

function animate() {

    requestAnimationFrame( animate );
    //camera.lookAt(new THREE.Vector3(mousePosition.x * 50, mousePosition.y * 50, 0));
    const delta = clock.getDelta();

    if ( mixer ) mixer.update( delta );

    renderer.render( scene, camera );

    stats.update();

}

animate();