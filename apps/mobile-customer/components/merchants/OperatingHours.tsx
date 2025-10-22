import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

interface OperatingHoursProps {
  hours: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
}

const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

const DAY_LABELS: Record<string, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

export default function OperatingHours({ hours }: OperatingHoursProps) {
  const currentDay = useMemo(() => {
    const day = new Date().getDay();
    // Convert JavaScript day (0=Sunday) to our array index
    return DAYS[day === 0 ? 6 : day - 1];
  }, []);

  const isCurrentlyOpen = useMemo(() => {
    const todayHours = hours[currentDay];
    if (!todayHours) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [openHour, openMin] = todayHours.open.split(':').map(Number);
    const [closeHour, closeMin] = todayHours.close.split(':').map(Number);

    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;

    return currentTime >= openTime && currentTime < closeTime;
  }, [hours, currentDay]);

  const nextOpenTime = useMemo(() => {
    const todayHours = hours[currentDay];
    if (!todayHours) return null;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [openHour, openMin] = todayHours.open.split(':').map(Number);
    const openTime = openHour * 60 + openMin;

    if (currentTime < openTime) {
      return `Opens at ${formatTime(todayHours.open)}`;
    }

    const [closeHour, closeMin] = todayHours.close.split(':').map(Number);
    const closeTime = closeHour * 60 + closeMin;

    if (currentTime >= openTime && currentTime < closeTime) {
      return `Closes at ${formatTime(todayHours.close)}`;
    }

    // Find next open day
    for (let i = 1; i < 7; i++) {
      const nextDayIndex = (DAYS.indexOf(currentDay) + i) % 7;
      const nextDay = DAYS[nextDayIndex];
      const nextDayHours = hours[nextDay];
      if (nextDayHours) {
        return `Opens ${DAY_LABELS[nextDay]} at ${formatTime(nextDayHours.open)}`;
      }
    }

    return null;
  }, [hours, currentDay]);

  return (
    <View style={styles.container}>
      {/* Status Badge */}
      <View style={styles.header}>
        <View style={[styles.statusBadge, isCurrentlyOpen && styles.statusBadgeOpen]}>
          <View style={[styles.statusDot, isCurrentlyOpen && styles.statusDotOpen]} />
          <Text style={[styles.statusText, isCurrentlyOpen && styles.statusTextOpen]}>
            {isCurrentlyOpen ? 'Open Now' : 'Closed'}
          </Text>
        </View>
        {nextOpenTime && (
          <Text style={styles.nextOpenText}>{nextOpenTime}</Text>
        )}
      </View>

      {/* Hours List */}
      <View style={styles.hoursList}>
        {DAYS.map((day) => {
          const dayHours = hours[day];
          const isToday = day === currentDay;

          return (
            <View
              key={day}
              style={[styles.dayRow, isToday && styles.dayRowToday]}
            >
              <View style={styles.dayLabelContainer}>
                {isToday && (
                  <Ionicons
                    name="today"
                    size={16}
                    color={colors.primary[500]}
                    style={styles.todayIcon}
                  />
                )}
                <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                  {DAY_LABELS[day]}
                </Text>
              </View>
              <Text style={[styles.hoursText, isToday && styles.hoursTextToday]}>
                {dayHours
                  ? `${formatTime(dayHours.open)} - ${formatTime(dayHours.close)}`
                  : 'Closed'}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  header: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
    marginBottom: spacing.xs,
  },
  statusBadgeOpen: {
    backgroundColor: colors.secondary[50],
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.status.error,
    marginRight: spacing.xs,
  },
  statusDotOpen: {
    backgroundColor: colors.secondary[500],
  },
  statusText: {
    ...typography.body.sm,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  statusTextOpen: {
    color: colors.secondary[700],
  },
  nextOpenText: {
    ...typography.body.sm,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  hoursList: {
    gap: spacing.sm,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  dayRowToday: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.sm,
    marginHorizontal: -spacing.sm,
    borderRadius: borderRadius.sm,
  },
  dayLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  todayIcon: {
    marginRight: spacing.xs,
  },
  dayLabel: {
    ...typography.body.base,
    color: colors.text.secondary,
    fontWeight: '500',
    minWidth: 40,
  },
  dayLabelToday: {
    color: colors.primary[700],
    fontWeight: '700',
  },
  hoursText: {
    ...typography.body.base,
    color: colors.text.primary,
    fontWeight: '500',
  },
  hoursTextToday: {
    color: colors.primary[600],
    fontWeight: '600',
  },
});
