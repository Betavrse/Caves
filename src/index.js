import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TDSLoader } from 'three/addons/loaders/TDSLoader.js';
import * as BufferGeometryUtils from '../jsm/utils/BufferGeometryUtils.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

let camera, scene, renderer;
let lightProbe;
let dirLight;
var scrollY = 0;
var PCobjHidden = false;
var WFobjHidden = false;
var SCobjHidden = true;
let cameraPosition;
var percentage = 0;
var startTime	= Date.now();
var _event = {
    y: 0,
    deltaY: 0
  };



var container = document.querySelector('.webgl');
var divContainer = document.querySelector('.container')
var maxHeight = (divContainer.clientHeight || divContainer.offsetHeight) - window.innerHeight
var span = document.querySelector('span');

scene = new THREE.Scene();
renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});

camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 2000);
camera.position.set(0, 0, 0);
cameraPosition = camera.position.z;

scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.Fog(0x3d3d3d, 400, 1000);

const hemiLight = new THREE.HemisphereLight(0xa0a0a0, 0x444444, 1);
hemiLight.position.set(0, 200, 0);
scene.add(hemiLight);
//

lightProbe = new THREE.LightProbe();
scene.add(lightProbe);
scene.add(new THREE.AmbientLight(0x404040, 1));
dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(0, 500, 100);
dirLight.castShadow = true;
dirLight.shadow.camera.top = 180;
dirLight.shadow.camera.bottom = - 100;
dirLight.shadow.camera.left = - 120;
dirLight.shadow.camera.right = 120;
scene.add(dirLight);

const cameraGroup = new THREE.Group();
scene.add(cameraGroup);
cameraGroup.add(camera);


var divContainer = document.querySelector('.container')
var maxHeight = (divContainer.clientHeight || divContainer.offsetHeight) - window.innerHeight
var span = document.querySelector('span');

function initThree () {
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    //renderer.setClearColor(0x161216)

    resize()
    const layers = {

        'PointCloud': function () {

            camera.layers.toggle( 0 );

        },
        'Scan': function () {

            camera.layers.toggle( 1);

        }

    }

    
    container.appendChild(renderer.domElement);
  }



  const loadingManager = new THREE.LoadingManager( () => {
	
    const loadingScreen = document.getElementById( 'loading-screen' );
    loadingScreen.classList.add( 'fade-out' );
    
    // optional: remove loader from DOM via event listener
    loadingScreen.addEventListener( 'transitionend', onTransitionEnd );
    
} );


////// 
//model
///////
const loader = new TDSLoader(loadingManager);
loader.setResourcePath('./models/cave/');
loader.load('./models/cave/cave00.3ds', function (object) {
    //object.position.z = -1200;
    const sprite = new THREE.TextureLoader().load('./src/textures/sprites/circle.png');
    let material = new THREE.PointsMaterial({ size: 2, sizeAttenuation: true, map: sprite, alphaTest: 0.5, transparent: false });
    const lineMat = new THREE.LineBasicMaterial({ color: 0x3d3d3d, vertexColors: false, linewidth: 0.1 });
    console.debug(object.children.length);

    const geometries = [];
    for (var i = 0; i < object.children.length; i++) {
        geometries.push(object.children[i].geometry);
    }

    const mergedGeo = BufferGeometryUtils.mergeBufferGeometries(geometries);
    
    var mesh = new THREE.Points(mergedGeo, material);
    var linesMesh = new THREE.LineSegments(mergedGeo, lineMat);
    mesh.position.z=-1200; 
    linesMesh.position.z=-1200;
    object.position.z = -1200;
    scene.add(mesh)
    scene.add(linesMesh);
    scene.add(object);

    mesh.visible = true;
    linesMesh.visible = true;
    object.visible = false;

    document.getElementById("PCtoggle").addEventListener("click", function(){
        if(PCobjHidden) {
            PCobjHidden = false;
            // code to show object

            mesh.visible = true;
        } else {
            PCobjHidden = true;
            // code to hide object
            
            mesh.visible = false;
        }


    });
    document.getElementById("WFtoggle").addEventListener("click", function(){
        if(WFobjHidden) {
            WFobjHidden = false;
            // code to show object

            linesMesh.visible = true;
        } else {
            WFobjHidden = true;
            // code to hide object
            
            linesMesh.visible = false;
        }


    });
    document.getElementById("SCtoggle").addEventListener("click", function(){
        if(SCobjHidden) {
            SCobjHidden = false;
            // code to show object

            object.visible = true;
        } else {
            SCobjHidden = true;
            // code to hide object
            
            object.visible = false;
        }


    });
}
);


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

    const message = '   CAVES\nPareid';

    const shapes = font.generateShapes(message, 40);

    const geometry = new THREE.ShapeGeometry(shapes);

    geometry.computeBoundingBox();

    const xMid = - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);

    geometry.translate(xMid, 0, 500);

    // make shape ( N.B. edge view not visible )

    const text = new THREE.Mesh(geometry, matLite);
    text.position.z = -1000;
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
    lineText.position.z = -1200;
    scene.add(lineText);



}); //end load function



/**
 * Particles
 */
// Geometry
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
scene.add(particles)

function lerp(a, b, t) {
    return ((1 - t) * a + t * b);
  }

function init () {
    initThree()
    window.addEventListener('resize', resize, { passive: true})
    divContainer.addEventListener('wheel', onWheel, { passive: false });
    
    
    divContainer.addEventListener('touchstart', onTouchStart, { passive: false });
    divContainer.addEventListener('touchmove', onTouchMove, { passive: false });
    animate()
  }

function resize () {
    // cointainer height - window height to limit the scroll at the top of the screen when we are at the bottom of the container
    maxHeight = (divContainer.clientHeight || divContainer.offsetHeight) - window.innerHeight
    renderer.width = container.clientWidth;
    renderer.height = container.clientHeight;
    renderer.setSize(renderer.width, renderer.height);
    camera.aspect = renderer.width / renderer.height;
    camera.updateProjectionMatrix();
  }
  function animate() {
    // render the 3D scene
    render();
    // relaunch the 'timer' 
    requestAnimationFrame( animate );
  }

  function render() {
    var dtime	= Date.now() - startTime;

    renderer.render( scene, camera );
  }

  function onWheel (e) {
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

function scroll (e) {
  var evt = _event;
  // limit scroll top
  if ((evt.y + evt.deltaY) > 0 ) {
    evt.y = 0;
  // limit scroll bottom
  } else if ((-(evt.y + evt.deltaY)) >= maxHeight) {
    evt.y = -maxHeight;
  } else {
      evt.y += evt.deltaY;
  }
  scrollY = -evt.y
  var camPos = camera.position.z;
  camera.position.z = -(scrollY/10);
  console.debug(scrollY)
}



//mobile example
function onTouchStart (e) {
    //e.preventDefault();
    var t = (e.targetTouches) ? e.targetTouches[0] : e;
    touchStartY = t.pageY;
};

function onTouchMove (e) {
    //e.preventDefault();
    var evt = _event;
    var t = (e.targetTouches) ? e.targetTouches[0] : e;
    evt.deltaY = (t.pageY - touchStartY) * 5;
    touchStartY = t.pageY;

	scroll(e)
};

init();


function onTransitionEnd( event ) {

	event.target.remove();
	
}
