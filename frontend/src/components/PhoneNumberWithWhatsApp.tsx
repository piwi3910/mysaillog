import React from 'react';
import { View, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { List, IconButton, useTheme } from 'react-native-paper';

interface PhoneNumberWithWhatsAppProps {
  phoneNumber: string;
  title?: string;
}

export default function PhoneNumberWithWhatsApp({ phoneNumber, title = "Phone" }: PhoneNumberWithWhatsAppProps) {
  const theme = useTheme();

  // Format phone number to international format (remove spaces, dashes, etc.)
  const formatPhoneNumber = (number: string) => {
    return number.replace(/[\s-]/g, '');
  };

  const openWhatsApp = async () => {
    const formattedNumber = formatPhoneNumber(phoneNumber);
    const whatsappUrl = `whatsapp://send?phone=${formattedNumber}`;
    
    try {
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        // If WhatsApp is not installed, try web version
        await Linking.openURL(`https://wa.me/${formattedNumber}`);
      }
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
    }
  };

  return (
    <List.Item
      title={title}
      description={phoneNumber}
      left={props => <List.Icon {...props} icon="phone" />}
      right={props => (
        <IconButton
          {...props}
          icon="whatsapp"
          iconColor={theme.colors.primary}
          onPress={openWhatsApp}
          style={styles.whatsappIcon}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  whatsappIcon: {
    margin: 0,
  },
});