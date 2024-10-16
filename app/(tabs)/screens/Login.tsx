import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { FIRESTORE_DB } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchUsername = async () => {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsedData = JSON.parse(userData);
        setUsername(parsedData.username);
      }
    };

    fetchUsername();
  }, []);

  const handleLogin = async () => {
    if (phone === '' || password === '') {
      setErrorMessage('Vui lòng nhập đầy đủ số điện thoại và mật khẩu');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const q = query(
        collection(FIRESTORE_DB, 'Login'),
        where('phone', '==', phone)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        let isPasswordCorrect = false;

        for (const doc of querySnapshot.docs) {
          const userData = doc.data();
          if (userData.password === password) {
            isPasswordCorrect = true;
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            setUsername(userData.username);
            setSuccessMessage('Đăng nhập thành công!');

            if (userData.role === true) {
              navigation.replace('AdminListService');
            } else {
              navigation.replace('CustomerListService', { username: userData.username });
            }
            break; // Exit loop since we found the correct password
          }
        }

        if (!isPasswordCorrect) {
          setErrorMessage('Mật khẩu không chính xác');
        }
      } else {
        setErrorMessage('Số điện thoại không tồn tại');
      }
    } catch (error) {
      setErrorMessage('Lỗi khi đăng nhập: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://th.bing.com/th/id/OIP.1lJ0x_67PKA8r3N6vqGQAgHaHa?pid=ImgDet&w=178&h=178&c=7&dpr=1.5' }}
        style={styles.avatar}
      />

      {username ? <Text style={styles.usernameText}>Xin chào, {username}!</Text> : null}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Số điện thoại"
          onChangeText={setPhone}
          value={phone}
          keyboardType="phone-pad"
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          onChangeText={setPassword}
          value={password}
          secureTextEntry
        />
      </View>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.loginText}>{loading ? 'Loading...' : 'Đăng Nhập'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.registerText}>Đăng ký tài khoản mới</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.forgotPasswordButton}
        onPress={() => navigation.navigate('ChangePassword')}
      >
        <Text style={styles.forgotPasswordText}>Đổi mật khẩu</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 30,
    backgroundColor: '#f0f0f0',
  },
  usernameText: {
    fontSize: 20,
    marginBottom: 20,
    color: '#000',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 40,
    color: '#000',
  },
  loginButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 5,
    width: '100%',
  },
  loginText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
  },
  errorText: {
    color: 'red',
    marginTop: 20,
  },
  successText: {
    color: 'green',
    marginTop: 20,
  },
  registerButton: {
    marginTop: 20,
  },
  registerText: {
    color: '#000',
    fontSize: 16,
  },
  forgotPasswordButton: {
    marginTop: 20,
  },
  forgotPasswordText: {
    color: '#000',
    fontSize: 16,
  },
});

export default LoginScreen;