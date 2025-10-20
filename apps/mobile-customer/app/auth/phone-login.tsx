import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, layout } from '../../theme/tokens';
import { TextInput } from '../../components/ui/TextInput';
import { Button } from '../../components/ui/Button';
import { validatePhoneNumber, formatPhoneNumber } from '../../lib/utils';
import { authApi } from '../../lib/api';

export default function PhoneLoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOtp = async () => {
    setError('');

    if (!phone) {
      setError('Please enter your phone number');
      return;
    }

    if (!validatePhoneNumber(phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      await authApi.requestPhoneOtp(phone);
      // Navigate to OTP verification screen
      router.push({
        pathname: '/auth/phone-otp',
        params: { phone },
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to DryJets</Text>
          <Text style={styles.subtitle}>Enter your phone to get started</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            label="Phone Number"
            placeholder="(555) 123-4567"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            editable={!loading}
            error={error}
          />

          {/* Error Message */}
          {error && !error.includes('Please enter your') && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          {/* Submit Button */}
          <Button
            title="Request OTP"
            onPress={handleRequestOtp}
            loading={loading}
            fullWidth
            style={styles.submitButton}
          />
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Buttons */}
        <View style={styles.socialButtons}>
          <Button
            title="Continue with Google"
            onPress={() => {
              // TODO: Implement Google sign-in
              console.log('Google sign-in');
            }}
            variant="outline"
            fullWidth
            style={styles.socialButton}
          />
          <Button
            title="Continue with Apple"
            onPress={() => {
              // TODO: Implement Apple sign-in
              console.log('Apple sign-in');
            }}
            variant="outline"
            fullWidth
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our{' '}
            <Text style={styles.link}>Terms of Service</Text> and{' '}
            <Text style={styles.link}>Privacy Policy</Text>
          </Text>
        </View>
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
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error[500],
    marginTop: spacing.md,
  },
  submitButton: {
    marginTop: spacing.xl,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    color: colors.text.tertiary,
    fontSize: typography.fontSize.sm,
  },
  socialButtons: {
    gap: spacing.md,
    marginBottom: spacing.xxxl,
  },
  socialButton: {
    marginBottom: spacing.md,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  link: {
    color: colors.primary[500],
    fontWeight: typography.fontWeight.semibold,
  },
});
