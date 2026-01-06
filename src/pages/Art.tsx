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

  const WHATSAPP_NUMBER = "5511913297566";
  const currentUrl = window.location.href;

  const handleInterest = () => {
    const message = encodeURIComponent(
      `Olá Gabi! Tenho interesse na obra "${work.title}". Gostaria de saber mais informações.\n\nLink da obra: ${currentUrl}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  const handleCustomRequest = () => {
    const message = encodeURIComponent(
      `Olá Gabi! Vi esta obra no seu site e gostaria de solicitar um orçamento para algo semelhante (sob encomenda).\n\nObra de referência: ${currentUrl}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  return (
    <div className="art-page-wrapper">
      <Header />

      <main className="art-container">
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

            <p className="art-price">
              {work.status === "vendido"
                ? "Obra Vendida"
                : `R$ ${Number(work.price).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}`}
            </p>

            <div className="art-info-specs">
              <div className="spec-item">
                <strong>Dimensões:</strong> <span>{work.dimensions || "Não informada"}</span>
              </div>

              <div className="spec-item">
                <strong>Status:</strong>
                <span className={`status-tag ${work.status}`}>
                  {work.status === "disponivel" ? "Disponível" :
                    work.status === "vendido" ? "Vendido" : "Por Encomenda"}
                </span>
              </div>
            </div>

            <div className="art-description">
              <h3>Sobre a obra</h3>
              <p>{work.description || "Sem descrição disponível."}</p>
            </div>

            <div className="art-actions">
              {/* O Botão "Tenho Interesse" agora é EXCLUSIVO para itens com status disponível */}
              {work.status === "disponivel" && (
                <button
                  className="btn-interest"
                  onClick={handleInterest}
                >
                  Tenho Interesse
                </button>
              )}

              <button className="btn-custom" onClick={handleCustomRequest}>
                Solicitar Algo Semelhante
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}