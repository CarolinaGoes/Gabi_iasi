import React, { useState } from "react";
import "../styles/adminDashboard.css";

// --- Interfaces ---
interface Artwork {
  id: number;
  title: string;
  price: string;
  category: string;
  status: "disponivel" | "vendido" | "sob-medida";
  dimensions: string;
  views: number;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("upload");

  // --- Estados de Categorias ---
  const [categories, setCategories] = useState(["Pinturas", "Desenhos", "Técnicas Mistas"]);
  const [newCategory, setNewCategory] = useState("");
  const [editingCatIndex, setEditingCatIndex] = useState<number | null>(null);
  const [editCatValue, setEditCatValue] = useState("");

  // --- Estados de Obras ---
  const [artworks, setArtworks] = useState<Artwork[]>([
    { id: 1, title: "Oceano Noturno", price: "R$ 1.200", category: "Pinturas", status: "disponivel", dimensions: "80x100cm", views: 452 },
    { id: 2, title: "Abstrato I", price: "R$ 900", category: "Desenhos", status: "vendido", dimensions: "50x50cm", views: 215 },
    { id: 3, title: "Reflexos", price: "R$ 1.500", category: "Pinturas", status: "disponivel", dimensions: "100x100cm", views: 890 },
  ]);

  // --- Métricas Gerais ---
  const totalSiteVisits = 12540;
  const totalSales = artworks.filter(art => art.status === "vendido").length;

  // --- Funções Lógicas de Categoria ---
  const addCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory("");
    }
  };

  const deleteCategory = (cat: string) => {
    if (window.confirm(`Excluir categoria "${cat}"?`)) {
      setCategories(categories.filter(c => c !== cat));
    }
  };

  // --- Funções Lógicas de Obra ---
  const deleteArtwork = (id: number) => {
    if (window.confirm("Remover esta obra definitivamente?")) {
      setArtworks(artworks.filter(art => art.id !== id));
    }
  };

  const updateArtworkStatus = (id: number, status: Artwork["status"]) => {
    setArtworks(artworks.map(art => art.id === id ? { ...art, status } : art));
  };

  return (
    <div className="admin-dashboard-wrapper">
    
      <main className="dashboard-content">
        <aside className="dashboard-sidebar">
          <h2>Painel Gabi Iasi</h2>
          <button className={activeTab === "upload" ? "active" : ""} onClick={() => setActiveTab("upload")}>Novo Quadro</button>
          <button className={activeTab === "inventory" ? "active" : ""} onClick={() => setActiveTab("inventory")}>Gerenciar Acervo</button>
          <button className={activeTab === "analytics" ? "active" : ""} onClick={() => setActiveTab("analytics")}>Estatísticas</button>
        </aside>

        <section className="dashboard-main-view">
          
          {/* 1. ABA: NOVO QUADRO */}
          {activeTab === "upload" && (
            <div className="upload-section">
              <h3>Cadastrar Nova Obra</h3>
              <form className="admin-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-row">
                  <div className="form-group flex-2"><label>Título</label><input type="text" placeholder="Nome da obra" /></div>
                  <div className="form-group flex-1"><label>Preço</label><input type="text" placeholder="R$ 0,00" /></div>
                </div>
                <div className="form-row">
                  <div className="form-group flex-1"><label>Medidas</label><input type="text" placeholder="Ex: 80x100cm" /></div>
                  <div className="form-group flex-1">
                    <label>Categoria</label>
                    <select className="simple-select">
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group"><label>Descrição</label><textarea rows={4} placeholder="Sobre a obra..."></textarea></div>
                <div className="form-group">
                  <label className="file-upload-label">
                    <span>Selecionar Foto</span>
                    <input type="file" hidden />
                  </label>
                </div>
                <button className="save-btn primary">Publicar Obra</button>
              </form>
            </div>
          )}

          {/* 2. ABA: GERENCIAR ACERVO */}
          {activeTab === "inventory" && (
            <div className="inventory-section">
              <div className="management-block">
                <h3>Gerenciar Categorias</h3>
                <div className="cat-manager-box">
                  <div className="add-cat-row">
                    <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Nova categoria..." />
                    <button onClick={addCategory} className="action-btn add">Adicionar</button>
                  </div>
                  <div className="cat-tags-container">
                    {categories.map((cat, idx) => (
                      <div key={idx} className="cat-editable-tag">
                        {editingCatIndex === idx ? (
                          <input 
                            value={editCatValue} 
                            onChange={(e) => setEditCatValue(e.target.value)}
                            onBlur={() => {
                              const newCats = [...categories];
                              newCats[idx] = editCatValue;
                              setCategories(newCats);
                              setEditingCatIndex(null);
                            }}
                            autoFocus
                          />
                        ) : (
                          <span onClick={() => { setEditingCatIndex(idx); setEditCatValue(cat); }}>{cat}</span>
                        )}
                        <button onClick={() => deleteCategory(cat)} className="cat-del">×</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="management-block" style={{marginTop: '30px'}}>
                <h3>Administrar Quadros</h3>
                <div className="inventory-grid">
                  {artworks.map(art => (
                    <div key={art.id} className="inventory-card">
                      <div className="art-details">
                        <strong>{art.title}</strong>
                        <span>{art.category} • {art.dimensions}</span>
                      </div>
                      <div className="art-management-actions">
                        <select 
                          value={art.status} 
                          onChange={(e) => updateArtworkStatus(art.id, e.target.value as any)}
                          className={`status-pill ${art.status}`}
                        >
                          <option value="disponivel">Disponível</option>
                          <option value="vendido">Vendido</option>
                          <option value="sob-medida">Sob Medida</option>
                        </select>
                        <button className="edit-btn">Editar</button>
                        <button onClick={() => deleteArtwork(art.id)} className="del-btn">Excluir</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. ABA: ESTATÍSTICAS */}
          {activeTab === "analytics" && (
            <div className="analytics-section">
              <h3>Performance do Site</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <span>Visitas Totais no Site</span>
                  <h4>{totalSiteVisits.toLocaleString()}</h4>
                </div>
                <div className="stat-card">
                  <span>Obras Vendidas</span>
                  <h4>{totalSales}</h4>
                </div>
              </div>

              <div className="visitor-table-container">
                <h5>Visualizações por Obra</h5>
                <table className="visitor-table">
                  <thead>
                    <tr>
                      <th>Obra</th>
                      <th>Categoria</th>
                      <th>Status</th>
                      <th style={{textAlign: 'right'}}>Total de Views</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...artworks].sort((a,b) => b.views - a.views).map((art) => (
                      <tr key={art.id}>
                        <td><strong>{art.title}</strong></td>
                        <td>{art.category}</td>
                        <td>
                          <span className={`status-tag ${art.status}`}>
                            {art.status === "disponivel" ? "Disponível" : art.status === "vendido" ? "Vendido" : "Sob Medida"}
                          </span>
                        </td>
                        <td style={{textAlign: 'right', fontWeight: 'bold', color: '#3498db'}}>
                          {art.views.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}