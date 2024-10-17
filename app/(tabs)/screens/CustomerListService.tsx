import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Image, Modal, SafeAreaView, Animated } from 'react-native';
import { FIRESTORE_DB } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import CartScreen from './Cart';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Service = {
  Quantity: number;
  id: string;
  Creator: string;
  Price: number;
  ServiceName: string;
  ImageUrl: string;
  Description: string;
};

const AdBanner = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
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
    }, 3000);

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
    let isMounted = true;
    const fetchServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(FIRESTORE_DB, 'Service'));
        if (isMounted) {
          const serviceList: Service[] = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data() as Omit<Service, 'id'>,
          }));
          setServices(serviceList);
          setFilteredServices(serviceList);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách dịch vụ:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchServices();

    return () => {
      isMounted = false;
    };
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
    if (services && services.length > 0) {
      if (text) {
        const filteredData = services.filter(service =>
          service.ServiceName.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredServices(filteredData);
      } else {
        setFilteredServices(services);
      }
    } else {
      setFilteredServices([]);
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
      setFavourites(prevFavourites => [...prevFavourites, service]);
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
    setFavourites(prevFavourites => prevFavourites?.filter(item => item.id !== id) || []);
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
        <Text style={styles.logo}>Optimus</Text>
        <TouchableOpacity onPress={() => setSidebarVisible(true)}>
          <Icon name="menu" size={24} color="#FFB6C1" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
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
        {filteredServices && filteredServices.length > 0 ? (
          <FlatList
            data={groupedServices}
            keyExtractor={(item, index) => `group-${index}`}
            renderItem={({ item, index }) => (
              <View style={styles.row} key={`row-${index}`}>
                {item.map(service => (
                  <View key={service.id} style={styles.columnContainer}>
                    {renderItem({ item: service })}
                  </View>
                ))}
              </View>
            )}
          />
        ) : (
          <Text style={styles.noResultsText}>Không tìm thấy kết quả</Text>
        )}
      </View>
      <View style={styles.bottomNav}>
        
        <TouchableOpacity onPress={() => navigation.navigate('Favourite', { favourites, removeFavourite, setFavoritesCount })}>
          <View style={styles.favouriteIconContainer}>
            <Icon name="favorite" size={24} color="#FFB6C1" />
            {favoritesCount > 0 && (
              <Text style={styles.favouriteCountText}>{favoritesCount}</Text>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('EditProfileScreen')}>
          <Icon name="person" size={24} color="#FFB6C1" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen')}>
          <Icon name="settings" size={24} color="#FFB6C1" />
        </TouchableOpacity>
      </View>

      <CartScreen
        isVisible={isCartVisible}
        cartItems={cart}
        onClose={() => setCartVisible(false)}
        onRemove={(itemId: string) => setCart(cart.filter(item => item.id !== itemId))}
        onCheckout={handleCheckout}
        onUpdateQuantity={(id: string, size: string, newQuantity: number) => {
          // Implement the logic to update quantity here
        }}
        onToggleSelect={(id: string, size: string) => {
          // Implement the logic to toggle select here
        }}
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
    backgroundColor: '#FFB6C1',
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
    color: '#FFB6C1',
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
    backgroundColor: '#FFB6C1',
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
  columnContainer: {
    width: '48%',
  },
  itemContainer: {
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
    alignItems: 'center',
    position: 'relative',
  },
  heartIconContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  itemImage: {
    width: '100%',
    height: 120,
    borderRadius: 5,
    resizeMode: 'cover',
  },
  itemDetails: {
    marginTop: 10,
    alignItems: 'center',
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF0000',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingVertical: 10,
  },
  favouriteIconContainer: {
    position: 'relative',
  },
  favouriteCountText: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF0000',
    color: '#fff',
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  sidebarContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlay: {
    flex: 1,
  },
  sidebar: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sidebarHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sidebarItem: {
    fontSize: 16,
    marginVertical: 10,
  },
  bannerContainer: {
    width: '100%',
    height: 150,
    marginBottom: 20,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  noResultsText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});

export default CustomerListService;