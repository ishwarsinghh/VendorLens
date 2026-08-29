import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Requirements from './pages/Requirements';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/"             element={<Dashboard />} />
            <Route path="/upload"       element={<Upload />} />
            <Route path="/requirements" element={<Requirements />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
