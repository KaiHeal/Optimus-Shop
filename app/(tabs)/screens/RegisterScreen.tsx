import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { FIRESTORE_DB } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const Avatar = ({ source }) => {
  return (
    <View style={styles.avatarContainer}>
      <Image source={source} style={styles.avatar} />
    </View>
  );
};

const RegisterScreen = ({ navigation }: any) => {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // New state for confirmation password
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarSource, setAvatarSource] = useState({ uri: 'https://example.com/default-avatar.jpg' });

  const handleRegister = async () => {
    if (username === '' || phone === '' || password === '' || confirmPassword === '') {
      setErrorMessage('Vui lòng nhập tên người dùng, số điện thoại, mật khẩu và xác nhận mật khẩu');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu và xác nhận mật khẩu không khớp');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const newUser = {
        username: username,
        phone: phone,
        password: password,
        avatar: avatarSource.uri,
        role: false,
      };

      await addDoc(collection(FIRESTORE_DB, 'Login'), newUser);
      setErrorMessage('Đăng ký thành công');
      navigation.replace('Login');
    } catch (error: any) {
      setErrorMessage('Lỗi khi đăng ký: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng Ký</Text>
      <View style={{ flex: 0, justifyContent: 'center', alignItems: 'center' }}>
        <Avatar source={{ uri: 'https://th.bing.com/th/id/OIP.1lJ0x_67PKA8r3N6vqGQAgHaHa?pid=ImgDet&w=178&h=178&c=7&dpr=1.5' }} />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Tên người dùng"
        onChangeText={setUsername}
        value={username}
      />
      <TextInput
        style={styles.input}
        placeholder="Số điện thoại"
        onChangeText={setPhone}
        value={phone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />
      <TextInput
        style={styles.input}
        placeholder="Xác nhận mật khẩu" // New input for confirming password
        secureTextEntry
        onChangeText={setConfirmPassword}
        value={confirmPassword}
      />
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <TouchableOpacity 
        style={styles.registerButton} 
        onPress={handleRegister} 
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.registerText}>Đăng Ký</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginText}>Đã có tài khoản? Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#F08080',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    paddingLeft: 8,
    borderRadius: 5,
  },
  registerButton: {
    backgroundColor: '#F08080',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  registerText: {
    color: 'white',
    fontSize: 18,
  },
  errorText: {
    color: 'red',
    marginTop: 20,
  },
  loginText: {
    marginTop: 20,
    color: '#007BFF',
  },
});

export default RegisterScreen;