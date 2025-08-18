export const API_ENDPOINTS = {
  // Autenticação
  LOGIN: '/usuarios/login',
  REGISTER: '/usuarios',
  CURRENT_USER: '/usuarios/me',

  // Usuários
  USERS: '/usuarios',
  DOCTORS: '/usuarios/medicos',
  CHANGE_PASSWORD: '/usuarios',  // NOVO ENDPOINT

  // Especialidades
  SPECIALTIES: '/especialidades',

  // Consultas
  APPOINTMENTS: '/consultas',
} as const;