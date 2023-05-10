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
import { FlyControls } from '../jsm/controls/FlyControls.js';



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

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

//let path = require('./models/cave/test60.fbx');

init();
animate();
function init() {

    const container = document.createElement( 'div' );
    document.body.appendChild( container );


    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 2000 );
    camera.position.set( 0, 0, 1000 );
    //camera = new CinematicCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
    
    
    //camera.position.set( 100, 50, 100 );
    cameraPosition = camera.position.z;

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x000000   );
    scene.fog = new THREE.Fog( 0x000000 , 500, 1000 );

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
    loader.setResourcePath( './models/cave/' );
    loader.load('./models/cave/cave00.3ds', function (object) {
        //const model = gltf.scene;

        /*
        object.position.set(0, 0, 0);
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
    
 
        const sprite = new THREE.TextureLoader().load( './src/textures/sprites/circle.png' );
        //sprite.colorSpace = THREE.SRGBColorSpace;
        //object.children[0].geometry.addAttribute('alpha', new THREE.BufferAttribute(alphas,1));
        //let material = new THREE.PointsMaterial({color:0xFFFFFF, size: 0.55})
        let material = new THREE.PointsMaterial({size: 2, sizeAttenuation: true, map: sprite, alphaTest: 0.5, transparent: false})
        //material.color.setHSL( 1.0, 0.3, 0.7, THREE.SRGBColorSpace );
        //let lineMat = new THREE.PointsMaterial({color:0x575656  , size: 0.05})
        const lineMat = new THREE.LineBasicMaterial( { color: 0x3d3d3d,vertexColors: false,linewidth: 5 } );
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
        
        //console.debug(vertices.length);
        var mesh = new THREE.Points(mergedGeo, material);
        var linesMesh = new THREE.LineSegments( mergedGeo, lineMat );
        //var mesh = new THREE.Points(object.children[2].geometry, material)
        scene.add(mesh)
        scene.add(linesMesh);
    } );



    ////text
    const textloader = new FontLoader();
    textloader.load('./src/fonts/helvetiker_regular.typeface.json', function (font) {

        const color = 0xffffff;

        const matDark = new THREE.LineBasicMaterial({
            color: color,
            side: THREE.DoubleSide
        });

        const matLite = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        });

        const message = '   CAVES\nPareid';

        const shapes = font.generateShapes(message, 80);

        const geometry = new THREE.ShapeGeometry(shapes);

        geometry.computeBoundingBox();

        const xMid = - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);

        geometry.translate(xMid, 0, 500);

        // make shape ( N.B. edge view not visible )

        const text = new THREE.Mesh(geometry, matLite);
        text.position.z = 0;
        scene.add(text);

        // make line shape ( N.B. edge view remains visible )

        const holeShapes = [];

        for (let i = 0; i < shapes.length; i++) {

            const shape = shapes[i];

            if (shape.holes && shape.holes.length > 0) {

                for (let j = 0; j < shape.holes.length; j++) {

                    const hole = shape.holes[j];
                    holeShapes.push(hole);

                }

            }

        }

        shapes.push.apply(shapes, holeShapes);

        const lineText = new THREE.Object3D();

        for (let i = 0; i < shapes.length; i++) {

            const shape = shapes[i];

            const points = shape.getPoints();
            const geometry = new THREE.BufferGeometry().setFromPoints(points);

            geometry.translate(xMid, 0, 350);

            const lineMesh = new THREE.Line(geometry, matDark);
            lineText.add(lineMesh);

        }

        scene.add(lineText);

        

    }); //end load function




    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.physicallyCorrectLights = true;
    renderer.gammaOutput = true;
    //renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    /*controls = new OrbitControls( camera, renderer.domElement );
    controls.target.set( 0, 0, 0 );
    //controls.enablePan = false;
    controls.zoomSpeed = 0.5;
    controls.update();*/

    //controls = new FlyControls( camera, renderer.domElement );
    //controls.movementSpeed = 10;
    //controls.rollSpeed = Math.PI / 50;
    //controls.update();

    controls = new FirstPersonControls(camera, renderer.domElement);
    controls.movementSpeed = 50;
    controls.lookSpeed = 0.1;

    window.addEventListener('resize', onWindowResize);

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
    //const delta = clock.getDelta();

    //if ( mixer ) mixer.update( delta );

    render();

    //stats.update();

}

function render(){
    controls.update( clock.getDelta() );

    renderer.render( scene, camera ); 
}

function onPointerMove( event, geo ) {

    pointer.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
    raycaster.setFromCamera( pointer, camera );

    // See if the ray from the camera into the world hits one of our meshes
    const intersects = raycaster.intersectObject( geo );

    // Toggle rotation bool for meshes that we clicked
    if ( intersects.length > 0 ) {

        helper.position.set( 0, 0, 0 );
        helper.lookAt( intersects[ 0 ].face.normal );

        helper.position.copy( intersects[ 0 ].point );

    }

}

