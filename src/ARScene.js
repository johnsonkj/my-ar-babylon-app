import React, { useEffect } from 'react';
import { Engine, Scene } from '@babylonjs/core';
import { WebXRExperienceHelper } from '@babylonjs/core/XR/webXRExperienceHelper';
import { Vector3, HemisphericLight, ArcRotateCamera, SceneLoader, AnimationGroup } from '@babylonjs/core';
import '@babylonjs/loaders'; // Babylon.js Loaders for loading glTF and glb

const ARScene = () => {
  useEffect(() => {
    // Create the canvas and engine
    const canvas = document.getElementById('renderCanvas');
    const engine = new Engine(canvas, true);

    // Create a basic scene
    const createScene = () => {
      const scene = new Scene(engine);

      // Add a camera
      const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 2, 10, new Vector3(0, 0, 0), scene);
      camera.attachControl(canvas, true);
      
      // Add a light
      const light = new HemisphericLight('light', new Vector3(1, 1, 0), scene);
      light.intensity = 0.7;

      return { scene, camera }; // Return the scene and camera
    };

    const { scene } = createScene();

    let model; // Variable to hold the loaded model
    let animationGroup; // Variable to hold the animation group

    // Load the GLB model from GitHub
    const loadModel = async () => {
      try {
        const result = await SceneLoader.ImportMeshAsync(
          '', // No mesh name filter
          'https://johnsonkj.github.io/my-ar-babylon-app/nathan.glb', // URL to the hosted .glb model
          '',
          scene
        );
        model = result.meshes[0]; // Access the loaded model
        model.position = new Vector3(0, 0, -5); // Position the model in AR space (5 units in front of camera

        // If there's an animation group, store it
        if (result.animationGroups.length > 0) {
          animationGroup = result.animationGroups[0]; // Play the first animation group
        }
      } catch (error) {
        console.error('Error loading model:', error);
      }
    };

    // Setup AR Button
    const xrButton = document.createElement('button');
    xrButton.innerText = 'Open AR';
    xrButton.style.position = 'absolute';
    xrButton.style.top = '10px';
    xrButton.style.left = '10px';
    document.body.appendChild(xrButton);

    xrButton.addEventListener('click', async () => {
      try {
        // Create WebXR experience
        const helper = await WebXRExperienceHelper.CreateAsync(scene);
        if (!helper) {
          console.error('WebXRExperienceHelper was not created.');
          return;
        }

        console.log('WebXRExperienceHelper created:', helper);

        // Start AR session
        await helper.enterXRAsync('immersive-ar', 'local-floor');
        console.log('AR session started');

        // Load the model if not loaded already
        if (!model) {
          await loadModel();
        }

        // If model and animation group exist, start the animation
        if (animationGroup) {
          animationGroup.start(true); // Play the animation looped
        }

        // Handle exit observable
        if (helper.onExitObservable) {
          helper.onExitObservable.add(() => {
            console.log('AR session ended');
          });
        } else {
          console.error('onExitObservable is not defined');
        }
      } catch (error) {
        console.error('Error starting AR session:', error);
      }
    });

    // Render loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Resize event
    window.addEventListener('resize', () => {
      engine.resize();
    });

    return () => {
      engine.dispose();
      window.removeEventListener('resize', () => {
        engine.resize();
      });
      document.body.removeChild(xrButton);
    };
  }, []);

  return (
    <canvas id="renderCanvas" style={{ width: '100%', height: '100%' }} />
  );
};

export default ARScene;
