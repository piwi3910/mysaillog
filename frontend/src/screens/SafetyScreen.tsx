import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
  Text,
  Button,
  Surface,
  TextInput,
  List,
  IconButton,
  Portal,
  Modal,
  useTheme,
  MD3Theme,
} from 'react-native-paper';
import {
  SafetyCheck,
  EmergencyContact,
  SafetyStorage,
  EmergencyStorage,
} from '../utils/storage';

export const SafetyScreen: React.FC = () => {
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const [safetyChecks, setSafetyChecks] = useState<SafetyCheck[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showAddCheckModal, setShowAddCheckModal] = useState(false);
  const [selectedVesselId, setSelectedVesselId] = useState<string>('');

  const [newContact, setNewContact] = useState<Omit<EmergencyContact, 'id'>>({
    name: '',
    phone: '',
    email: '',
    role: '',
    priority: 1,
  });

  const [newCheckItem, setNewCheckItem] = useState({
    name: '',
    notes: '',
  });

  useEffect(() => {
    loadSafetyData();
  }, [selectedVesselId]);

  const loadSafetyData = async () => {
    if (selectedVesselId) {
      const checks = await SafetyStorage.getByVessel(selectedVesselId);
      setSafetyChecks(checks);
    }
    const contacts = await EmergencyStorage.getContacts();
    setEmergencyContacts(contacts);
  };

  const handleAddContact = async () => {
    const contact: EmergencyContact = {
      id: Date.now().toString(),
      ...newContact,
    };
    await EmergencyStorage.addContact(contact);
    setEmergencyContacts([...emergencyContacts, contact]);
    setShowAddContactModal(false);
    setNewContact({ name: '', phone: '', email: '', role: '', priority: 1 });
  };

  const handleAddCheckItem = async () => {
    if (!selectedVesselId) return;

    const newCheck: SafetyCheck = {
      id: Date.now().toString(),
      vesselId: selectedVesselId,
      timestamp: Date.now(),
      items: [{
        name: newCheckItem.name,
        checked: false,
        notes: newCheckItem.notes,
      }],
    };

    await SafetyStorage.addCheck(newCheck);
    setSafetyChecks([...safetyChecks, newCheck]);
    setShowAddCheckModal(false);
    setNewCheckItem({ name: '', notes: '' });
  };

  const toggleCheckItem = async (checkId: string, itemIndex: number) => {
    const updatedChecks = safetyChecks.map(check => {
      if (check.id === checkId) {
        const updatedItems = [...check.items];
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          checked: !updatedItems[itemIndex].checked,
        };
        return { ...check, items: updatedItems };
      }
      return check;
    });

    const updatedCheck = updatedChecks.find(check => check.id === checkId);
    if (updatedCheck) {
      await SafetyStorage.updateCheck(updatedCheck);
    }

    setSafetyChecks(updatedChecks);
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.section} elevation={1}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Safety Checklist
        </Text>
        {safetyChecks.map((check) => (
          <Surface key={check.id} style={styles.checklistCard} elevation={1}>
            {check.items.map((item, index) => (
              <List.Item
                key={`${check.id}-${index}`}
                title={item.name}
                description={item.notes}
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon={item.checked ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  />
                )}
                onPress={() => toggleCheckItem(check.id, index)}
              />
            ))}
          </Surface>
        ))}
        <Button
          mode="contained"
          onPress={() => setShowAddCheckModal(true)}
          style={styles.button}
        >
          Add Safety Check Item
        </Button>
      </Surface>

      <Surface style={styles.section} elevation={1}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Emergency Contacts
        </Text>
        {emergencyContacts
          .sort((a, b) => a.priority - b.priority)
          .map((contact) => (
            <Surface key={contact.id} style={styles.contactCard} elevation={1}>
              <Text variant="titleMedium">{contact.name}</Text>
              <Text variant="bodyMedium">{contact.role}</Text>
              <Text variant="bodyMedium">{contact.phone}</Text>
              {contact.email && <Text variant="bodySmall">{contact.email}</Text>}
            </Surface>
          ))}
        <Button
          mode="contained"
          onPress={() => setShowAddContactModal(true)}
          style={styles.button}
        >
          Add Emergency Contact
        </Button>
      </Surface>

      <Portal>
        <Modal
          visible={showAddContactModal}
          onDismiss={() => setShowAddContactModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Surface style={styles.modalSurface} elevation={2}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              Add Emergency Contact
            </Text>
            <TextInput
              label="Name"
              value={newContact.name}
              onChangeText={(text) => setNewContact({ ...newContact, name: text })}
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Phone"
              value={newContact.phone}
              onChangeText={(text) => setNewContact({ ...newContact, phone: text })}
              style={styles.input}
              mode="outlined"
              keyboardType="phone-pad"
            />
            <TextInput
              label="Email"
              value={newContact.email}
              onChangeText={(text) => setNewContact({ ...newContact, email: text })}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
            />
            <TextInput
              label="Role"
              value={newContact.role}
              onChangeText={(text) => setNewContact({ ...newContact, role: text })}
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Priority (1-5)"
              value={newContact.priority.toString()}
              onChangeText={(text) =>
                setNewContact({ ...newContact, priority: parseInt(text) || 1 })
              }
              style={styles.input}
              mode="outlined"
              keyboardType="numeric"
            />
            <Button mode="contained" onPress={handleAddContact} style={styles.button}>
              Add Contact
            </Button>
          </Surface>
        </Modal>

        <Modal
          visible={showAddCheckModal}
          onDismiss={() => setShowAddCheckModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Surface style={styles.modalSurface} elevation={2}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              Add Safety Check Item
            </Text>
            <TextInput
              label="Item Name"
              value={newCheckItem.name}
              onChangeText={(text) => setNewCheckItem({ ...newCheckItem, name: text })}
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Notes"
              value={newCheckItem.notes}
              onChangeText={(text) => setNewCheckItem({ ...newCheckItem, notes: text })}
              style={styles.input}
              mode="outlined"
              multiline
            />
            <Button mode="contained" onPress={handleAddCheckItem} style={styles.button}>
              Add Check Item
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
    checklistCard: {
      marginBottom: 8,
      borderRadius: 8,
    },
    contactCard: {
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

export default SafetyScreen;