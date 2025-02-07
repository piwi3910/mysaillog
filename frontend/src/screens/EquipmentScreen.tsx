import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
  Text,
  Button,
  Surface,
  TextInput,
  List,
  Portal,
  Modal,
  useTheme,
  MD3Theme,
  Chip,
} from 'react-native-paper';
import {
  Equipment,
  MaintenanceLog,
  EquipmentStorage,
  MaintenanceStorage,
} from '../utils/storage';
import { timestampToDate } from '../types';

export const EquipmentScreen: React.FC = () => {
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);
  const [showAddMaintenanceModal, setShowAddMaintenanceModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  const [newEquipment, setNewEquipment] = useState<Omit<Equipment, 'id'>>({
    name: '',
    type: '',
    lastMaintenance: Date.now(),
    nextMaintenance: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90 days from now
    notes: '',
  });

  const [newMaintenance, setNewMaintenance] = useState<Omit<MaintenanceLog, 'id' | 'equipmentId'>>({
    timestamp: Date.now(),
    type: 'routine',
    description: '',
    cost: 0,
    nextDue: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90 days from now
  });

  useEffect(() => {
    loadEquipmentData();
  }, []);

  const loadEquipmentData = async () => {
    const equipmentList = await EquipmentStorage.getAll();
    setEquipment(equipmentList);
    const logs = await MaintenanceStorage.getLogs();
    setMaintenanceLogs(logs);
  };

  const handleAddEquipment = async () => {
    const equipmentItem: Equipment = {
      id: Date.now().toString(),
      ...newEquipment,
    };
    await EquipmentStorage.add(equipmentItem);
    setEquipment([...equipment, equipmentItem]);
    setShowAddEquipmentModal(false);
    setNewEquipment({
      name: '',
      type: '',
      lastMaintenance: Date.now(),
      nextMaintenance: Date.now() + 90 * 24 * 60 * 60 * 1000,
      notes: '',
    });
  };

  const handleAddMaintenance = async () => {
    if (!selectedEquipment) return;

    const maintenanceLog: MaintenanceLog = {
      id: Date.now().toString(),
      equipmentId: selectedEquipment.id,
      ...newMaintenance,
    };

    await MaintenanceStorage.addLog(maintenanceLog);
    setMaintenanceLogs([...maintenanceLogs, maintenanceLog]);

    // Update equipment's last maintenance date
    const updatedEquipment: Equipment = {
      ...selectedEquipment,
      lastMaintenance: maintenanceLog.timestamp,
      nextMaintenance: maintenanceLog.nextDue,
    };
    await EquipmentStorage.update(updatedEquipment);
    setEquipment(equipment.map(eq => 
      eq.id === updatedEquipment.id ? updatedEquipment : eq
    ));

    setShowAddMaintenanceModal(false);
    setNewMaintenance({
      timestamp: Date.now(),
      type: 'routine',
      description: '',
      cost: 0,
      nextDue: Date.now() + 90 * 24 * 60 * 60 * 1000,
    });
  };

  const getMaintenanceStatus = (equipment: Equipment) => {
    const now = Date.now();
    const daysUntilDue = Math.ceil((equipment.nextMaintenance - now) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) {
      return { label: 'Overdue', color: theme.colors.error };
    } else if (daysUntilDue < 7) {
      return { label: 'Due Soon', color: theme.colors.warning };
    } else {
      return { label: `Due in ${daysUntilDue} days`, color: theme.colors.primary };
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.section} elevation={1}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Equipment Inventory
        </Text>
        {equipment.map((item) => {
          const status = getMaintenanceStatus(item);
          return (
            <Surface key={item.id} style={styles.equipmentCard} elevation={1}>
              <View style={styles.equipmentHeader}>
                <View>
                  <Text variant="titleMedium">{item.name}</Text>
                  <Text variant="bodyMedium">{item.type}</Text>
                </View>
                <Chip
                  mode="flat"
                  textStyle={{ color: theme.colors.surface }}
                  style={{ backgroundColor: status.color }}
                >
                  {status.label}
                </Chip>
              </View>
              <Text variant="bodySmall">
                Last Maintenance: {timestampToDate(item.lastMaintenance).toLocaleDateString()}
              </Text>
              <Text variant="bodySmall">
                Next Due: {timestampToDate(item.nextMaintenance).toLocaleDateString()}
              </Text>
              {item.notes && <Text variant="bodySmall">Notes: {item.notes}</Text>}
              <Button
                mode="outlined"
                onPress={() => {
                  setSelectedEquipment(item);
                  setShowAddMaintenanceModal(true);
                }}
                style={styles.button}
              >
                Log Maintenance
              </Button>
            </Surface>
          );
        })}
        <Button
          mode="contained"
          onPress={() => setShowAddEquipmentModal(true)}
          style={styles.button}
        >
          Add Equipment
        </Button>
      </Surface>

      <Surface style={styles.section} elevation={1}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Maintenance History
        </Text>
        {maintenanceLogs
          .sort((a, b) => b.timestamp - a.timestamp)
          .map((log) => {
            const relatedEquipment = equipment.find(eq => eq.id === log.equipmentId);
            return (
              <Surface key={log.id} style={styles.maintenanceCard} elevation={1}>
                <Text variant="titleMedium">
                  {relatedEquipment?.name || 'Unknown Equipment'}
                </Text>
                <Text variant="bodyMedium">
                  {timestampToDate(log.timestamp).toLocaleDateString()}
                </Text>
                <Text variant="bodyMedium">Type: {log.type}</Text>
                <Text variant="bodyMedium">Description: {log.description}</Text>
                {log.cost > 0 && (
                  <Text variant="bodyMedium">Cost: ${log.cost.toFixed(2)}</Text>
                )}
              </Surface>
            );
          })}
      </Surface>

      <Portal>
        <Modal
          visible={showAddEquipmentModal}
          onDismiss={() => setShowAddEquipmentModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Surface style={styles.modalSurface} elevation={2}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              Add Equipment
            </Text>
            <TextInput
              label="Name"
              value={newEquipment.name}
              onChangeText={(text) => setNewEquipment({ ...newEquipment, name: text })}
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Type"
              value={newEquipment.type}
              onChangeText={(text) => setNewEquipment({ ...newEquipment, type: text })}
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Notes"
              value={newEquipment.notes}
              onChangeText={(text) => setNewEquipment({ ...newEquipment, notes: text })}
              style={styles.input}
              mode="outlined"
              multiline
            />
            <Button mode="contained" onPress={handleAddEquipment} style={styles.button}>
              Add Equipment
            </Button>
          </Surface>
        </Modal>

        <Modal
          visible={showAddMaintenanceModal}
          onDismiss={() => setShowAddMaintenanceModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Surface style={styles.modalSurface} elevation={2}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              Log Maintenance
            </Text>
            <List.Item
              title={selectedEquipment?.name || ''}
              description={selectedEquipment?.type || ''}
            />
            <TextInput
              label="Description"
              value={newMaintenance.description}
              onChangeText={(text) =>
                setNewMaintenance({ ...newMaintenance, description: text })
              }
              style={styles.input}
              mode="outlined"
              multiline
            />
            <TextInput
              label="Cost"
              value={newMaintenance.cost.toString()}
              onChangeText={(text) =>
                setNewMaintenance({ ...newMaintenance, cost: parseFloat(text) || 0 })
              }
              style={styles.input}
              mode="outlined"
              keyboardType="numeric"
            />
            <Button mode="contained" onPress={handleAddMaintenance} style={styles.button}>
              Log Maintenance
            </Button>
          </Surface>
        </Modal>
      </Portal>
    </ScrollView>
  );
};

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    section: {
      padding: 16,
      marginBottom: 16,
      borderRadius: 8,
    },
    sectionTitle: {
      marginBottom: 16,
      textAlign: 'center',
    },
    equipmentCard: {
      padding: 16,
      marginBottom: 8,
      borderRadius: 8,
    },
    equipmentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    maintenanceCard: {
      padding: 16,
      marginBottom: 8,
      borderRadius: 8,
    },
    button: {
      marginTop: 8,
    },
    modalContent: {
      padding: 20,
    },
    modalSurface: {
      padding: 20,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
    },
    modalTitle: {
      marginBottom: 16,
      textAlign: 'center',
    },
    input: {
      marginBottom: 12,
    },
  });

export default EquipmentScreen;