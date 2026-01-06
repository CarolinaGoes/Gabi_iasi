import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/art.css";

export default function Art() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const work = location.state?.work;

  if (!work) {
    return (
      <div className="art-error-wrapper">
        <Header />
        <div className="error-content">
          <h2>Obra não encontrada</h2>
          <button onClick={() => navigate("/projects")}>Voltar para Galeria</button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleInterest = () => {
    const message = encodeURIComponent(`Olá! Tenho interesse na obra "${work.title}" (ID: ${work.id}).`);
    window.open(`https://wa.me/SEUNUMERO?text=${message}`, "_blank");
  };

  const handleCustomRequest = () => {
    navigate("/contacts", { state: { subject: `Solicitação sob medida: ${work.title}` } });
  };

  return (
    <div className="art-page-wrapper">
      <Header />
      
      <main className="art-container">
        {/* O navigate(-1) volta para a URL anterior mantendo a posição do histórico */}
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Voltar
        </button>

        <div className="art-content-grid">
          <div className="art-image-section">
            <div className="image-frame">
              <img src={work.image} alt={work.title} />
            </div>
          </div>

          <div className="art-details-section">
            <span className="art-category">{work.category}</span>
            <h1 className="art-title">{work.title}</h1>
            <p className="art-price">R$ {work.price.toLocaleString('pt-BR')}</p>
            
            <div className="art-info-specs">
              <div className="spec-item">
                <strong>Dimensões:</strong> <span>{work.size}</span>
              </div>
              <div className="spec-item">
                <strong>Data de Criação:</strong> <span>{new Date(work.date).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>

            <div className="art-description">
              <h3>Sobre a obra</h3>
              <p>{work.description}</p>
            </div>

            <div className="art-actions">
              <button className="btn-interest" onClick={handleInterest}>
                Tenho Interesse
              </button>
              <button className="btn-custom" onClick={handleCustomRequest}>
                Solicitar Sob Medida
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}