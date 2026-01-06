import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contacts from "./pages/Contacts";  
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Projects from "./pages/Projects";




function App() {
  return (
    <Router>
      <Routes>
        {/* Rota principal que carrega a Home (e consequentemente o Header) */}
        <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/projects" element={<Projects />} />

        <Route path="/sobre" element={<About />} />
        <Route path="/contato" element={<Contacts/>} />



        {/* Rota para categorias */}
        <Route path="/categoria-pinturas" element={<div>Panturas</div>} />

        {/* Rota de erro (opcional) */}
        <Route path="*" element={<div>Página não encontrada</div>} />
      </Routes>
    </Router>
  );
}

export default App;