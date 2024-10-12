import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/Login';
import AdminListScreen from './screens/AdminListService';
import CustomerListScreen from './screens/CustomerListService';
import DetailScreen from './screens/DetailScreen';  // Import DetailScreen
import SettingsScreen from './screens/SettingsScreen';
import AdminDetailScreen from './screens/AdminDetailScreen';
import UpdateScreen from './screens/UpdateScreen';
import CustomerScreen from './screens/Customer';
import RegisterScreen from './screens/RegisterScreen';
import ChangePasswordScreen from './screens/ChangePassword';
import Favourite from './screens/Favourite';
import CheckoutScreen from './screens/checkout'; // Import CheckoutScreen
import Cart from './screens/Cart';
import EditProfileScreen from './screens/EditProfileScreen';
const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="AdminListService" component={AdminListScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CustomerListService" component={CustomerListScreen} options={{ headerShown: false }} />
        <Stack.Screen name="DetailScreen" component={DetailScreen} options={{ title: 'Service Details' }} />
        <Stack.Screen name="AdminDetailScreen" component={AdminDetailScreen} options={{ title: 'Service Details' }} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
        <Stack.Screen name="Customer" component={CustomerScreen} />
        <Stack.Screen name="UpdateScreen" component={UpdateScreen} />
        <Stack.Screen name="Favourite" component={Favourite} />
        <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} options={{ title: 'Đặt hàng' }} />
        <Stack.Screen name="Cart" component={Cart} />
        <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
