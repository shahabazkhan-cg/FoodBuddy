/**
 * Debug Console Component
 *
 * Floating debug panel for React Native development.
 * Displays real-time logs and allows filtering/exporting.
 *
 * Usage:
 * ```tsx
 * import { DebugConsole } from './components/DebugConsole';
 *
 * // In your app root (usually App.tsx):
 * <DebugConsole />
 * ```
 */

import React, { useState, useMemo } from 'react';
import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, X } from 'lucide-react-native';
import { logger, LogLevel, LogEntry } from '../utils/logger';
import { colors } from '../theme/appTheme';
import { testPokemonAPI, testSSEEndpoint, runNetworkDiagnostics } from '../utils/networkDebug';

export function DebugConsole() {
  const [visible, setVisible] = useState(false);
  const [filter, setFilter] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'ALL'>('ALL');
  const [testLoading, setTestLoading] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const insets = useSafeAreaInsets();

  const allLogs = useMemo(() => logger.getLogs(), [visible]);

  const filtered = useMemo(
    () =>
      allLogs.filter((log) => {
        const levelMatch = selectedLevel === 'ALL' || log.level === selectedLevel;
        const textMatch =
          log.category.toLowerCase().includes(filter.toLowerCase()) ||
          log.message.toLowerCase().includes(filter.toLowerCase());
        return levelMatch && textMatch;
      }),
    [allLogs, filter, selectedLevel],
  );

  const getLevelColor = (level: LogLevel): string => {
    switch (level) {
      case LogLevel.DEBUG:
        return '#888888';
      case LogLevel.INFO:
        return '#3FBF6F';
      case LogLevel.WARN:
        return '#F59E0B';
      case LogLevel.ERROR:
        return '#EF4444';
    }
  };

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setTestLoading(testName);
    try {
      const result = await testFn();
      setTestResults((prev) => ({
        ...prev,
        [testName]: result,
      }));
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        [testName]: { error: error instanceof Error ? error.message : String(error) },
      }));
    } finally {
      setTestLoading(null);
    }
  };

  const renderLogItem = (info: ListRenderItemInfo<LogEntry>): React.ReactElement => {
    const { item } = info;
    const dataStr = item.data ? JSON.stringify(item.data, null, 2) : null;
    return (
      <View style={styles.logEntry}>
        <View style={styles.logMeta}>
          <Text
            style={[
              styles.logLevel,
              { color: getLevelColor(item.level) },
            ]}
          >
            {item.level.padEnd(5)}
          </Text>
          <Text style={styles.logCategory}>{item.category}</Text>
          <Text style={styles.logTime}>{item.timestamp.split('T')[1].split('.')[0]}</Text>
        </View>
        <Text style={styles.logMessage}>{item.message}</Text>
        {dataStr ? (
          <Text style={styles.logData}>{dataStr}</Text>
        ) : null}
      </View>
    );
  };

  const renderTestResult = (result: any, success: boolean) => {
    if (!result) return null;
    const resultColor = success ? '#3FBF6F' : '#EF4444';
    return (
      <View style={[styles.testResult, { borderLeftColor: resultColor }]}>
        <Text style={[styles.testResultTitle, { color: resultColor }]}>
          {success ? '✓' : '✗'} {result.pokemonName || result.statusCode || 'Test'}
        </Text>
        <Text style={styles.testResultText}>
          {result.latency && `${result.latency}ms`}
          {result.error && ` • Error: ${result.error}`}
        </Text>
      </View>
    );
  };

  if (!visible) {
    return (
      <Pressable
        style={[
          styles.fab,
          {
            bottom: insets.bottom + 80, // Position above input bar (54px) + margin (10px) + buffer (16px)
            right: insets.right + 16,
          },
        ]}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.fabLabel}>📋</Text>
      </Pressable>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Debug Console</Text>
            <View style={styles.headerActions}>
              <Pressable
                onPress={() => logger.clear()}
                style={styles.headerBtn}
              >
                <Text style={styles.headerBtnText}>Clear</Text>
              </Pressable>
              <Pressable
                onPress={() => setVisible(false)}
                style={styles.headerBtn}
              >
                <X size={18} color={colors.text} />
              </Pressable>
            </View>
          </View>

          {/* Filter controls */}
          <View style={styles.controls}>
            <TextInput
              value={filter}
              onChangeText={setFilter}
              placeholder="Filter logs…"
              placeholderTextColor={colors.muted}
              style={styles.searchInput}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.levelFilters}>
              {(['ALL', LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR] as const).map(
                (level) => (
                  <Pressable
                    key={level}
                    onPress={() => setSelectedLevel(level)}
                    style={[
                      styles.levelChip,
                      selectedLevel === level && styles.levelChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.levelChipText,
                        selectedLevel === level && styles.levelChipTextActive,
                      ]}
                    >
                      {level}
                    </Text>
                  </Pressable>
                ),
              )}
            </ScrollView>

            {/* Network test buttons */}
            <View style={styles.networkTestButtons}>
              <Pressable
                onPress={() => runTest('pokemon', testPokemonAPI)}
                disabled={testLoading === 'pokemon'}
                style={[styles.testBtn, styles.testBtnPrimary]}
              >
                {testLoading === 'pokemon' ? (
                  <ActivityIndicator size="small" color={colors.text} />
                ) : (
                  <Text style={styles.testBtnText}>🎮 Pokemon</Text>
                )}
              </Pressable>

              <Pressable
                onPress={() => runTest('sse', testSSEEndpoint)}
                disabled={testLoading === 'sse'}
                style={[styles.testBtn, styles.testBtnPrimary]}
              >
                {testLoading === 'sse' ? (
                  <ActivityIndicator size="small" color={colors.text} />
                ) : (
                  <Text style={styles.testBtnText}>🔌 SSE</Text>
                )}
              </Pressable>

              <Pressable
                onPress={() => runTest('diagnostics', runNetworkDiagnostics)}
                disabled={testLoading === 'diagnostics'}
                style={[styles.testBtn, styles.testBtnSecondary]}
              >
                {testLoading === 'diagnostics' ? (
                  <ActivityIndicator size="small" color={colors.text} />
                ) : (
                  <Text style={styles.testBtnText}>📊 Diagnostics</Text>
                )}
              </Pressable>
            </View>

            {/* Test results */}
            {Object.entries(testResults).length > 0 && (
              <View style={styles.testResultsContainer}>
                {testResults.pokemon && renderTestResult(testResults.pokemon, testResults.pokemon.success)}
                {testResults.sse && renderTestResult(testResults.sse, testResults.sse.reachable)}
              </View>
            )}
          </View>

          {/* Log list */}
          <FlatList
            data={filtered}
            keyExtractor={(_, i) => String(i)}
            contentContainerStyle={styles.logList}
            renderItem={renderLogItem}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No logs matching filter</Text>
              </View>
            }
          />

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{filtered.length} of {allLogs.length} logs</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  fabLabel: {
    fontSize: 24,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    marginTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerBtnText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  controls: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 10,
    color: colors.text,
    fontSize: 13,
  },
  levelFilters: {
    flexDirection: 'row',
  },
  levelChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  levelChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  levelChipText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '600',
  },
  levelChipTextActive: {
    color: '#F4FFF8',
  },
  logList: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  logEntry: {
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderLeftWidth: 3,
    borderLeftColor: colors.border,
  },
  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  logLevel: {
    fontWeight: '700',
    fontSize: 11,
    fontFamily: 'Menlo',
  },
  logCategory: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  logTime: {
    color: colors.muted,
    fontSize: 10,
    marginLeft: 'auto',
  },
  logMessage: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  logData: {
    color: colors.muted,
    fontSize: 10,
    fontFamily: 'Menlo',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 6,
    borderRadius: 4,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 13,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  footerText: {
    color: colors.muted,
    fontSize: 12,
  },
  networkTestButtons: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  testBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testBtnPrimary: {
    backgroundColor: 'rgba(63, 191, 111, 0.2)',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  testBtnSecondary: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  testBtnText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  testResultsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  testResult: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderLeftWidth: 3,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  testResultTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  testResultText: {
    fontSize: 11,
    color: colors.muted,
  },
});
