import React, { useEffect, useRef } from 'react';
import { Engine, Scene, Vector3, Color4 } from '@babylonjs/core';
import '@babylonjs/loaders';
import { WebXRExperienceHelper } from '@babylonjs/core';
import { SceneLoader } from '@babylonjs/core';

const ARComponent = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const createScene = async (xrHelper) => {
      // Create BabylonJS engine and scene
      const engine = new Engine(canvasRef.current, true);
      const scene = new Scene(engine);

      // Set a clear color for the scene
      scene.clearColor = new Color4(0, 0, 0, 0); // Transparent background for AR

      // Load a model
      const modelUrl = 'https://johnsonkj.github.io/my-ar-babylon-app/nathan.glb'; // Replace with your model URL
      const result = await SceneLoader.ImportMeshAsync(null, modelUrl, '', scene);
      const model = result.meshes[0];
      model.scaling.scaleInPlace(0.1); // Scale the model down if needed
      model.position = new Vector3(0, 0, 0); // Position the model in the center

      // Run the engine render loop
      engine.runRenderLoop(() => {
        scene.render();
      });

      // Handle window resize
      window.addEventListener('resize', () => {
        engine.resize();
      });

      // Cleanup on unmount
      return () => {
        window.removeEventListener('resize', () => {
          engine.resize();
        });
        engine.dispose();
      };
    };

    const requestARSession = async () => {
      if (navigator.xr) {
        try {
          const session = await navigator.xr.requestSession('immersive-ar');
          const xrHelper = await WebXRExperienceHelper.CreateAsync(session);

          // Start the scene with the created XR helper
          createScene(xrHelper);
        } catch (err) {
          console.error('Failed to start AR session:', err);
        }
      } else {
        console.error('WebXR not supported');
      }
    };

    requestARSession();
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};

export default ARComponent;
