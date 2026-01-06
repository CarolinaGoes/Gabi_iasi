import React from "react";
import { Link } from "react-router-dom"; // Importação necessária para navegação
import Header from "../components/Header";
import Carousel from "../components/Carousel";
import Footer from "../components/Footer";
import Projects from "./Projects";
import "../styles/home.css";

export default function Home() {
  return (
    <div className="home">
      <Header />

      <main className="home-main">
        <section className="hero-section">
          <h1>Gabi Iasi</h1>
          <p>
            Bem-vindo ao meu site pessoal! Aqui você encontrará informações sobre
            mim, meus projetos e interesses.
          </p>
        </section>

        <section className="carousel-section">
          <Carousel />

          <div className="veja-mais-wrapper">
            {/* O botão agora é um Link que aponta para /projects */}
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