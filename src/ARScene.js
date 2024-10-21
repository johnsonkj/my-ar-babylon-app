import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Engine, Scene } from '@babylonjs/core';
import { Vector3, HemisphericLight, ArcRotateCamera, SceneLoader } from '@babylonjs/core';
import { AdvancedDynamicTexture, Button, StackPanel } from '@babylonjs/gui';
import '@babylonjs/loaders';

const ARScene = () => {
  const [modelLoaded, setModelLoaded] = useState(false);
  const [showMessage, setShowMessage] = useState(false); // State for showing the message
  const modelRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);  // Add a camera reference
  const loadButtonRef = useRef(null); // Reference to the load button

  const loadModel = useCallback(async () => {
    if (!modelLoaded) {
      if (!canvasRef.current || !canvasRef.current.scene || canvasRef.current.scene.isDisposed) {
        console.error('Scene has been disposed, cannot load the model.');
        return;
      }

      try {
        console.log("Loading model..."); // Log for model loading
        const result = await SceneLoader.ImportMeshAsync(
          '',
          'https://johnsonkj.github.io/my-ar-babylon-app/nathan.glb',
          '',
          canvasRef.current.scene
        );
        modelRef.current = result.meshes[0];
        modelRef.current.position = new Vector3(0, -3.5, 8);
        modelRef.current.scaling = new Vector3(0.05, 0.05, 0.05);

        if (cameraRef.current) {
          cameraRef.current.setTarget(modelRef.current.position);  // Set the camera to target the model's position
        }

        setModelLoaded(true);
        setShowMessage(true); // Show message after the model is loaded
        console.log("Model added successfully!"); // Log for successful model addition
      } catch (error) {
        console.error('Error loading model:', error);
      }
    }
  }, [modelLoaded]);

  useEffect(() => {
    const createScene = async () => {
      try {
        const canvas = canvasRef.current;
        const engine = new Engine(canvas, true);
        const scene = new Scene(engine);
        canvas.scene = scene;

        // Setup camera and light
        const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 2, 10, new Vector3(0, 0, 0), scene);
        camera.attachControl(canvas, true);
        cameraRef.current = camera;  // Store the camera reference
        const light = new HemisphericLight('light', new Vector3(1, 1, 0), scene);
        light.intensity = 0.7;

        // BabylonJS GUI for button interaction
        const guiTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);
        const panel = new StackPanel();
        panel.verticalAlignment = 1;
        panel.top = "-20px";

        guiTexture.addControl(panel);

        // Button to load the model
        const loadButton = Button.CreateSimpleButton("loadButton", "Load Model");
        loadButtonRef.current = loadButton; // Store reference to load button
        loadButton.width = "170px";  // Pixel-based width to make sure it's visible
        loadButton.height = "60px";  // Adjust pixel height
        loadButton.thickness = 4;
        loadButton.cornerRadius = 20;
        loadButton.color = "#FF7979";
        loadButton.background = "#007900";
        loadButton.fontSize = "26px";

        loadButton.onPointerUpObservable.add(() => {
          console.log("Button clicked!"); // Log button click
          loadModel();
          loadButton.isEnabled = false; // Disable the button when clicked
        });

        panel.addControl(loadButton);

        // XR Experience
        try {
          const xr = await scene.createDefaultXRExperienceAsync({
            uiOptions: {
              sessionMode: "immersive-ar",
              referenceSpaceType: "local-floor",
              onError: (error) => {
                alert(error);
              },
            },
            optionalFeatures: true,
          });

          console.log('AR session started');
        } catch (error) {
          console.error('Error starting AR session:', error);
        }

        engine.runRenderLoop(() => {
          if (scene && !scene.isDisposed) {
            scene.render();
          }
        });

        window.addEventListener('resize', () => {
          engine.resize();
        });

        return scene;

      } catch (error) {
        console.error('Error starting AR session:', error);
      }
    };
    createScene();
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      {showMessage && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#FFF',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 0 10px rgba(0,0,0,0.5)',
        }}>
          Model Loaded!
        </div>
      )}
    </div>
  );
};

export default ARScene;
