import React, { useState, useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/projects.css";

// Interface para tipagem das obras
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

// Exemplo de dados (Simulando o que viria do banco ou admin)
const worksData: Work[] = [
  { id: 1, title: "Abstração Azul", category: "Pintura", price: 1200, size: "100x80cm", description: "Uma exploração das nuances oceânicas...", image: "https://via.placeholder.com/400", date: "2024-01-15", popularity: 85 },
  { id: 2, title: "Linhas Urbanas", category: "Desenho", price: 450, size: "50x50cm", description: "Traços inspirados na arquitetura paulista...", image: "https://via.placeholder.com/400", date: "2023-12-10", popularity: 92 },
  // Adicione mais itens para testar a paginação
];

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("Todos");
  const [sortBy, setSortBy] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Lógica de Filtro e Busca
  const filteredWorks = useMemo(() => {
    return worksData
      .filter((work) => {
        const matchesSearch = work.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              work.description.toLowerCase().includes(searchTerm.toLowerCase());
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

  // Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredWorks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredWorks.length / itemsPerPage);

  return (
    <div className="projects-page">
      <Header />
      
      <main className="projects-container">
        <header className="projects-header">
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
              <select onChange={(e) => setCategory(e.target.value)}>
                <option value="Todos">Todas Categorias</option>
                <option value="Pintura">Pintura</option>
                <option value="Desenho">Desenho</option>
                <option value="Escultura">Escultura</option>
              </select>

              <select onChange={(e) => setSortBy(e.target.value)}>
                <option value="recent">Mais Recentes</option>
                <option value="popularity">Popularidade</option>
                <option value="price-asc">Preço: Menor para Maior</option>
                <option value="price-desc">Preço: Maior para Menor</option>
              </select>
            </div>
          </div>
        </header>

        <div className="projects-grid">
          {currentItems.map((work) => (
            <div key={work.id} className="project-card">
              <div className="card-image">
                <img src={work.image} alt={work.title} />
                <span className="card-category">{work.category}</span>
              </div>
              <div className="card-content">
                <div className="card-header">
                  <h3>{work.title}</h3>
                  <span className="card-price">R$ {work.price}</span>
                </div>
                <p className="card-size">Medidas: {work.size}</p>
                <p className="card-description">
                  {work.description.substring(0, 80)}...
                </p>
                <button className="view-details-btn">Ver Detalhes</button>
              </div>
            </div>
          ))}
        </div>

        {/* Paginação */}
        <div className="pagination">
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(prev => prev - 1)}
          > Anterior </button>
          
          {Array.from({ length: totalPages }, (_, i) => (
            <button 
              key={i + 1} 
              onClick={() => setCurrentPage(i + 1)}
              className={currentPage === i + 1 ? "active" : ""}
            > {i + 1} </button>
          ))}

          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(prev => prev + 1)}
          > Próximo </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}