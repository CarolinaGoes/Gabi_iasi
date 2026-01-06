import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase"; 
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import Header from "../components/Header";
import "../styles/adminLogin.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState(""); // Para mensagens de sucesso
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const allowedUsers = import.meta.env.VITE_ALLOWED_USERS?.split(",") || [];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

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
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        setError("E-mail ou senha incorretos.");
      } else {
        setError("Ocorreu um erro ao tentar entrar.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para recuperar a senha
  const handleForgotPassword = async () => {
    if (!email) {
      setError("Por favor, digite seu e-mail primeiro para redefinir a senha.");
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      setMessage("E-mail de redefinição enviado! Verifique sua caixa de entrada.");
      setError("");
    } catch (err: any) {
      setError("Erro ao enviar e-mail. Verifique se o endereço está correto.");
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
            {message && <div className="success-message">{message}</div>}

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
              <button 
                type="button" 
                className="forgot-password-link" 
                onClick={handleForgotPassword}
              >
                Esqueceu a senha?
              </button>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Processando..." : "Entrar"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}