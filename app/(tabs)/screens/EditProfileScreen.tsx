import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIRESTORE_DB } from '../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';

const EditProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({
    phone: '',
    password: '',
    name: '',
    avatarUrl: '',
    username: '', // Thêm trường username
  });

  useEffect(() => {
    const loadUserData = async () => {
      const storedData = await AsyncStorage.getItem('userData');
      if (storedData) {
        setUserData(JSON.parse(storedData));
      }
    };
    loadUserData();
  }, []);

  const pickImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (!result.didCancel && result.assets) {
      const imageUri = result.assets[0].uri;
      setUserData((prev) => ({ ...prev, avatarUrl: imageUri }));
    }
  };

  const handleSave = async () => {
    try {
      const userDocRef = doc(FIRESTORE_DB, 'Login', userData.phone);
      await updateDoc(userDocRef, {
        password: userData.password,
        name: userData.name,
        avatarUrl: userData.avatarUrl,
        username: userData.username, // Cập nhật tên người dùng
      });

      // Cập nhật dữ liệu người dùng vào AsyncStorage
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      Alert.alert('Thông báo', 'Cập nhật thành công!');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chỉnh sửa thông tin</Text>
      <TouchableOpacity onPress={pickImage}>
        {userData.avatarUrl ? (
          <Image source={{ uri: userData.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder} />
        )}
      </TouchableOpacity>
      
      <TextInput
        style={styles.input}
        placeholder="Tên người dùng"
        value={userData.username} // Hiển thị tên người dùng ở đây
onChangeText={(text) => setUserData({ ...userData, username: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Số điện thoại"
        value={userData.phone}
        onChangeText={(text) => setUserData({ ...userData, phone: text })}
        editable={true}
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        value={userData.password}
        onChangeText={(text) => setUserData({ ...userData, password: text })}
        secureTextEntry
      />
      
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Lưu</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 15 },
  saveButton: { backgroundColor: '#000', padding: 15, borderRadius: 5, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: 18 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 15 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#ccc', marginBottom: 15 },
});

export default EditProfileScreen;