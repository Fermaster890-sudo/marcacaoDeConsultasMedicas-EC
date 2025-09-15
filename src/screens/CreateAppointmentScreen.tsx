import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { Input, Button, Text } from 'react-native-elements';
import { ScrollView, KeyboardAvoidingView, Platform, ViewStyle } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import Header from '../components/Header';
import DoctorList from '../components/DoctorList';
import TimeSlotList from '../components/TimeSlotList';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApiService } from '../services/authApi';
import { User } from '../types/auth';
import theme from '../styles/theme';

type CreateAppointmentScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CreateAppointment'>;
};

type AppointmentStep = 'date' | 'time' | 'doctor' | 'confirm';

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  specialty: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
}

const CreateAppointmentScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<CreateAppointmentScreenProps['navigation']>();
  
  // Estados do formulário
  const [currentStep, setCurrentStep] = useState<AppointmentStep>('date');
  const [date, setDate] = useState('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados para dados da API
  const [doctors, setDoctors] = useState<User[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  // Carrega médicos ao montar o componente
  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoadingDoctors(true);
      setError('');
      const doctorsData = await authApiService.getAllDoctors();
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Erro ao carregar médicos:', error);
      setError('Carregando médicos com dados locais...');
      setTimeout(async () => {
        try {
          const doctorsData = await authApiService.getAllDoctors();
          setDoctors(doctorsData);
          setError('');
        } catch (retryError) {
          setError('Médicos carregados com dados locais (API indisponível)');
        }
      }, 1000);
    } finally {
      setLoadingDoctors(false);
    }
  };

  // Converte User[] para Doctor[]
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

  const handleNextStep = () => {
    setError('');
    
    switch (currentStep) {
      case 'date':
        if (!date.trim()) {
          setError('Por favor, selecione uma data');
          return;
        }
        setCurrentStep('time');
        break;
      case 'time':
        if (!selectedTime) {
          setError('Por favor, selecione um horário');
          return;
        }
        setCurrentStep('doctor');
        break;
      case 'doctor':
        if (!selectedDoctor) {
          setError('Por favor, selecione um médico');
          return;
        }
        setCurrentStep('confirm');
        break;
    }
  };

  const handlePreviousStep = () => {
    setError('');
    switch (currentStep) {
      case 'time':
        setCurrentStep('date');
        break;
      case 'doctor':
        setCurrentStep('time');
        break;
      case 'confirm':
        setCurrentStep('doctor');
        break;
    }
  };

  const handleCreateAppointment = async () => {
    try {
      setLoading(true);
      setError('');

      if (!date || !selectedTime || !selectedDoctor) {
        setError('Por favor, preencha todos os campos');
        return;
      }

      // Recupera consultas existentes
      const storedAppointments = await AsyncStorage.getItem('@MedicalApp:appointments');
      const appointments: Appointment[] = storedAppointments ? JSON.parse(storedAppointments) : [];

      // Cria nova consulta
      const newAppointment: Appointment = {
        id: Date.now().toString(),
        patientId: user?.id || '',
        patientName: user?.name || '',
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        date,
        time: selectedTime,
        specialty: selectedDoctor.specialty,
        status: 'pending',
      };

      // Adiciona nova consulta à lista
      appointments.push(newAppointment);

      // Salva lista atualizada
      await AsyncStorage.setItem('@MedicalApp:appointments', JSON.stringify(appointments));

      alert('Consulta agendada com sucesso!');
      navigation.goBack();
    } catch (err) {
      setError('Erro ao agendar consulta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'date': return 'Selecione a Data';
      case 'time': return 'Escolha o Horário';
      case 'doctor': return 'Selecione o Médico';
      case 'confirm': return 'Confirme os Dados';
      default: return 'Agendar Consulta';
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 'date': return 'Escolha a data para sua consulta';
      case 'time': return 'Selecione um horário disponível';
      case 'doctor': return 'Escolha o médico especialista';
      case 'confirm': return 'Revise os dados antes de confirmar';
      default: return '';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'date':
        return (
          <Input
            placeholder="Data (DD/MM/AAAA)"
            value={date}
            onChangeText={setDate}
            containerStyle={styles.input}
            keyboardType="numeric"
          />
        );
      
      case 'time':
        return (
          <TimeSlotList
            onSelectTime={setSelectedTime}
            selectedTime={selectedTime}
          />
        );
      
      case 'doctor':
        return (
          <>
            {loadingDoctors ? (
              <LoadingText>Carregando médicos...</LoadingText>
            ) : (
              <DoctorList
                doctors={convertUsersToDoctors(doctors)}
                onSelectDoctor={setSelectedDoctor}
                selectedDoctorId={selectedDoctor?.id}
              />
            )}
          </>
        );
      
      case 'confirm':
        return (
          <ConfirmationCard>
            <ConfirmationTitle>Resumo da Consulta</ConfirmationTitle>
            <ConfirmationItem>
              <ConfirmationLabel>Data:</ConfirmationLabel>
              <ConfirmationValue>{date}</ConfirmationValue>
            </ConfirmationItem>
            <ConfirmationItem>
              <ConfirmationLabel>Horário:</ConfirmationLabel>
              <ConfirmationValue>{selectedTime}</ConfirmationValue>
            </ConfirmationItem>
            <ConfirmationItem>
              <ConfirmationLabel>Médico:</ConfirmationLabel>
              <ConfirmationValue>{selectedDoctor?.name}</ConfirmationValue>
            </ConfirmationItem>
            <ConfirmationItem>
              <ConfirmationLabel>Especialidade:</ConfirmationLabel>
              <ConfirmationValue>{selectedDoctor?.specialty}</ConfirmationValue>
            </ConfirmationItem>
          </ConfirmationCard>
        );
      
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Container>
        <Header />
        
        <ScreenHeader>
          <Title>{getStepTitle()}</Title>
          <Subtitle>{getStepSubtitle()}</Subtitle>
        </ScreenHeader>

        <StepSelector>
          <StepButton 
            active={currentStep === 'date'} 
            onPress={() => setCurrentStep('date')}
          >
            <StepText active={currentStep === 'date'}>📅 Data</StepText>
          </StepButton>
          <StepButton 
            active={currentStep === 'time'} 
            onPress={() => setCurrentStep('time')}
          >
            <StepText active={currentStep === 'time'}>🕐 Horário</StepText>
          </StepButton>
          <StepButton 
            active={currentStep === 'doctor'} 
            onPress={() => setCurrentStep('doctor')}
          >
            <StepText active={currentStep === 'doctor'}>👨‍⚕️ Médico</StepText>
          </StepButton>
          <StepButton 
            active={currentStep === 'confirm'} 
            onPress={() => setCurrentStep('confirm')}
          >
            <StepText active={currentStep === 'confirm'}>✅ Confirmar</StepText>
          </StepButton>
        </StepSelector>

        <ScrollView showsVerticalScrollIndicator={false}>
          <FormContainer>
            {renderStepContent()}

            {error ? <ErrorText>{error}</ErrorText> : null}

            <ButtonContainer>
              {currentStep !== 'date' && (
                <Button
                  title="Voltar"
                  onPress={handlePreviousStep}
                  containerStyle={styles.backButton as ViewStyle}
                  buttonStyle={styles.backButtonStyle}
                />
              )}
              
              {currentStep !== 'confirm' ? (
                <Button
                  title="Próximo"
                  onPress={handleNextStep}
                  containerStyle={styles.nextButton as ViewStyle}
                  buttonStyle={styles.nextButtonStyle}
                />
              ) : (
                <Button
                  title="Agendar Consulta"
                  onPress={handleCreateAppointment}
                  loading={loading}
                  containerStyle={styles.confirmButton as ViewStyle}
                  buttonStyle={styles.confirmButtonStyle}
                />
              )}
            </ButtonContainer>

            <CancelButton
              title="Cancelar"
              onPress={() => navigation.goBack()}
              containerStyle={styles.cancelButton as ViewStyle}
              buttonStyle={styles.cancelButtonStyle}
            />
          </FormContainer>
        </ScrollView>
      </Container>
    </KeyboardAvoidingView>
  );
};

const styles = {
  input: {
    marginBottom: 15,
  },
  nextButton: {
    flex: 1,
    marginLeft: 10,
  },
  nextButtonStyle: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
  },
  backButton: {
    flex: 1,
    marginRight: 10,
  },
  backButtonStyle: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: 12,
  },
  confirmButton: {
    width: '100%',
  },
  confirmButtonStyle: {
    backgroundColor: theme.colors.success,
    paddingVertical: 12,
  },
  cancelButton: {
    marginTop: 10,
    width: '100%',
  },
  cancelButtonStyle: {
    backgroundColor: theme.colors.error,
    paddingVertical: 12,
  },
};

const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
`;

const ScreenHeader = styled.View`
  padding: 20px;
  align-items: center;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  color: ${theme.colors.text};
  margin-bottom: 8px;
`;

const Subtitle = styled.Text`
  font-size: 16px;
  text-align: center;
  color: ${theme.colors.text};
  opacity: 0.7;
`;

const StepSelector = styled.View`
  flex-direction: row;
  margin: 0 20px 20px;
  background-color: ${theme.colors.white};
  border-radius: 12px;
  padding: 4px;
  elevation: 2;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
`;

const StepButton = styled.TouchableOpacity<{ active: boolean }>`
  flex: 1;
  padding: 8px 4px;
  border-radius: 8px;
  background-color: ${(props: { active: boolean }) => props.active ? theme.colors.primary : 'transparent'};
  align-items: center;
`;

const StepText = styled.Text<{ active: boolean }>`
  font-size: 12px;
  font-weight: 600;
  color: ${(props: { active: boolean }) => props.active ? theme.colors.white : theme.colors.text};
  text-align: center;
`;

const FormContainer = styled.View`
  padding: 0 20px 20px;
`;

const LoadingText = styled.Text`
  text-align: center;
  color: ${theme.colors.text};
  font-size: 16px;
  margin: 20px 0;
`;

const ConfirmationCard = styled.View`
  background-color: ${theme.colors.white};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  elevation: 2;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
`;

const ConfirmationTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${theme.colors.text};
  margin-bottom: 15px;
  text-align: center;
`;

const ConfirmationItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const ConfirmationLabel = styled.Text`
  font-size: 16px;
  color: ${theme.colors.text};
  opacity: 0.7;
`;

const ConfirmationValue = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.text};
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  margin-top: 20px;
`;

const CancelButton = styled(Button)``;

const ErrorText = styled.Text`
  color: ${theme.colors.error};
  text-align: center;
  margin-bottom: 10px;
`;

export default CreateAppointmentScreen;
