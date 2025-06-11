# 🔗 Guia de Integração com Backend

Este documento lista todos os pontos do frontend onde existem **dados fantasmas (mock data)** que precisam ser substituídos por chamadas reais ao backend.

## 📋 Resumo Geral

Todos os dados fantasmas estão marcados com comentários `// TODO: BACKEND` no código. Use a busca global por "TODO: BACKEND" para encontrar todos os pontos que precisam de integração.

## 🏠 HomePage (`src/pages/HomePage.tsx`)

### Dados Mock a Substituir:
- **Timeline de Posts**: `mockPosts` (linhas ~25-65)
  - **Endpoint sugerido**: `GET /api/posts/timeline?limit=10&offset=0`
  - **Dados**: posts com likes, dislikes, comentários, scores

### Simulações a Remover:
- `setTimeout` para simular carregamento (linha ~67)

---

## 👤 ProfilePage (`src/pages/ProfilePage.tsx`)

### Dados Mock a Substituir:
- **Dados do Usuário**: `mockUser` (linhas ~67-78)
  - **Endpoint sugerido**: `GET /api/users/:userId/profile`
  - **Dados**: perfil completo, bio, localização, verificação
  
- **Posts do Usuário**: `mockPosts` (linhas ~80-110)
  - **Endpoint sugerido**: `GET /api/users/:userId/posts?limit=10&offset=0`
  - **Dados**: posts do usuário com estatísticas

- **Contadores do Perfil**: (linhas ~280-300)
  - Seguidores, seguindo, posts
  - **Endpoints sugeridos**: 
    - `GET /api/users/:userId/followers/count`
    - `GET /api/users/:userId/following/count`
    - `GET /api/users/:userId/posts/count`

### Simulações a Remover:
- `setTimeout` para simular carregamento (linha ~112)

---

## 🔍 ExplorePage (`src/pages/ExplorePage.tsx`)

### Dados Mock a Substituir:
- **Posts em Alta**: `mockTrendingPosts` (linhas ~60-85)
  - **Endpoint sugerido**: `GET /api/posts/trending?limit=10`
  
- **Usuários Sugeridos**: `mockSuggestedUsers` (linhas ~87-115)
  - **Endpoint sugerido**: `GET /api/users/suggested?limit=6`
  
- **Tags Populares**: `mockPopularTags` (linhas ~117-125)
  - **Endpoint sugerido**: `GET /api/tags/popular?limit=6`
  
- **Grupos Ativos**: `mockActiveGroups` (linhas ~127-150)
  - **Endpoint sugerido**: `GET /api/groups/active?limit=6`

### Simulações a Remover:
- `setTimeout` para simular carregamento (linha ~152)

---

## 👥 GroupsPage (`src/pages/GroupsPage.tsx`)

### Dados Mock a Substituir:
- **Todos os Grupos**: `mockAllGroups` (linhas ~55-80)
  - **Endpoint sugerido**: `GET /api/groups?limit=20&offset=0`
  
- **Grupos do Usuário**: `mockMyGroups` (linha ~82)
  - **Endpoint sugerido**: `GET /api/users/:userId/groups`
  
- **Grupos Populares**: `mockPopularGroups` (linha ~85)
  - **Endpoint sugerido**: `GET /api/groups/popular?limit=10`

### Funcionalidades a Implementar:
- **Criar Grupo**: `handleCreateGroup` (linhas ~95-110)
  - **Endpoint sugerido**: `POST /api/groups`
  - **Body**: `{ group_name: string, description: string }`

### Simulações a Remover:
- `setTimeout` para simular carregamento (linha ~87)

---

## 💬 MessagesPage (`src/pages/MessagesPage.tsx`)

### Dados Mock a Substituir:
- **Conversas**: `mockConversations` (linhas ~35-55)
  - **Endpoint sugerido**: `GET /api/users/:userId/conversations`
  
- **Mensagens**: `mockMessages` (linhas ~57-75)
  - **Endpoint sugerido**: `GET /api/conversations/:conversationId/messages?limit=50`

### Funcionalidades a Implementar:
- **Enviar Mensagem**: `handleSendMessage` (linhas ~85-100)
  - **Endpoint sugerido**: `POST /api/messages`
  - **Body**: `{ receiver_id: number, content: string }`

### Simulações a Remover:
- `setTimeout` para simular carregamento (linha ~77)

---

## 🧩 Componentes

### PostCard (`src/components/Posts/PostCard.tsx`)

#### Funcionalidades a Implementar:
- **Curtir Post**: `handleLike` (linhas ~25-35)
  - **Endpoints**: `POST /api/posts/:postId/like` ou `DELETE /api/posts/:postId/like`
  
- **Descurtir Post**: `handleDislike` (linhas ~37-47)
  - **Endpoints**: `POST /api/posts/:postId/dislike` ou `DELETE /api/posts/:postId/dislike`
  
- **Comentar**: `handleComment` (linhas ~49-52)
  - Navegar para página de comentários ou abrir modal
  
- **Compartilhar**: `handleShare` (linhas ~54-57)
  - Implementar compartilhamento interno/externo

### Navbar (`src/components/Layout/Navbar.tsx`)

#### Dados Mock a Substituir:
- **Usuário Atual**: `currentUser` (linhas ~15-18)
  - **Endpoint sugerido**: `GET /api/auth/me`
  
- **Contadores**: `notificationCount`, `messageCount` (linhas ~24-25)
  - **Endpoints sugeridos**:
    - `GET /api/notifications/unread/count`
    - `GET /api/messages/unread/count`

#### Funcionalidades a Implementar:
- **Busca**: `handleSearch` (linhas ~27-33)
  - **Endpoint sugerido**: `GET /api/search?q={query}&type=all`
  
- **Logout**: `handleLogout` (linhas ~45-50)
  - **Endpoint sugerido**: `POST /api/auth/logout`

### Sidebar (`src/components/Layout/Sidebar.tsx`)

#### Dados Mock a Substituir:
- **Contadores da Rede**: `networkStats` (linhas ~45-50)
  - **Endpoint sugerido**: `GET /api/stats/network`
  
- **Tags em Alta**: `trendingTags` (linhas ~52-58)
  - **Endpoint sugerido**: `GET /api/tags/trending?limit=5`
  
- **Usuários Sugeridos**: `suggestedUsers` (linhas ~60-64)
  - **Endpoint sugerido**: `GET /api/users/suggested?limit=3`

### TrendingSidebar (`src/components/Widgets/TrendingSidebar.tsx`)

#### Dados Mock a Substituir:
- **Tags em Alta**: `trendingTags` (linhas ~10-16)
  - **Endpoint sugerido**: `GET /api/tags/trending?limit=5`
  
- **Usuários Ativos**: `activeUsers` (linhas ~18-22)
  - **Endpoint sugerido**: `GET /api/users/active?limit=3`
  
- **Contadores**: `networkStats` (linhas ~24-28)
  - **Endpoint sugerido**: `GET /api/stats/network`

---

## 🔧 Próximos Passos para Integração

### 1. Configurar Cliente HTTP
```typescript
// src/services/api.ts
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

export default api;
```

### 2. Criar Serviços por Domínio
```typescript
// src/services/posts.ts
import api from './api';

export const postsService = {
  getTimeline: (limit = 10, offset = 0) => 
    api.get(`/posts/timeline?limit=${limit}&offset=${offset}`),
  
  getTrending: (limit = 10) => 
    api.get(`/posts/trending?limit=${limit}`),
  
  likePost: (postId: number) => 
    api.post(`/posts/${postId}/like`),
  
  unlikePost: (postId: number) => 
    api.delete(`/posts/${postId}/like`),
};
```

### 3. Implementar Context de Autenticação
```typescript
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### 4. Substituir Dados Mock Gradualmente
1. Comece pelos endpoints mais simples (estatísticas, listas)
2. Implemente autenticação e dados do usuário
3. Adicione funcionalidades de interação (likes, comentários)
4. Finalize com funcionalidades complexas (busca, mensagens)

### 5. Tratamento de Erros
```typescript
// src/hooks/useApi.ts
import { useState, useEffect } from 'react';

export const useApi = <T>(apiCall: () => Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await apiCall();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};
```

---

## ⚠️ Observações Importantes

1. **Todos os `setTimeout`** devem ser removidos após implementar as chamadas reais
2. **IDs hardcoded** (como `user_id: 1`) devem vir da autenticação
3. **Contadores e estatísticas** devem ser atualizados em tempo real
4. **Estados de loading** já estão implementados, apenas conecte com as APIs
5. **Tratamento de erros** deve ser adicionado em todas as chamadas
6. **Paginação** deve ser implementada para listas grandes
7. **Cache** pode ser implementado para melhorar performance

---

## 🎯 Checklist de Integração

- [ ] Configurar cliente HTTP (axios)
- [ ] Implementar serviços de API
- [ ] Criar context de autenticação
- [ ] Substituir dados mock da HomePage
- [ ] Substituir dados mock da ProfilePage
- [ ] Substituir dados mock da ExplorePage
- [ ] Substituir dados mock da GroupsPage
- [ ] Substituir dados mock da MessagesPage
- [ ] Implementar interações do PostCard
- [ ] Conectar Navbar com APIs
- [ ] Conectar Sidebar com APIs
- [ ] Conectar TrendingSidebar com APIs
- [ ] Adicionar tratamento de erros
- [ ] Implementar loading states
- [ ] Testar todas as funcionalidades
- [ ] Remover todos os `setTimeout`
- [ ] Remover todos os comentários `TODO: BACKEND`

---

**📝 Nota**: Este documento deve ser atualizado conforme a integração progride. Remova os itens concluídos e adicione novos desafios encontrados durante o desenvolvimento. 