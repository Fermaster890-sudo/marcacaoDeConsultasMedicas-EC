// IMPORTAÇÕES da API real
import { authApiService } from '../services/authApi';
import { User } from '../types/auth';

// ESTADO para médicos da API
const [doctors, setDoctors] = useState<User[]>([]);

// FUNÇÃO para carregar médicos da API
const loadDoctors = async () => {
  try {
    const doctorsData = await authApiService.getAllDoctors();
    setDoctors(doctorsData);
  } catch (error) {
    console.error('Erro ao carregar médicos:', error);
  }
};

// CARREGAMENTO automático
useFocusEffect(
  React.useCallback(() => {
    loadAppointments();
    loadDoctors(); // Carrega médicos da API
  }, [])
);

// BUSCA em dados reais
const getDoctorInfo = (doctorId: string): User | undefined => {
  return doctors.find(doctor => doctor.id === doctorId);
};

// RENDERIZAÇÃO com dados reais
const renderAppointment = ({ item }: { item: Appointment }) => {
  const doctor = getDoctorInfo(item.doctorId);

  return (
    <AppointmentCard>
      <DoctorImage source={{ uri: doctor?.image || 'https://via.placeholder.com/100' }} />
      <InfoContainer>
        <DoctorName>{doctor?.name || 'Médico não encontrado'}</DoctorName>
        <DoctorSpecialty>
          {doctor?.role === 'doctor' && 'specialty' in doctor
            ? doctor.specialty
            : 'Especialidade não encontrada'}
        </DoctorSpecialty>
      </InfoContainer>
    </AppointmentCard>
  );
};