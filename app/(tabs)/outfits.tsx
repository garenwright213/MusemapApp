import { StyleSheet, Text, View } from 'react-native';

export default function OutfitsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Outfits</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F1EB' },
  title: { fontSize: 24, color: '#2B2118' },
});
