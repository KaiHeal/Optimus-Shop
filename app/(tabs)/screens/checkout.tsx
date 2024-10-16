import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Alert, TextInput } from 'react-native';

type Service = {
  id: string;
  Creator: string;
  Price: number;
  ServiceName: string;
  Quantity?: number;
  Sizes?: string[];
  ImageUrl?: string;
};

type CheckoutScreenProps = {
  route: {
    params: {
      cartItems: Service[];
    };
  };
  navigation: any;
};

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ route, navigation }) => {
  const { cartItems } = route.params;
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Tính tổng tiền dựa trên các sản phẩm trong giỏ hàng
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.Price * (item.Quantity || 1)), 0);
  const finalAmount = totalAmount - discountAmount;

  const handleConfirmPayment = () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Vui lòng chọn phương thức thanh toán!');
      return;
    }

    if (selectedPaymentMethod === 'COD') {
      Alert.alert('Đặt hàng thành công! Cảm ơn bạn đã đặt hàng. Thanh toán khi nhận hàng.');
    } else {
      Alert.alert(selectedPaymentMethod +' Đang thử nghiệm' );
    }
    
    navigation.navigate('CustomerListService', { totalAmount: finalAmount });
  };

  const applyDiscount = () => {
    // Ví dụ mã giảm giá: "DISCOUNT10"
    if (discountCode === 'NAT') {
      setDiscountAmount(20000); // Giảm 10 đơn vị tiền tệ
      Alert.alert('Mã giảm giá áp dụng thành công!');
    } else {
      Alert.alert('Mã giảm giá không hợp lệ!');
    }
    setDiscountCode(''); // Xóa mã sau khi áp dụng
  };

  const renderItem = ({ item }: { item: Service }) => {
    const itemTotal = item.Price * (item.Quantity || 1);

    return (
      <View style={styles.itemContainer}>
        <Image source={{ uri: item.ImageUrl }} style={styles.itemImage} />
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.ServiceName}</Text>
          <Text style={styles.itemPrice}>{item.Price} ₫</Text>
          <Text style={styles.itemQuantity}>Số lượng: {item.Quantity}</Text>
          <Text style={styles.itemSize}>Kích thước: {item.Sizes?.join(', ')}</Text>
          <Text style={styles.itemTotal}>Tổng: {itemTotal.toFixed(2)} ₫</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Xác Nhận Đơn Hàng</Text>
      <Text style={styles.totalText}>Tổng cộng: {totalAmount.toFixed(2)} ₫</Text>
      {discountAmount > 0 && <Text style={styles.discountText}>Giảm giá: {discountAmount} ₫</Text>}
      <Text style={styles.finalText}>Tổng sau giảm giá: {finalAmount.toFixed(2)} ₫</Text>
      <Text style={styles.itemsText}>Sản phẩm:</Text>
      <FlatList
        data={cartItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
      />

      {/* Nhập mã giảm giá */}
      <TextInput
        style={styles.discountInput}
        placeholder="Nhập mã giảm giá"
        value={discountCode}
        onChangeText={setDiscountCode}
      />
      <TouchableOpacity style={styles.applyButton} onPress={applyDiscount}>
        <Text style={styles.applyButtonText}>Áp dụng</Text>
      </TouchableOpacity>

      {/* Phương thức thanh toán */}
      <Text style={styles.paymentTitle}>Chọn phương thức thanh toán:</Text>
      <TouchableOpacity
        style={[styles.paymentOption, selectedPaymentMethod === 'COD' && styles.selectedOption]}
        onPress={() => setSelectedPaymentMethod('COD')}
      >
        <Text style={styles.paymentOptionText}>Thanh toán khi nhận hàng (COD)</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.paymentOption, selectedPaymentMethod === 'CreditCard' && styles.selectedOption]}
        onPress={() => setSelectedPaymentMethod('CreditCard')}
      >
        <Text style={styles.paymentOptionText}>Thẻ tín dụng</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.paymentOption, selectedPaymentMethod === 'PayPal' && styles.selectedOption]}
        onPress={() => setSelectedPaymentMethod('PayPal')}
      >
        <Text style={styles.paymentOptionText}>PayPal</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPayment}>
        <Text style={styles.confirmButtonText}>Xác nhận thanh toán</Text>
      </TouchableOpacity>
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
    marginBottom: 20,
  },
  totalText: {
    fontSize: 18,
    marginBottom: 10,
  },
  discountText: {
    fontSize: 16,
    color: '#E60026',
    marginBottom: 10,
  },
  finalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  itemsText: {
    fontSize: 18,
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  itemQuantity: {
    fontSize: 14,
  },
  itemSize: {
    fontSize: 14,
    color: '#666',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E60026',
  },
  discountInput: {
    borderColor: '#e5e5e5',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
  },
  applyButton: {
    backgroundColor: '#E60026',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  applyButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  paymentTitle: {
    fontSize: 18,
    marginVertical: 10,
  },
  paymentOption: {
    padding: 15,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 5,
    marginVertical: 5,
  },
  selectedOption: {
    borderColor: '#E60026',
  },
  paymentOptionText: {
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#E60026',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CheckoutScreen;