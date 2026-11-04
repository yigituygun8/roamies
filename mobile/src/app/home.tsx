import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useTheme } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons'; // Icon library included with Expo

export default function HomeScreen() {
  const theme = useTheme();
  
  // Local state to manage which tab is currently active
  const [activeTab, setActiveTab] = useState('explore');

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      
      {/* Main Content Area */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Home</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          TODO
        </Text>
        
        {/* Placeholder for future map or swipe cards */}
        <View style={[styles.placeholderCard, { backgroundColor: theme.surfaceLight, borderColor: theme.borderSubtle }]} />
      </View>

      {/* Floating Bottom Menu */}
      <View
        style={[
          styles.floatingMenu,
          {
            backgroundColor: theme.surface,
            // Cross-platform shadows to make it float
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: theme.background === '#0B0E17' ? 0.3 : 0.1, // Darker shadow for dark mode
            shadowRadius: 16,
            elevation: 10,
            marginBottom: 30,
          },
        ]}
      >
        <TabButton
          icon="map"
          label="Explore"
          isActive={activeTab === 'explore'}
          onPress={() => setActiveTab('explore')}
          theme={theme}
        />
        <TabButton
          icon="airplane"
          label="Trips"
          isActive={activeTab === 'trips'}
          onPress={() => setActiveTab('trips')}
          theme={theme}
        />
        <TabButton
          icon="person"
          label="Profile"
          isActive={activeTab === 'profile'}
          onPress={() => setActiveTab('profile')}
          theme={theme}
        />
      </View>
    </View>
  );
}

/**
 * Reusable Tab Button component 
 */
function TabButton({ icon, label, isActive, onPress, theme }: any) {
  return (
    <Pressable onPress={onPress} style={styles.tabButton}>
      <Ionicons
        // Use solid icon when active, outline when inactive
        name={isActive ? icon : `${icon}-outline`}
        size={24}
        color={isActive ? theme.accent : theme.textMuted}
      />
      <Text
        style={[
          styles.tabLabel,
          { color: isActive ? theme.accent : theme.textMuted, fontWeight: isActive ? '600' : '400' },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 60, // Safe area padding
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  placeholderCard: {
    flex: 1,
    marginBottom: 120, // Leave space for the floating menu
    borderRadius: 24,
    borderWidth: 1,
  },
  floatingMenu: {
    position: 'absolute',
    bottom: 32, // Distance from the bottom of the screen
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '85%', // Keeps it nicely centered with margins
    height: 60,
    borderRadius: 35, // Fully rounded pill shape
    paddingHorizontal: 24,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 4,
  },
  tabLabel: {
    fontSize: 12,
  },
});