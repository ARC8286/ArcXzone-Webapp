// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)


if (container.hasChildNodes()) {
  // If server-side rendered, hydrate
  hydrateRoot(container, <App />);
} else {
  // If client-side only, render normally
  const root = createRoot(container);
  root.render(<App />);
}