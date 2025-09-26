import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import bgGenel from '../../assets/bg-genel.jpg';
import bgTarih from '../../assets/bg-tarih.jpg';
import bgGame from '../../assets/bg-game.jpg';
import bgSpor from '../../assets/bg-spor.jpg';

const categories = [
  {
    key: 'genel',
    title: 'Genel Kültür',
    gradient: ['#0ea5e9', '#22d3ee'],
    icon: '🧠',
    backgroundImage: bgGenel
  },
  {
    key: 'tarih',
    title: 'Tarih',
    gradient: ['#8b5cf6', '#ec4899'],
    icon: '🏛️',
    backgroundImage: bgTarih
  },
  {
    key: 'oyun',
    title: 'Oyun Dünyası',
    gradient: ['#22c55e', '#84cc16'],
    icon: '🎮',
    backgroundImage: bgGame
  },
  {
    key: 'spor',
    title: 'Spor',
    gradient: ['#f59e0b', '#ef4444'],
    icon: '⚽',
    backgroundImage: bgSpor
  }
];

const HomeScreen = ({ navigation }) => {
  const handleCategoryPress = (category) => {
    navigation.navigate('Quiz', { category });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1e293b', '#334155']} style={StyleSheet.absoluteFill}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Quiz Uygulaması</Text>
            <Text style={styles.subtitle}>Bilginizi test edin!</Text>
          </View>

          <View style={styles.categoriesContainer}>
            {categories.map((category) => {
              const hasBackgroundImage = Boolean(category.backgroundImage);
              
              const CategoryBackground = ({ children }) => {
                try {
                  return hasBackgroundImage ? (
                    <ImageBackground 
                      source={category.backgroundImage} 
                      resizeMode="cover" 
                      style={styles.categoryGradient}
                      imageStyle={{ borderRadius: 16 }}
                      onError={() => console.log('Image load error for:', category.key)}
                    >
                      <View style={styles.imageOverlay} />
                      {children}
                    </ImageBackground>
                  ) : (
                    <LinearGradient
                      colors={category.gradient}
                      style={styles.categoryGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      {children}
                    </LinearGradient>
                  );
                } catch (error) {
                  console.log('Error loading background for:', category.key, error);
                  return (
                    <LinearGradient
                      colors={category.gradient}
                      style={styles.categoryGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      {children}
                    </LinearGradient>
                  );
                }
              };

              return (
                <TouchableOpacity
                  key={category.key}
                  style={styles.categoryCard}
                  onPress={() => handleCategoryPress(category)}
                  activeOpacity={0.8}
                >
                  <CategoryBackground>
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                  </CategoryBackground>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Her kategoride 5 soru bulunmaktadır</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
  },
  categoriesContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  categoryCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  categoryGradient: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export default HomeScreen;
