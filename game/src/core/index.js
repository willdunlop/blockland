
import initialise from './initialise';

import constants from '../config/constants';
import helpers from '../config/helpers';

import PlayerLocal from './player/local';
// import helpers from '../config/helpers';
// const { controls } = helpers;

/**
 * @class: Core
 * The Core class acts as the core of the threejs environment. It is in this
 * class that the scene, renderer, camera, controls and lights are all configured
 */
class Core {
    constructor() {
        if(!Detector.webgl) Detector.addGetWebGLMessage();

        this.stats = new Stats();
        this.scene = new THREE.Scene();
        this.renderer = initialise.configureRenderer();
        this.camera = initialise.configureCamera();
        this.devControls = initialise.configureControls(this.camera, this.renderer);
        this.player = {};
        this.animations = {};
        // This is constants for sure
        // this.anims = ["Walking", "Walking_Backwards", "Turn", "Running"];
        this.colliders = [];
        this.sun = initialise.configureLight();
        this.clock = new THREE.Clock();
        this.loaders = {
            fbx: new THREE.FBXLoader(),
            texture: new THREE.TextureLoader()
        };

        this.init();
        this.animate(0);
    }



    /**
     * @function: onWindowResize
     * Is triggered by a window resize which will adjust the camera and
     * renderer size and ration for responsive rendering.
     */
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * @function: init
     * Initialises the environment. All the pieces of the scene are put
     * together in this function.
     */
    init() {
        /** direct the renderer and UI elements to the container element */
        const container = document.getElementById('container');
        container.appendChild(this.renderer.domElement);
        container.appendChild(this.stats.dom);
        // this.camera.lookAt(devCtarget);

        this.scene.background = new THREE.Color(0xa0a0a0);
        this.scene.fog = new THREE.Fog(0xa0a0a0, 700, 1800);


        /** Set up lights to be used in the scene */

        // const shadowHelper = new THREE.CameraHelper(light.shadow.camera);
        // this.scene.add(shadowHelper)


        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
        hemiLight.position.y = 50;
        // var helper = new THREE.HemisphereLightHelper( hemiLight, 5, 0x000000);
        // this.scene.add( helper );

        const groundGeo = new THREE.PlaneBufferGeometry(4000, 4000);
        const groundMat = new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.name = 'ground';
        ground.rotation.x = - Math.PI * 0.5;
        ground.receiveShadow = true;
        this.colliders.push(ground)

        const grid = new THREE.GridHelper( 4000, 60, 0x000000, 0x000000 );
		grid.material.opacity = 0.2;
		grid.material.transparent = true;
		this.scene.add( grid );

        // this.loaders.fbx.load('/assets/3D/people/FireFighter.fbx', object => {
        //     object.mixer = new THREE.AnimationMixer(object);
        //     this.player.mixer = object.mixer;
        //     this.player.root = object.mixer.getRoot();

        //     object.name = "FireFighter";
            
        //     this.loaders.texture.load('/assets/3D/SimplePeople_FireFighter_Brown.png', texture => {
        //         object.traverse(child => {
        //             if(child.isMesh){
        //                 child.material.map = texture;
        //                 child.castShadow = true;
        //                 child.recieveShadow = false;
        //             }
        //         })
        //     });
        //     this.player.object = new THREE.Object3D();
        //     this.scene.add(this.player.object)
        //     this.player.object.add(object);
        //     this.animations.Idle = object.animations[0];

        //     helpers.loadNextAnim(this.animations, this.loaders.fbx);
        //     initialise.createCameras(this);
        //     initialise.createColliders(this);

        //     this.joystick = new JoyStick({ onMove: (forward, turn) => helpers.playerControl(this, forward, turn), game: this })
        //     this.action = "Idle"; /** this.action is using a setter/getter */
        // })

        this.player = new PlayerLocal(this);
        helpers.loadNextAnim(this.animations, this.loaders.fbx)
        initialise.createColliders(this);
        this.joystick = new JoyStick({ onMove: (forward, turn) => helpers.playerControl(this, forward, turn), game: this })

        /** Add all lights, meshes and shaders to the scene */
        this.scene.add(this.sun);
        this.scene.add(hemiLight);
        this.scene.add(ground);


        /** Add event listeners for screen resizing */
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
    }

    /** Setters and Getters */
    // set action(name) { 
    //     console.log("setting action")
    //     const action = this.player.mixer.clipAction(this.animations[name]);
    //     action.time = 0;
    //     this.player.mixer.stopAllAction();
    //     this.player.action = name;
    //     this.player.actionTime = Date.now();
    //     this.player.actionName = name;

    //     action.fadeIn(0.5);
    //     action.play();
    // }

    // get action() {
    //     if (this.player == undefined || this.player.actionName == undefined) return;
    //     return this.player.actionName
    // }

    set activeCamera(object) { this.player.cameras.active = object }


    /**
     * @function: animate
     * @param {Number} timestamp: Used to measure the progress of time, a frame counter
     * Used to call upon the render function continuously so a new frame can be drawn
     * allowing for animation
     */
    animate(timestamp) {
        const dt = this.clock.getDelta();
        this.renderer.setAnimationLoop(this.animate.bind(this));
        this.update(dt);
        this.render(timestamp);
    }

    update(dt) {
        /** FPS counter */
        this.stats.update();
        /* Put a check to make sure all the async shit has completed */

        if (this.player.mixer !== undefined) this.player.mixer.update(dt);

        /* Player Controls Update */
        if (this.player.action === 'Walking') {
            const elapsedTime = Date.now() - this.player.actionTime;
            if (elapsedTime > 1000 && this.player.motion.forward > 0) this.player.action = 'Running'
        }
        // if (this.player.move !== undefined) helpers.movePlayer(this, dt);
        if (this.player.motion !== undefined) this.player.move(dt);


        /* Player Camera Update */
        if (this.player.cameras !== undefined && this.player.cameras.active !== undefined) {
            this.camera.position.lerp(this.player.cameras.active.getWorldPosition(new THREE.Vector3()), 0.05)
            const pos = this.player.object.position.clone();
            pos.y += 200;
            this.camera.lookAt(pos);
        }

        /* Sun Update */
        /* Sun will move with player so that the shadow map follows */
        if (this.sun !== undefined && this.player.object !== undefined) {
            this.sun.position.x = this.player.object.position.x;
            this.sun.position.y = this.player.object.position.y + 200;
            this.sun.position.z = this.player.object.position.z + 100;
            this.sun.target = this.player.object;
        }
}

    /**
     * @function: render
     * @param {Number} timestamp: Used to measure the progress of time, a frame counter
     * Draws an image to the screen including any pogressive changes. Uses the
     * threejs/WebGL renderer to draw an image
     */
    render() {

        /** Render the scene */
        this.renderer.render(this.scene, this.camera);
    }
}

export default Core;
