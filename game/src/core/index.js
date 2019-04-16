
import initialise from './initialise';

import constants from '../config/constants';
import helpers from '../config/helpers';

import PlayerLocal from './player/local';
import Player from './player';
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

        this.remotePlayers = [];
		this.remoteColliders = [];
		this.initialisingPlayers = [];
		this.remoteData = [];


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

        // this.scene.background = new THREE.Color(0xa0a0a0);
        // this.scene.fog = new THREE.Fog(0xa0a0a0, 2000, 2500);


        /** Set up lights to be used in the scene */

        // const shadowHelper = new THREE.CameraHelper(light.shadow.camera);
        // this.scene.add(shadowHelper)


        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
        hemiLight.position.y = 50;
        // var helper = new THREE.HemisphereLightHelper( hemiLight, 5, 0x000000);
        // this.scene.add( helper );

        // const groundGeo = new THREE.PlaneBufferGeometry(4000, 4000);
        // const groundMat = new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
        // const ground = new THREE.Mesh(groundGeo, groundMat);
        // ground.name = 'ground';
        // ground.rotation.x = - Math.PI * 0.5;
        // ground.receiveShadow = true;
        // this.colliders.push(ground)

        // const grid = new THREE.GridHelper( 4000, 60, 0x000000, 0x000000 );
		// grid.material.opacity = 0.2;
		// grid.material.transparent = true;
		// this.scene.add( grid );


        this.player = new PlayerLocal(this);
        helpers.loadNextAnim(this.animations, this.loaders.fbx)
        this.loadEnvironment();
        // initialise.createColliders(this);
        this.joystick = new JoyStick({ onMove: (forward, turn) => helpers.playerControl(this, forward, turn), game: this })

        /** Add all lights, meshes and shaders to the scene */
        this.scene.add(this.sun);
        this.scene.add(hemiLight);
        // this.scene.add(ground);


        /** Add event listeners for screen resizing */
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
    }


    loadEnvironment() {
        this.loaders.fbx.load('/assets/3D/town.fbx', object => {
            this.environment = object;
            this.scene.add(object);
            object.traverse(child => {
                if(child.isMesh) {
                    if (child.name.startsWith("proxy")) {
                        this.colliders.push(child);
                        child.material.visible = false;
                    } else {
                        child.castShadow = true;
                        child.recieveShadow = true;
                    }
                }
            })

        }, undefined, err => { console.log("Error loading town", err)})
    }

    /**
     * It would bring me joy if you would return to this function and chill it out in a number of ways
     */
    updateRemotePlayers(delta) {
        if(
            this.remoteData === undefined ||
            this.remoteData.length === 0 ||
            this.player === undefined ||
            this.player.id === undefined
        ) return;

        const remotePlayers = [];
        const remoteColliders = [];

        this.remoteData.forEach(data => {
            // Ignores local player
            if (this.player.id !== data.id) {
                // Check if it is an initialising player
                let iplayer;
                this.initialisingPlayers.forEach(player => {
                    if (player.id === data.id) iplayer = player
                });

                if (iplayer === undefined) {
                    let rplayer;
                    this.remotePlayers.forEach(player => {
                        if (player.id === data.id) rplayer = player;
                    });
                    if (rplayer === undefined) {
                        this.initialisingPlayers.push( new Player(this, data));
                    } else {
                        remotePlayers.push(rplayer);
                        this.remoteColliders.push(rplayer.collider)
                    }
                }
            }
        });

        /** Delete players if they disconnect */
        /** I do not like this grossly broad loop of scene */
        this.scene.children.forEach(object => {
            if(object.userData.remotePlayer && this.getRemotePlayerById(object.userData.id) === undefined) {
                this.scene.remove(object);
            }
        });

        this.remotePlayers = remotePlayers;
        this.remoteCollider = remoteColliders;
        this.remotePlayers.forEach(player => { player.update(delta); });
    }

    getRemotePlayerById(id) {
        if(this.remotePlayers === undefined || this.remotePlayers.length === 0) return;

        const players = this.remotePlayers.filter(player => {
            if(player.id == id) return true;
        });

        if (players.length === 0) return;

        return players[0];
    }


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

        this.updateRemotePlayers(dt);

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
