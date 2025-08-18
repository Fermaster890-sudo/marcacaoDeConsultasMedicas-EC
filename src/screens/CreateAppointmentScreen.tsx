// IMPORTAÇÕES da API real
import { authApiService } from '../services/authApi';
import { User } from '../types/auth';

// ESTADOS para dados da API
const [doctors, setDoctors] = useState<User[]>([]);
const [loadingDoctors, setLoadingDoctors] = useState(true);

// CARREGAMENTO ao montar componente
useEffect(() => {
  loadDoctors();
}, []);

const loadDoctors = async () => {
  try {
    setLoadingDoctors(true);
    const doctorsData = await authApiService.getAllDoctors();
    setDoctors(doctorsData);
  } catch (error) {
    console.error('Erro ao carregar médicos:', error);
    setError('Erro ao carregar médicos. Tente novamente.');
  } finally {
    setLoadingDoctors(false);
  }
};

// CONVERSÃO de User[] para Doctor[]
const convertUsersToDoctors = (users: User[]): Doctor[] => {
  return users.map(user => ({
    id: user.id,
    name: user.name,
    specialty: user.role === 'doctor' && 'specialty' in user 
      ? user.specialty 
      : 'Especialidade não informada',
    image: user.image
  }));
};

// USO de dados reais
{loadingDoctors ? (
  <ErrorText>Carregando médicos...</ErrorText>
) : (
  <DoctorList
    doctors={convertUsersToDoctors(doctors)} // Dados reais convertidos
    onSelectDoctor={setSelectedDoctor}
    selectedDoctorId={selectedDoctor?.id}
  />
)}