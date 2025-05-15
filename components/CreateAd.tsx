import React, { useState, useRef } from 'react';
import { OPENAI_API_KEY } from '../config/openaiConfig';
import { styles } from './CreateAd.styles';
import {
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  View,
  Dimensions,
  Alert,
} from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SelectList } from 'react-native-dropdown-select-list';

const CreateAd = () => {
  // Основні дані товару
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [category, setCategory] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  
  // Контактні дані
  const [contactName, setContactName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  
  // Додаткові характеристики
  const [availability, setAvailability] = useState('in_stock'); // in_stock або to_order
  const [characteristics, setCharacteristics] = useState('');
  const [searchKeywords, setSearchKeywords] = useState('');
  
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Дані для випадаючих списків
  const categories = [
    { key: 'electronics', value: 'Електроніка' },
    { key: 'clothing', value: 'Одяг' },
    { key: 'furniture', value: 'Меблі' },
    { key: 'sports', value: 'Спорт і відпочинок' },
    { key: 'home', value: 'Дім і сад' },
  ];

  const conditions = [
    { key: 'new', value: 'Новий' },
    { key: 'used', value: 'Б/в' },
  ];

  const availabilityOptions = [
    { key: 'in_stock', value: 'В наявності' },
    { key: 'to_order', value: 'Під замовлення' },
  ];

  const isFormValid = () => {
    // Перевірка обов'язкових полів
    if (!title.trim()) return false;
    if (!price.trim()) return false;
    if (!condition) return false;
    if (!category) return false;
    if (!contactName.trim()) return false;
    if (!phoneNumber.trim()) return false;
    if (!location.trim()) return false;
    if (!availability) return false;
    if (photos.length === 0) return false;
    if (!description.trim()) return false;

    return true;
  };

  const handleSubmit = () => {
    if (!isFormValid()) {
      Alert.alert('Помилка', 'Будь ласка, заповніть всі обов\'язкові поля');
      return;
    }

    // TODO: Implement submission logic
    Alert.alert('Успіх', 'Оголошення готове до публікації');
  };

  const generateDescription = async () => {
    if (!title.trim()) {
      Alert.alert('Помилка', 'Будь ласка, введіть назву товару');
      return;
    }

    setLoading(true);
    setDescription('');
    fadeAnim.setValue(0);

    try {
      const prompt = `Створи детальне оголошення про продаж товару з такими характеристиками:
      - Назва: ${title}
      ${price ? `- Ціна: ${price} грн` : ''}
      ${condition ? `- Стан: ${condition}` : ''}
      
      Зроби опис привабливим для покупця, вкажи основні переваги товару та чому його варто придбати.`;

      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { 
              role: 'system', 
              content: 'Ти досвідчений копірайтер, який створює привабливі оголошення про продаж товарів. Твої описи мають бути інформативними, структурованими та переконливими.' 
            },
            { role: 'user', content: prompt }
          ],
          max_tokens: 350,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );

      const newDescription = res.data.choices[0].message.content.trim();
      setDescription(newDescription);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Помилка генерації опису:', error);
      Alert.alert('Помилка', 'Не вдалося згенерувати опис. Спробуйте ще раз.');
    } finally {
      setLoading(false);
    }
  };

  const selectPhotos = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Помилка', 'Потрібен доступ до галереї!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      const newPhotos = result.assets.map(asset => asset.uri);
      if (photos.length + newPhotos.length > 10) {
        Alert.alert('Помилка', 'Максимальна кількість фото - 10');
        return;
      }
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const renderPhotos = () => {
    const screenWidth = Dimensions.get('window').width;
    const spacing = 8;
    const itemsPerRow = 3;
    const availableWidth = screenWidth - styles.container.padding * 2 - (spacing * (itemsPerRow - 1));
    const imageSize = availableWidth / itemsPerRow;

    return (
      <View style={styles.photosGrid}>
        {photos.map((uri, index) => (
          <View
            key={index}
            style={[
              styles.photoContainer,
              {
                width: imageSize,
                height: imageSize,
                marginRight: (index + 1) % itemsPerRow === 0 ? 0 : spacing,
                marginBottom: spacing,
              },
            ]}
          >
            <Image source={{ uri }} style={styles.photoThumbnail} />
            <TouchableOpacity
              style={styles.removePhotoButton}
              onPress={() => removePhoto(index)}
            >
              <Icon name="close-circle" size={24} color="#ff4444" />
            </TouchableOpacity>
          </View>
        ))}
        {photos.length < 10 && (
          <TouchableOpacity
            style={[
              styles.addPhotoButton,
              {
                width: imageSize,
                height: imageSize,
                marginRight: (photos.length + 1) % itemsPerRow === 0 ? 0 : spacing,
              },
            ]}
            onPress={selectPhotos}
          >
            <Icon name="camera-plus" size={32} color="#666" />
            <Text style={styles.addPhotoText}>Додати фото</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Створити оголошення</Text>
        
        {/* Основна інформація */}
        <Text style={styles.sectionTitle}>Основна інформація</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Назва товару *"
          placeholderTextColor="#aaa"
          value={title}
          onChangeText={setTitle}
          autoCorrect={false}
        />

        <SelectList
          setSelected={(val: string) => setCategory(val)}
          data={categories}
          save="key"
          placeholder="Оберіть категорію *"
          boxStyles={styles.selectBox}
          dropdownStyles={styles.dropdown}
          search={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Ціна (грн) *"
          placeholderTextColor="#aaa"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />

        <SelectList
          setSelected={(val: string) => setCondition(val)}
          data={conditions}
          save="key"
          placeholder="Оберіть стан товару *"
          boxStyles={styles.selectBox}
          dropdownStyles={styles.dropdown}
          search={false}
        />

        <SelectList
          setSelected={(val: string) => setAvailability(val)}
          data={availabilityOptions}
          save="key"
          placeholder="Наявність *"
          boxStyles={styles.selectBox}
          dropdownStyles={styles.dropdown}
          search={false}
        />

        {/* Контактна інформація */}
        <Text style={styles.sectionTitle}>Контактна інформація</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Ваше ім'я *"
          placeholderTextColor="#aaa"
          value={contactName}
          onChangeText={setContactName}
        />

        <TextInput
          style={styles.input}
          placeholder="Номер телефону *"
          placeholderTextColor="#aaa"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />

        <TextInput
          style={styles.input}
          placeholder="Місцезнаходження *"
          placeholderTextColor="#aaa"
          value={location}
          onChangeText={setLocation}
        />

        {/* Фотографії */}
        <Text style={styles.sectionTitle}>Фотографії *</Text>
        {renderPhotos()}

        {/* Опис та характеристики */}
        <Text style={styles.sectionTitle}>Опис та характеристики</Text>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Детальні характеристики товару (розмір, колір, матеріал тощо)"
          placeholderTextColor="#aaa"
          value={characteristics}
          onChangeText={setCharacteristics}
          multiline
          numberOfLines={4}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Ключові слова для пошуку (розділяйте комами)"
          placeholderTextColor="#aaa"
          value={searchKeywords}
          onChangeText={setSearchKeywords}
          multiline
          numberOfLines={2}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={generateDescription}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="auto-fix" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Згенерувати опис</Text>
            </>
          )}
        </TouchableOpacity>

        {description && (
          <Animated.View style={[styles.descriptionBox, { opacity: fadeAnim }]}>
            <Text style={styles.descriptionTitle}>Опис:</Text>
            <Text style={styles.descriptionText}>{description}</Text>
          </Animated.View>
        )}

        <TouchableOpacity
          style={[styles.submitButton, !isFormValid() && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!isFormValid()}
        >
          <Text style={styles.submitButtonText}>Опублікувати оголошення</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateAd;