import React, { useEffect } from 'react';
import { Engine, Scene } from '@babylonjs/core';
import '@babylonjs/core/Legacy/legacy'; // For basic XR support


const ARScene = () => {
  useEffect(() => {
    const canvas = document.getElementById('renderCanvas');
    const engine = new Engine(canvas, true);

    const createScene = () => {
      const scene = new Scene(engine);
      // Set up the scene (lighting, camera, etc.) here
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
                  // You can add other configurations here
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
