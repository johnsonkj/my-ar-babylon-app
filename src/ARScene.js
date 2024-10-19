import React, { useEffect } from 'react';
import { Engine, Scene } from '@babylonjs/core';
import { WebXRExperienceHelper } from '@babylonjs/core/XR/webXRExperienceHelper';
import { Vector3, HemisphericLight, ArcRotateCamera, MeshBuilder } from '@babylonjs/core';
import '@babylonjs/loaders';

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

      // Create a sphere to visualize
      const sphere = MeshBuilder.CreateSphere('sphere', { diameter: 2 }, scene);
      sphere.position.y = 1; // Position the sphere above the ground

      return { scene, sphere, camera }; // Return the scene, sphere, and camera
    };

    const { scene, sphere } = createScene();

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

        // Use the XR camera if available
        const xrCamera = helper._nonVRCamera || helper.baseExperience.camera;

        if (xrCamera) {
          // Set the initial position of the sphere in AR space
          const arPosition = new Vector3(0, 0, -5); // Position it 5 units in front of the camera
          sphere.position = arPosition; // Set the sphere's position

          // Optionally, set the sphere's rotation to match the camera's rotation
          sphere.rotationQuaternion = xrCamera.rotationQuaternion; // Align rotation with camera
        } else {
          console.error('No camera available for AR session');
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
