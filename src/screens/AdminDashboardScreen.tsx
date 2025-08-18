// IMPORTAÇÕES - Adicionar no topo do arquivo
import UserManagement from '../components/UserManagement';

// ESTADO - Adicionar novo estado para controlar abas
const [activeTab, setActiveTab] = useState<'appointments' | 'users'>('appointments');

// JSX - Substituir a seção após o título por:
return (
  <Container>
    <Header />
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Title>Painel Administrativo</Title>

      {/* NOVO - Abas de navegação */}
      <TabContainer>
        <TabButton 
          active={activeTab === 'appointments'} 
          onPress={() => setActiveTab('appointments')}
        >
          <TabText active={activeTab === 'appointments'}>Consultas</TabText>
        </TabButton>
        <TabButton 
          active={activeTab === 'users'} 
          onPress={() => setActiveTab('users')}
        >
          <TabText active={activeTab === 'users'}>Usuários</TabText>
        </TabButton>
      </TabContainer>

      {/* CONTEÚDO CONDICIONAL baseado na aba ativa */}
      {activeTab === 'appointments' ? (
        <>
          <SectionTitle>Últimas Consultas</SectionTitle>
          {/* ... código existente das consultas ... */}
        </>
      ) : (
        <UserManagement />
      )}

      <Button
        title="Sair"
        onPress={signOut}
        containerStyle={styles.button as ViewStyle}
        buttonStyle={styles.logoutButton}
      />
    </ScrollView>
  </Container>
);

// STYLED COMPONENTS - Adicionar no final do arquivo
const TabContainer = styled.View`
  flex-direction: row;
  background-color: ${theme.colors.surface};
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid ${theme.colors.border};
`;

const TabButton = styled.TouchableOpacity<{ active: boolean }>`
  flex: 1;
  padding: 12px;
  align-items: center;
  background-color: ${props => props.active ? theme.colors.primary : 'transparent'};
  border-radius: 8px;
`;

const TabText = styled.Text<{ active: boolean }>`
  color: ${props => props.active ? '#fff' : theme.colors.text};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  font-size: 16px;
`;