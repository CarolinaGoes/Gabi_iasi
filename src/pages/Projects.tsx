import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; 
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/projects.css";

interface Work {
  id: number;
  title: string;
  category: string;
  price: number;
  size: string;
  description: string;
  image: string;
  date: string;
  popularity: number;
}

const worksData: Work[] = [
  { id: 1, title: "Vibração Solar", category: "Pintura", price: 2100, size: "120x90cm", description: "Cores vibrantes...", image: "https://via.placeholder.com/400", date: "2024-01-15", popularity: 85 },
  { id: 2, title: "Abstração Azul", category: "Pintura", price: 1200, size: "100x80cm", description: "Nuances oceânicas...", image: "https://via.placeholder.com/400", date: "2024-02-10", popularity: 92 },
  { id: 3, title: "Linhas Urbanas", category: "Desenho", price: 450, size: "50x50cm", description: "Traços inspirados...", image: "https://via.placeholder.com/400", date: "2023-12-05", popularity: 78 },
  // Adicione mais itens aqui para testar a paginação
];

export default function Projects() {
  const navigate = useNavigate(); 
  
  // 1. Inicializa os estados tentando ler do sessionStorage para persistir ao voltar
  const [searchTerm, setSearchTerm] = useState(() => sessionStorage.getItem("art_searchTerm") || "");
  const [category, setCategory] = useState(() => sessionStorage.getItem("art_category") || "Todos");
  const [sortBy, setSortBy] = useState(() => sessionStorage.getItem("art_sortBy") || "recent");
  const [currentPage, setCurrentPage] = useState(() => Number(sessionStorage.getItem("art_page")) || 1);
  
  const itemsPerPage = 9;
  const isFirstRender = useRef(true);

  // 2. Salva as preferências no sessionStorage sempre que mudarem
  useEffect(() => {
    sessionStorage.setItem("art_searchTerm", searchTerm);
    sessionStorage.setItem("art_category", category);
    sessionStorage.setItem("art_sortBy", sortBy);
    sessionStorage.setItem("art_page", currentPage.toString());
  }, [searchTerm, category, sortBy, currentPage]);

  // 3. Resetar para a página 1 apenas quando o usuário alterar filtros manualmente
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
        if (sortBy === "popularity") return b.popularity - a.popularity;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [searchTerm, category, sortBy]);

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
                <option value="Pintura">Pintura</option>
                <option value="Desenho">Desenho</option>
              </select>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="recent">Mais Recentes</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
              </select>
            </div>
          </div>
        </div>

        <div className="projects-grid">
          {currentItems.map((work, index) => (
            <div key={`${work.id}-${index}`} className="project-card">
              <div className="card-image-container">
                <img src={work.image} alt={work.title} />
                <span className="card-badge">{work.category}</span>
              </div>
              <div className="card-info">
                <h3>{work.title}</h3>
                <p className="card-price">R$ {work.price}</p>
                <p className="card-size">{work.size}</p>
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
      </main>
      <Footer />
    </div>
  );
}