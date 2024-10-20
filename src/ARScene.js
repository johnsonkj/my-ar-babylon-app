import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Engine, Scene } from '@babylonjs/core';
import { WebXRExperienceHelper } from '@babylonjs/core/XR/webXRExperienceHelper';
import { Vector3, HemisphericLight, ArcRotateCamera, SceneLoader } from '@babylonjs/core';
import { AdvancedDynamicTexture, Button, StackPanel } from '@babylonjs/gui';
import '@babylonjs/loaders';

import { FreeCamera, Quaternion, DirectionalLight } from '@babylonjs/core';


import { WebXRHitTest } from '@babylonjs/core/XR/features/WebXRHitTest';

const ARScene = () => {
  const canvasRef = useRef(null);
    
  useEffect(() => {
      const createScene = async () => {
          const canvas = canvasRef.current;
          const engine = new Engine(canvas, true);
          const scene = new Scene(engine);

          // Create XR camera
          const camera_XR = new FreeCamera("camera_XR", new Vector3(0, 1, -5), scene);
          camera_XR.setTarget(Vector3.Zero());
          camera_XR.attachControl(canvas, false);

         
          // Lighting
          new HemisphericLight("light", new Vector3(0, 1, 0), scene).intensity = 0.7;
          const dirLight = new DirectionalLight("dirlight", new Vector3(0, -1, -0.5), scene);
          dirLight.position = new Vector3(0, 5, -5);

          // GUI
          const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
          const panel = new StackPanel();
          panel.verticalAlignment = 1;
          panel.top = "-20px";
          advancedTexture.addControl(panel);

          const button_set = Button.CreateSimpleButton("button", "Set Object");
          button_set.width = "400px";
          button_set.height = "150px";
          button_set.thickness = 10;
          button_set.cornerRadius = 150;
          button_set.color = "#FF7979";
          button_set.background = "#007900";
          button_set.children[0].color = "#DFF9FB";
          button_set.children[0].fontSize = "70px";

          button_set.onPointerClickObservable.add(() => {
              if (button_set.background === "#007900") {
                  button_set.children[0].text = "Lift Object";
                  button_set.background = "#EB4D4B";
              } else {
                  button_set.children[0].text = "Set Object";
                  button_set.background = "#007900";
              }
          });
          panel.addControl(button_set);

          // XR Experience
          const xr = await scene.createDefaultXRExperienceAsync({
              uiOptions: {
                  sessionMode: "immersive-ar",
                  referenceSpaceType: "local-floor",
                  onError: (error) => {
                      alert(error);
                  }
              },
              optionalFeatures: true
          });

        
          // Load Model
          const model = await SceneLoader.ImportMeshAsync("", "https://johnsonkj.github.io/my-ar-babylon-app/", "nathan.glb", scene);
          const b = model.meshes[0];
          b.scalingDeterminant = 4;

          
          

         
          b.rotationQuaternion = new Quaternion();
          b.setEnabled(true);
         
          button_set.isVisible = true;

          // XR Session Handling
          xr.baseExperience.sessionManager.onXRSessionInit.add(() => {
              b.rotationQuaternion = new Quaternion();
              b.scalingDeterminant = 0.2;
              b.setEnabled(false);
              button_set.isVisible = true;
          });

         
         

        
          engine.runRenderLoop(() => {
              if (scene) {
                  scene.render();
              }
          });

          return scene;
      };

      const scene = createScene();
      
      return () => {
          if (scene) {
              //scene.dispose();
          }
      };
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};
export default ARScene;
