import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { COLORS, FONTS } from '../../src/constants/theme';

function TabIcon({ emoji, label, focused }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 4 }}>
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <Text style={{
        fontFamily: focused ? FONTS.semiBold : FONTS.regular,
        fontSize: 10,
        color: focused ? COLORS.primary : COLORS.textTertiary,
        marginTop: 2,
      }}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 0.5,
          height: 80,
          paddingBottom: 20,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="✨" label="Explore" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="wishlists"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="❤️" label="Wishlists" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔔" label="Alerts" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🗺️" label="Trips" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
