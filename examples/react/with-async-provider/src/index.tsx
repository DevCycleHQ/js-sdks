import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { asyncWithDVCProvider } from '@devcycle/devcycle-react-sdk';

(async () => {
  const ENV_KEY = 'test_token'
  const DVCProvider = await asyncWithDVCProvider({envKey: ENV_KEY })
  ReactDOM.render(
    <React.StrictMode>
      <DVCProvider>
        <App />
      </DVCProvider>
    </React.StrictMode>,
    document.getElementById('root')
  );
})()

