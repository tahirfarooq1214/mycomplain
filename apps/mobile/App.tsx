import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { MainNavigator } from './src/navigation/MainNavigator';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { ProfileSetupScreen } from './src/screens/auth/ProfileSetupScreen';
import { ToastProvider, showToast } from './src/components/Toast';
import { io as socketIO } from 'socket.io-client';

const SOCKET_URL = Platform.OS === 'web' ? 'http://localhost:3000' : 'http://192.168.1.100:3000';

const linking = {
  prefixes: [Platform.OS === 'web' ? window.location.origin : 'mycomplain://'],
  config: {
    screens: {
      Main: {
        screens: {
          Home: '',
          'My Requests': 'requests',
          'New Request': 'new',
          Services: 'services',
          Profile: 'profile',
        },
      },
      ComplaintDetail: 'complaint/:id',
      NewComplaint: 'new-complaint',
      EditProfile: 'edit-profile',
      HelpSupport: 'help',
    },
  },
};

function AppContent() {
  const { user, isLoading, isNewUser } = useAuth();

  // ── Socket.IO real-time notifications ──
  useEffect(() => {
    if (!user?.id) return;

    const socket = socketIO(SOCKET_URL, { transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
      socket.emit('join:user', user.id);
    });

    socket.on('complaint:updated', (data: any) => {
      const status = (data.status || '').replace(/_/g, ' ').toLowerCase();
      showToast({
        type: 'info',
        title: 'Complaint Updated',
        body: `${data.complaintNumber || 'Your complaint'} is now: ${status}`,
      });
    });

    socket.on('complaint:escalated', () => {
      showToast({
        type: 'warning',
        title: 'Complaint Escalated',
        body: 'Your escalation has been received. Our team will prioritize this.',
      });
    });

    return () => { socket.disconnect(); };
  }, [user?.id]);

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (isNewUser || !user.fullName) {
    return <ProfileSetupScreen />;
  }

  return <MainNavigator />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <NavigationContainer linking={linking}>
          <StatusBar style="light" />
          <AppContent />
        </NavigationContainer>
      </ToastProvider>
    </AuthProvider>
  );
}
