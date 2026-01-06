import { useState, useEffect, useRef } from "react";
import '../styles/carousel.css';

const imagensOriginais = [
  "/bk.png",
  "/bk2.jpg",
  "/foto-gabi.jpg",
];

export default function Carousel() {
  // Criamos uma lista com o primeiro item duplicado no final
  const imagens = [...imagensOriginais, imagensOriginais[0]];
  const [index, setIndex] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = () => {
    setTransitionEnabled(true);
    setIndex((prev) => prev + 1);
  };

  const prev = () => {
    setTransitionEnabled(true);
    setIndex((prev) => (prev === 0 ? imagensOriginais.length - 1 : prev - 1));
  };

  // Efeito para o Loop Infinito "Invisível"
  useEffect(() => {
    if (index === imagens.length - 1) {
      // Quando chegar no clone, espera a animação acabar (700ms)
      setTimeout(() => {
        setTransitionEnabled(false); // Desliga a animação
        setIndex(0); // Pula para o início real
      }, 700); 
    }
  }, [index, imagens.length]);

  // Temporizador Automático
  useEffect(() => {
    timeoutRef.current = setInterval(next, 2000);
    return () => {
      if (timeoutRef.current) clearInterval(timeoutRef.current);
    };
  }, [index]);

  return (
    <div className="carousel-wrapper">
      <button className="carousel-btn prev" onClick={prev}>‹</button>

      <div className="carousel">
        <div
          className="carousel-track"
          style={{ 
            transform: `translateX(-${index * 100}%)`,
            transition: transitionEnabled ? "transform 0.7s ease-in-out" : "none"
          }}
        >
          {imagens.map((img, i) => (
            <div className="carousel-item" key={i}>
              <div className="art-card">
                <img src={img} alt={`Obra ${i + 1}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="carousel-btn next" onClick={next}>›</button>
    </div>
  );
}