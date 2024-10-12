import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, Switch } from 'react-native';
import { FIRESTORE_DB } from '../firebaseConfig';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

type Customer = {
  id: string;
  phone: string;
  password: string;
  role: boolean;
};

const CustomerScreen = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(false);
  const [editId, setEditId] = useState<string | null>(null); // Biến để lưu id của customer đang chỉnh sửa

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const querySnapshot = await getDocs(collection(FIRESTORE_DB, 'Login'));
      const customerList: Customer[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Customer[];
      setCustomers(customerList);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const addCustomer = async () => {
    if (!phone || !password) {
      Alert.alert('Please enter all details');
      return;
    }

    try {
      const newCustomer = {
        phone,
        password,
        role,
      };

      if (editId) {
        // Cập nhật thông tin khách hàng nếu đang ở chế độ chỉnh sửa
        const customerDoc = doc(FIRESTORE_DB, 'Login', editId);
        await updateDoc(customerDoc, newCustomer);
        setEditId(null);
      } else {
        // Thêm khách hàng mới
        await addDoc(collection(FIRESTORE_DB, 'Login'), newCustomer);
      }

      fetchCustomers();
      setPhone('');
      setPassword('');
      setRole(false);
    } catch (error) {
      console.error('Error adding/updating customer:', error);
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      await deleteDoc(doc(FIRESTORE_DB, 'Login', id));
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const editCustomer = (customer: Customer) => {
    setPhone(customer.phone);
    setPassword(customer.password);
    setRole(customer.role);
    setEditId(customer.id);
  };

  const renderItem = ({ item }: { item: Customer }) => (
    <View style={styles.customerItem}>
      <View style={styles.customerInfo}>
        <Text style={styles.customerText}>Phone: {item.phone}</Text>
        <Text style={styles.customerText}>Password: {item.password}</Text>
        <Text style={styles.customerText}>Role: {item.role ? 'Admin' : 'User'}</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.editButton} onPress={() => editCustomer(item)}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteCustomer(item.id)}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customer Management</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <View style={styles.roleContainer}>
        <Text style={styles.roleText}>{role ? 'Admin' : 'User'}</Text>
        <Switch value={role} onValueChange={setRole} />
      </View>

      <TouchableOpacity style={styles.addButton} onPress={addCustomer}>
        <Text style={styles.buttonText}>{editId ? 'Update Customer' : 'Add Customer'}</Text>
      </TouchableOpacity>

      <FlatList
        data={customers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F7F7F7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  roleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  editButton: {
    backgroundColor: '#FF9800',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  customerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#FFF',
    borderRadius: 5,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  customerInfo: {
    flex: 1,
  },
  customerText: {
    fontSize: 16,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default CustomerScreen;
