import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FIRESTORE_DB } from '../firebaseConfig';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

const ChangePasswordScreen = ({ navigation }: any) => {
  const [phone, setPhone] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Thay đổi mật khẩu
  const changePassword = async () => {
    if (phone === '' || oldPassword === '' || newPassword === '') {
      setErrorMessage('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      // Kiểm tra người dùng trong Firestore
      const q = query(collection(FIRESTORE_DB, 'Login'), where('phone', '==', phone));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        // Kiểm tra mật khẩu cũ
        if (userData.password === oldPassword) {
          const userRef = doc(FIRESTORE_DB, 'Login', userDoc.id);

          // Cập nhật mật khẩu mới
          await updateDoc(userRef, {
            password: newPassword,
          });
          alert('Mật khẩu đã thay đổi thành công');
          navigation.navigate('Login');
        } else {
          setErrorMessage('Mật khẩu cũ không chính xác');
        }
      } else {
        setErrorMessage('Số điện thoại không tồn tại');
      }
    } catch (error) {
      console.error('Lỗi khi thay đổi mật khẩu:', error);
      setErrorMessage('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nhập số điện thoại"
        onChangeText={setPhone}
        value={phone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Nhập mật khẩu cũ"
        onChangeText={setOldPassword}
        value={oldPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Nhập mật khẩu mới"
        onChangeText={setNewPassword}
        value={newPassword}
        secureTextEntry
      />
      {/* Hiển thị lỗi nếu có */}
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={changePassword}>
        <Text style={styles.buttonText}>Thay đổi mật khẩu</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#F08080',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginTop: 20,
  },
});

export default ChangePasswordScreen;
