
import constants from '../../config/constants'; 

const initialise = {

    /**
     * @function: configureRenderer
     * @returns: {Object}: renderer
     * sets up and configures the renderer object to be used in the
     * environment.
     */
    configureRenderer() {
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        return renderer;
    },

    /**
     * @function: configureCamera
     * @returns: {Object}: camera
     * sets up and configures the camera object to be used in the
     * environment.
     */
    configureCamera() {
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 10, 200000);
        camera.position.set(112,100,400);

        return camera;
    },

    configureControls(camera, renderer) {
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 170, 0);
        controls.update();
        return controls
    },

    configureLight() {
        const light = new THREE.DirectionalLight(0xffffff);
        light.position.set(30, 100, 40)
        light.target.position.set( 0, 0, 0 );

        const lightSize = 500;
        light.castShadow = true;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        light.shadow.bias = 0.0039;
        light.shadow.camera.near = 1;
        light.shadow.camera.far = 500;
        light.shadow.camera.left = light.shadow.camera.bottom = -lightSize;
		light.shadow.camera.right = light.shadow.camera.top = lightSize;

        // light.shadow.camera.top = 180;
        // light.shadow.camera.bottom = -100;
        // light.shadow.camera.left = -120;
        // light.shadow.camera.right = 120;

        return light;
    },

    createColliders(core){
        const geometry = new THREE.BoxGeometry(500, 400, 500);
        const material = new THREE.MeshBasicMaterial({color:0x222222, wireframe:true});
        
        
        for (let x=-5000; x<5000; x+=1000){
            for (let z=-5000; z<5000; z+=1000){
                if (x==0 && z==0) continue;
                const box = new THREE.Mesh(geometry, material);
                box.position.set(x, 200, z);
                core.scene.add(box);
                core.colliders.push(box);
            }
        }
        
        const geometry2 = new THREE.BoxGeometry(1000, 40, 1000);
        const stage = new THREE.Mesh(geometry2, material);
        stage.position.set(0, 20, 0);
        core.colliders.push(stage);
        core.scene.add(stage);
    },

    createCameras(core) {
        core.player.cameras = {}
        Object.keys(constants.playerCameras).forEach(key => {
            const cameraObject = new THREE.Object3D();
            const { x, y, z } = constants.playerCameras[key];
            cameraObject.position.set(x, y, z);
            cameraObject.parent = core.player.object;
            core.player.cameras[key] = cameraObject;
        })
        core.activeCamera = core.player.cameras.back
    }

}

export default initialise;