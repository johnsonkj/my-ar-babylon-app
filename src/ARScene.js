import React, { useEffect } from 'react';
import { Engine, Scene } from '@babylonjs/core';
import { WebXRExperienceHelper } from '@babylonjs/core/XR/webXRExperienceHelper';
import { Vector3, HemisphericLight, ArcRotateCamera, SceneLoader } from '@babylonjs/core';
import '@babylonjs/loaders'; // Babylon.js Loaders for loading glTF and glb

const ARScene = () => {
  useEffect(() => {
    const canvas = document.getElementById('renderCanvas');
    const engine = new Engine(canvas, true);

    const createScene = () => {
      const scene = new Scene(engine);

      const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 2, 10, new Vector3(0, 0, 0), scene);
      camera.attachControl(canvas, true);
      
      const light = new HemisphericLight('light', new Vector3(1, 1, 0), scene);
      light.intensity = 0.7;

      return { scene, camera };
    };

    const { scene } = createScene();

    let model;
    let animationGroup;
    let initialScale = 0.05;
    let lastScale = initialScale;
    let lastRotation = 0;

    const loadModel = async () => {
      try {
        const result = await SceneLoader.ImportMeshAsync(
          '',
          'https://johnsonkj.github.io/my-ar-babylon-app/nathan.glb',
          '',
          scene
        );
        model = result.meshes[0];
        model.position = new Vector3(0, -3.5, 8);
        model.scaling = new Vector3(initialScale, initialScale, initialScale);

        if (result.animationGroups.length > 0) {
          animationGroup = result.animationGroups[0];
        }
      } catch (error) {
        console.error('Error loading model:', error);
      }
    };

    let initialDistance = null;
    let initialAngle = null;

    const onTouchMove = (event) => {
      if (event.touches.length === 2 && model) {
        const [touch1, touch2] = event.touches;
        const currentDistance = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY
        );

        if (initialDistance !== null) {
          const scaleChange = currentDistance / initialDistance;
          const newScale = lastScale * scaleChange;
          model.scaling = new Vector3(newScale, newScale, newScale);
        } else {
          initialDistance = currentDistance;
        }

        const currentAngle = Math.atan2(
          touch2.clientY - touch1.clientY,
          touch2.clientX - touch1.clientX
        );

        if (initialAngle !== null) {
          const angleChange = currentAngle - initialAngle;
          model.rotation.y = lastRotation + angleChange;
        } else {
          initialAngle = currentAngle;
        }
      }
    };

    const onTouchEnd = () => {
      initialDistance = null;
      initialAngle = null;
      if (model) {
        lastScale = model.scaling.x;
        lastRotation = model.rotation.y;
      }
    };

    const addTouchListeners = () => {
      canvas.addEventListener('touchmove', onTouchMove);
      canvas.addEventListener('touchend', onTouchEnd);
      canvas.addEventListener('touchcancel', onTouchEnd);
    };

    const removeTouchListeners = () => {
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchcancel', onTouchEnd);
    };

    const xrButton = document.createElement('button');
    xrButton.innerText = 'Open AR';
    xrButton.style.position = 'absolute';
    xrButton.style.top = '10px';
    xrButton.style.left = '10px';
    document.body.appendChild(xrButton);

    xrButton.addEventListener('click', async () => {
      try {
        const helper = await WebXRExperienceHelper.CreateAsync(scene);

        await helper.enterXRAsync('immersive-ar', 'local-floor');
        console.log('AR session started');

        if (!model) {
          await loadModel();
        }

        if (animationGroup) {
          animationGroup.start(true);
        }

        // Add touch listeners for interactions in AR mode
        addTouchListeners();

        if (helper.onExitObservable) {
          helper.onExitObservable.add(() => {
            console.log('AR session ended');
            removeTouchListeners(); // Clean up listeners when AR session ends
          });
        }
      } catch (error) {
        console.error('Error starting AR session:', error);
      }
    });

    engine.runRenderLoop(() => {
      scene.render();
    });

    window.addEventListener('resize', () => {
      engine.resize();
    });

    return () => {
      engine.dispose();
      removeTouchListeners();
      window.removeEventListener('resize', () => engine.resize());
      document.body.removeChild(xrButton);
    };
  }, []);

  return (
    <canvas id="renderCanvas" style={{ width: '100%', height: '100%' }} />
  );
};

export default ARScene;
