import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, typography, layout } from '../../theme/tokens';
import { TextInput } from '../../components/ui/TextInput';
import { Button } from '../../components/ui/Button';
import { authApi } from '../../lib/api';
import { useAuthStore } from '../../lib/store';

export default function PhoneOtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const { setToken, setUser } = useAuthStore();

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleVerifyOtp = async () => {
    setError('');

    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.verifyPhoneOtp(phone!, otp);
      const { token, user } = response.data.data;

      await setToken(token);
      setUser(user);

      // Navigate to main app (auth check in root layout will show tabs)
      router.replace('/(tabs)/home');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setResendCountdown(60);
    try {
      await authApi.requestPhoneOtp(phone!);
    } catch (err: any) {
      setError('Failed to resend OTP');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Enter OTP</Text>
          <Text style={styles.subtitle}>
            We've sent a code to {phone}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            label="One-Time Password"
            placeholder="1234"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
            editable={!loading}
            error={error}
          />

          {/* Verify Button */}
          <Button
            title="Verify OTP"
            onPress={handleVerifyOtp}
            loading={loading}
            fullWidth
            style={styles.submitButton}
          />
        </View>

        {/* Resend */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code?</Text>
          <TouchableOpacity
            onPress={handleResendOtp}
            disabled={resendCountdown > 0}
          >
            <Text
              style={[
                styles.resendLink,
                { opacity: resendCountdown > 0 ? 0.5 : 1 },
              ]}
            >
              {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend Code'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Back */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.xl,
  },
  header: {
    marginBottom: spacing.xxxl,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  form: {
    marginBottom: spacing.xl,
  },
  submitButton: {
    marginTop: spacing.xl,
  },
  resendContainer: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  resendText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  resendLink: {
    fontSize: typography.fontSize.base,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.semibold,
  },
  backButton: {
    marginTop: spacing.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  backText: {
    fontSize: typography.fontSize.base,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.semibold,
  },
});
