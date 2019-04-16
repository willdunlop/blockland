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
        core.player.updateSocket();
        //update
    },

    getRandomNumber: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
 };
  
export default helpers;