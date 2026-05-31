import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, Platform } from 'react-native';
import { Colors } from '../constants/colors';

import { HomeScreen } from '../screens/home/HomeScreen';
import { MyComplaintsScreen } from '../screens/complaints/MyComplaintsScreen';
import { NewComplaintScreen } from '../screens/complaints/NewComplaintScreen';
import { ComplaintDetailScreen } from '../screens/complaints/ComplaintDetailScreen';
import { ServicesScreen } from '../screens/services/ServicesScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { HelpScreen } from '../screens/profile/HelpScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '🏠',
    'My Requests': '📋',
    'New Request': '➕',
    Services: '📞',
    Profile: '👤',
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{
        fontSize: label === 'New Request' ? 22 : focused ? 22 : 20,
        opacity: focused ? 1 : 0.5,
      }}>
        {icons[label] || '📌'}
      </Text>
      {focused && label !== 'New Request' && (
        <View style={{
          width: 5,
          height: 5,
          borderRadius: 2.5,
          backgroundColor: Colors.primary,
          marginTop: 3,
        }} />
      )}
    </View>
  );
}

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: -2,
        },
        headerStyle: {
          backgroundColor: Colors.primary,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: { fontWeight: '800', fontSize: 18, letterSpacing: -0.3 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'MyComplain' }} />
      <Tab.Screen name="My Requests" component={MyComplaintsScreen} />
      <Tab.Screen
        name="New Request"
        component={NewComplaintScreen}
        options={{
          tabBarLabel: 'New',
          tabBarItemStyle: {
            backgroundColor: Colors.primary,
            borderRadius: 20,
            marginHorizontal: 12,
            marginTop: -8,
            height: 52,
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          },
          tabBarLabelStyle: { color: Colors.white, fontSize: 10, fontWeight: '800', marginTop: -2 },
        }}
      />
      <Tab.Screen name="Services" component={ServicesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: { fontWeight: '800', fontSize: 18, letterSpacing: -0.3 },
        cardStyle: { flex: 1, backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="Main" component={HomeTabs} options={{ headerShown: false }} />
      <Stack.Screen name="ComplaintDetail" component={ComplaintDetailScreen} options={{ title: 'Complaint Details' }} />
      <Stack.Screen name="NewComplaint" component={NewComplaintScreen} options={{ title: 'New Service Request' }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="HelpSupport" component={HelpScreen} options={{ title: 'Help & Support' }} />
    </Stack.Navigator>
  );
}
