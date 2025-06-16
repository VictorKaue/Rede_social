import React, { useState } from 'react';
import { Box, Container, Card, Typography, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Certifique-se de que o AuthContext está implementado

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Função de login do AuthContext
  const [form, setForm] = useState({ email: '', senha: '' });
  const [erro, setErro] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Certifique-se de que os nomes das propriedades correspondem ao backend
      await login(form.email, form.senha);
      navigate('/home'); // Redireciona para a HomePage após o login
    } catch (err) {
      setErro('Credenciais inválidas. Tente novamente.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card sx={{ p: 4, boxShadow: 3 }}>
        <Typography variant="h4" gutterBottom>
          Entrar
        </Typography>
        {erro && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            {erro}
          </Typography>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <TextField
            label="Senha"
            name="senha"
            type="password"
            value={form.senha}
            onChange={handleChange}
            required
          />
          <Button type="submit" variant="contained" color="primary">
            Entrar
          </Button>
        </Box>
      </Card>
    </Container>
  );
}