import React, { useEffect, useState, useRef } from 'react';
import { Engine, Scene } from 'react-babylonjs';
import { Vector3, SceneLoader } from '@babylonjs/core';
import { WebXRExperienceHelper } from '@babylonjs/core';
import '@babylonjs/loaders/glTF'; // Important for loading .glb models

function App() {
    const [scene, setScene] = useState(null);
    const [model, setModel] = useState(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        if (scene) {
            // Set up AR (WebXR)
            const xrHelper = scene.createDefaultXRExperienceAsync({
                floorMeshes: [], // Optional: Add floor detection meshes here
            });

            xrHelper.then((xr) => {
                console.log("WebXR enabled");
            });
        }
    }, [scene]);

    // Function to play the animation on button click
    const handlePlayAnimation = () => {
        if (scene) {
            // Load the .glb model from the public folder when the button is clicked
            SceneLoader.ImportMesh(
                "",   // No need for specific mesh names
                "/",  // Root directory of public folder
                "nathan.glb", // Name of your GLB file
                scene,
                (meshes, particleSystems, skeletons) => {
                    const loadedModel = meshes[0];
                    setModel(loadedModel);

                    // Set the skeleton if available
                    if (skeletons.length > 0) {
                        loadedModel.skeleton = skeletons[0]; // Assign the skeleton to the model
                    }

                    // Adjust the model's position or scale as needed
                    loadedModel.position = new Vector3(0, 0, 0);
                    loadedModel.scaling = new Vector3(0.5, 0.5, 0.5); // Example scaling

                    // Play the animation if the skeleton has animations
                    if (loadedModel.skeleton && loadedModel.skeleton.animations.length > 0) {
                        scene.beginAnimation(loadedModel.skeleton, 0, 100, true); // Loop animation
                    } else {
                        console.error("No animations found on the model.");
                    }
                }
            );
        } else {
            console.error("Scene is not available.");
        }
    };

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <Engine antialias adaptToDeviceRatio canvasId="babylonJS" ref={canvasRef}>
                <Scene onSceneMount={(e) => { setScene(e.scene); }}>
                    <arcRotateCamera
                        name="camera1"
                        alpha={Math.PI / 2}
                        beta={Math.PI / 4}
                        radius={5}
                        target={Vector3.Zero()}
                        lowerRadiusLimit={2}
                        upperRadiusLimit={10}
                        wheelPrecision={50} // Controls zoom speed
                    />
                    <hemisphericLight name="light1" intensity={0.7} direction={Vector3.Up()} />
                </Scene>
            </Engine>
            
            <button
                onClick={handlePlayAnimation}
                style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '10px',
                    fontSize: '16px',
                }}
            >
                Load and Play Animation
            </button>
        </div>
    );
}

export default App;
