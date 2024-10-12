import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Image, SafeAreaView } from 'react-native';

type Service = {
  id: string;
  Creator: string;
  Price: number;
  ServiceName: string;
  ImageUrl?: string;
  Sizes?: string[];
  Quantity?: number;
  Description?: string;
  Customizations?: string[];
};

type CartProps = {
  isVisible: boolean;
  cartItems: Service[];
  onClose: () => void;
  onRemove: (id: string, size: string) => void;
  onCheckout: () => void;
  onUpdateQuantity: (id: string, size: string, newQuantity: number) => void;
};

const Cart: React.FC<CartProps> = ({
  isVisible,
  cartItems,
  onClose,
  onRemove,
  onCheckout,
  onUpdateQuantity,
}) => {
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);

  useEffect(() => {
    const amount = cartItems.reduce((total, item) => total + (item.Price * (item.Quantity || 1)), 0);
    setTotalAmount(amount);
    const quantity = cartItems.reduce((sum, item) => sum + (item.Quantity || 0), 0);
    setTotalQuantity(quantity);
  }, [cartItems]);

  const renderItem = ({ item }: { item: Service }) => (
    <View style={styles.cartItem} key={item.id}>
      {item.ImageUrl && (
        <Image source={{ uri: item.ImageUrl }} style={styles.itemImage} />
      )}
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.ServiceName}</Text>
        {item.Sizes && item.Sizes.length > 0 && (
          <Text style={styles.itemSize}>Kích thước: {item.Sizes[0]}</Text>
        )}
        {item.Quantity !== undefined && (
          <View style={styles.quantityContainer}>
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={() => item.Quantity && onUpdateQuantity(item.id, item.Sizes[0], Math.max(1, item.Quantity - 1))}
              disabled={item.Quantity <= 1}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.itemQuantity}>Số lượng: {item.Quantity}</Text>
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={() => onUpdateQuantity(item.id, item.Sizes[0], (item.Quantity || 1) + 1)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
        {item.Description && <Text style={styles.itemDescription}>{item.Description}</Text>}
        {item.Customizations && item.Customizations.length > 0 && (
          <View style={styles.customizationsContainer}>
            <Text style={styles.customizationsTitle}>Tùy chọn:</Text>
            {item.Customizations.map((customization, index) => (
              <Text key={index} style={styles.customizationItem}>{customization}</Text>
            ))}
          </View>
        )}
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.itemPrice}>{(item.Price * (item.Quantity || 1)).toFixed(2)} ₫</Text>
        <TouchableOpacity onPress={() => item.Sizes && onRemove(item.id, item.Sizes[0])}>
          <Text style={styles.removeButton}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal transparent={true} visible={isVisible} animationType="slide">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Giỏ hàng</Text>
          <FlatList
            data={cartItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.listContent}
            style={styles.flatList}
          />
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Tổng: {totalAmount.toFixed(2)} ₫</Text>
            <Text style={styles.totalQuantityText}>Tổng số lượng: {totalQuantity}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.checkoutButton} onPress={onCheckout}>
              <Text style={styles.checkoutButtonText}>Thanh toán</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  itemImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
  },
  itemSize: {
    fontSize: 14,
    color: '#666',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  priceContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 16,
    marginBottom: 10,
  },
  removeButton: {
    color: 'red',
    fontWeight: 'bold',
  },
  totalContainer: {
    marginTop: 10,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalQuantityText: {
    fontSize: 16,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  checkoutButton: {
    backgroundColor: '#E60026',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10, // Khoảng cách giữa nút thanh toán và nút đóng
  },
  checkoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    flex: 1,
  },
  closeButtonText: {
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  customizationsContainer: {
    marginTop: 5,
  },
  customizationsTitle: {
    fontWeight: 'bold',
  },
  customizationItem: {
    fontSize: 14,
    color: '#555',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  quantityButton: {
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 5,
    padding: 5,
    marginHorizontal: 5,
  },
  quantityButtonText: {
    fontSize: 20,
    color: '#000000',
  },
  listContent: {
    paddingBottom: 20,
  },
  flatList: {
    maxHeight: '60%',
  },
});

export default Cart;