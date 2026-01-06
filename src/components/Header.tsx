import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Importe o Link
import '../styles/header.css';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header>
      <div className="header-left">
        {/* Use navigate para botões de ação rápida */}
        <button onClick={() => navigate("/")}>Início</button>
        <button onClick={() => navigate("/sobre")}>Sobre</button>
      </div>

      <div className="menu-wrapper">
        <button onClick={() => setMenuOpen(!menuOpen)}>Menu</button>

        <div className={`dropdown ${menuOpen ? "active" : ""}`}>
          <div className="submenu-wrapper">
            <span className="submenu-label">Categorias</span>
            <div className="submenu">
              <Link to="/projects" onClick={() => setMenuOpen(false)}>Pinturas</Link>
              <Link to="/projects" onClick={() => setMenuOpen(false)}>Desenhos</Link>
            </div>
          </div>

          <Link 
            to="/contacts" 
            className="contact-link" 
            onClick={() => setMenuOpen(false)}
          >
            Contatos
          </Link>
        </div>
      </div>
    </header>
  );
}