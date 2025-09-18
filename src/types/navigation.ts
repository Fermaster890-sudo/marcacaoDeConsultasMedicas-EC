/**
 * Tipos relacionados à navegação
 * Este arquivo contém todas as definições de tipos necessárias para a navegação entre telas
 */

/**
 * Define as rotas disponíveis na aplicação e seus parâmetros
 * @property Auth - Tela unificada de autenticação (login/registro)
 * @property Home - Tela inicial da aplicação
 * @property CreateAppointment - Tela de criação de consulta
 * @property Profile - Tela de perfil do usuário
 * @property AdminDashboard - Tela do painel de administração
 * @property DoctorDashboard - Tela do painel do médico
 * @property PatientDashboard - Tela do painel do paciente
 * @property UserManagement - Tela de gerenciamento de usuários
 */
export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  CreateAppointment: undefined;
  Profile: undefined;
  AdminDashboard: undefined;
  DoctorDashboard: undefined;
  PatientDashboard: undefined;
  UserManagement: undefined;
}; 