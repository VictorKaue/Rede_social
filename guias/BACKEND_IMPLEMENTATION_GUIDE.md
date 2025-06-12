# 🚀 Guia de Implementação do Backend - Rede Social JPProject

## 📋 Visão Geral

Este documento fornece um **roadmap completo** para implementação do backend da rede social, baseado nos comentários TODO detalhados encontrados em todo o código frontend. O backend deve ser implementado em **Node.js + Express** com **PostgreSQL/MySQL** e **Redis** para cache.

## 🏗️ Estrutura do Projeto Backend

```
backend/
├── package.json                 # Dependências e scripts
├── .env.example                 # Variáveis de ambiente
├── .gitignore                   # Arquivos ignorados
├── README.md                    # Documentação específica do backend
├── src/
│   ├── app.js                   # Configuração principal do Express
│   ├── server.js                # Inicialização do servidor
│   ├── config/
│   │   ├── database.js          # Configuração PostgreSQL/MySQL
│   │   ├── redis.js             # Configuração Redis
│   │   └── auth.js              # Configuração JWT
│   ├── models/                  # Modelos de dados (Sequelize/Prisma)
│   │   ├── User.js              
│   │   ├── Post.js              
│   │   ├── Comment.js           
│   │   ├── Rating.js            
│   │   ├── Group.js             
│   │   ├── GroupMember.js       
│   │   ├── Message.js           
│   │   ├── Tag.js               
│   │   ├── UserTag.js           
│   │   └── Connection.js        
│   ├── controllers/             # Lógica de negócio
│   │   ├── authController.js    
│   │   ├── userController.js    
│   │   ├── postController.js    
│   │   ├── commentController.js 
│   │   ├── ratingController.js  
│   │   ├── groupController.js   
│   │   ├── messageController.js 
│   │   ├── tagController.js     
│   │   ├── connectionController.js
│   │   └── notificationController.js
│   ├── routes/                  # Definição de rotas
│   │   ├── auth.js              
│   │   ├── users.js             
│   │   ├── posts.js             
│   │   ├── comments.js          
│   │   ├── groups.js            
│   │   ├── messages.js          
│   │   ├── tags.js              
│   │   ├── connections.js       
│   │   └── notifications.js     
│   ├── middleware/              # Middleware customizado
│   │   ├── auth.js              # Verificação JWT
│   │   ├── validation.js        # Validação de dados
│   │   ├── rateLimit.js         # Rate limiting
│   │   ├── upload.js            # Upload de arquivos
│   │   └── errorHandler.js      # Tratamento de erros
│   ├── services/                # Lógica de negócio complexa
│   │   ├── emailService.js      # Envio de emails
│   │   ├── uploadService.js     # Upload para cloud
│   │   ├── notificationService.js # Sistema de notificações
│   │   └── cacheService.js      # Operações de cache
│   ├── utils/                   # Utilitários
│   │   ├── validators.js        # Funções de validação
│   │   ├── helpers.js           # Funções auxiliares
│   │   └── constants.js         # Constantes da aplicação
│   └── websocket/               # WebSocket para tempo real
│       ├── socketHandlers.js    # Handlers dos eventos
│       └── socketAuth.js        # Autenticação WebSocket
└── tests/                       # Testes automatizados
    ├── unit/                    
    ├── integration/             
    └── e2e/                     
```

## 📦 Dependências Principais

### **package.json**
```json
{
  "name": "rede-social-backend",
  "version": "1.0.0",
  "description": "Backend da Rede Social JPProject",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest",
    "migrate": "sequelize-cli db:migrate",
    "seed": "sequelize-cli db:seed:all"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sequelize": "^6.33.0",
    "pg": "^8.11.3",
    "redis": "^4.6.8",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "joi": "^17.9.2",
    "multer": "^1.4.5-lts.1",
    "cloudinary": "^1.40.0",
    "nodemailer": "^6.9.4",
    "socket.io": "^4.7.2",
    "helmet": "^7.0.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^6.10.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.4",
    "supertest": "^6.3.3",
    "sequelize-cli": "^6.6.1"
  }
}
```

## 🔐 Sistema de Autenticação

### **Rotas de Autenticação**
```javascript
// routes/auth.js

const express = require('express');
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validation');
const rateLimit = require('../middleware/rateLimit');

const router = express.Router();

// Registro de novo usuário
router.post('/register', 
  rateLimit.strict, // Limite rigoroso para registro
  validateRegister,
  authController.register
);

// Login com email/senha
router.post('/login',
  rateLimit.auth, // Rate limit para tentativas de login
  validateLogin,
  authController.login
);

// Logout (invalidar token)
router.post('/logout',
  authController.logout
);

// Refresh token
router.post('/refresh',
  authController.refreshToken
);

// Dados do usuário autenticado
router.get('/me',
  authController.getCurrentUser
);

module.exports = router;
```

### **Controller de Autenticação**
```javascript
// controllers/authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { ApiResponse } = require('../utils/responses');

class AuthController {
  // Registro de novo usuário
  async register(req, res) {
    try {
      const { username, email, password, birth_date } = req.body;

      // Verificar se usuário já existe
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ email }, { username }]
        }
      });

      if (existingUser) {
        return res.status(400).json(
          ApiResponse.error('Email ou username já existe')
        );
      }

      // Validar idade mínima (13 anos)
      const birthDate = new Date(birth_date);
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 13);
      
      if (birthDate > minDate) {
        return res.status(400).json(
          ApiResponse.error('Idade mínima de 13 anos')
        );
      }

      // Hash da senha
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Criar usuário
      const user = await User.create({
        username,
        email,
        password_hash: passwordHash,
        birth_date: birthDate
      });

      // Gerar JWT token
      const token = jwt.sign(
        { user_id: user.user_id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Remover senha da resposta
      const { password_hash, ...userResponse } = user.toJSON();

      res.status(201).json(
        ApiResponse.success({
          user: userResponse,
          token
        }, 'Usuário criado com sucesso')
      );

    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json(
        ApiResponse.error('Erro interno do servidor')
      );
    }
  }

  // Login do usuário
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Buscar usuário por email
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        return res.status(401).json(
          ApiResponse.error('Credenciais inválidas')
        );
      }

      // Verificar senha
      const validPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!validPassword) {
        return res.status(401).json(
          ApiResponse.error('Credenciais inválidas')
        );
      }

      // Gerar JWT token
      const token = jwt.sign(
        { user_id: user.user_id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Remover senha da resposta
      const { password_hash, ...userResponse } = user.toJSON();

      res.json(
        ApiResponse.success({
          user: userResponse,
          token
        }, 'Login realizado com sucesso')
      );

    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json(
        ApiResponse.error('Erro interno do servidor')
      );
    }
  }

  // Logout (adicionar token à blacklist)
  async logout(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (token) {
        // Adicionar token à blacklist no Redis
        await redis.setex(`blacklist_${token}`, 86400, 'true'); // 24h
      }

      res.json(
        ApiResponse.success(null, 'Logout realizado com sucesso')
      );

    } catch (error) {
      console.error('Erro no logout:', error);
      res.status(500).json(
        ApiResponse.error('Erro interno do servidor')
      );
    }
  }

  // Obter dados do usuário autenticado
  async getCurrentUser(req, res) {
    try {
      const user = await User.findByPk(req.user.user_id, {
        attributes: { exclude: ['password_hash'] }
      });

      if (!user) {
        return res.status(404).json(
          ApiResponse.error('Usuário não encontrado')
        );
      }

      res.json(
        ApiResponse.success(user)
      );

    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json(
        ApiResponse.error('Erro interno do servidor')
      );
    }
  }
}

module.exports = new AuthController();
```

## 👤 API de Usuários

### **Rotas de Usuários**
```javascript
// routes/users.js

const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const { validateProfileUpdate } = require('../middleware/validation');
const upload = require('../middleware/upload');

const router = express.Router();

// Buscar perfil de usuário
router.get('/:userId/profile', userController.getUserProfile);

// Atualizar perfil (apenas próprio usuário)
router.put('/:userId/profile',
  auth,
  upload.single('profile_photo'),
  validateProfileUpdate,
  userController.updateProfile
);

// Estatísticas de seguidores/seguindo
router.get('/:userId/follow-stats', userController.getFollowStats);

// Gerar link de compartilhamento
router.get('/:userId/share-link', userController.generateShareLink);

// Buscar usuários
router.get('/search', userController.searchUsers);

module.exports = router;
```

### **Controller de Usuários**
```javascript
// controllers/userController.js

const { User, UserTag, Tag } = require('../models');
const { uploadToCloudinary } = require('../services/uploadService');
const cacheService = require('../services/cacheService');

class UserController {
  // Buscar perfil completo do usuário
  async getUserProfile(req, res) {
    try {
      const { userId } = req.params;

      // Verificar cache primeiro
      const cached = await cacheService.get(`user_profile:${userId}`);
      if (cached) {
        return res.json(ApiResponse.success(cached));
      }

      // Buscar usuário com estatísticas
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password_hash'] },
        include: [
          {
            model: UserTag,
            include: [{ model: Tag }]
          }
        ]
      });

      if (!user) {
        return res.status(404).json(
          ApiResponse.error('Usuário não encontrado')
        );
      }

      // Calcular estatísticas
      const stats = await this.calculateUserStats(userId);
      
      const userProfile = {
        ...user.toJSON(),
        ...stats
      };

      // Cache por 5 minutos
      await cacheService.set(`user_profile:${userId}`, userProfile, 300);

      res.json(ApiResponse.success(userProfile));

    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      res.status(500).json(
        ApiResponse.error('Erro interno do servidor')
      );
    }
  }

  // Atualizar perfil do usuário
  async updateProfile(req, res) {
    try {
      const { userId } = req.params;
      const updateData = req.body;

      // Verificar se é o próprio usuário
      if (req.user.user_id !== parseInt(userId)) {
        return res.status(403).json(
          ApiResponse.error('Não autorizado')
        );
      }

      // Upload de nova foto se fornecida
      if (req.file) {
        const uploadResult = await uploadToCloudinary(req.file);
        updateData.profile_photo = uploadResult.secure_url;
      }

      // Validar unicidade de username/email se alterados
      if (updateData.username || updateData.email) {
        const existing = await User.findOne({
          where: {
            [Op.or]: [
              ...(updateData.username ? [{ username: updateData.username }] : []),
              ...(updateData.email ? [{ email: updateData.email }] : [])
            ],
            user_id: { [Op.ne]: userId }
          }
        });

        if (existing) {
          return res.status(400).json(
            ApiResponse.error('Username ou email já existe')
          );
        }
      }

      // Atualizar usuário
      await User.update(updateData, {
        where: { user_id: userId }
      });

      // Buscar usuário atualizado
      const updatedUser = await User.findByPk(userId, {
        attributes: { exclude: ['password_hash'] }
      });

      // Limpar cache
      await cacheService.del(`user_profile:${userId}`);

      res.json(
        ApiResponse.success(updatedUser, 'Perfil atualizado com sucesso')
      );

    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json(
        ApiResponse.error('Erro interno do servidor')
      );
    }
  }

  // Calcular estatísticas do usuário
  async calculateUserStats(userId) {
    const [postCount, commentCount, followerCount, followingCount] = await Promise.all([
      Post.count({ where: { user_id: userId } }),
      Comment.count({ where: { user_id: userId } }),
      Connection.count({ where: { connected_user_id: userId, status: 'accepted' } }),
      Connection.count({ where: { user_id: userId, status: 'accepted' } })
    ]);

    return {
      post_count: postCount,
      comment_count: commentCount,
      follower_count: followerCount,
      following_count: followingCount
    };
  }
}

module.exports = new UserController();
```

## 📝 API de Postagens

### **Rotas de Postagens**
```javascript
// routes/posts.js

const express = require('express');
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validatePost } = require('../middleware/validation');

const router = express.Router();

// Feed de postagens com paginação
router.get('/', postController.getFeed);

// Criar nova postagem
router.post('/',
  auth,
  upload.single('image'),
  validatePost,
  postController.createPost
);

// Buscar postagem específica
router.get('/:postId', postController.getPost);

// Atualizar postagem (apenas autor)
router.put('/:postId',
  auth,
  postController.updatePost
);

// Deletar postagem (apenas autor)
router.delete('/:postId',
  auth,
  postController.deletePost
);

module.exports = router;
```

## 💬 API de Comentários

### **Rotas de Comentários**
```javascript
// routes/comments.js

const express = require('express');
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');
const { validateComment } = require('../middleware/validation');

const router = express.Router();

// Buscar comentários de um post (hierárquicos)
router.get('/post/:postId', commentController.getPostComments);

// Criar comentário
router.post('/',
  auth,
  validateComment,
  commentController.createComment
);

// Responder a um comentário
router.post('/:commentId/reply',
  auth,
  validateComment,
  commentController.replyToComment
);

// Editar comentário (apenas autor)
router.put('/:commentId',
  auth,
  commentController.updateComment
);

// Deletar comentário (apenas autor)
router.delete('/:commentId',
  auth,
  commentController.deleteComment
);

module.exports = router;
```

## ❤️ API de Avaliações (Likes/Dislikes)

### **Rotas de Avaliações**
```javascript
// routes/ratings.js

const express = require('express');
const ratingController = require('../controllers/ratingController');
const auth = require('../middleware/auth');

const router = express.Router();

// Avaliar postagem
router.post('/post/:postId',
  auth,
  ratingController.ratePost
);

// Avaliar comentário
router.post('/comment/:commentId',
  auth,
  ratingController.rateComment
);

// Remover avaliação
router.delete('/:ratingId',
  auth,
  ratingController.removeRating
);

module.exports = router;
```

## 👥 API de Conexões

### **Rotas de Conexões**
```javascript
// routes/connections.js

const express = require('express');
const connectionController = require('../controllers/connectionController');
const auth = require('../middleware/auth');

const router = express.Router();

// Seguir usuário
router.post('/follow',
  auth,
  connectionController.followUser
);

// Parar de seguir
router.delete('/follow/:targetUserId',
  auth,
  connectionController.unfollowUser
);

// Verificar se está seguindo
router.get('/is-following/:targetUserId',
  auth,
  connectionController.isFollowing
);

// Listar seguidores
router.get('/:userId/followers',
  connectionController.getFollowers
);

// Listar seguindo
router.get('/:userId/following',
  connectionController.getFollowing
);

module.exports = router;
```

## 💌 API de Mensagens

### **Rotas de Mensagens**
```javascript
// routes/messages.js

const express = require('express');
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');
const { validateMessage } = require('../middleware/validation');

const router = express.Router();

// Listar conversas do usuário
router.get('/conversations',
  auth,
  messageController.getConversations
);

// Mensagens de uma conversa específica
router.get('/conversation/:otherUserId',
  auth,
  messageController.getConversationMessages
);

// Enviar mensagem
router.post('/',
  auth,
  validateMessage,
  messageController.sendMessage
);

// Marcar mensagem como lida
router.put('/:messageId/read',
  auth,
  messageController.markAsRead
);

// Contagem de mensagens não lidas
router.get('/unread/count',
  auth,
  messageController.getUnreadCount
);

module.exports = router;
```

## 🔔 Sistema de Notificações

### **API de Notificações**
```javascript
// routes/notifications.js

const express = require('express');
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

const router = express.Router();

// Listar notificações do usuário
router.get('/',
  auth,
  notificationController.getNotifications
);

// Marcar notificação como lida
router.put('/:notificationId/read',
  auth,
  notificationController.markAsRead
);

// Marcar todas como lidas
router.put('/mark-all-read',
  auth,
  notificationController.markAllAsRead
);

// Contagem de não lidas
router.get('/unread/count',
  auth,
  notificationController.getUnreadCount
);

// Deletar notificação
router.delete('/:notificationId',
  auth,
  notificationController.deleteNotification
);

module.exports = router;
```

## 🌐 WebSocket para Tempo Real

### **Configuração WebSocket**
```javascript
// websocket/socketHandlers.js

const jwt = require('jsonwebtoken');
const { Message, Notification } = require('../models');

class SocketHandlers {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map(); // userId -> socketId
  }

  // Autenticar conexão WebSocket
  authenticateSocket(socket, next) {
    const token = socket.handshake.auth.token;
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.user_id;
      socket.username = decoded.username;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  }

  // Gerenciar conexões
  handleConnection(socket) {
    console.log(`User ${socket.username} connected`);
    
    // Armazenar conexão do usuário
    this.connectedUsers.set(socket.userId, socket.id);

    // Entrar em sala pessoal para notificações
    socket.join(`user_${socket.userId}`);

    // Handlers de eventos
    socket.on('send_message', (data) => this.handleSendMessage(socket, data));
    socket.on('message_read', (data) => this.handleMessageRead(socket, data));
    socket.on('typing', (data) => this.handleTyping(socket, data));
    
    socket.on('disconnect', () => {
      console.log(`User ${socket.username} disconnected`);
      this.connectedUsers.delete(socket.userId);
    });
  }

  // Enviar mensagem em tempo real
  async handleSendMessage(socket, data) {
    try {
      const { receiver_id, content } = data;

      // Criar mensagem no banco
      const message = await Message.create({
        sender_id: socket.userId,
        receiver_id,
        content,
        status: 'sent'
      });

      // Enviar para o destinatário se online
      const receiverSocketId = this.connectedUsers.get(receiver_id);
      if (receiverSocketId) {
        this.io.to(receiverSocketId).emit('new_message', {
          message_id: message.message_id,
          sender_id: socket.userId,
          sender_username: socket.username,
          content,
          sent_at: message.sent_at
        });

        // Atualizar status para 'received'
        await message.update({ status: 'received', received_at: new Date() });
      }

      // Confirmar envio para o remetente
      socket.emit('message_sent', {
        temp_id: data.temp_id, // ID temporário do frontend
        message_id: message.message_id,
        status: receiverSocketId ? 'received' : 'sent'
      });

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      socket.emit('message_error', { error: 'Erro ao enviar mensagem' });
    }
  }

  // Marcar mensagem como lida
  async handleMessageRead(socket, data) {
    try {
      const { message_id } = data;

      await Message.update(
        { status: 'read', read_at: new Date() },
        { where: { message_id, receiver_id: socket.userId } }
      );

      // Notificar remetente sobre leitura
      const message = await Message.findByPk(message_id);
      const senderSocketId = this.connectedUsers.get(message.sender_id);
      
      if (senderSocketId) {
        this.io.to(senderSocketId).emit('message_read', { message_id });
      }

    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', error);
    }
  }

  // Indicador de digitação
  handleTyping(socket, data) {
    const { receiver_id, typing } = data;
    const receiverSocketId = this.connectedUsers.get(receiver_id);
    
    if (receiverSocketId) {
      this.io.to(receiverSocketId).emit('user_typing', {
        user_id: socket.userId,
        username: socket.username,
        typing
      });
    }
  }

  // Enviar notificação para usuário
  async sendNotificationToUser(userId, notification) {
    this.io.to(`user_${userId}`).emit('new_notification', notification);
  }
}

module.exports = SocketHandlers;
```

## 🛡️ Middleware de Segurança

### **Middleware de Autenticação**
```javascript
// middleware/auth.js

const jwt = require('jsonwebtoken');
const redis = require('../config/redis');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token de acesso requerido'
      });
    }

    // Verificar se token está na blacklist
    const isBlacklisted = await redis.get(`blacklist_${token}`);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
    }

    // Verificar e decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar se usuário ainda existe
    const user = await User.findByPk(decoded.user_id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    req.user = {
      user_id: decoded.user_id,
      username: decoded.username
    };
    
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado'
      });
    }

    console.error('Erro na autenticação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

module.exports = authMiddleware;
```

### **Rate Limiting**
```javascript
// middleware/rateLimit.js

const rateLimit = require('express-rate-limit');

// Rate limit rigoroso para registro e ações sensíveis
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas por IP
  message: {
    success: false,
    error: 'Muitas tentativas. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limit para autenticação
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 tentativas por IP
  message: {
    success: false,
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  }
});

// Rate limit geral para APIs
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // 100 requests por minuto
  message: {
    success: false,
    error: 'Limite de requisições excedido. Tente novamente em 1 minuto.'
  }
});

// Rate limit para busca
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // 30 buscas por minuto
  message: {
    success: false,
    error: 'Limite de buscas excedido. Tente novamente em 1 minuto.'
  }
});

module.exports = {
  strict: strictLimiter,
  auth: authLimiter,
  general: generalLimiter,
  search: searchLimiter
};
```

## 📤 Upload de Arquivos

### **Middleware de Upload**
```javascript
// middleware/upload.js

const multer = require('multer');
const path = require('path');

// Configuração do multer para upload em memória
const storage = multer.memoryStorage();

// Filtro de tipos de arquivo
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido'), false);
  }
};

// Configuração do upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
    files: 1 // Apenas 1 arquivo por vez
  }
});

module.exports = upload;
```

### **Serviço de Upload**
```javascript
// services/uploadService.js

const cloudinary = require('cloudinary').v2;

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

class UploadService {
  // Upload de imagem para Cloudinary
  async uploadToCloudinary(file, folder = 'rede-social') {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto' },
            { format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(file.buffer);
    });
  }

  // Upload de foto de perfil (redimensionamento específico)
  async uploadProfilePhoto(file) {
    return this.uploadToCloudinary(file, 'rede-social/profiles');
  }

  // Upload de imagem de post
  async uploadPostImage(file) {
    return this.uploadToCloudinary(file, 'rede-social/posts');
  }

  // Deletar imagem do Cloudinary
  async deleteFromCloudinary(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      throw error;
    }
  }
}

module.exports = new UploadService();
```

## 🔧 Configuração e Inicialização

### **Configuração Principal**
```javascript
// src/app.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Importar rotas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications');

// Middleware global
const errorHandler = require('./middleware/errorHandler');
const rateLimit = require('./middleware/rateLimit');

const app = express();

// Middleware de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting geral
app.use(rateLimit.general);

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined'));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API está funcionando',
    timestamp: new Date().toISOString()
  });
});

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

module.exports = app;
```

### **Inicialização do Servidor**
```javascript
// src/server.js

const app = require('./app');
const http = require('http');
const socketIo = require('socket.io');
const SocketHandlers = require('./websocket/socketHandlers');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;

// Criar servidor HTTP
const server = http.createServer(app);

// Configurar Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Configurar handlers WebSocket
const socketHandlers = new SocketHandlers(io);

// Middleware de autenticação WebSocket
io.use((socket, next) => {
  socketHandlers.authenticateSocket(socket, next);
});

// Handler de conexão
io.on('connection', (socket) => {
  socketHandlers.handleConnection(socket);
});

// Sincronizar banco de dados e iniciar servidor
const startServer = async () => {
  try {
    // Testar conexão com banco
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida');

    // Sincronizar modelos (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Modelos sincronizados com o banco');
    }

    // Iniciar servidor
    server.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📖 Documentação: http://localhost:${PORT}/api-docs`);
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Iniciar servidor
startServer();
```

## 🔧 Variáveis de Ambiente

### **.env.example**
```env
# Configuração do servidor
NODE_ENV=development
PORT=5000

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Banco de dados PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rede_social_db
DB_USER=postgres
DB_PASS=sua_senha_aqui

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=sua_chave_jwt_super_secreta_aqui
JWT_EXPIRES_IN=24h

# Cloudinary (upload de imagens)
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=sua_api_secret

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_app
```

## 📋 Checklist de Implementação

### **Fase 1: Configuração Base (1-2 dias)**
- [ ] Configurar projeto Node.js + Express
- [ ] Configurar PostgreSQL/MySQL
- [ ] Configurar Redis
- [ ] Implementar estrutura de pastas
- [ ] Configurar variáveis de ambiente
- [ ] Implementar middleware básico

### **Fase 2: Autenticação (2-3 dias)**
- [ ] Implementar registro de usuário
- [ ] Implementar login/logout
- [ ] Implementar middleware JWT
- [ ] Implementar refresh token
- [ ] Configurar rate limiting
- [ ] Testar endpoints de auth

### **Fase 3: APIs Principais (3-4 dias)**
- [ ] API de usuários (CRUD perfil)
- [ ] API de postagens (CRUD posts)
- [ ] API de comentários (hierárquicos)
- [ ] API de avaliações (like/dislike)
- [ ] Sistema de upload de imagens
- [ ] Testes de integração

### **Fase 4: Funcionalidades Sociais (2-3 dias)**
- [ ] API de conexões (seguir/seguindo)
- [ ] API de mensagens privadas
- [ ] API de grupos
- [ ] API de tags
- [ ] Sistema de notificações
- [ ] Cache Redis

### **Fase 5: Tempo Real (1-2 dias)**
- [ ] Configurar WebSocket
- [ ] Mensagens em tempo real
- [ ] Notificações push
- [ ] Indicadores de atividade
- [ ] Testes de WebSocket

### **Fase 6: Finalização (1-2 dias)**
- [ ] Documentação da API
- [ ] Testes automatizados
- [ ] Deploy em produção
- [ ] Monitoramento e logs
- [ ] Otimizações de performance

## 🎯 Total Estimado: 10-15 dias de desenvolvimento

---

Este guia fornece uma base sólida para implementação completa do backend. Cada seção contém código pronto para uso, seguindo as melhores práticas e integrando perfeitamente com o frontend já implementado. 