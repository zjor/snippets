import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';

const createBloomingPipeline = ({renderer, scene, camera}) => {
  const composer = new EffectComposer(renderer);

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloomConfig = {
    strength: 5,
    threshold: 0,
    radius: 0,
  }
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight),
    bloomConfig.strength,
    bloomConfig.radius,
    bloomConfig.threshold)

  const bloomComposer = new EffectComposer(renderer);
  bloomComposer.renderToScreen = false;
  bloomComposer.addPass(renderPass);
  bloomComposer.addPass(bloomPass);

  const finalPass = new ShaderPass(
    new THREE.ShaderMaterial({
      uniforms: {
        baseTexture: {value: null},
        bloomTexture: {value: bloomComposer.renderTarget2.texture}
      },
      vertexShader: document.getElementById('vertexshader').textContent,
      fragmentShader: document.getElementById('fragmentshader').textContent,
      defines: {}
    }), 'baseTexture'
  );
  finalPass.needsSwap = true;

  const finalComposer = new EffectComposer(renderer);
  finalComposer.addPass(renderPass);
  finalComposer.addPass(finalPass);

  composer.addPass(bloomPass)

  return {
    finalComposer,
    bloomComposer
  }
}

export {createBloomingPipeline}
