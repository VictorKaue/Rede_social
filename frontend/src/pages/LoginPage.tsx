import React, { useState } from 'react';
import { Box, Container, Card, Typography, TextField, Button } from '@mui/material';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [erro, setErro] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('authToken', res.data.token);
      navigate('/HomePage');  
    } catch (err: any) {
      setErro(err.response?.data?.erro || 'Erro ao fazer login');
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