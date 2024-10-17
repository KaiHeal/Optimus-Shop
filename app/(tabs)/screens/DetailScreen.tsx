import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Cart from './Cart';
import StarRating from './StarRating';

type Service = {
  id: string;
  Creator: string;
  Price: number;
  ServiceName: string;
  ImageUrl?: string;
  Description?: string;
  Sizes?: string[];
  Quantity?: number;
  selected?: boolean;
  isFavorite?: boolean; // Thêm thuộc tính cho trạng thái yêu thích
};

const DetailScreen = ({ route, navigation }: any) => {
  const { service } = route.params;
  const [cart, setCart] = useState<Service[]>([]);
  const [isCartVisible, setCartVisible] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(service.isFavorite || false); // Khởi tạo trạng thái yêu thích

  const sizes = service.Sizes || ['S', 'M', 'L', 'XL', '2XL', '3XL'];

  useEffect(() => {
    const loadCart = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('@cart');
        if (jsonValue != null) {
          const loadedCart = JSON.parse(jsonValue);
          setCart(loadedCart);
          const totalQuantity = loadedCart.reduce((sum: number, item: Service) => sum + (item.Quantity || 0), 0);
          setCartQuantity(totalQuantity);
        }
      } catch (e) {
        console.error("Không thể tải giỏ hàng:", e);
      }
    };

    loadCart();
  }, []);

  useEffect(() => {
    const saveCart = async () => {
      try {
        const jsonValue = JSON.stringify(cart);
        await AsyncStorage.setItem('@cart', jsonValue);
      } catch (e) {
        console.error("Không thể lưu giỏ hàng:", e);
      }
    };

    saveCart();
  }, [cart]);

  useEffect(() => {
    const saveFavoriteStatus = async () => {
      try {
        await AsyncStorage.setItem(`@favorite_${service.id}`, JSON.stringify(isFavorite));
      } catch (e) {
        console.error("Không thể lưu trạng thái yêu thích:", e);
      }
    };

    saveFavoriteStatus();
  }, [isFavorite]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      Alert.alert('Vui lòng chọn kích thước!');
      return;
    }

    const existingItemIndex = cart.findIndex(item => item.id === service.id && item.Sizes?.includes(selectedSize!));

    if (existingItemIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].Quantity += 1;
      setCart(updatedCart);
      Alert.alert(`${service.ServiceName} kích thước ${selectedSize} đã được cập nhật số lượng thành ${updatedCart[existingItemIndex].Quantity}!`);
    } else {
      const itemToAdd = { 
        ...service, 
        Sizes: [selectedSize], 
        Quantity: 1, 
        selected: false,
      }; 
      setCart(prevCart => [...prevCart, itemToAdd]);
      Alert.alert(`${service.ServiceName} kích thước ${selectedSize} với số lượng 1 đã được thêm vào giỏ hàng!`);
    }

    // Cập nhật số lượng giỏ hàng
    const totalQuantity = cart.reduce((sum, item) => sum + (item.Quantity || 0), 0) + 1;
    setCartQuantity(totalQuantity);
  };

  const handleToggleFavorite = () => {
    setIsFavorite(prevState => !prevState);
    Alert.alert(`Bạn đã ${!isFavorite ? 'thêm vào' : 'xóa khỏi'} danh sách yêu thích!`);
  };

  const handleGoToCart = () => {
    setCartVisible(true);
  };

  const handleRemoveItem = (id: string, size: string) => {
    setCart(prevCart => {
      const updatedCart = prevCart.filter(item => item.id !== id || (item.Sizes && item.Sizes[0] !== size));
      const totalQuantity = updatedCart.reduce((sum, item) => sum + (item.Quantity || 0), 0);
      setCartQuantity(totalQuantity);
      return updatedCart;
    });
    Alert.alert('Sản phẩm đã được xóa khỏi giỏ hàng!');
  };

  const handleCheckout = async () => {
    const selectedItems = cart.filter(item => item.selected);
    navigation.navigate('CheckoutScreen', { cartItems: selectedItems });

    try {
      const updatedCart = cart.filter(item => !item.selected);
      await AsyncStorage.setItem('@cart', JSON.stringify(updatedCart));
      setCart(updatedCart);
      setCartQuantity(updatedCart.reduce((sum, item) => sum + (item.Quantity || 0), 0));
      setCartVisible(false);
    } catch (e) {
      console.error("Không thể xóa giỏ hàng:", e);
    }
  };

  const handleUpdateQuantity = (id: string, size: string, newQuantity: number) => {
    const updatedCart = cart.map(item =>
      item.id === id && item.Sizes?.[0] === size ? { ...item, Quantity: newQuantity } : item
    );
    setCart(updatedCart);
    const totalQuantity = updatedCart.reduce((sum, item) => sum + (item.Quantity || 0), 0);
    setCartQuantity(totalQuantity);
  };

  const handleToggleSelect = (id: string, size: string) => {
    const updatedCart = cart.map(item => {
      if (item.id === id && item.Sizes?.includes(size)) {
        return { ...item, selected: !item.selected };
      }
      return item;
    });
    setCart(updatedCart);
  };

  const handleRatingChange = (rating) => {
    setUserRating(rating);
    Alert.alert(`Bạn đã đánh giá ${rating} sao!`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.cartIcon} onPress={handleGoToCart}>
        <Ionicons name="cart" size={24} color="black" />
        {cartQuantity > 0 && (
          <View style={styles.cartCount}>
            <Text style={styles.cartCountText}>{cartQuantity}</Text>
          </View>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.favoriteIcon} onPress={handleToggleFavorite}>
        <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={isFavorite ? "red" : "black"} />
      </TouchableOpacity>

      <Text style={styles.title}>{service.ServiceName}</Text>
      
      {service.ImageUrl && (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: service.ImageUrl }} 
            style={styles.image} 
            resizeMode="contain"
          />
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.text}>Giá: <Text style={styles.price}>{service.Price} ₫</Text></Text>
        <Text style={styles.text}>Loại: <Text style={styles.creator}>{service.Creator}</Text></Text>
        
        {service.Description && (
          <Text style={styles.description}>{service.Description}</Text>
        )}

        <Text style={styles.text}>Chọn kích thước:</Text>
        <View style={styles.sizeContainer}>
          {sizes.map(size => (
            <TouchableOpacity
              key={size}
              style={[styles.sizeButton, selectedSize === size && styles.selectedSizeButton]}
              onPress={() => setSelectedSize(size)}
            >
              <Text style={[styles.sizeButtonText, selectedSize === size && styles.selectedSizeText]}>{size}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
          <Text style={styles.addButtonText}>Thêm vào giỏ hàng</Text>
        </TouchableOpacity>

        <Text style={styles.text}>Đánh giá:</Text>
        <StarRating rating={userRating} onRatingChange={handleRatingChange} />
      </View>

      <Cart
        isVisible={isCartVisible}
        cartItems={cart}
        onClose={() => setCartVisible(false)}
        onRemove={handleRemoveItem}
        onCheckout={handleCheckout}
        onUpdateQuantity={handleUpdateQuantity}
        onToggleSelect={handleToggleSelect}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  cartIcon: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 1000,
  },
  favoriteIcon: {
    position: 'absolute',
    left: 20,
    top: 20,
    zIndex: 1000,
  },
  cartCount: {
    position: 'absolute',
    right: 0,
    top: -5,
    backgroundColor: '#000000',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartCountText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000000',
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  price: {
    fontWeight: 'bold',
    color: '#E60026',
  },
  creator: {
    fontStyle: 'italic',
  },
  description: {
    fontSize: 14,
    marginTop: 5,
    color: '#666',
  },
  sizeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  sizeButton: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    padding: 10,
  },
  selectedSizeButton: {
    backgroundColor: '#E60026',
  },
  sizeButtonText: {
    color: '#000',
  },
  selectedSizeText: {
    color: '#FFF',
  },
  addButton: {
    backgroundColor: '#E60026',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default DetailScreen;