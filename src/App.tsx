import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Screen } from './types';
import { loadState, saveState, AppState, UserProfile } from './store/appStore';

// Onboarding
import WelcomeScreen from './components/WelcomeScreen';
import ClassSelectScreen from './components/ClassSelectScreen';
import SubjectSelectScreen from './components/SubjectSelectScreen';
import ProfileSetupScreen from './components/ProfileSetupScreen';

// Main app
import HomeScreen from './components/HomeScreen';
import KuchBhiPochoScreen from './components/KuchBhiPochoScreen';

// Snap & Learn flow
import CameraScreen from './components/CameraScreen';
import ProcessingScreen from './components/ProcessingScreen';
import AnalysisScreen from './components/AnalysisScreen';

// DIY flow
import DIYPickerScreen from './components/DIYPickerScreen';
import DIYScanScreen from './components/DIYScanScreen';
import DIYStepScreen from './components/DIYStepScreen';
import SuccessScreen from './components/SuccessScreen';

// Homework flow
import HomeworkCaptureScreen from './components/HomeworkCaptureScreen';
import HomeworkSolutionScreen from './components/HomeworkSolutionScreen';
import DeepExplainScreen from './components/DeepExplainScreen';

// Additional screens
import LiveLearningScreen from './components/LiveLearningScreen';
import ExamPredictorScreen from './components/ExamPredictorScreen';
import ProfileScreen from './components/ProfileScreen';

// Discovery Challenge screens
import DiscoveryChallengeScreen from './components/DiscoveryChallengeScreen';
import DiscoveryProcessingScreen from './components/DiscoveryProcessingScreen';
import DiscoveryRevealScreen from './components/DiscoveryRevealScreen';

// AI service
import { analyzeImageForLesson, analyzeHomework, analyzeDiscoveryChallenge, DiscoveryAnalysis, compressImage } from './services/snaplearnAI';
import ErrorBoundary from './components/ErrorBoundary';

// Screens that should never be returned to via the hardware back button
const TERMINAL_SCREENS: Screen[] = ['home', 'welcome'];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [screenHistory, setScreenHistory] = useState<Screen[]>([]);
  const [appState, setAppState] = useState<AppState>(loadState());

  // Ephemeral state for flows
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // DIY state — passed directly, no global hacks
  const [selectedDIY, setSelectedDIY] = useState<string>('');

  // Discovery Challenge state
  const [discoveryPhotos, setDiscoveryPhotos] = useState<string[]>([]);
  const [discoveryAnalysis, setDiscoveryAnalysis] = useState<DiscoveryAnalysis | null>(null);

  // Load persisted state on mount
  useEffect(() => {
    const state = loadState();
    setAppState(state);
    // If user has already onboarded, go to home
    if (state.profile.name) {
      setCurrentScreen('home');
    }
  }, []);

  // Hardware / browser back button — pop our own history stack instead of exiting
  useEffect(() => {
    // Push a dummy entry so the browser always has somewhere to "go back" to
    // without actually leaving the SPA.
    window.history.pushState({ snaplearn: true }, '');

    const handlePopState = () => {
      // Immediately push another entry so the next back press is also caught
      window.history.pushState({ snaplearn: true }, '');

      setScreenHistory(prev => {
        if (prev.length === 0) return prev; // already at root — do nothing
        const next = [...prev];
        const target = next.pop()!;
        setCurrentScreen(target);
        return next;
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (screen: Screen) => {
    // Don't push terminal screens (home / welcome) onto the history stack —
    // pressing back from them would just loop.
    setScreenHistory(prev =>
      TERMINAL_SCREENS.includes(screen) ? [] : [...prev, currentScreen]
    );
    setCurrentScreen(screen);
  };

  const updateProfile = (profile: UserProfile) => {
    const newState = { ...appState, profile };
    setAppState(newState);
    saveState({ profile });
  };

  const addXP = (amount: number) => {
    const newXP = appState.xp + amount;
    const newLevel = Math.floor(newXP / 1000) + 1;
    const newState = { ...appState, xp: newXP, level: newLevel };
    setAppState(newState);
    saveState({ xp: newXP, level: newLevel });
  };

  // ── Snap & Learn flow ────────────────────────────────────────────────────────
  const handleCameraCapture = async (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    setIsAnalyzing(true);
    setAnalysisError(null);
    navigate('processing');

    try {
      // Compress before sending to Bedrock — faster API, smaller payload
      const compressed = await compressImage(imageDataUrl);
      const result = await analyzeImageForLesson(compressed, appState.profile);

      // Save result to state
      const newSnapsCount = appState.snapsCount + 1;
      const newState = {
        ...appState,
        capturedImage: imageDataUrl,
        snapLearnResult: result,
        snapsCount: newSnapsCount,
        xp: appState.xp + (result.xpEarned || 50)
      };
      setAppState(newState);
      saveState({
        capturedImage: imageDataUrl,
        snapLearnResult: result,
        snapsCount: newSnapsCount,
        xp: appState.xp + (result.xpEarned || 50)
      });

      setIsAnalyzing(false);
      navigate('analysis');
    } catch (err) {
      setIsAnalyzing(false);
      setAnalysisError('Yaar, thoda clear photo le! AI samajh nahi paya. Try again karo! 📸');
      navigate('camera');
    }
  };

  // ── Homework flow ────────────────────────────────────────────────────────────
  const handleHomeworkCapture = async (imageDataUrl: string) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    navigate('processing');

    try {
      // Compress before sending to Bedrock
      const compressed = await compressImage(imageDataUrl);
      const result = await analyzeHomework(compressed, appState.profile);

      const newState = {
        ...appState,
        homeworkImage: imageDataUrl,
        homeworkResult: result,
      };
      setAppState(newState);
      saveState({
        homeworkImage: imageDataUrl,
        homeworkResult: result,
      });

      setIsAnalyzing(false);
      navigate('homework-solution');
    } catch (err) {
      setIsAnalyzing(false);
      setAnalysisError('Yaar, thoda clear photo le! Homework clearly dikhna chahiye.');
      navigate('homework-capture');
    }
  };

  // ── Discovery Challenge flow ─────────────────────────────────────────────
  const handleDiscoveryStart = async (photos: string[]) => {
    setDiscoveryPhotos(photos);
    navigate('discovery-processing');
    try {
      const analysis = await analyzeDiscoveryChallenge(photos);
      setDiscoveryAnalysis(analysis);
      // Award 200 XP
      const newXP = appState.xp + 200;
      const newState = { ...appState, xp: newXP };
      setAppState(newState);
      saveState({ xp: newXP });
      navigate('discovery-reveal');
    } catch (err) {
      console.error('Discovery analysis failed:', err);
      navigate('home');
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      // ── Onboarding ───────────────────────────────────────────────────────────
      case 'welcome':
        return <WelcomeScreen
          onNext={() => navigate('class-select')}
          profile={appState.profile}
          setProfile={updateProfile}
        />;
      case 'class-select':
        return <ClassSelectScreen
          onNext={() => navigate('subject-select')}
          onBack={() => navigate('welcome')}
          profile={appState.profile}
          setProfile={updateProfile}
        />;
      case 'subject-select':
        return <SubjectSelectScreen
          onNext={() => navigate('profile-setup')}
          onBack={() => navigate('class-select')}
          profile={appState.profile}
          setProfile={updateProfile}
        />;
      case 'profile-setup':
        return <ProfileSetupScreen
          onNext={() => navigate('home')}
          onBack={() => navigate('subject-select')}
          profile={appState.profile}
          setProfile={updateProfile}
        />;

      // ── Main App ─────────────────────────────────────────────────────────────
      case 'home':
        return <HomeScreen navigate={navigate} profile={appState.profile} appState={appState} />;

      case 'voice-overlay':
      case 'chat':
        return <KuchBhiPochoScreen
          onBack={() => navigate('home')}
          profile={appState.profile}
        />;

      // ── Snap & Learn ─────────────────────────────────────────────────────────
      case 'camera':
        return <CameraScreen
          onBack={() => navigate('home')}
          onCapture={handleCameraCapture}
          error={analysisError}
        />;

      case 'processing':
        return <ProcessingScreen
          onComplete={() => { }} // handled by async flow
          isSnapMode={true}
        />;

      case 'analysis':
        return <AnalysisScreen
          onBack={() => navigate('home')}
          onNext={() => navigate('success')}
          capturedImage={capturedImage}
          result={appState.snapLearnResult}
          onTakeAnother={() => navigate('camera')}
        />;

      // ── DIY Mode ─────────────────────────────────────────────────────────────
      case 'diy-picker':
        return <DIYPickerScreen
          onBack={() => navigate('home')}
          onSelect={(concept: string) => {
            setSelectedDIY(concept); // ✓ direct React state, no window hacks
            navigate('diy-scan');
          }}
          appState={appState}
          setAppState={(s) => { setAppState(s); saveState(s); }}
        />;

      case 'diy-scan':
        return <DIYScanScreen
          onBack={() => navigate('diy-picker')}
          onStart={() => navigate('diy-step')}
          profile={appState.profile}
          concept={selectedDIY}  // ✓ passed directly as prop
          appState={appState}
          setAppState={(s) => { setAppState(s); saveState(s); }}
        />;

      case 'diy-step':
        return <DIYStepScreen
          onBack={() => navigate('diy-scan')}
          onComplete={() => navigate('success')}
          appState={appState}
          setAppState={(s) => { setAppState(s); saveState(s); }}
        />;

      case 'success':
        return <SuccessScreen
          onNext={() => navigate('home')}
          appState={appState}
        />;

      // ── Homework Helper ───────────────────────────────────────────────────────
      case 'homework-capture':
        return <HomeworkCaptureScreen
          onBack={() => navigate('home')}
          onCapture={handleHomeworkCapture}
          error={analysisError}
        />;

      case 'homework-solution':
        return <HomeworkSolutionScreen
          onBack={() => navigate('homework-capture')}
          onExplainMore={() => navigate('deep-explain')}
          result={appState.homeworkResult}
          homeworkImage={appState.homeworkImage}
        />;

      case 'deep-explain':
        return <DeepExplainScreen
          onBack={() => navigate('homework-solution')}
          profile={appState.profile}
          result={appState.homeworkResult}
        />;

      // ── New Screens ───────────────────────────────────────────────────────────
      case 'live-learning':
        return <LiveLearningScreen
          onBack={() => navigate('home')}
          profile={appState.profile}
          onXPEarned={addXP}
        />;

      case 'exam-predictor':
        return <ExamPredictorScreen
          onBack={() => navigate('home')}
          profile={appState.profile}
        />;

      case 'profile':
        return <ProfileScreen
          onBack={() => navigate('home')}
          appState={appState}
          onResetOnboarding={() => {
            saveState({ profile: { name: '', grade: '', subjects: [], location: '', language: 'Hindi' } });
            navigate('welcome');
          }}
        />;

      // ── Discovery Challenge ───────────────────────────────────────────────
      case 'discovery-challenge':
        return <DiscoveryChallengeScreen
          onBack={() => navigate('home')}
          onComplete={handleDiscoveryStart}
        />;

      case 'discovery-processing':
        return <DiscoveryProcessingScreen
          photos={discoveryPhotos}
        />;

      case 'discovery-reveal':
        return discoveryAnalysis ? (
          <DiscoveryRevealScreen
            photos={discoveryPhotos}
            analysis={discoveryAnalysis}
            onHome={() => navigate('home')}
            onRetry={() => navigate('discovery-challenge')}
          />
        ) : null;

      default:
        return <WelcomeScreen
          onNext={() => navigate('class-select')}
          profile={appState.profile}
          setProfile={updateProfile}
        />;
    }
  };

  return (
    <div className="max-w-md mx-auto h-screen relative overflow-hidden bg-background-dark">
      <ErrorBoundary>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="h-full w-full"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </ErrorBoundary>
    </div>
  );
}
