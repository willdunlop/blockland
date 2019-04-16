import io from 'socket.io-client';
import Player from './index';

class PlayerLocal extends Player {
    constructor(core, model) {
        super(core, model);
        console.log("PlayerLocal", this);

        const socket = io.connect("http://localhost:2002");
        socket.on('setId', data => { this.id = data.id; })
        socket.on('remotePlayer', data => { core.remoteData = data; })
        socket.on('deletePlayer', data => {
            const players = core.remotePlayers.filter(player => {
                if (player.id === data.id) return player;
            });

            if (players.length > 0) {
                let index = core.remotePlayers.indexOf(players[0]);
                if(index !== -1) {
                    core.remotePlayers.splice(index, 1);
                    core.scene.remove(players[0].object);
                }
            } else {
                index = core.initialisingPlayers.indexOf(data.id);
                if(index !== -1) {
                    const player = core.initialisingPlayers[index];
                    player.deleted = true;
                    core.initialisingPlayers.splice(index, 1);
                }
            }
        });

        // socket.on('chat message', data => {
        //     const remotePlayer = core.getRemotePlayerById(data.id);
        //     core.speechBubble.player = remotePlayer;
        //     core.chatSocketId = remotePlayer.id
        //     core.activeCamera = core.cameras.chat;
        //     core.speechBubble.update(data.message);
        // })

        /**
         * Message form submition and resetting
         */

         this.socket = socket;
    }

    initSocket() {
        if (this.socket !== undefined) {
            this.socket.emit('update', {
                x: this.object.position.x,
                y: this.object.position.y,
                z: this.object.position.z,
                h: this.object.rotation.y,
                pb: this.object.rotation.x,
                action: this.action
            })
        }
    }

    updateSocket(){
		if (this.socket !== undefined){
			this.socket.emit('update', {
				x: this.object.position.x,
				y: this.object.position.y,
				z: this.object.position.z,
				h: this.object.rotation.y,
				pb: this.object.rotation.x,
				action: this.action
			})
		}
	}


    raycastSide(castDir, dir, pos, raycaster) {
        dir.set(castDir.x, castDir.y, castDir.z);
        dir.applyMatrix4(this.object.matrix);
        dir.normalize();
        raycaster = new THREE.Raycaster(pos, dir);
        this.intersects = raycaster.intersectObjects(this.core.colliders) 
        if (this.intersects.length > 0 && this.intersects[0].distance < 50) {
            this.object.translateX(100 - this.intersects[0].distance);
        }
    }

    raycastDown(dir, pos, delta, raycaster) {
        dir.set(0,-1,0);
        pos.y += 200;
        raycaster = new THREE.Raycaster(pos, dir);
        const gravity = 30;

        this.intersects = raycaster.intersectObjects(this.core.colliders);
        if (this.intersects.length>0){
            const targetY = pos.y - this.intersects[0].distance;
            if (targetY > this.object.position.y){
                //Going up
                this.object.position.y = 0.8 * this.object.position.y + 0.2 * targetY;
                this.velocityY = 0;
            }else if (targetY < this.object.position.y){
                //Falling
                if (this.velocityY === undefined) this.velocityY = 0;
                this.velocityY += delta * gravity;
                this.object.position.y -= this.velocityY;
                if (this.object.position.y < targetY){
                    this.velocityY = 0;
                    this.object.position.y = targetY;
                }
            }
        }
    }

    move(delta) {
        const pos = this.object.position.clone();
        pos.y += 60;
        let dir = new THREE.Vector3();
        this.object.getWorldDirection(dir);
        if (this.motion.forward < 0) dir.negate();
        let raycaster = new THREE.Raycaster(pos, dir);
        let blocked = false;
        const colliders = this.core.colliders;
        this.intersects = raycaster.intersectObjects(colliders);

        if(colliders !== undefined) {
            if (this.intersects.length > 0 && this.intersects[0].distance < 50) blocked = true;
        }

        if(!blocked) {
            if(this.motion.forward > 0) {
                const speed = this.action === 'Running' ? 500 : 150;
                this.object.translateZ(delta * speed);
            } else {
                this.object.translateZ(-delta * 60);
            }
        }

        if (colliders !== undefined) {
            const left = { x: -1, y: 0, z: 0 };
            const right = { x: 1, y: 0, z: 0 };
            this.raycastSide(left, dir, pos, raycaster);
            this.raycastSide(right, dir, pos, delta, raycaster)
            this.raycastDown(dir, pos, delta, raycaster)
        }

        this.object.rotateY(this.motion.turn * delta);
        this.updateSocket();
    }
}

export default PlayerLocal;