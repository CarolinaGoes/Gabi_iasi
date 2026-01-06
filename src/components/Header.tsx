import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import '../styles/header.css';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const navigate = useNavigate();

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
              
              {/* Opção FIXA: Sempre aparece e não pode ser editada no dashboard */}
              <Link 
                to="/projects" 
                state={{ categoryFilter: "Todos" }} 
                onClick={() => setMenuOpen(false)}
                className="fixed-category"
              >
                Todas as Categorias
              </Link>

              {/* Divisor visual opcional */}
              {categories.length > 0 && <hr className="menu-divider" />}

              {/* Categorias Dinâmicas vindas do Firebase */}
              {categories.map((cat) => (
                <Link 
                  key={cat} 
                  to="/projects" 
                  state={{ categoryFilter: cat }} 
                  onClick={() => setMenuOpen(false)}
                >
                  {cat}
                </Link>
              ))}

              {categories.length === 0 && (
                <span className="no-cat">Nenhuma outra categoria</span>
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