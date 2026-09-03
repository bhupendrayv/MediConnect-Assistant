import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Provider } from 'react-redux'
import store from './redux/store.js'
import axios from 'axios'

// Set default baseURL for all raw axios calls across the app
const baseURL = import.meta.env.VITE_SERVER_URL || (import.meta.env.DEV ? 'http://localhost:8082/api/v1' : '/api/v1');
axios.defaults.baseURL = baseURL;
axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <App />
    </Provider>,
)

