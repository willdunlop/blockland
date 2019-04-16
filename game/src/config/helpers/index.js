// import constrols from './controls';
import constants from '../constants';

const helpers = { 
    
    loadNextAnim(animations, fbxLoader) {
        constants.animationList.forEach(animation => {
            fbxLoader.load(`/assets/3D/animations/${animation}.fbx`, object => {
                animations[animation] = object.animations[0];
            })
        })
    },


    playerControl(core, forward, turn) {
        turn = -turn;
		if (forward>0.3){
			if (core.player.action != 'Walking' && core.player.action != 'Running') core.player.action = 'Walking';
		}else if (forward < -0.3){
			if (core.player.action!='Walking_Backward') core.player.action = 'Walking_Backward';
		}else{
			forward = 0;
			if (Math.abs(turn)>0.1){
				if (core.player.action != 'Turn') core.player.action = 'Turn';
			}else if (core.player.action != "Idle"){
				core.player.action = 'Idle';
			}
        }
        
        if (forward==0 && turn==0) delete core.player.motion;
		else core.player.motion = { forward, turn }; 
    },



    movePlayer(core, delta) {
        const playerPos = core.player.object.position.clone();
        playerPos.y += 60;  //  set the playerPos at about waist height
        const dir = new THREE.Vector3();
        core.player.object.getWorldDirection(dir);
        if (core.player.move.forward < 0) dir.negate(); //  invert the direction if moving back

        let raycaster = new THREE.Raycaster(playerPos, dir);
        let playerBlocked = false;

        let intersects = raycaster.intersectObjects(core.colliders);
        if(intersects.length > 0 && intersects[0].distance < 50) playerBlocked = true;

        if (!playerBlocked) {
            if (core.player.move.forward > 0) {
                const speed = core.player.action === "Running" ? 400 : 150;
                core.player.object.translateZ(delta * speed);
            } else {
                core.player.object.translateZ(-delta * 100);
            }
        }

        if (core.colliders !== undefined) {
            //  cast left
			dir.set(-1,0,0);
			dir.applyMatrix4(core.player.object.matrix);
			dir.normalize();
			raycaster = new THREE.Raycaster(playerPos, dir);

			let intersects = raycaster.intersectObjects(core.colliders);
			if (intersects.length>0 && intersects[0].distance<50){
				core.player.object.translateX(100-intersects[0].distance);
            }
            
            // cast right
            dir.set(1, 0, 0);
            dir.applyMatrix4(core.player.object.matrix);
            dir.normalize();
            raycaster = new THREE.Raycaster(playerPos, dir);

            intersects = raycaster.intersectObjects(core.colliders);
            if (intersects.length>0 && intersects[0].distance<50){
				core.player.object.translateX(intersects[0].distance - 100);
            }

            //cast down
            dir.set(0, -1, 0);
            playerPos.y += 200;
            raycaster = new THREE.Raycaster(playerPos, dir);
            const gravity = 30;

            intersects = raycaster.intersectObjects(core.colliders);
            if (intersects.length > 0) {
                const targetY = playerPos.y - intersects[0].distance;
                if (targetY > core.player.object.position.y) {
                    // going up
                    core.player.object.position.y = 0.8 * core.player.object.position.y + 0.2 * targetY;
                    core.player.velocityY = 0;
                } else if (targetY < core.player.object.position.y) {
                    // Falling
                    if(core.player.velocityY === undefined) core.player.velocityY = 0;
                    core.player.velocityY += delta * gravity;
                    core.player.object.position.y -= core.player.velocityY;
                    if(core.player.object.position.y < targetY) {
                        core.player.velocityY = 0;
						core.player.object.position.y = targetY;

                    }
                } 
            } else if (core.player.object.position.y>0){
                if (core.player.velocityY==undefined) core.player.velocityY = 0;
                core.player.velocityY += delta * gravity;
                core.player.object.position.y -= core.player.velocityY;
                if (core.player.object.position.y < 0){
                    core.player.velocityY = 0;
                    core.player.object.position.y = 0;
                }
            }

        }

        core.player.object.rotateY(delta * core.player.move.turn);
    }



 };
  
export default helpers;