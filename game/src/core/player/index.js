import io from 'socket.io-client';

import helpers from '../../config/helpers';
import initialise from '../initialise';
import { events } from "../../config/events"; 


class Player {
    constructor(core, options) {
       
        // console.log("socket", socket);

        this.socket = io.connect("http://localhost:2002");;
        this.local = true;
        let model, colour;

        const colours = ['Black', 'Brown', 'White'];
        colour = colours[Math.floor(Math.random() * colours.length)];

        if (options === undefined) {
            const people = ['BusinessMan', 'Doctor', 'FireFighter', 'HouseWife', 'Policeman', 'Punk', 'RiotCop', 'RoadWorker', 'Robber', 'Sheriff'];
            model = people[Math.floor(Math.random() * people.length)];
            this.colour = colour;
        } else if (typeof options === 'object') {
            console.log("Player: expected options", options)
            this.local = false;
            this.options = options;
            this.id = options.id;
            model = options.model;
            this.colour = options.colour;
            this.position = options.position;
            this.rotation = options.rotation;
        } else {
            model = options;
        }

        this.model = model
        this.core = core;
        this.animations = this.core.animations;
        this.object;
        this.isReady = false;

        this.socket.on("NPC.response", this.postMessageToWorld)
        this.socket.on("chat message", this.postMessageToWorld.bind(this))
        this.init();
    }

    init() {
        const loader = new THREE.FBXLoader();
        const textureLoader = new THREE.TextureLoader();
        console.log("pre load")
        loader.load(`assets/3D/people/${this.model}.fbx`, object => {
            console.log("load model", object)
            object.mixer = new THREE.AnimationMixer(object);
            this.root = object;
            this.mixer = object.mixer;
            if (this.options) {
                this.options.name ? object.name = this.options.name : "Person";
                this.options.name ? this.name = this.name : "Person";
            } else {
                object.name = "Person";
            }


            textureLoader.load(`assets/3D/images/SimplePeople_${this.model}_${this.colour}.png`, texture => {
                object.traverse(child => {
                    if(child.isMesh) {
                        child.castShadow = true;
                        child.recieveShadow = true;
                        child.material.map = texture;
                    }
                });
            });

            this.object = new THREE.Object3D();
            this.object.add(object);
            if (this.position) {
                this.object.position.x = this.position.x
                this.object.position.z = this.position.z
            } else {
                this.object.position.x = helpers.getRandomNumber(2000, 2300);
                this.object.position.z = helpers.getRandomNumber(-9000, -9999);
            }

            if (this.rotation) {
                this.object.rotation.y = this.rotation.y
            } else {
                this.object.rotation.y = Math.PI / 2
            }


            if(this.deleted === undefined) {
                console.log(`adding ${this.id} to the scene`, this)
                this.core.scene.add(this.object);
            }

            if (this.local) {
                initialise.createCameras(this.core);
                this.core.sun.target = this.core.player.object;
                this.core.animations.Idle = object.animations[0];
                if(this.initSocket !== undefined) this.initSocket();
            } else {
                console.log("Creating non local player", this)
				const geometry = new THREE.BoxGeometry(100,300,100);
				const material = new THREE.MeshBasicMaterial({visible:false});
				const box = new THREE.Mesh(geometry, material);
				box.name = "Collider";
                box.position.set(0, 150, 0);
                this.object.add(box);
                this.collider = box;
                if (this.options.isNPC) {
                    console.log("creating NPC")
                    this.object.userData = {}
                    this.object.userData.id = this.id;
                    this.object.userData.remotePlayer = false;    
                    this.core.NPCs.push(this);
                } else {
                    this.object.userData.id = this.id;
                    this.object.userData.remotePlayer = false;
                    const players = this.core.initialisingPlayers.splice(this.core.initialisingPlayers.indexOf(this), 1)
                    this.core.remotePlayers.push(players[0])
                }
            }

            if(this.core.animations.Idle !== undefined) this.action = "Idle";
            // helpers.loadNextAnim(this.animations, this.loaders.fbx);
            // this.message.LookAt(this.core.camera.position);

            // const gltfLoader = new THREE.GLTFLoader()
            // gltfLoader.load("assets/3D/HotDog.glb", gltf => {
            //     const hotdog = gltf.scene;
            //     console.log("hotdog", hotdog)
            //     hotdog.scale(10,10,10)
            //     this.object.children[0]             //  chef_NPCS
            //         .children[1]                    //  pelvis
            //         .children[2]                    // spine_01    
            //         .children[0]                    // spine_02
            //         .children[0]                    //  spine_03
            //         .children[0]                    // clavicle_r
            //         .children[0]                    // upperarm r
            //         .children[0]                    // lowerarm r
            //         .children[0]                    // hand r
            //         .add(hotdog)
            // })

            const sausageSizzle = new THREE.Mesh(
                new THREE.BoxBufferGeometry(20,20,60),
                new THREE.MeshLambertMaterial({ color: 0xffbb00 })
            );
            sausageSizzle.visible = false;
            sausageSizzle.name = "sausageSizzle";

            this.object.children[0]             //  chef_NPCS
                .children[1]                    //  pelvis
                .children[2]                    // spine_01    
                .children[0]                    // spine_02
                .children[0]                    //  spine_03
                .children[0]                    // clavicle_r
                .children[0]                    // upperarm r
                .children[0]                    // lowerarm r
                .children[0]                    // hand r
                .add(sausageSizzle)


        }, undefined, err => { console.log("FBXLoader Err", err)});

        window.addEventListener("post.message", e => this.postMessageToWorld(e.detail.data));



        this.activeMessage = {
            isActive: false,
            message: {}
        }
    }

    async postMessageToWorld(data) {
        const finishTalking = (messagePlate, endEvent) => {
            return new Promise((resolve) => setTimeout(() => {
                if (this.activeMessage.isActive) {
                    this.object.remove(messagePlate)
                    this.activeMessage = {isActive: false, message: {}}
                    console.log("timeout complete");
                    if (endEvent) window.dispatchEvent(events[endEvent.name](endEvent.data))
                    resolve();
                } else { this.object.remove(messagePlate) }
            }, 4000))
        }
        // console.log("recieved message", data, this);
        // console.log("passes arg", this.id === data.name)
        if (this.id === data.name) {
            if (this.activeMessage.isActive) {
                console.log("removing old message")
                this.object.remove(this.activeMessage.message)
            }

            if (Array.isArray(data.message)) {
                for (const message of data.message) {
                    console.log("array of messages", message)
                    const messagePlate = this.characterMessagePlate(message);
                    this.object.add(messagePlate);
                    this.activeMessage = { isActive: true, message: messagePlate};
                    const isFinalMessage = message === data.message[data.message.length - 1]
                    const endEvent = isFinalMessage ? data.endEvent : false;
                    await finishTalking(messagePlate, endEvent);
                    console.log("finished awaiting")
                }
            } else {
                console.log("server message detected")
                const message = this.characterMessagePlate(data.message);
                this.object.add(message);
                this.activeMessage = { isActive: true, message: message};
                setTimeout(() => {
                    if (this.activeMessage.isActive) {
                        this.object.remove(message)
                        this.activeMessage = {isActive: false, message: {}}
                    } else { this.object.remove(message) }
                }, 4000)
            }
        }
    }

    characterMessagePlate(message) {
        var nameCanvas = document.createElement('canvas');
        var context = nameCanvas.getContext('2d');
        context.font = " 40px Arial";
        var textWidth = context.measureText(message).width;
        nameCanvas.width = textWidth;
        // nameCanvas.height = 40*1.3;
        context.font = " 40px Arial";
        context.fillStyle = "rgba(0,0,0, 0.65)";
        context.fillRect(0, 0, nameCanvas.width, nameCanvas.height / 2);
        context.fillStyle = "rgb(255, 255, 255)";
        context.fillText(message, 0, 60);

        const nameTexture = new THREE.Texture(nameCanvas);
        nameTexture.wrapS = THREE.RepeatWrapping;
        nameTexture.wrapT = THREE.RepeatWrapping;
        nameTexture.needsUpdate = true;

        const spriteMaterial = new THREE.SpriteMaterial({ map: nameTexture, color: 0xffffff });
        const sprite = new THREE.Sprite( spriteMaterial );
        sprite.scale.x = textWidth;
        sprite.scale.y = 200;
  
        sprite.position.z = 50;
        sprite.position.y = 300;
        return sprite;
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
        // this.action = name;
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
            // if(!found) this.core.removePlayer(this);
        } 
    }
}

export default Player;
