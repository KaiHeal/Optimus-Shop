import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  TextInput, 
  Image, 
  Modal, 
  SafeAreaView, 
  Animated 
} from 'react-native';
import { FIRESTORE_DB } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import CartScreen from './Cart';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Service = {
  id: string;
  Creator: string;
  Price: number;
  ServiceName: string;
  ImageUrl: string;
  Description: string;
};

const AdBanner = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    'https://synottip-cz.com/wp-content/uploads/2022/08/homepage.png',
    'https://th.bing.com/th/id/OIP.8U4WQYhjhrpVAvL1tk8VtQHaCP?w=1199&h=362&rs=1&pid=ImgDetMain',
    'https://img.freepik.com/premium-photo/soccer-player-red-uniform-is-kicking-ball-air_801994-341.jpg',
  ];

  useEffect(() => {
    const changeImage = () => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
    };

    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        changeImage();
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [fadeAnim]);

  return (
    <View style={styles.bannerContainer}>
      <Animated.Image
        source={{ uri: images[currentIndex] }}
        style={[styles.bannerImage, { opacity: fadeAnim }]}
        resizeMode="cover"
      />
    </View>
  );
};

const CustomerListService = ({ navigation, route }: any) => {
  const { username } = route.params || {};
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [cart, setCart] = useState<Service[]>([]);
  const [isCartVisible, setCartVisible] = useState(false);
  const [favourites, setFavourites] = useState<Service[]>([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [userData, setUserData] = useState<{ phone: string; avatarUrl: string }>({ phone: '', avatarUrl: '' });
  const [showGreeting, setShowGreeting] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(FIRESTORE_DB, 'Service'));
        const serviceList: Service[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as Omit<Service, 'id'>,
        }));
        setServices(serviceList);
        setFilteredServices(serviceList);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách dịch vụ:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      const storedData = await AsyncStorage.getItem('userData');
      if (storedData) {
        setUserData(JSON.parse(storedData));
      }
    };
    loadUserData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGreeting(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text) {
      const filteredData = services.filter(service =>
        service.ServiceName.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredServices(filteredData);
    } else {
      setFilteredServices(services);
    }
  };

  const handleCheckout = () => {
    const totalAmount = cart.reduce((total, item) => total + item.Price * (item.Quantity || 1), 0);
    navigation.navigate('CheckoutScreen', {
      cartItems: cart,
      totalAmount,
      onPaymentConfirmed: () => setCart([]),
    });
    setCartVisible(false);
  };

  const handleAddToFavourites = (service: Service) => {
    if (!favourites.some(fav => fav.id === service.id)) {
      setFavourites([...favourites, service]);
      setFavoritesCount(prevCount => prevCount + 1);
      Toast.show({
        text1: 'Đã thêm vào danh sách yêu thích!',
        visibilityTime: 2000,
        position: 'bottom',
        type: 'success',
      });
    } else {
      removeFavourite(service.id);
      setFavoritesCount(prevCount => prevCount - 1);
      Toast.show({
        text1: 'Đã xóa khỏi danh sách yêu thích!',
        visibilityTime: 2000,
        position: 'bottom',
        type: 'info',
      });
    }
  };

  const removeFavourite = (id: string) => {
    setFavourites(prevFavourites => prevFavourites.filter(item => item.id !== id));
  };

  const renderItem = ({ item }: { item: Service }) => {
    const isFavourite = favourites.some(fav => fav.id === item.id);

    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate('DetailScreen', { service: item, cart, setCart })}
          activeOpacity={0.7}
        >
          <TouchableOpacity
            style={styles.heartIconContainer}
            onPress={() => handleAddToFavourites(item)}
          >
            <Icon name={isFavourite ? "favorite" : "favorite-border"} size={24} color={isFavourite ? "#ff3d00" : "#ccc"} />
          </TouchableOpacity>
          <Image source={{ uri: item.ImageUrl }} style={styles.itemImage} />
          <View style={styles.itemDetails}>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.ServiceName}
            </Text>
            <Text style={styles.itemPrice}>{item.Price} ₫</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const groupedServices = filteredServices.reduce<Service[][]>((acc, service, index) => {
    if (index % 2 === 0) {
      acc.push([service]);
    } else {
      acc[acc.length - 1].push(service);
    }
    return acc;
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#000" style={styles.loadingIndicator} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('EditProfileScreen')}>
            <Image
              source={{
                uri: userData.avatarUrl || 'https://th.bing.com/th/id/OIP._prlVvISXU3EfqFW3GF-RwHaHa?w=193&h=193&c=7&r=0&o=5&dpr=1.5&pid=1.7'
              }}
              style={styles.avatar}
            />
          </TouchableOpacity>
          {showGreeting && (
            <Text style={styles.usernameText}>Xin Chào, {username ? username : "Người dùng"}</Text>
          )}
        </View>
        <Text style={styles.logo}>Bumblebee</Text>
        <TouchableOpacity onPress={() => setSidebarVisible(true)}>
          <Icon name="menu" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        {/* Thêm Banner Quảng Cáo */}
        <AdBanner />
        
        <View style={styles.searchContainer}>
          <Icon name="search" size={24} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm"
            value={searchText}
            onChangeText={handleSearch}
            placeholderTextColor="#888"
          />
        </View>
        <Text style={styles.serviceListHeaderText}>Danh sách Sản Phẩm</Text>
        <FlatList
          data={groupedServices}
          renderItem={({ item }) => (
            <View style={styles.row}>
              {item.map(service => renderItem({ item: service }))}
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Icon name="home" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Favourite', { favourites, removeFavourite, setFavoritesCount })}>
          <View style={styles.favouriteIconContainer}>
            <Icon name="favorite" size={24} color="#fff" />
            {favoritesCount > 0 && (
              <Text style={styles.favouriteCountText}>{favoritesCount}</Text>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('EditProfileScreen')}>
          <Icon name="person" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen')}>
          <Icon name="settings" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <CartScreen
        isVisible={isCartVisible}
        cartItems={cart}
        onClose={() => setCartVisible(false)}
        onRemove={(itemId: string) => setCart(cart.filter(item => item.id !== itemId))}
        onCheckout={handleCheckout}
      />

      <Toast />

      <Modal visible={isSidebarVisible} transparent={true} animationType="slide">
        <View style={styles.sidebarContainer}>
          <TouchableOpacity onPress={() => setSidebarVisible(false)} style={styles.overlay} />
          <View style={styles.sidebar}>
            <Text style={styles.sidebarHeader}>Menu</Text>
            <TouchableOpacity onPress={() => { setSidebarVisible(false); navigation.navigate('Home'); }}>
              <Text style={styles.sidebarItem}>Trang chủ</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setSidebarVisible(false); navigation.navigate('Favourite', { favourites, removeFavourite }); }}>
              <Text style={styles.sidebarItem}>Yêu thích</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setSidebarVisible(false); navigation.navigate('EditProfileScreen'); }}>
              <Text style={styles.sidebarItem}>Chỉnh sửa hồ sơ</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setSidebarVisible(false); navigation.navigate('SettingsScreen'); }}>
              <Text style={styles.sidebarItem}>Cài đặt</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    backgroundColor: '#000',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  usernameText: {
    fontSize: 18,
    color: '#fff',
    marginRight: 10,
  },
  content: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    marginHorizontal: 10,
    backgroundColor: '#fff',
  },
  searchInput: {
    flex: 1,
    padding: 10,
    color: '#000',
  },
  searchIcon: {
    padding: 10,
  },
  serviceListHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemContainer: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  item: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  heartIconContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#000',
    marginLeft:100,
  },
  favouriteIconContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  favouriteCountText: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff3d00',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: 5,
    fontSize: 12,
  },
  sidebarContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sidebar: {
    width: 250,
    backgroundColor: '#fff',
    padding: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  sidebarHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sidebarItem: {
    fontSize: 18,
    marginVertical: 10,
  },
  // Styles cho Banner
  bannerContainer: {
    marginBottom: 15,
  },
  bannerImage: {
    width: '100%', // Full width
    height: 150, // Height of the banner
    borderRadius: 10, // Rounded corners
  },
});

export default CustomerListService;