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
} from 'react-native';
import axios from 'axios';

const CreateAd = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const generateDescription = async () => {
    if (!title.trim()) return;

    setLoading(true);
    setDescription(''); 
    fadeAnim.setValue(0); 

    try {
      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Ти помічник, який створює оголошення про продаж товарів.' },
            { role: 'user', content: `Напиши оголошення про продаж "${title}"` }
          ],
          max_tokens: 150,
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Створи оголошення</Text>

        <TextInput
          style={styles.input}
          placeholder="Введи назву товару"
          placeholderTextColor="#aaa"
          value={title}
          onChangeText={setTitle}
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={generateDescription}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Згенерувати опис</Text>
          )}
        </TouchableOpacity>

        {!!description && (
          <Animated.View style={[styles.descriptionBox, { opacity: fadeAnim }]}>
            <Text style={styles.descriptionTitle}>Опис:</Text>
            <Text style={styles.descriptionText}>{description}</Text>
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateAd;