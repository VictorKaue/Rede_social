import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Endpoints de postagens
export const fetchPosts = () => api.get('/posts');
export const likePost = (postId: string) => api.post(`/posts/${postId}/like`);
export const dislikePost = (postId: string) => api.post(`/posts/${postId}/dislike`);
export const fetchComments = (postId: string) => api.get(`/posts/${postId}/comments`);
export const addComment = (postId: string, content: string) =>
  api.post(`/posts/${postId}/comments`, { content });

export default api;