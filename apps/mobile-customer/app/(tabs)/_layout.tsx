import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '../../theme/tokens';

export default function TabsLayout() {
  const tabIcons = {
    home: '🏠',
    orders: '📦',
    stores: '⭐',
    profile: '👤',
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: colors.background.primary,
          borderTopColor: colors.border.light,
          borderTopWidth: 1,
        },
        headerShown: false,
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color, marginBottom: -3 }}>
              {tabIcons.home}
            </Text>
          ),
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color, marginBottom: -3 }}>
              {tabIcons.orders}
            </Text>
          ),
        }}
      />

      <Tabs.Screen
        name="stores"
        options={{
          title: 'Stores',
          tabBarLabel: 'Stores',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color, marginBottom: -3 }}>
              {tabIcons.stores}
            </Text>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color, marginBottom: -3 }}>
              {tabIcons.profile}
            </Text>
          ),
        }}
      />
    </Tabs>
  );
}
