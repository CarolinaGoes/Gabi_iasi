import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase"; 
import { signInWithEmailAndPassword } from "firebase/auth";
import Header from "../components/Header";
import "../styles/adminLogin.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 1. ATUALIZEI A LISTA COM O SEU E-MAIL REAL
  const allowedUsers = import.meta.env.VITE_ALLOWED_USERS?.split(",") || [];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 2. ADICIONEI .trim() PARA REMOVER ESPAÇOS ACIDENTAIS
    const formattedEmail = email.toLowerCase().trim();

    if (!allowedUsers.includes(formattedEmail)) {
      setError("Acesso negado. Este usuário não tem permissão.");
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, formattedEmail, password);
      navigate("/admindashboard");
    } catch (err: any) {
      console.error("Erro Firebase:", err.code);
      // Tratamento de erro mais amigável
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        setError("E-mail ou senha incorretos.");
      } else {
        setError("Ocorreu um erro ao tentar entrar. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <Header />
      <main className="login-main">
        <div className="login-card">
          <h1>Painel Administrativo</h1>
          <p>Entre com suas credenciais para gerenciar o site.</p>

          <form onSubmit={handleLogin} className="login-form">
            {error && <div className="error-message">{error}</div>}

            <div className="input-group">
              <label>E-mail</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="seu@email.com"
                required 
              />
            </div>

            <div className="input-group">
              <label>Senha</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
                required 
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Autenticando..." : "Entrar"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}