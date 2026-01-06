import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "../styles/adminLogin.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você adicionará a lógica de autenticação futuramente
    console.log("Login solicitado:", { email, password });
    
    // Exemplo: se (sucesso) navigate("/admin-dashboard")
  };

  return (
    <div className="admin-login-wrapper">
      <Header />
      
      <main className="login-main">
        <div className="login-card">
          <h1>Painel Administrativo</h1>
          <p>Entre com suas credenciais para gerenciar o site.</p>

          <form onSubmit={handleLogin} className="login-form">
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

            <button type="submit" className="login-button">
              Entrar
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}