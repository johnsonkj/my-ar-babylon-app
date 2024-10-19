// App.js
import React from 'react';
import ARComponent from './ARComponent';

function App() {
  const startAR = () => {
    const canvas = document.getElementById('renderCanvas');
    if (canvas) {
      const xrHelper = new WebXRExperienceHelper();
      xrHelper.createAsync();
    }
  };

  return (
    <div>
      <h1>AR Experience</h1>
      <button onClick={startAR}>Start AR</button>
      <ARComponent />
    </div>
  );
}

export default App;
