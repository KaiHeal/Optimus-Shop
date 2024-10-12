import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal, Alert } from 'react-native';
import { FIRESTORE_DB } from '../firebaseConfig';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';

const AdminDetailScreen = ({ route, navigation }: any) => {
  const { service } = route.params;
  const [serviceName, setServiceName] = useState(service.ServiceName);
  const [price, setPrice] = useState(service.Price);
  const [creator, setCreator] = useState(service.Creator);
  const [isModalVisible, setModalVisible] = useState(false);

  const handleUpdate = async () => {
    if (!serviceName || price <= 0 || !creator) {
      Alert.alert('Error', 'Please enter valid service details.');
      return;
    }

    try {
      const serviceRef = doc(FIRESTORE_DB, 'Service', service.id);
      await updateDoc(serviceRef, {
        ServiceName: serviceName,
        Price: price,
        Creator: creator,
      });
      Alert.alert('Success', 'Service updated successfully.');
      navigation.navigate('AdminListService', { refresh: true });
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update service: ' + error.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(FIRESTORE_DB, 'Service', service.id));
      Alert.alert("Success", "Service has been deleted.");
      navigation.navigate('AdminListService', { refresh: true });
    } catch (error: any) {
      Alert.alert("Error", "An error occurred while deleting the service: " + error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Service Details</Text>
      <View style={styles.infoContainer}>
        <TextInput
          style={styles.input}
          placeholder="Service Name"
          value={serviceName}
          onChangeText={setServiceName}
        />
        <TextInput
          style={styles.input}
          placeholder="Price"
          value={String(price)}
          onChangeText={(text) => setPrice(Number(text))}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Creator's Name"
          value={creator}
          onChangeText={setCreator}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
          <Text style={styles.buttonText}>Update Service</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>Delete Service</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
        <Text style={styles.buttonText}>Close</Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Deletion</Text>
            <Text>Are you sure you want to delete this service?</Text>
            <TouchableOpacity style={styles.confirmButton} onPress={handleDelete}>
              <Text style={styles.buttonText}>Yes, Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F7F7F7',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#E60026',
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  updateButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    padding: 15,
    borderRadius: 5,
    flex: 1,
  },
  closeButton: {
    backgroundColor: '#E5E5E5',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#F44336',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#E5E5E5',
    padding: 15,
    borderRadius: 5,
  },
});

export default AdminDetailScreen;
