import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Importado corretamente
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/projects.css";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy, doc } from "firebase/firestore";

interface Work {
  id: string;
  title: string;
  category: string;
  price: number;
  dimensions: string;
  description: string;
  image: string;
  date: string;
  popularity: number;
  status: string;
}

export default function Projects() {
  const navigate = useNavigate();
  const location = useLocation();

  const [worksData, setWorksData] = useState<Work[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState(() => sessionStorage.getItem("art_searchTerm") || "");
  const [category, setCategory] = useState(() => sessionStorage.getItem("art_category") || "Todos");
  const [sortBy, setSortBy] = useState(() => sessionStorage.getItem("art_sortBy") || "recent");
  const [currentPage, setCurrentPage] = useState(() => Number(sessionStorage.getItem("art_page")) || 1);

  const itemsPerPage = 9;
  const isFirstRender = useRef(true);

  // --- NOVO: Captura o filtro vindo do Header ---
  useEffect(() => {
    if (location.state && location.state.categoryFilter) {
      const filterFromNav = location.state.categoryFilter;
      setCategory(filterFromNav);
      // Limpa o state do histórico para não travar no filtro se a página for recarregada
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    const q = query(collection(db, "artworks"), orderBy("date", "desc"));
    const unsubWorks = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Work[];
      setWorksData(docs);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar obras:", error);
      setLoading(false);
    });

    const unsubCats = onSnapshot(doc(db, "settings", "categories"), (snapshot) => {
      if (snapshot.exists()) {
        setCategories(snapshot.data().list || []);
      }
    });

    return () => {
      unsubWorks();
      unsubCats();
    };
  }, []);

  useEffect(() => {
    sessionStorage.setItem("art_searchTerm", searchTerm);
    sessionStorage.setItem("art_category", category);
    sessionStorage.setItem("art_sortBy", sortBy);
    sessionStorage.setItem("art_page", currentPage.toString());
  }, [searchTerm, category, sortBy, currentPage]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setCurrentPage(1);
  }, [searchTerm, category]);

  const filteredWorks = useMemo(() => {
    return worksData
      .filter((work) => {
        const matchesSearch = work.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = category === "Todos" || work.category === category;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [worksData, searchTerm, category, sortBy]);

  const currentItems = filteredWorks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredWorks.length / itemsPerPage);

  return (
    <div className="projects-page-wrapper">
      <Header />
      <main className="projects-container">
        <div className="projects-header-section">
          <h1>Obras</h1>
          <div className="filters-bar">
            <input
              type="text"
              placeholder="Pesquisar obra..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <div className="select-group">
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Todos">Todas Categorias</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="recent">Mais Recentes</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Carregando acervo...</div>
        ) : (
          <>
            <div className="projects-grid">
              {currentItems.map((work) => (
                <div key={work.id} className="project-card">
                  <div className="card-image-container">
                    <img src={work.image} alt={work.title} />
                    <span className={`card-badge ${work.status}`}>{work.category}</span>
                    {work.status === "vendido" && <div className="sold-overlay">Vendido</div>}
                  </div>
                  <div className="card-info">
                    <h3>{work.title}</h3>
                    <div className="price-status-row">
                      <p className="card-price">
                        {work.price
                          ? `R$ ${Number(work.price).toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}`
                          : "Consulte valor"}
                      </p>
                      <span className={`status-tag ${work.status}`}>
                        {work.status === "disponivel" ? "Disponível" :
                          work.status === "vendido" ? "Vendido" : "Por Encomenda"}
                      </span>
                    </div>
                    <p className="card-size">{work.dimensions}</p>
                    <button
                      className="view-details-btn"
                      onClick={() => navigate(`/art/${work.id}`, { state: { work } })}
                    >
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>
                  Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={currentPage === i + 1 ? "active" : ""}
                  >
                    {i + 1}
                  </button>
                ))}
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>
                  Próximo
                </button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}