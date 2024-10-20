import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Engine, Scene } from '@babylonjs/core';
import { WebXRExperienceHelper } from '@babylonjs/core/XR/webXRExperienceHelper';
import { Vector3, HemisphericLight, ArcRotateCamera, SceneLoader } from '@babylonjs/core';
import { AdvancedDynamicTexture, Button } from '@babylonjs/gui'; // Import GUI components
import '@babylonjs/loaders'; // Babylon.js Loaders for loading glTF and glb

const ARScene = () => {
  const [modelLoaded, setModelLoaded] = useState(false);
  const [arStarted, setARStarted] = useState(false); // Track if AR has started
  const modelRef = useRef(null);
  const animationGroupRef = useRef(null);
  const canvasRef = useRef(null);

  const loadModel = useCallback(async () => {
    if (!modelLoaded) {
      if (!canvasRef.current || !canvasRef.current.scene || canvasRef.current.scene.isDisposed) {
        console.error('Scene has been disposed, cannot load the model.');
        return;
      }

      try {
        const result = await SceneLoader.ImportMeshAsync(
          '',
          'https://johnsonkj.github.io/my-ar-babylon-app/nathan.glb',
          '',
          canvasRef.current.scene
        );
        modelRef.current = result.meshes[0];
        modelRef.current.position = new Vector3(0, -3.5, 8);
        modelRef.current.scaling = new Vector3(0.05, 0.05, 0.05);

        if (result.animationGroups.length > 0) {
          animationGroupRef.current = result.animationGroups[0];
        }
        setModelLoaded(true);
      } catch (error) {
        console.error('Error loading model:', error);
      }
    }
  }, [modelLoaded]);

  const startARSession = async () => {
    try {
      const canvas = canvasRef.current;
      const engine = new Engine(canvas, true);
      const scene = new Scene(engine);
      canvas.scene = scene;

      // Setup camera and light
      const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 2, 10, new Vector3(0, 0, 0), scene);
      camera.attachControl(canvas, true);
      const light = new HemisphericLight('light', new Vector3(1, 1, 0), scene);
      light.intensity = 0.7;

      // Create WebXR session
      const helper = await WebXRExperienceHelper.CreateAsync(scene);
      await helper.enterXRAsync('immersive-ar', 'local-floor');
      console.log('AR session started');

      // Add BabylonJS GUI button inside AR session
      const guiTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
      const loadButton = Button.CreateSimpleButton("loadButton", "Load Animation Model");
      loadButton.width = "150px";
      loadButton.height = "40px";
      loadButton.color = "white";
      loadButton.background = "rgba(0, 150, 255, 0.8)";
      loadButton.onPointerUpObservable.add(() => {
        loadModel();
      });
      guiTexture.addControl(loadButton);

      engine.runRenderLoop(() => {
        if (scene && !scene.isDisposed) {
          scene.render();
        }
      });

      if (helper.onExitObservable) {
        helper.onExitObservable.add(() => {
          console.log('AR session ended');
        });
      }

      window.addEventListener('resize', () => {
        engine.resize();
      });

      setARStarted(true); // Mark AR session as started
    } catch (error) {
      console.error('Error starting AR session:', error);
    }
  };

  return (
    <>
      <canvas id="renderCanvas" ref={canvasRef} style={{ width: '100vw', height: '100vh' }} />

      
        <button
          onClick={startARSession}
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            zIndex: 1,
            padding: '10px 20px',
            backgroundColor: 'rgba(0, 150, 255, 0.8)',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Start AR
        </button>
      )
    </>
  );
};

export default ARScene;
