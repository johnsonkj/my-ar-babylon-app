import React, { useEffect } from 'react';
import { Engine, Scene } from '@babylonjs/core';
import { WebXRExperienceHelper } from '@babylonjs/core/XR/webXRExperienceHelper';
import { Vector3, HemisphericLight, ArcRotateCamera, SceneLoader } from '@babylonjs/core';
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
    let initialScale = 0.05; // Initial model scale (reduce size)
    let lastScale = initialScale;
    let lastRotation = 0;

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
        model.position = new Vector3(0, -3.5, 8); // Position the model in AR space (5 units in front of the camera)
        model.scaling = new Vector3(initialScale, initialScale, initialScale); // Scale down the model

        // If there's an animation group, store it
        if (result.animationGroups.length > 0) {
          animationGroup = result.animationGroups[0]; // Play the first animation group
        }
      } catch (error) {
        console.error('Error loading model:', error);
      }
    };

    // Pinch and rotate gestures logic
    let initialDistance = null;
    let initialAngle = null;

    const onTouchMove = (event) => {
      if (event.touches.length === 2 && model) {
        // Get current positions of both touches
        const [touch1, touch2] = event.touches;
        const currentDistance = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY
        );

        // Pinch-to-zoom
        if (initialDistance !== null) {
          const scaleChange = currentDistance / initialDistance;
          const newScale = lastScale * scaleChange;
          model.scaling = new Vector3(newScale, newScale, newScale); // Adjust the model’s scale
        } else {
          initialDistance = currentDistance;
        }

        // Twist-to-rotate
        const currentAngle = Math.atan2(
          touch2.clientY - touch1.clientY,
          touch2.clientX - touch1.clientX
        );

        if (initialAngle !== null) {
          const angleChange = currentAngle - initialAngle;
          model.rotation.y = lastRotation + angleChange; // Rotate the model along the Y-axis
        } else {
          initialAngle = currentAngle;
        }
      }
    };

    const onTouchEnd = () => {
      // Reset values when touch ends
      initialDistance = null;
      initialAngle = null;
      lastScale = model.scaling.x; // Store the last scale
      lastRotation = model.rotation.y; // Store the last rotation
    };

    // Add touch event listeners
    canvas.addEventListener('touchmove', onTouchMove);
    canvas.addEventListener('touchend', onTouchEnd);
    canvas.addEventListener('touchcancel', onTouchEnd);

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
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchcancel', onTouchEnd);
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
