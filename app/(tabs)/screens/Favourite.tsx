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
      setFavoritesCount: (count: number | ((prevCount: number) => number)) => void;
    };
  };
};

const Favourite: React.FC<FavouriteProps> = ({ route }) => {
  const { favourites: initialFavourites, removeFavourite, setFavoritesCount } = route.params;
  const [favourites, setFavourites] = useState<Service[]>(initialFavourites);
  const navigation = useNavigation();

  const navigateToDetail = (service: Service) => {
    navigation.navigate('DetailScreen' as never, { service } as never);
  };

  const handleRemoveFavourite = (id: string) => {
    removeFavourite(id);
    setFavourites(prevFavourites => prevFavourites.filter(item => item.id !== id));
    if (setFavoritesCount) {
      setFavoritesCount(prevCount => (typeof prevCount === 'number' ? prevCount - 1 : 0));
    }
  };

  const renderItem = ({ item }: { item: Service }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.ImageUrl }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <TouchableOpacity onPress={() => navigateToDetail(item)}>
          <Text style={styles.itemName}>{item.ServiceName}</Text>
          <Text style={styles.itemPrice}>{item.Price.toLocaleString('vi-VN')} ₫</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveFavourite(item.id)}>
          <Icon name="favorite" size={24} color="#ff3d00" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Danh sách yêu thích</Text>
      {favourites.length === 0 ? (
        <Text style={styles.emptyText}>Chưa có sản phẩm nào trong danh sách yêu thích.</Text>
      ) : (
        <FlatList
          data={favourites}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
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
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    height: 100,
    marginBottom: 10,
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
  removeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
});

export default Favourite;