import React, { useEffect } from 'react';
import { Engine, Scene, FreeCamera, Vector3, HemisphericLight } from '@babylonjs/core';
import '@babylonjs/core/Legacy/legacy'; // Importing the legacy module for basic XR support

const ARScene = () => {
  useEffect(() => {
    const canvas = document.getElementById('renderCanvas');
    const engine = new Engine(canvas, true);

    const createScene = () => {
      const scene = new Scene(engine);

      // Create a camera
      const camera = new FreeCamera("camera1", new Vector3(0, 1, -5), scene);
      camera.setTarget(Vector3.Zero());
      camera.attachControl(canvas, true); // Allow user to control the camera with mouse or touch

      // Create a light
      const light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
      light.intensity = 0.7;

      return scene;
    };

    const scene = createScene();

    // Check if XR is supported
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
        if (supported) {
          // Create a button to start AR
          const xrButton = document.createElement('button');
          xrButton.innerText = 'Start AR';
          document.body.appendChild(xrButton);

          xrButton.addEventListener('click', () => {
            navigator.xr
              .requestSession('immersive-ar')
              .then((session) => {
                // Create the XR experience
                const xrHelper = scene.createDefaultXRExperienceAsync({
                  floorMeshes: [], // Optionally specify floor meshes
                });

                session.addEventListener('end', () => {
                  // Handle session end
                  xrHelper.exitXR();
                });
              });
          });
        } else {
          console.error('AR not supported on this device.');
        }
      });
    } else {
      console.error('WebXR not supported in this browser.');
    }

    engine.runRenderLoop(() => {
      scene.render();
    });

    return () => {
      engine.dispose();
    };
  }, []);

  return <canvas id="renderCanvas" style={{ width: '100%', height: '100%' }} />;
};

export default ARScene;
