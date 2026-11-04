import { ReactNode } from 'react';
import {
  Image,
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { useTheme } from '@/lib/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Import the icon library

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  showBackButton?: boolean;
};

export function AuthLayout({ title, subtitle, showBackButton = false, children }: AuthLayoutProps) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
        <View style={styles.imageContainer}>
          <Image
            source={require('@/assets/images/loginBackground/loginImage.jpg')}
            style={{ width: '100%', height: 475 }}
          />

          {/* Conditional Back Button floating over the image */}
          {showBackButton && (
            <Pressable 
              style={styles.backButton} 
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={25} color="#FFFFFF" />
            </Pressable>
          )}
        </View>

        <View style={[styles.bottomCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            {subtitle}
          </Text>

          {/* Specific logic for Login or Register here */}
          <View style={styles.form}>{children}</View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1 },
  imageContainer: { height: 305, width: '100%' },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.51)', // Slight dark background for better visibility
    padding: 8,
    borderRadius: 20,
  },
  bottomCard: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingTop: 32,
  },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 32, lineHeight: 22 },
  form: { gap: 16 },
});