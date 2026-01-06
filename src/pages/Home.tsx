import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import Header from "../components/Header";
import Carousel from "../components/Carousel";
import Footer from "../components/Footer";
import "../styles/home.css";

interface HomeData {
  heroTitle: string;
  heroSubtitle: string;
  backgroundImage: string;
}

export default function Home() {
  const [homeData, setHomeData] = useState<HomeData>({
    heroTitle: "Gabi Iasi",
    heroSubtitle: "Bem-vindo ao meu site pessoal!",
    backgroundImage: ""
  });

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "home"));
        if (snap.exists()) {
          setHomeData(snap.data() as HomeData);
        }
      } catch (error) {
        console.error("Erro ao carregar dados da Home:", error);
      }
    };

    fetchHomeData();
  }, []);

  // Estilo dinâmico aplicado agora ao MAIN
  const mainStyle = {
    backgroundImage: homeData.backgroundImage 
      ? `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${homeData.backgroundImage})` 
      : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed', // Opcional: faz a imagem ficar parada enquanto rola
    minHeight: '100vh'
  };

  return (
    <div className="home">
      <Header />

      {/* Background aplicado aqui no main */}
      <main className="home-main" style={mainStyle}>
        
        <section className="hero-section">
          <div className="hero-content">
            <h1>{homeData.heroTitle}</h1>
            <p>{homeData.heroSubtitle}</p>
          </div>
        </section>

        <section className="carousel-section">
          <Carousel />

          <div className="veja-mais-wrapper">
            <Link to="/projects" className="veja-mais-btn">
              Veja mais
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}