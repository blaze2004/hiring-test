import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './main.css'
import Logs from './components/ui/Logs.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/audits" element={<Logs />} /> { // I just did some basic work here in fetching data and showcasing it at http://localhost:5173/audits 
      }
    </Routes>
  </BrowserRouter>,
)
