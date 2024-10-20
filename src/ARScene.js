import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Engine, Scene } from '@babylonjs/core';
import { WebXRExperienceHelper } from '@babylonjs/core/XR/webXRExperienceHelper';
import { Vector3, HemisphericLight, ArcRotateCamera, SceneLoader } from '@babylonjs/core';
import '@babylonjs/loaders'; // Babylon.js Loaders for loading glTF and glb

const ARScene = () => {
  const [modelLoaded, setModelLoaded] = useState(false); 
  const modelRef = useRef(null);
  const animationGroupRef = useRef(null);
  const canvasRef = useRef(null);
  
  const loadModel = useCallback(async () => {
    if (!modelLoaded) { // Check if the model has already been loaded
      if (!canvasRef.current || !canvasRef.current.scene || canvasRef.current.scene.isDisposed) {
        console.error('Scene has been disposed, cannot load the model.');
        return;
      }

      try {
        const result = await SceneLoader.ImportMeshAsync(
          '',
          'https://johnsonkj.github.io/my-ar-babylon-app/nathan.glb',
          '',
          canvasRef.current.scene // Pass the scene directly from the canvas reference
        );
        modelRef.current = result.meshes[0];
        modelRef.current.position = new Vector3(0, -3.5, 8);
        modelRef.current.scaling = new Vector3(0.05, 0.05, 0.05); // Use your desired initial scale

        if (result.animationGroups.length > 0) {
          animationGroupRef.current = result.animationGroups[0];
        }
        setModelLoaded(true); // Update the state when model is loaded
      } catch (error) {
        console.error('Error loading model:', error);
      }
    }
  }, [modelLoaded]); // Add modelLoaded as a dependency

  useEffect(() => {
    const canvas = canvasRef.current;
    const engine = new Engine(canvas, true);
    
    const scene = new Scene(engine);
    canvas.scene = scene; // Attach scene to canvas reference for use in loadModel

    // Initial camera setup
    const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 2, 10, new Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);
    
    const light = new HemisphericLight('light', new Vector3(1, 1, 0), scene);
    light.intensity = 0.7;

    const startARSession = async () => {
      try {
        const helper = await WebXRExperienceHelper.CreateAsync(scene);
        await helper.enterXRAsync('immersive-ar', 'local-floor');
        console.log('AR session started');

        await loadModel(); // Call loadModel when the AR session starts

        if (animationGroupRef.current) {
          animationGroupRef.current.start(true);
        }

        if (helper.onExitObservable) {
          helper.onExitObservable.add(() => {
            console.log('AR session ended');
          });
        }
      } catch (error) {
        console.error('Error starting AR session:', error);
      }
    };

    // Auto-start the AR session when the app loads
    startARSession();

    engine.runRenderLoop(() => {
      if (scene && !scene.isDisposed) {
        scene.render();
      }
    });

    window.addEventListener('resize', () => {
      engine.resize();
    });

    return () => {
      if (scene && !scene.isDisposed) {
        // scene.dispose(); // You can uncomment this if you want to dispose of the scene on unmount
      }
      window.removeEventListener('resize', () => engine.resize());
    };
  }, [loadModel]); // Include loadModel in the dependency array

  const handleLoadModel = () => {
    loadModel(); // Call the load model function on button click
  };

  return (
    <>
      <canvas id="renderCanvas" ref={canvasRef} style={{ width: '100vw', height: '100vh' }} />

      <button 
  onClick={handleLoadModel} 
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
  Load Animation Model
</button>

    </>
  );
};

export default ARScene;