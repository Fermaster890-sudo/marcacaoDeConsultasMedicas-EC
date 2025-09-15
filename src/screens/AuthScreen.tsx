import React, { useState } from 'react';
import styled from 'styled-components/native';
import { Input, Button, Text } from 'react-native-elements';
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import theme from '../styles/theme';
import { ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type AuthScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Auth'>;
};

type AuthMode = 'login' | 'register';

const AuthScreen: React.FC = () => {
  const { signIn, register } = useAuth();
  const navigation = useNavigation<AuthScreenProps['navigation']>();
  const [mode, setMode] = useState<AuthMode>('login');
  
  // Estados do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'PACIENTE' | 'ADMIN'>('PACIENTE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    try {
      setLoading(true);
      setError('');

      if (mode === 'login') {
        await signIn({ email, password });
      } else {
        if (!name || !email || !password) {
          setError('Por favor, preencha todos os campos');
          return;
        }
        await register({ name, email, password, userType });
        // Após registro bem-sucedido, volta para login
        setMode('login');
        setName('');
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      setError(mode === 'login' ? 'Email ou senha inválidos' : 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Container>
        <Header>
          <Title>App Marcação de Consultas</Title>
          <Subtitle>
            {mode === 'login' ? 'Faça login para acessar sua conta' : 'Crie sua conta para começar'}
          </Subtitle>
        </Header>

        <TabSelector>
          <TabButton 
            active={mode === 'login'} 
            onPress={() => switchMode('login')}
          >
            <TabText active={mode === 'login'}>Entrar</TabText>
          </TabButton>
          <TabButton 
            active={mode === 'register'} 
            onPress={() => switchMode('register')}
          >
            <TabText active={mode === 'register'}>Cadastrar</TabText>
          </TabButton>
        </TabSelector>

        <ScrollView showsVerticalScrollIndicator={false}>
          <FormContainer>
            {mode === 'register' && (
              <Input
                placeholder="Nome completo"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                containerStyle={styles.input}
              />
            )}

            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              containerStyle={styles.input}
            />

            <Input
              placeholder="Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              containerStyle={styles.input}
            />

            {mode === 'register' && (
              <>
                <SectionTitle>Tipo de Usuário</SectionTitle>
                <UserTypeContainer>
                  <UserTypeButton 
                    selected={userType === 'PACIENTE'}
                    onPress={() => setUserType('PACIENTE')}
                  >
                    <UserTypeText selected={userType === 'PACIENTE'}>
                      👤 Paciente
                    </UserTypeText>
                  </UserTypeButton>
                  
                  <UserTypeButton 
                    selected={userType === 'ADMIN'}
                    onPress={() => setUserType('ADMIN')}
                  >
                    <UserTypeText selected={userType === 'ADMIN'}>
                      🔧 Administrador
                    </UserTypeText>
                  </UserTypeButton>
                </UserTypeContainer>
              </>
            )}

            {error ? <ErrorText>{error}</ErrorText> : null}

            <Button
              title={mode === 'login' ? 'Entrar' : 'Cadastrar'}
              onPress={handleAuth}
              loading={loading}
              containerStyle={styles.button as ViewStyle}
              buttonStyle={styles.buttonStyle}
            />

            <HelpText>
              {mode === 'login' 
                ? 'Primeiro acesso? Cadastre-se como Admin ou Paciente.'
                : 'Já tem uma conta? Faça login para acessar sua área.'
              }
            </HelpText>
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
  button: {
    marginTop: 10,
    width: '100%',
  },
  buttonStyle: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
  },
};

const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
`;

const Header = styled.View`
  padding: 40px 20px 20px;
  align-items: center;
`;

const Title = styled.Text`
  font-size: 28px;
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

const TabSelector = styled.View`
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

const TabButton = styled.TouchableOpacity<{ active: boolean }>`
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  background-color: ${(props: { active: boolean }) => props.active ? theme.colors.primary : 'transparent'};
  align-items: center;
`;

const TabText = styled.Text<{ active: boolean }>`
  font-size: 16px;
  font-weight: 600;
  color: ${(props: { active: boolean }) => props.active ? theme.colors.white : theme.colors.text};
`;

const FormContainer = styled.View`
  padding: 0 20px 20px;
`;

const SectionTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${theme.colors.text};
  margin-bottom: 12px;
  margin-top: 8px;
`;

const UserTypeContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const UserTypeButton = styled.TouchableOpacity<{ selected: boolean }>`
  flex: 1;
  padding: 12px;
  margin: 0 4px;
  border-radius: 8px;
  border: 2px solid ${(props: { selected: boolean }) => props.selected ? theme.colors.primary : theme.colors.border};
  background-color: ${(props: { selected: boolean }) => props.selected ? theme.colors.primary + '20' : theme.colors.background};
  align-items: center;
`;

const UserTypeText = styled.Text<{ selected: boolean }>`
  color: ${(props: { selected: boolean }) => props.selected ? theme.colors.primary : theme.colors.text};
  font-weight: ${(props: { selected: boolean }) => props.selected ? 'bold' : 'normal'};
  font-size: 14px;
`;

const ErrorText = styled.Text`
  color: ${theme.colors.error};
  text-align: center;
  margin-bottom: 10px;
`;

const HelpText = styled.Text`
  text-align: center;
  color: ${theme.colors.text};
  opacity: 0.6;
  font-size: 14px;
  margin-top: 20px;
  line-height: 20px;
`;

export default AuthScreen;
