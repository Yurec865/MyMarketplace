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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [category, setCategory] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  
  const [contactName, setContactName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  
  const [availability, setAvailability] = useState('in_stock');
  const [characteristics, setCharacteristics] = useState('');
  const [searchKeywords, setSearchKeywords] = useState('');
  
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const categories = [
    { key: 'electronics', value: 'Electronics' },
    { key: 'clothing', value: 'Clothing' },
    { key: 'furniture', value: 'Furniture' },
    { key: 'sports', value: 'Sports & Recreation' },
    { key: 'home', value: 'Home & Garden' },
  ];

  const conditions = [
    { key: 'new', value: 'New' },
    { key: 'used', value: 'Used' },
  ];

  const availabilityOptions = [
    { key: 'in_stock', value: 'In Stock' },
    { key: 'to_order', value: 'To Order' },
  ];

  const isFormValid = () => {
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
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    Alert.alert('Success', 'Advertisement is ready for publication');
  };

  const generateDescription = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter the product name');
      return;
    }

    setLoading(true);
    setDescription('');
    fadeAnim.setValue(0);

    try {
      const prompt = `Create a detailed product listing with the following characteristics:
      - Name: ${title}
      ${price ? `- Price: ${price} UAH` : ''}
      ${condition ? `- Condition: ${condition}` : ''}
      
      Make the description appealing to buyers, highlight the main advantages of the product and why it's worth buying.`;

      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { 
              role: 'system', 
              content: 'You are an experienced copywriter who creates attractive product listings. Your descriptions should be informative, structured, and persuasive.' 
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
      console.error('Description generation error:', error);
      Alert.alert('Error', 'Failed to generate description. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectPhotos = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Error', 'Gallery access required!');
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
        Alert.alert('Error', 'Maximum 10 photos allowed');
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
            <Text style={styles.addPhotoText}>Add Photo</Text>
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
        <Text style={styles.heading}>Create Advertisement</Text>
        
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Product Name *"
          placeholderTextColor="#aaa"
          value={title}
          onChangeText={setTitle}
          autoCorrect={false}
        />

        <SelectList
          setSelected={(val: string) => setCategory(val)}
          data={categories}
          save="key"
          placeholder="Select Category *"
          boxStyles={styles.selectBox}
          dropdownStyles={styles.dropdown}
          search={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Price (UAH) *"
          placeholderTextColor="#aaa"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />

        <SelectList
          setSelected={(val: string) => setCondition(val)}
          data={conditions}
          save="key"
          placeholder="Select Product Condition *"
          boxStyles={styles.selectBox}
          dropdownStyles={styles.dropdown}
          search={false}
        />

        <SelectList
          setSelected={(val: string) => setAvailability(val)}
          data={availabilityOptions}
          save="key"
          placeholder="Availability *"
          boxStyles={styles.selectBox}
          dropdownStyles={styles.dropdown}
          search={false}
        />

        <Text style={styles.sectionTitle}>Contact Information</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Your Name *"
          placeholderTextColor="#aaa"
          value={contactName}
          onChangeText={setContactName}
        />

        <TextInput
          style={styles.input}
          placeholder="Phone Number *"
          placeholderTextColor="#aaa"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />

        <TextInput
          style={styles.input}
          placeholder="Location *"
          placeholderTextColor="#aaa"
          value={location}
          onChangeText={setLocation}
        />

        <Text style={styles.sectionTitle}>Photos *</Text>
        {renderPhotos()}

        <Text style={styles.sectionTitle}>Description and Specifications</Text>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Detailed product specifications (size, color, material, etc.)"
          placeholderTextColor="#aaa"
          value={characteristics}
          onChangeText={setCharacteristics}
          multiline
          numberOfLines={4}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Search keywords (separate with commas)"
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
              <Text style={styles.buttonText}>Generate Description</Text>
            </>
          )}
        </TouchableOpacity>

        {description && (
          <Animated.View style={[styles.descriptionBox, { opacity: fadeAnim }]}>
            <Text style={styles.descriptionTitle}>Description:</Text>
            <Text style={styles.descriptionText}>{description}</Text>
          </Animated.View>
        )}

        <TouchableOpacity
          style={[styles.submitButton, !isFormValid() && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!isFormValid()}
        >
          <Text style={styles.submitButtonText}>Publish Advertisement</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateAd;