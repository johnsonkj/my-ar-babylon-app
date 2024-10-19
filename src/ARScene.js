import React, { useEffect } from 'react';
import { Engine, Scene } from '@babylonjs/core';
import { WebXRExperienceHelper } from '@babylonjs/core/XR/webXRExperienceHelper'; // Correct import
import { Vector3, HemisphericLight, ArcRotateCamera, MeshBuilder } from '@babylonjs/core';
import '@babylonjs/loaders'; // Ensure you have loaders if you are loading models

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

      // Optional: add a basic sphere to visualize
      const sphere = MeshBuilder.CreateSphere('sphere', { diameter: 2 }, scene);
      sphere.position.y = 1;

      return scene;
    };

    const scene = createScene();

    // Setup AR Button
    const xrButton = document.createElement('button');
    xrButton.innerText = 'Open AR';
    xrButton.style.position = 'absolute';
    xrButton.style.top = '10px';
    xrButton.style.left = '10px';
    document.body.appendChild(xrButton);

    xrButton.addEventListener('click', () => {
      WebXRExperienceHelper.CreateAsync(scene).then((helper) => {
        if (helper) {
          // Start AR session
          helper.enterXRAsync('immersive-ar', 'local-floor').then(() => {
            console.log('AR session started');
          });

          // Handle exit observable
          if (helper.onExitObservable) {
            helper.onExitObservable.add(() => {
              console.log('AR session ended');
            });
          } else {
            console.error('onExitObservable is not defined');
          }
        } else {
          console.error('WebXRExperienceHelper is undefined');
        }
      }).catch(error => {
        console.error('Error creating WebXRExperienceHelper:', error);
      });
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
