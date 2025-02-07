import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, IconButton } from 'react-native-paper';
import { CrewMember } from '../types';
import ProfilePicture from './ProfilePicture';

interface CrewListProps {
  crew: CrewMember[];
  onEdit?: (member: CrewMember, index: number) => void;
  onDelete?: (index: number) => void;
  editable?: boolean;
}

export const CrewList: React.FC<CrewListProps> = ({
  crew,
  onEdit,
  onDelete,
  editable = true,
}) => {
  return (
    <View style={styles.container}>
      {crew.map((member, index) => (
        <Surface key={index} style={styles.memberCard} elevation={1}>
          <View style={styles.cardContent}>
            <ProfilePicture
              uri={member.profilePicture}
              size={60}
              editable={false}
            />
            <View style={styles.memberInfo}>
              <Text variant="titleMedium">{member.name}</Text>
              <Text variant="bodyMedium">{member.role}</Text>
            </View>
            {editable && (
              <View style={styles.actions}>
                <IconButton
                  icon="pencil"
                  size={20}
                  onPress={() => onEdit?.(member, index)}
                />
                <IconButton
                  icon="delete"
                  size={20}
                  onPress={() => onDelete?.(index)}
                />
              </View>
            )}
          </View>
        </Surface>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  memberCard: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  actions: {
    flexDirection: 'row',
  },
});

export default CrewList;