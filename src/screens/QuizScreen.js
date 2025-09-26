import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchQuestionsByCategory } from '../services/dataService';

const categoryStyles = {
  genel: { gradient: ['#0ea5e9', '#22d3ee'], text: '#ffffff', backgroundImage:  require('../../assets/bg-genel.jpg') },
  tarih: { gradient: ['#8b5cf6', '#ec4899'], text: '#ffffff', backgroundImage: require('../../assets/bg-tarih.jpg') },
  oyun: { gradient: ['#22c55e', '#84cc16'], text: '#ffffff', backgroundImage: require('../../assets/bg-game.jpg') },
  spor: { gradient: ['#f59e0b', '#ef4444'], text: '#ffffff', backgroundImage:  require('../../assets/bg-spor.jpg') }
};

const QuizScreen = ({ route, navigation }) => {
  const { category } = route.params || {};
  const styleForCat = categoryStyles[category?.key] || categoryStyles.genel;

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [index, setIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);

  const current = questions[index];

  // Soruları karıştırmak için yardımcı fonksiyon
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      setIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setFinished(false);
      const key = category?.key || 'genel';
      try {
        const remote = await fetchQuestionsByCategory(key);
        if (!mounted) return;
        const questionsArray = Array.isArray(remote) ? remote : [];
        // Soruları karıştır
        const shuffledQuestions = shuffleArray(questionsArray);
        setQuestions(shuffledQuestions);
      } catch (e) {
        if (!mounted) return;
        console.log('Questions fetch error:', e);
        setError(e?.message || 'Sorular yüklenirken bir hata oluştu.');
        setQuestions([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [category]);

  const selectAnswer = (i) => {
    if (!current || showResult) return;
    setSelectedAnswer(i);
    setShowResult(true);
  };

  const nextQuestion = () => {
    const next = index + 1;
    if (next >= questions.length) {
      setFinished(true);
    } else {
      setIndex(next);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const restart = () => {
    // Soruları yeniden karıştır
    const shuffledQuestions = shuffleArray(questions);
    setQuestions(shuffledQuestions);
    setIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setFinished(false);
  };

  const hasBackgroundImage = Boolean(styleForCat.backgroundImage);

  const Background = ({ children }) => {
    try {
      return hasBackgroundImage ? (
        <ImageBackground 
          source={styleForCat.backgroundImage} 
          resizeMode="cover" 
          style={StyleSheet.absoluteFill}
          imageStyle={{ 
            opacity: 1
          }}
          onError={() => console.log('Quiz background image error for:', category?.key)}
        >
          {children}
        </ImageBackground>
      ) : (
        <LinearGradient colors={styleForCat.gradient} style={StyleSheet.absoluteFill}>
          {children}
        </LinearGradient>
      );
    } catch (error) {
      console.log('Error loading quiz background for:', category?.key, error);
      return (
        <LinearGradient colors={styleForCat.gradient} style={StyleSheet.absoluteFill}>
          {children}
        </LinearGradient>
      );
    }
  };

  return (
    <View style={styles.container}>
      <Background>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: styleForCat.text }]}>
          {category?.title || 'Quiz'}
        </Text>
        <Text style={[styles.subText, { color: styleForCat.text }]}>Soru {index + 1}/{questions.length}</Text>
      </View>

      {loading ? (
        <View style={styles.content}>
          <Text style={[styles.question, { color: styleForCat.text }]}>Yükleniyor...</Text>
        </View>
      ) : error ? (
        <View style={styles.content}>
          <Text style={[styles.question, { color: styleForCat.text }]}>{error}</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.secondary} onPress={() => navigation.goBack()}>
              <Text style={styles.secondaryText}>Geri Dön</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : questions.length === 0 ? (
        <View style={styles.content}>
          <Text style={[styles.question, { color: styleForCat.text }]}>Bu kategoride soru bulunamadı.</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.secondary} onPress={() => navigation.goBack()}>
              <Text style={styles.secondaryText}>Ana Sayfa</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : !finished ? (
        <View style={styles.content}>
          <Text style={[styles.question, { color: styleForCat.text }]}>{current?.q}</Text>
          <View style={styles.answers}>
            {current?.a?.map((opt, i) => {
              let buttonStyle = styles.answerBtn;
              let textStyle = styles.answerText;
              
              if (showResult) {
                if (i === current.c) {
                  buttonStyle = [styles.answerBtn, styles.correctAnswer];
                  textStyle = [styles.answerText, styles.correctText];
                } else if (i === selectedAnswer && i !== current.c) {
                  buttonStyle = [styles.answerBtn, styles.wrongAnswer];
                  textStyle = [styles.answerText, styles.wrongText];
                } else {
                  buttonStyle = [styles.answerBtn, styles.disabledAnswer];
                  textStyle = [styles.answerText, styles.disabledText];
                }
              }
              
              return (
                <TouchableOpacity 
                  key={i} 
                  style={buttonStyle} 
                  onPress={() => selectAnswer(i)}
                  disabled={showResult}
                >
                  <Text style={textStyle}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {showResult && (
            <View style={styles.nextButtonContainer}>
              <TouchableOpacity style={styles.nextButton} onPress={nextQuestion}>
                <Text style={styles.nextButtonText}>
                  {index + 1 >= questions.length ? 'Sonuçları Gör' : 'Sonraki Soru'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={[styles.question, { color: styleForCat.text }]}>Quiz Tamamlandı!</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.primary} onPress={restart}>
              <Text style={styles.primaryText}>Tekrar Oyna</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondary} onPress={() => navigation.goBack()}>
              <Text style={styles.secondaryText}>Ana Sayfa</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      </Background>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 64, paddingHorizontal: 20, paddingBottom: 8 },
  headerText: { 
    fontSize: 24, 
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  },
  subText: { 
    fontSize: 14, 
    opacity: 0.9, 
    marginTop: 6,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  content: { flex: 1, paddingHorizontal: 20, justifyContent: 'center' },
  question: { 
    fontSize: 22, 
    fontWeight: '700', 
    textAlign: 'center', 
    marginBottom: 24,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  },
  answers: { gap: 12 },
  answerBtn: { 
    backgroundColor: 'rgba(255,255,255,0.95)', 
    padding: 14, 
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  answerText: { 
    textAlign: 'center', 
    fontWeight: '700', 
    color: '#0f172a',
    fontSize: 16
  },
  correctAnswer: {
    backgroundColor: '#10b981',
    borderColor: '#059669'
  },
  correctText: {
    color: '#ffffff'
  },
  wrongAnswer: {
    backgroundColor: '#ef4444',
    borderColor: '#dc2626'
  },
  wrongText: {
    color: '#ffffff'
  },
  disabledAnswer: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderColor: 'rgba(255,255,255,0.3)'
  },
  disabledText: {
    color: '#6b7280'
  },
  nextButtonContainer: {
    marginTop: 20,
    alignItems: 'center'
  },
  nextButton: {
    backgroundColor: '#1f2937',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#374151'
  },
  nextButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16
  },
  progress: { 
    textAlign: 'center', 
    marginTop: 16, 
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  row: { flexDirection: 'row', gap: 12, justifyContent: 'center', marginTop: 12 },
  primary: { backgroundColor: '#111827', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12 },
  primaryText: { color: '#ffffff', fontWeight: '700' },
  secondary: { 
    backgroundColor: 'rgba(255,255,255,0.9)', 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  secondaryText: { 
    color: '#1f2937', 
    fontWeight: '700',
    fontSize: 16
  }
});

export default QuizScreen;


