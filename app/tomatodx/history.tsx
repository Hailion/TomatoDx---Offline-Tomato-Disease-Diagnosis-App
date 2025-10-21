// history.tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Easing,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const mock = [
  { 
    id: '1', 
    disease: 'Early Blight', 
    date: '2025-10-01',
    confidence: 0.92,
    severity: 'High',
    image: '🌱'
  },
  { 
    id: '2', 
    disease: 'Healthy', 
    date: '2025-10-10',
    confidence: 0.88,
    severity: 'None',
    image: '✅'
  },
  { 
    id: '3', 
    disease: 'Late Blight', 
    date: '2025-10-15',
    confidence: 0.95,
    severity: 'Critical',
    image: '⚠️'
  },
  { 
    id: '4', 
    disease: 'Bacterial Spot', 
    date: '2025-10-20',
    confidence: 0.78,
    severity: 'Medium',
    image: '🦠'
  }
];

export default function HistoryScreen() {
  useTranslation();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpHeader = useRef(new Animated.Value(30)).current;
  const slideUpList = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
    Animated.sequence([
      // Fade in background
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // Header animation
      Animated.parallel([
        Animated.timing(slideUpHeader, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.back(1)),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.elastic(1),
          useNativeDriver: true,
        })
      ]),
      // List animation
      Animated.timing(slideUpList, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, scaleAnim, slideUpHeader, slideUpList]);

  const handleItemPress = (itemId: string) => {
    // Button press animation feedback
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.99,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.push(`/tomatodx/result?id=${itemId}`);
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#65a30d';
      default: return '#16a34a';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'warning';
      case 'high': return 'alert-circle';
      case 'medium': return 'information-circle';
      case 'low': return 'checkmark-circle';
      default: return 'leaf';
    }
  };

  // Extracted list item into a proper component so hooks are used in a component
  const HistoryListItem = ({ item, index }: { item: any; index: number }) => {
    // keep ref object stable to avoid hook dependency issues
    const itemAnimRef = useRef(new Animated.Value(0));

    useEffect(() => {
      Animated.timing(itemAnimRef.current, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }, [index]);

    return (
      <Animated.View
        style={{
          opacity: itemAnimRef.current,
          transform: [
            {
              translateY: itemAnimRef.current.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        }}
      >
        <TouchableOpacity
          style={styles.historyItem}
          onPress={() => handleItemPress(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.itemLeft}>
            <View style={styles.imageContainer}>
              <Text style={styles.itemImage}>{item.image}</Text>
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.diseaseName}>{item.disease}</Text>
              <Text style={styles.date}>{item.date}</Text>
              <View style={styles.confidenceContainer}>
                <View style={styles.confidenceBar}>
                  <View 
                    style={[
                      styles.confidenceFill,
                      { 
                        width: `${item.confidence * 100}%`,
                        backgroundColor: getSeverityColor(item.severity)
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.confidenceText}>
                  {Math.round(item.confidence * 100)}%
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.itemRight}>
            <View 
              style={[
                styles.severityBadge,
                { backgroundColor: getSeverityColor(item.severity) + '20' }
              ]}
            >
              <Ionicons 
                name={getSeverityIcon(item.severity) as any} 
                size={16} 
                color={getSeverityColor(item.severity)} 
              />
              <Text 
                style={[
                  styles.severityText,
                  { color: getSeverityColor(item.severity) }
                ]}
              >
                {item.severity}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background Elements */}
      <Animated.View style={[styles.backgroundCircle, styles.circle1, { opacity: fadeAnim }]} />
      <Animated.View style={[styles.backgroundCircle, styles.circle2, { opacity: fadeAnim }]} />
      
      {/* Header */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideUpHeader },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>📋 Scan History</Text>
            <Text style={styles.subtitle}>
              {mock.length} recent tomato disease detections
            </Text>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{mock.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* History List */}
      <Animated.View 
        style={[
          styles.listContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpList }]
          }
        ]}
      >
        {mock.length > 0 ? (
          <FlatList
            data={mock}
            keyExtractor={i => i.id}
            renderItem={({ item, index }) => (
              <HistoryListItem item={item} index={index} />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No Scan History</Text>
            <Text style={styles.emptyText}>
              Your tomato disease detection history will appear here
            </Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fffc',
  },
  // Background elements
  backgroundCircle: {
    position: 'absolute',
    borderRadius: 500,
  },
  circle1: {
    width: 200,
    height: 200,
    top: -80,
    right: -80,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: -50,
    left: -50,
    backgroundColor: 'rgba(134, 239, 172, 0.05)',
  },
  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
  },
  title: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: '#166534',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  statsContainer: {
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#166534',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  // List
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 8,
  },
  // History Item
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginVertical: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  itemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#dcfce7',
  },
  itemImage: {
    fontSize: 20,
  },
  itemInfo: {
    flex: 1,
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confidenceBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 3,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    minWidth: 30,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 20,
  },
});