import { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/header.css';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header>
      <div className="header-left">
        <button onClick={() => navigate("/")}>Início</button>
        <button onClick={() => navigate("/sobre")}>Sobre</button>
      </div>

      <div className="menu-wrapper">
        <button onClick={() => setMenuOpen(!menuOpen)}>Menu</button>

        <div className={`dropdown ${menuOpen ? "active" : ""}`}>
          {/* Submenu-wrapper agora sem lógica de clique, sempre com classe 'open' no CSS */}
          <div className="submenu-wrapper">
            <span className="submenu-label">Categorias</span>
            <div className="submenu">
              <a href="/categoria-pinturas">Pinturas</a>
              <a href="/categoria-desenhos">Desenhos</a>
              <a href="/categoria-mistas">Técnicas Mistas</a>
            </div>
          </div>

          <a href="/contato">Contatos</a>
        </div>
      </div>
    </header>
  );
}