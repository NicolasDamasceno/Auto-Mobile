import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';

/**
 * Placeholder de entrada do app. A navegação real (React Navigation) e as
 * telas entram em src/presentation depois que o esqueleto do domínio
 * (src/domain) e a persistência (src/data) estiverem implementados.
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Text style={styles.title}>AutoMobile</Text>
        <Text style={styles.subtitle}>Controle de gastos do seu veículo</Text>
        <StatusBar style="auto" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
  },
});
