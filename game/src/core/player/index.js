class Player {
    constructor(core, options) {
        this.local = true;
        let model, colour;

        const colours = ['Black', 'Brown', 'White'];
        colour = colours[Math.floor(Math.random() * colours.length)];

        if (options === undefined) {
            const people = ['BusinessMan', 'Doctor', 'FireFighter', 'HouseWife', 'Policeman', 'Punk', 'RiotCop', 'Roadworker', 'Robber', 'Sherrif', 'Streetman', 'Waitress'];
            model = people[Math.floor(Math.random() * people.length)];
        } else if (typeof options === 'object') {
            this.local = false;
            this.options = options;
            this.id = options.id;
            model = options.model;
            colour = options.colour;
        } else {
            model = options;
        }

        this.model = model
        this.colour = colour;
        this.core = core;
        this.animations = this.core.animations;

        this.init();
    }

    init() {
        const loader = new THREE.FBXLoader();
        const textureLoader = new THREE.TextureLoader();
        loader.load(`assets/3D/people/${this.model}.fbx`, object => {
            object.mixer = new THREE.AnimationMixer(object);
            this.root = object;
            this.mixer = object.mixer;
            object.name = "Person";

            textureLoader.load(`assets/3D/imageas/SimplePeople_${this.model}_${this.colour}.png`, texture => {
                object.traverse(child => {
                    if(child.isMesh) {
                        child.castShadow = true;
                        child.recieveShadow = true;
                        child.material.map = texture;
                    }
                });
            });

            this.object = new THREE.Object3D();
            this.player.object.add(object);
            if(player.deleted === undefined) this.core.scene.add(this.object);

            if (this.local) {
                this.core.createCameras();
                this.core.sun.target = this.core.player.object;
                this.core.animations.Idle = object.animations[0];
                if(this.initSocket !== undefined) this.initSocket();
            } else {
				const geometry = new THREE.BoxGeometry(100,300,100);
				const material = new THREE.MeshBasicMaterial({visible:false});
				const box = new THREE.Mesh(geometry, material);
				box.name = "Collider";
                box.position.set(0, 150, 0);
                this.object.add(box);
                this.collider = box;
                this.object.userData.id = this.id;
                this.object.userData.remotePlayer = true;
                const players = this.core.initialisingPlayers.splice(this.core.initialisingPlayers.indexOf(this), 1)
                this.core.remotePlayers.push(players[0])
            }

            if(core.animations.Idle !== undefined) this.action = "Idle";
        });
    }

    set action(name) {
        if (this.actionName === name) return;
        let clip;
        if (this.local) clip = this.animations[name];
        /* Log the clip object and if it looks good, do a deep clone instead */
        else clip = THREE.AnimationClip.parse(THREE.AnimationClip.toJSON(this.animations[name]));

        const action = this.mixer.clipAction(clip);
        action.time = 0;
        this.mixer.stopAllAction();
        this.actionName = name;
        this.actionTime = Date.now();

        action.fadeIn(0.5);
        action.play();
    }

    get action() { return this.actionName; }

    update(delta) {
        this.mixer.update(delta);
        if (this.core.remoteData.length > 0) {
            let found = false;
            for (let data of this.core.remoteData) {
                if (data.id !== this.id) continue;
                // Player found
                this.object.position.set(data.x, data.y, data.z);
                const euler = new THREE.Euler(data.pb, data.heading, data.pb);
                this.object.quaternion.setFromEuler(euler);
                this.action = data.action;
                found = true;
            }
            if(!found) this.core.removePlayer(this);
        }
    }
}

export default Player;