interface Notification {
  notification_id: number;
  user_id: number;
  type: 'like' | 'comment' | 'follow' | 'group_invite' | 'message';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_user?: {
    username: string;
    profile_photo: string | null;
  };
  related_post?: {
    post_id: number;
    content: string;
  };
  related_group?: {
    group_id: number;
    group_name: string;
  };
}

interface NotificationResponse {
  notifications: Notification[];
  total: number;
  unread_count: number;
}

class NotificationService {
  private baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  async getNotifications(limit = 50, offset = 0): Promise<NotificationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar notificações');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro no serviço de notificações:', error);
      // Retorna dados mock em caso de erro para desenvolvimento
      return this.getMockNotifications();
    }
  }

  async markAsRead(notificationId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao marcar notificação como lida');
      }
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      // Em desenvolvimento, simula sucesso
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao marcar todas as notificações como lidas');
      }
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
      // Em desenvolvimento, simula sucesso
    }
  }

  async deleteNotification(notificationId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar notificação');
      }
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      // Em desenvolvimento, simula sucesso
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/unread-count`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar contagem de não lidas');
      }

      const data = await response.json();
      return data.count;
    } catch (error) {
      console.error('Erro ao buscar contagem de não lidas:', error);
      return 3; // Mock para desenvolvimento
    }
  }

  private getMockNotifications(): NotificationResponse {
    const mockNotifications: Notification[] = [
      {
        notification_id: 1,
        user_id: 1,
        type: 'like',
        title: 'Nova curtida',
        message: 'maria_tech curtiu seu post',
        is_read: false,
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        related_user: {
          username: 'maria_tech',
          profile_photo: null,
        },
        related_post: {
          post_id: 1,
          content: 'Acabei de lançar meu novo projeto React! 🚀',
        },
      },
      {
        notification_id: 2,
        user_id: 1,
        type: 'comment',
        title: 'Novo comentário',
        message: 'dev_carlos comentou em seu post',
        is_read: false,
        created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        related_user: {
          username: 'dev_carlos',
          profile_photo: null,
        },
        related_post: {
          post_id: 1,
          content: 'Acabei de lançar meu novo projeto React! 🚀',
        },
      },
      {
        notification_id: 3,
        user_id: 1,
        type: 'follow',
        title: 'Novo seguidor',
        message: 'ana_designer começou a te seguir',
        is_read: true,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        related_user: {
          username: 'ana_designer',
          profile_photo: null,
        },
      },
      {
        notification_id: 4,
        user_id: 1,
        type: 'group_invite',
        title: 'Convite para grupo',
        message: 'Você foi convidado para o grupo "Desenvolvedores React"',
        is_read: false,
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        related_group: {
          group_id: 1,
          group_name: 'Desenvolvedores React',
        },
      },
      {
        notification_id: 5,
        user_id: 1,
        type: 'message',
        title: 'Nova mensagem',
        message: 'tech_guru enviou uma mensagem',
        is_read: false,
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        related_user: {
          username: 'tech_guru',
          profile_photo: null,
        },
      },
    ];

    return {
      notifications: mockNotifications,
      total: mockNotifications.length,
      unread_count: mockNotifications.filter(n => !n.is_read).length,
    };
  }
}

const notificationServiceInstance = new NotificationService();

export default notificationServiceInstance;
export type { Notification, NotificationResponse }; 