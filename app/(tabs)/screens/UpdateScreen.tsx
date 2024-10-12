import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { FIRESTORE_DB } from '../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

const UpdateScreen = ({ route, navigation }: any) => {
  const { service } = route.params; // Get service information from params

  // State variables for the input fields
  const [serviceName, setServiceName] = useState(service.ServiceName);
  const [price, setPrice] = useState(service.Price.toString());
  const [creator, setCreator] = useState(service.Creator);

  const handleUpdate = async () => {
    if (!serviceName || !price || !creator) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    try {
      const serviceRef = doc(FIRESTORE_DB, 'Service', service.id);
      await updateDoc(serviceRef, {
        ServiceName: serviceName,
        Price: parseFloat(price),
        Creator: creator,
      });
      Alert.alert("Thành công", "Thông tin dịch vụ đã được cập nhật.");
      navigation.goBack(); // Quay lại màn hình trước đó
    } catch (error:any) {
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi cập nhật dịch vụ: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cập nhật dịch vụ</Text>
      <TextInput
        style={styles.input}
        placeholder="Tên dịch vụ"
        value={serviceName}
        onChangeText={setServiceName}
      />
      <TextInput
        style={styles.input}
        placeholder="Giá"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Người tạo"
        value={creator}
        onChangeText={setCreator}
      />
      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Lưu</Text>
      </TouchableOpacity>
    </View>
  );
};

// Define styles
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
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default UpdateScreen;
