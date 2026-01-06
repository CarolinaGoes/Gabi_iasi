import { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import '../styles/carousel.css';

export default function Carousel() {
  const [artImages, setArtImages] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 1. BUSCAR IMAGENS DO FIREBASE
  useEffect(() => {
    // Buscamos as últimas 5 obras publicadas para o carrossel
    const q = query(
      collection(db, "artworks"),
      orderBy("date", "desc"),
      limit(6)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const images = snapshot.docs
        .map(doc => doc.data().image)
        .filter(img => img); // Remove qualquer valor vazio por segurança

      setArtImages(images);
    });

    return () => unsub();
  }, []);

  // Criamos a lista para o loop infinito (original + primeiro item no final)
  const displayImages = artImages.length > 0 ? [...artImages, artImages[0]] : [];

  const next = () => {
    if (displayImages.length <= 1) return;
    setTransitionEnabled(true);
    setIndex((prev) => prev + 1);
  };

  const prev = () => {
    if (displayImages.length <= 1) return;
    setTransitionEnabled(true);
    setIndex((prev) => (prev === 0 ? artImages.length - 1 : prev - 1));
  };

  // Efeito para o Loop Infinito "Invisível"
  useEffect(() => {
    if (index === displayImages.length - 1 && displayImages.length > 1) {
      setTimeout(() => {
        setTransitionEnabled(false);
        setIndex(0);
      }, 700);
    }
  }, [index, displayImages.length]);

  // Temporizador Automático
  useEffect(() => {
    if (displayImages.length <= 1) return;
    timeoutRef.current = setInterval(next, 4000); // Aumentei para 4s para melhor visualização
    return () => {
      if (timeoutRef.current) clearInterval(timeoutRef.current);
    };
  }, [index, displayImages.length]);

  // Se não houver imagens ainda, exibe um carregamento ou nada
  if (artImages.length === 0) {
    return <div className="carousel-placeholder">Carregando galeria...</div>;
  }

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
          {displayImages.map((img, i) => (
            <div className="carousel-item" key={i}>
              <img src={img} alt="Obra de Arte" />
            </div>
          ))}{displayImages.map((img, i) => (
            <div className="carousel-item" key={i}>
              <div className="art-card-carousel">
                <img src={img} alt="Obra de Arte" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="carousel-btn next" onClick={next}>›</button>
    </div>
  );
}