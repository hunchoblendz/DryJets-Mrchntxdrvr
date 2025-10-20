import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme/tokens';

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
  status: 'completed' | 'in_progress' | 'pending';
}

interface StatusTimelineProps {
  events: TimelineEvent[];
  currentEventId?: string;
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  events,
  currentEventId,
}) => {
  const getStatusColor = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return colors.success[500];
      case 'in_progress':
        return colors.primary[500];
      case 'pending':
        return colors.background.secondary;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusIcon = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'in_progress':
        return '●';
      case 'pending':
        return '○';
      default:
        return '●';
    }
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Timeline</Text>

      <View style={styles.timeline}>
        {events.map((event, index) => {
          const isLast = index === events.length - 1;
          const isCurrent = event.id === currentEventId;
          const statusColor = getStatusColor(event.status);

          return (
            <View key={event.id} style={styles.eventContainer}>
              {/* Timeline node */}
              <View style={styles.nodeWrapper}>
                <View
                  style={[
                    styles.node,
                    {
                      backgroundColor: statusColor,
                      borderColor: statusColor,
                      borderWidth: event.status === 'in_progress' ? 3 : 2,
                    },
                  ]}
                >
                  <Text style={styles.nodeIcon}>{getStatusIcon(event.status)}</Text>
                </View>

                {/* Connector line */}
                {!isLast && (
                  <View
                    style={[
                      styles.connector,
                      {
                        backgroundColor:
                          event.status === 'completed' || event.status === 'in_progress'
                            ? statusColor
                            : colors.background.secondary,
                      },
                    ]}
                  />
                )}
              </View>

              {/* Event content */}
              <View
                style={[
                  styles.eventContent,
                  isCurrent && styles.eventContentActive,
                ]}
              >
                <View style={styles.eventHeader}>
                  <Text style={styles.eventIcon}>{event.icon}</Text>
                  <View style={styles.eventTitleWrapper}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventTime}>{formatTime(event.timestamp)}</Text>
                  </View>
                </View>

                {event.description && (
                  <Text style={styles.eventDescription}>{event.description}</Text>
                )}

                {isCurrent && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>Currently happening</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  timeline: {
    gap: spacing.md,
  },
  eventContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  nodeWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  node: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.secondary,
  },
  nodeIcon: {
    fontSize: 20,
    color: colors.background.primary,
    fontWeight: '700',
  },
  connector: {
    width: 3,
    flex: 1,
    minHeight: 40,
    borderRadius: 1.5,
    marginTop: spacing.sm,
  },
  eventContent: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    gap: spacing.xs,
  },
  eventContentActive: {
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
    paddingVertical: spacing.md,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  eventIcon: {
    fontSize: 20,
  },
  eventTitleWrapper: {
    flex: 1,
    gap: 2,
  },
  eventTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.text.primary,
  },
  eventTime: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  eventDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 18,
    paddingLeft: spacing.lg,
  },
  currentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.success[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: spacing.xs,
    marginLeft: spacing.lg,
  },
  currentBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.success[700],
    fontWeight: '600',
  },
});
