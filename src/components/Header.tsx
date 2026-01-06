import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../firebase"; // Importe a conexão do banco
import { doc, onSnapshot } from "firebase/firestore";
import '../styles/header.css';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]); // Estado para as categorias
  const navigate = useNavigate();

  // Buscar as categorias cadastradas em tempo real
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "categories"), (snapshot) => {
      if (snapshot.exists()) {
        setCategories(snapshot.data().list || []);
      }
    });

    return () => unsub();
  }, []);

  return (
    <header>
      <div className="header-left">
        <button onClick={() => navigate("/")}>Início</button>
        <button onClick={() => navigate("/sobre")}>Sobre</button>
      </div>

      <div className="menu-wrapper">
        <button onClick={() => setMenuOpen(!menuOpen)}>Menu</button>

        <div className={`dropdown ${menuOpen ? "active" : ""}`}>
          <div className="submenu-wrapper">
            <span className="submenu-label">Categorias</span>
            <div className="submenu">
              {/* Se não houver categorias, mostra uma mensagem ou link padrão */}
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <Link 
                    key={cat} 
                    to="/projects" 
                    state={{ filter: cat }} // Passa a categoria para filtrar na galeria
                    onClick={() => setMenuOpen(false)}
                  >
                    {cat}
                  </Link>
                ))
              ) : (
                <span className="no-cat">Nenhuma categoria</span>
              )}
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