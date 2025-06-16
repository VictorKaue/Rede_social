import { Box, Container, Card, Typography, TextField, Button } from '@mui/material';
import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome_usuario: '',
    email: '',
    senha: '',
    data_nascimento: '',
  });
  const [erro, setErro] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', form);
      navigate('/login');
    } catch (err: any) {
      setErro(err.response?.data?.erro || 'Erro ao registrar usuário');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card sx={{ p: 4, boxShadow: 3 }}>
        <Typography variant="h4" gutterBottom>
          Criar conta
        </Typography>
        {erro && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            {erro}
          </Typography>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Usuário"
            name="nome_usuario"
            value={form.nome_usuario}
            onChange={handleChange}
            required
          />
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
          <TextField
            label="Data de nascimento"
            name="data_nascimento"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={form.data_nascimento}
            onChange={handleChange}
            required
          />
          <Button type="submit" variant="contained" color="primary">
            Cadastrar
          </Button>
        </Box>
      </Card>
    </Container>
  );
}