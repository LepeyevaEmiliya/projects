// Mock data for development without API

export const mockProjects = [
    {
        id: '1',
        name: 'E-Commerce Platform',
        description: 'Разработка платформы электронной коммерции с полным функционалом',
        owner_id: 'user1',
        owner_name: 'Иван Иванов',
        role: 'owner',
        is_active: true,
        member_count: 5,
        created_at: '2024-01-15T10:00:00Z'
    },
    {
        id: '2',
        name: 'Mobile Banking App',
        description: 'Мобильное приложение для банковских операций',
        owner_id: 'user2',
        owner_name: 'Мария Петрова',
        role: 'participant',
        is_active: true,
        member_count: 3,
        created_at: '2024-01-20T14:30:00Z'
    },
    {
        id: '3',
        name: 'CRM System',
        description: 'Система управления взаимоотношениями с клиентами',
        owner_id: 'user1',
        owner_name: 'Иван Иванов',
        role: 'manager',
        is_active: true,
        member_count: 8,
        created_at: '2024-02-01T09:00:00Z'
    }
];

export const mockTasks = [
    {
        id: '1',
        project_id: '1',
        project_name: 'E-Commerce Platform',
        title: 'Реализовать систему аутентификации',
        description: 'Добавить JWT токены и защищенные маршруты',
        status: 'in_progress',
        priority: 'high',
        task_type: 'task',
        assignee_id: 'user1',
        assignee_name: 'Иван Иванов',
        created_by_id: 'user2',
        created_by_name: 'Мария Петрова',
        due_date: '2024-12-20T18:00:00Z',
        created_at: '2024-12-10T10:00:00Z'
    },
    {
        id: '2',
        project_id: '1',
        project_name: 'E-Commerce Platform',
        title: 'Дизайн главной страницы',
        description: 'Создать привлекательный дизайн главной страницы',
        status: 'review',
        priority: 'medium',
        task_type: 'task',
        assignee_id: 'user3',
        assignee_name: 'Петр Сидоров',
        created_by_id: 'user1',
        created_by_name: 'Иван Иванов',
        due_date: '2024-12-18T18:00:00Z',
        created_at: '2024-12-08T14:00:00Z'
    },
    {
        id: '3',
        project_id: '2',
        project_name: 'Mobile Banking App',
        title: 'Исправить баг с переводами',
        description: 'Пользователи жалуются на ошибку при переводах',
        status: 'new',
        priority: 'critical',
        task_type: 'bug',
        assignee_id: 'user1',
        assignee_name: 'Иван Иванов',
        created_by_id: 'user2',
        created_by_name: 'Мария Петрова',
        due_date: '2024-12-12T12:00:00Z',
        created_at: '2024-12-09T16:00:00Z'
    },
    {
        id: '4',
        project_id: '1',
        project_name: 'E-Commerce Platform',
        title: 'Добавить корзину покупок',
        description: 'Реализовать функционал корзины с сохранением состояния',
        status: 'done',
        priority: 'high',
        task_type: 'task',
        assignee_id: 'user1',
        assignee_name: 'Иван Иванов',
        created_by_id: 'user1',
        created_by_name: 'Иван Иванов',
        due_date: '2024-12-15T18:00:00Z',
        completed_at: '2024-12-14T16:30:00Z',
        created_at: '2024-12-05T09:00:00Z'
    },
    {
        id: '5',
        project_id: '3',
        project_name: 'CRM System',
        title: 'Интеграция с почтой',
        description: 'Подключить отправку email уведомлений',
        status: 'in_progress',
        priority: 'medium',
        task_type: 'improvement',
        assignee_id: 'user4',
        assignee_name: 'Анна Козлова',
        created_by_id: 'user1',
        created_by_name: 'Иван Иванов',
        due_date: '2024-12-25T18:00:00Z',
        created_at: '2024-12-07T11:00:00Z'
    }
];

export const mockNotifications = [
    {
        id: '1',
        type: 'task_assigned',
        title: 'Вам назначена новая задача',
        message: 'Задача "Реализовать систему аутентификации" назначена вам',
        related_task_id: '1',
        related_project_id: '1',
        task_title: 'Реализовать систему аутентификации',
        project_name: 'E-Commerce Platform',
        is_read: false,
        created_at: '2024-12-10T10:05:00Z'
    },
    {
        id: '2',
        type: 'comment_mention',
        title: 'Вас упомянули в комментарии',
        message: '@ИванИванов, можешь посмотреть этот код?',
        related_task_id: '2',
        related_project_id: '1',
        task_title: 'Дизайн главной страницы',
        project_name: 'E-Commerce Platform',
        is_read: false,
        created_at: '2024-12-09T15:30:00Z'
    },
    {
        id: '3',
        type: 'deadline_reminder',
        title: 'Напоминание о дедлайне',
        message: 'Задача "Исправить баг с переводами" должна быть завершена завтра',
        related_task_id: '3',
        related_project_id: '2',
        task_title: 'Исправить баг с переводами',
        project_name: 'Mobile Banking App',
        is_read: true,
        created_at: '2024-12-08T09:00:00Z'
    },
    {
        id: '4',
        type: 'task_completed',
        title: 'Задача завершена',
        message: 'Иван Иванов завершил задачу "Добавить корзину покупок"',
        related_task_id: '4',
        related_project_id: '1',
        task_title: 'Добавить корзину покупок',
        project_name: 'E-Commerce Platform',
        is_read: true,
        created_at: '2024-12-14T16:35:00Z'
    }
];

export const mockComments = [
    {
        id: '1',
        task_id: '1',
        user_id: 'user2',
        user_name: 'Мария Петрова',
        text: 'Отличная работа! Не забудь добавить валидацию email.',
        mentions: [],
        created_at: '2024-12-11T10:30:00Z'
    },
    {
        id: '2',
        task_id: '1',
        user_id: 'user1',
        user_name: 'Иван Иванов',
        text: '@МарияПетрова Спасибо! Уже добавил валидацию.',
        mentions: [{ user_id: 'user2', username: 'МарияПетрова' }],
        created_at: '2024-12-11T14:15:00Z'
    },
    {
        id: '3',
        task_id: '2',
        user_id: 'user3',
        user_name: 'Петр Сидоров',
        text: 'Дизайн готов для review. Посмотрите в Figma.',
        mentions: [],
        created_at: '2024-12-12T16:00:00Z'
    }
];

export const mockMembers = [
    {
        id: '1',
        user_id: 'user1',
        name: 'Иван Иванов',
        email: 'ivan@example.com',
        role: 'owner',
        status: 'accepted',
        joined_at: '2024-01-15T10:00:00Z'
    },
    {
        id: '2',
        user_id: 'user2',
        name: 'Мария Петрова',
        email: 'maria@example.com',
        role: 'manager',
        status: 'accepted',
        joined_at: '2024-01-16T11:00:00Z'
    },
    {
        id: '3',
        user_id: 'user3',
        name: 'Петр Сидоров',
        email: 'petr@example.com',
        role: 'participant',
        status: 'accepted',
        joined_at: '2024-01-17T09:00:00Z'
    },
    {
        id: '4',
        user_id: 'user4',
        name: 'Анна Козлова',
        email: 'anna@example.com',
        role: 'participant',
        status: 'accepted',
        joined_at: '2024-01-18T14:00:00Z'
    }
];

// Filters helper
export const filterTasks = (tasks, filters) => {
    return tasks.filter(task => {
        if (filters.status && task.status !== filters.status) return false;
        if (filters.priority && task.priority !== filters.priority) return false;
        if (filters.type && task.task_type !== filters.type) return false;
        if (filters.project_id && task.project_id !== filters.project_id) return false;
        if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
        return true;
    });
};

export const filterProjects = (projects, search) => {
    if (!search) return projects;
    return projects.filter(project =>
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        project.description?.toLowerCase().includes(search.toLowerCase())
    );
};