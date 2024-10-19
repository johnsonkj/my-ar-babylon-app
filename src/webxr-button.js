// src/webxr-button.js
export class WebXRButton {
    constructor(engine, { onRequestSession } = {}) {
      this.engine = engine;
      this.onRequestSession = onRequestSession;
  
      this.domElement = this.createButton();
      this.enabled = false;
    }
  
    createButton() {
      const button = document.createElement('button');
      button.innerText = 'START AR';
      button.style.position = 'absolute';
      button.style.top = '10px';
      button.style.right = '10px';
      button.style.zIndex = 1000;
      button.addEventListener('click', this.onRequestSession);
      return button;
    }
  
    setSession(session) {
      if (session) {
        this.domElement.innerText = 'EXIT AR';
        this.domElement.removeEventListener('click', this.onRequestSession);
      } else {
        this.domElement.innerText = 'START AR';
        this.domElement.addEventListener('click', this.onRequestSession);
      }
    }
  }
  