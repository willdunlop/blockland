
class Barbecue {
    constructor(core, options) {
        this.object = new THREE.Object3D();;

        this.init();
    }

    init() {
        const loader = new THREE.FBXLoader();
        console.log("init bbq")
        loader.load("assets/3D/bbq.fbx", (fbx) => {
            this.object.add(fbx)
            this.object.position.x = 3465;
            this.object.position.z = -10357;
            this.object.scale.set(100,100,100)
            
            console.log("bbq object", this.object)
            this.core.scene.add(this.object)
        });
    }
}

export default Barbecue;