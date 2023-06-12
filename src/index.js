import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TDSLoader } from 'three/addons/loaders/TDSLoader.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { Scene, PerspectiveCamera } from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let camera, scene, renderer, raycaster;
let lightProbe;
let dirLight;
var scrollY = 0;
var PCobjHidden = false;
var WFobjHidden = false;
var SCobjHidden = true;
let cameraPosition;
let INTERSECTED;
let theta = 0;

const pointer = new THREE.Vector2();
const radius = 100;
const frustumSize = 400;
var touchStartY = 0;
var _event = {
    y: 0,
    deltaY: 0
};
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const newmaterial = new THREE.MeshPhysicalMaterial({
    reflectivity: 1,
    color: 0x131313,
    roughness: 0.435,
    thickness: 10,
    clearcoat: 0.72,
    clearcoatRoughness: 1



});

const aspect = window.innerWidth / window.innerHeight;
var container = document.querySelector('.webgl');

scene = new THREE.Scene();
raycaster = new THREE.Raycaster();

renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true;
renderer.physicallyCorrectLights = true;
renderer.colorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 3;


camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 2000);
//camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 1000 );
camera.position.set(0, 100, 300);
//camera.LookAt(0,0,0);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.screenSpacePanning = false;
// an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.05;
//controls.minDistance = 300;
//controls.maxDistance = 500;
controls.maxPolarAngle = Math.PI / 2;
controls.target.set(0, 0, 0);

scene.background = new THREE.Color(0xff0000);
scene.fog = new THREE.Fog(0xff0000, 200, 500);
//scene.fog = new THREE.FogExp2( 0xcccccc, 1000 );
const hemiLight = new THREE.HemisphereLight(0xa0a0a0, 0x444444, 1);
hemiLight.position.set(0, 200, 0);
scene.add(hemiLight);
//

lightProbe = new THREE.LightProbe();
scene.add(lightProbe);
scene.add(new THREE.AmbientLight(0x404040, 1));
dirLight = new THREE.DirectionalLight(0xffffff, 0.3);
dirLight.position.set(0, 500, 100);
dirLight.castShadow = true;
dirLight.shadow.camera.top = 180;
dirLight.shadow.camera.bottom = - 100;
dirLight.shadow.camera.left = - 120;
dirLight.shadow.camera.right = 120;
scene.add(dirLight);


var parent = new THREE.Group();
scene.add(parent);

var maxHeight = (container.clientHeight || container.offsetHeight) - window.innerHeight

function initThree() {
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    //renderer.setClearColor(0x161216)


    const layers = {

        'PointCloud': function () {

            camera.layers.toggle(0);

        },
        'Scan': function () {

            camera.layers.toggle(1);

        }

    }
    container.appendChild(renderer.domElement);
    document.addEventListener('mousemove', onPointerMove);


}
function onPointerMove(event) {

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

}
const loadingManager = new THREE.LoadingManager(() => {

    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.classList.add('fade-out');

    // optional: remove loader from DOM via event listener
    loadingScreen.addEventListener('transitionend', onTransitionEnd);

});
const size = 1000;
const divisions = 20;

const gridHelper = new THREE.GridHelper(size, divisions);
scene.add(gridHelper);

////// 
//model
///////


const loader = new TDSLoader(loadingManager);
loader.load('https://storage.googleapis.com/fluidplate.com/Buracos/cave01.3ds', function (object) {
    //object.position.z = -1200;

    const sprite = new THREE.TextureLoader().load('./src/textures/sprites/circle.png');
    let material = new THREE.PointsMaterial({ size: 2, sizeAttenuation: true, map: sprite, alphaTest: 0.5, transparent: false });
    /*
        const geometries = [];
        for (var i = 0; i < object.children.length; i++) {
            geometries.push(object.children[i].geometry);
        }*/

    //const mergedGeo = BufferGeometryUtils.mergeBufferGeometries(geometries);

    //var mesh = new THREE.Points(mergedGeo, material);

    object.scale.set(0.1, 0.1, 0.1);
    // mesh.position.z = 0;
    object.position.set(-100, 30, 100);
    //scene.add(mesh)
    scene.add(object);
    parent.add(object);
    //mesh.visible = true;
    object.visible = true;


    const axesHelper = new THREE.AxesHelper(100);
    object.add(axesHelper);
    /*
        document.getElementById("PCtoggle").addEventListener("click", function () {
            if (PCobjHidden) {
                PCobjHidden = false;
                // code to show object
    
                mesh.visible = true;
            } else {
                PCobjHidden = true;
                // code to hide object
    
                mesh.visible = false;
            }
    
    
        });
        document.getElementById("WFtoggle").addEventListener("click", function () {
            if (WFobjHidden) {
                WFobjHidden = false;
                // code to show object
    
                linesMesh.visible = true;
            } else {
                WFobjHidden = true;
                // code to hide object
    
                linesMesh.visible = false;
            }
    
    
        });
        document.getElementById("SCtoggle").addEventListener("click", function () {
            if (SCobjHidden) {
                SCobjHidden = false;
                // code to show object
    
                object.visible = true;
            } else {
                SCobjHidden = true;
                // code to hide object
    
                object.visible = false;
            }
    
    
        });*/
}
);




loader.load('https://storage.googleapis.com/fluidplate.com/Buracos/cave01.3ds', function (object) {

    const sprite = new THREE.TextureLoader().load('./src/textures/sprites/circle.png');
    let material = new THREE.PointsMaterial({ size: 2, sizeAttenuation: true, map: sprite, alphaTest: 0.5, transparent: false });
    /*
        const geometries = [];
        for (var i = 0; i < object.children.length; i++) {
            geometries.push(object.children[i].geometry);
        }
    
        const mergedGeo = BufferGeometryUtils.mergeBufferGeometries(geometries);
    
        var mesh = new THREE.Points(mergedGeo, material);
    */
    object.scale.set(0.1, 0.1, 0.1);
    // mesh.position.z = 0;
    object.position.set(-100, 30, -100);
    //scene.add(mesh)
    //scene.add(object);
    parent.add(object);
    //mesh.visible = false;
    object.visible = true;
    const axesHelper = new THREE.AxesHelper(100);
    object.add(axesHelper);
});



loader.load('https://storage.googleapis.com/fluidplate.com/Buracos/cave00.3ds', function (object) {

    const sprite = new THREE.TextureLoader().load('./src/textures/sprites/circle.png');
    let material = new THREE.PointsMaterial({ size: 2, sizeAttenuation: true, map: sprite, alphaTest: 0.5, transparent: false });
    /*
        const geometries = [];
        for (var i = 0; i < object.children.length; i++) {
            geometries.push(object.children[i].geometry);
        }
    
        const mergedGeo = BufferGeometryUtils.mergeBufferGeometries(geometries);
    
        var mesh = new THREE.Points(mergedGeo, material);
    */
    object.scale.set(0.1, 0.1, 0.1);
    //mesh.position.z = 0;
    object.position.set(100, 30, -100);
    object.rotation.set(-120, -30, -90);
    //scene.add(mesh)
    //scene.add(object);
    parent.add(object);
    //mesh.visible = false;
    object.visible = true;
    const axesHelper = new THREE.AxesHelper(100);
    object.add(axesHelper);
});



loader.load('https://storage.googleapis.com/fluidplate.com/Buracos/cave05.3ds', function (object) {

    const sprite = new THREE.TextureLoader().load('./src/textures/sprites/circle.png');
    let material = new THREE.PointsMaterial({ size: 2, sizeAttenuation: true, map: sprite, alphaTest: 0.5, transparent: false });
    /*
        const geometries = [];
        for (var i = 0; i < object.children.length; i++) {
            geometries.push(object.children[i].geometry);
        }
    
        const mergedGeo = BufferGeometryUtils.mergeBufferGeometries(geometries);
    
        var mesh = new THREE.Points(mergedGeo, material);
    */
    object.scale.set(0.1, 0.1, 0.1);
    // mesh.position.z = 0;
    object.position.set(100, 30, 100);
    //scene.add(mesh)
    //scene.add(object);
    parent.add(object);
    // mesh.visible = false;
    object.visible = true;
    const axesHelper = new THREE.AxesHelper(100);
    object.add(axesHelper);
});



/////////
/////text
/////////

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

    const message = 'Buracos';

    const shapes = font.generateShapes(message, 40);

    const geometry = new THREE.ShapeGeometry(shapes);

    geometry.computeBoundingBox();

    const xMid = - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);

    geometry.translate(xMid, 50, 0);

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

        geometry.translate(xMid, 50, 0);

        const lineMesh = new THREE.Line(geometry, matDark);
        lineText.add(lineMesh);

    }
    lineText.position.z = 0;
    scene.add(lineText);



}); //end load function



/**
 * Particles
 */
// Geometry
/*
const particlesCount = 60000
const positions = new Float32Array(particlesCount * 3)


for(let i = 0; i < particlesCount; i++)
{
    positions[i * 3 + 0] = (Math.random() - 0.5) * 5000
    positions[i * 3 + 1] = (Math.random() - 0.5) * 5000
    positions[i * 3 + 2] = (Math.random() - 0.5) * 5000
}
const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
// Material
const particlesMaterial = new THREE.PointsMaterial({
    color: '#ffeded',
    sizeAttenuation: true,
    size: 0.5
})
// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)*/

function lerp(a, b, t) {
    return ((1 - t) * a + t * b);
}

function init() {
    initThree()
    //window.addEventListener('resize', resize, { passive: true })
    //divContainer.addEventListener('wheel', onWheel, { passive: false });
    //divContainer.addEventListener('touchstart', onTouchStart, { passive: false });
    //divContainer.addEventListener('touchmove', onTouchMove, { passive: false });
    animate()
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

function animate() {
    // render the 3D scene
    requestAnimationFrame(animate);
    controls.update();
    // relaunch the 'timer' 
    render();

}

function render() {
    //var dtime = Date.now() - startTime;
    var time = Date.now() * 0.0005;
    parent.rotation.y += 0.0004;
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children, false);
    if (intersects.length > 0) {

        if (INTERSECTED != intersects[0].object) {

            if (INTERSECTED) INTERSECTED.material;

            INTERSECTED = intersects[0].object;

            INTERSECTED.material = newmaterial;

        }

    } else {

        if (INTERSECTED) INTERSECTED.material;

        INTERSECTED = null;

    }

    renderer.render(scene, camera);

}

function onWheel(e) {
    // for embedded demo
    //e.stopImmediatePropagation();
    //e.preventDefault();
    //e.stopPropagation();

    var evt = _event;
    evt.deltaY = e.wheelDeltaY || e.deltaY * -1;
    // reduce by half the delta amount otherwise it scroll too fast
    evt.deltaY *= 0.5;

    scroll(e);
};

function scroll(e) {
    var evt = _event;
    // limit scroll top
    if ((evt.y + evt.deltaY) > 0) {
        evt.y = 0;
        // limit scroll bottom
    } else if ((-(evt.y + evt.deltaY)) >= maxHeight) {
        evt.y = -maxHeight;
    } else {
        evt.y += evt.deltaY;
    }
    scrollY = -evt.y
    var camPos = camera.position.z;
    camera.position.z = -(scrollY / 10);
    console.debug(scrollY)
}



//mobile example
function onTouchStart(e) {
    //e.preventDefault();
    var t = (e.targetTouches) ? e.targetTouches[0] : e;
    touchStartY = t.pageY;
};

function onTouchMove(e) {
    //e.preventDefault();
    var evt = _event;
    var t = (e.targetTouches) ? e.targetTouches[0] : e;
    evt.deltaY = (t.pageY - touchStartY) * 5;
    touchStartY = t.pageY;

    scroll(e)
};

init();


function onTransitionEnd(event) {

    event.target.remove();

}
