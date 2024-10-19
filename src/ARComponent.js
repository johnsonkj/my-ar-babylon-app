// ARComponent.js
import React, { useEffect } from 'react';
import { Engine, Scene, Vector3 } from '@babylonjs/core';
import '@babylonjs/loaders';
import { WebXRExperienceHelper, WebXRCamera, SceneLoader } from '@babylonjs/core';

const ARComponent = () => {
  useEffect(() => {
    const createScene = async (canvas) => {
      // Create BabylonJS engine and scene
      const engine = new Engine(canvas, true);
      const scene = new Scene(engine);

      // Add a WebXR camera
      const camera = new WebXRCamera('WebXR', new Vector3(0, 1, -1), scene);
      scene.addCamera(camera);

      // Enable WebXR experience
      const xrHelper = await WebXRExperienceHelper.CreateAsync(scene);
      xrHelper.enableFeature(WebXRExperienceHelper.GPS, '1.0.0'); // Enable GPS feature

      // Load a model
      const modelUrl = 'https://johnsonkj.github.io/my-ar-babylon-app/nathan.glb'; // Replace with your model URL
      const result = await SceneLoader.ImportMeshAsync(null, modelUrl, '', scene);
      const model = result.meshes[0];
      model.scaling.scaleInPlace(0.1); // Scale the model down if needed

      // Run the engine render loop
      engine.runRenderLoop(() => {
        scene.render();
      });

      // Handle window resize
      window.addEventListener('resize', () => {
        engine.resize();
      });
    };

    const canvas = document.getElementById('renderCanvas');
    createScene(canvas);

    // Cleanup on unmount
    return () => {
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
    };
  }, []);

  return <canvas id="renderCanvas" style={{ width: '100%', height: '100vh' }}></canvas>;
};

export default ARComponent;
