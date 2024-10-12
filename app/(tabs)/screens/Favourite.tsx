import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

type Service = {
  id: string;
  Creator: string;
  Price: number;
  ServiceName: string;
  ImageUrl: string;
};

type FavouriteProps = {
  route: {
    params: {
      favourites: Service[];
      removeFavourite: (id: string) => void;
    };
  };
};

const Favourite: React.FC<FavouriteProps> = ({ route }) => {
  const { favourites: initialFavourites, removeFavourite } = route.params;
  const [favourites, setFavourites] = useState<Service[]>(initialFavourites);
  const navigation = useNavigation();

  const navigateToDetail = (service: Service) => {
    navigation.navigate('DetailScreen', { service });
  };

  const handleRemoveFavourite = (id: string) => {
    removeFavourite(id);  // Gọi hàm xóa từ props
    setFavourites(prevFavourites => prevFavourites.filter(item => item.id !== id)); // Cập nhật danh sách yêu thích
  };

  const renderItem = ({ item }: { item: Service }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.ImageUrl }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <TouchableOpacity onPress={() => navigateToDetail(item)}>
          <Text style={styles.itemName}>{item.ServiceName}</Text>
          <Text style={styles.itemPrice}>{item.Price} ₫</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveFavourite(item.id)}>
          <Icon name="favorite" size={24} color="#ff3d00" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRow = ({ item }: { item: Service[] }) => (
    <View style={styles.rowContainer}>
      {item.map((service) => (
        <View key={service.id} style={styles.column}>
          {renderItem({ item: service })}
        </View>
      ))}
    </View>
  );

  const groupedFavourites = [];
  for (let i = 0; i < favourites.length; i += 2) {
    groupedFavourites.push(favourites.slice(i, i + 2));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Danh sách yêu thích</Text>
      {favourites.length === 0 ? (
        <Text style={styles.emptyText}>Chưa có sản phẩm nào trong danh sách yêu thích.</Text>
      ) : (
        <FlatList
          data={groupedFavourites}
          renderItem={renderRow}
          keyExtractor={(item) => item[0].id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  column: {
    flex: 1,
    marginRight: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
  },
});

export default Favourite;