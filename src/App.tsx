import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Screen, UserProfile } from './types';
import WelcomeScreen from './components/WelcomeScreen';
import ClassSelectScreen from './components/ClassSelectScreen';
import SubjectSelectScreen from './components/SubjectSelectScreen';
import ProfileSetupScreen from './components/ProfileSetupScreen';
import HomeScreen from './components/HomeScreen';
import VoiceOverlay from './components/VoiceOverlay';
import ChatScreen from './components/ChatScreen';
import CameraScreen from './components/CameraScreen';
import ProcessingScreen from './components/ProcessingScreen';
import AnalysisScreen from './components/AnalysisScreen';
import DIYPickerScreen from './components/DIYPickerScreen';
import DIYScanScreen from './components/DIYScanScreen';
import DIYStepScreen from './components/DIYStepScreen';
import SuccessScreen from './components/SuccessScreen';
import HomeworkCaptureScreen from './components/HomeworkCaptureScreen';
import HomeworkSolutionScreen from './components/HomeworkSolutionScreen';
import DeepExplainScreen from './components/DeepExplainScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    grade: '',
    subjects: [],
    location: '',
    language: 'Hindi',
  });

  const navigate = (screen: Screen) => setCurrentScreen(screen);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onNext={() => navigate('class-select')} profile={profile} setProfile={setProfile} />;
      case 'class-select':
        return <ClassSelectScreen onNext={() => navigate('subject-select')} onBack={() => navigate('welcome')} profile={profile} setProfile={setProfile} />;
      case 'subject-select':
        return <SubjectSelectScreen onNext={() => navigate('profile-setup')} onBack={() => navigate('class-select')} profile={profile} setProfile={setProfile} />;
      case 'profile-setup':
        return <ProfileSetupScreen onNext={() => navigate('home')} onBack={() => navigate('subject-select')} profile={profile} setProfile={setProfile} />;
      case 'home':
        return <HomeScreen navigate={navigate} profile={profile} />;
      case 'voice-overlay':
        return <VoiceOverlay onBack={() => navigate('home')} onStop={() => navigate('chat')} />;
      case 'chat':
        return <ChatScreen onBack={() => navigate('home')} />;
      case 'camera':
        return <CameraScreen onBack={() => navigate('home')} onCapture={() => navigate('processing')} />;
      case 'processing':
        return <ProcessingScreen onComplete={() => navigate('analysis')} />;
      case 'analysis':
        return <AnalysisScreen onBack={() => navigate('home')} onNext={() => navigate('success')} />;
      case 'diy-picker':
        return <DIYPickerScreen onBack={() => navigate('home')} onSelect={() => navigate('diy-scan')} />;
      case 'diy-scan':
        return <DIYScanScreen onBack={() => navigate('diy-picker')} onStart={() => navigate('diy-step')} />;
      case 'diy-step':
        return <DIYStepScreen onBack={() => navigate('diy-scan')} onComplete={() => navigate('success')} />;
      case 'success':
        return <SuccessScreen onNext={() => navigate('home')} />;
      case 'homework-capture':
        return <HomeworkCaptureScreen onBack={() => navigate('home')} onCapture={() => navigate('homework-solution')} />;
      case 'homework-solution':
        return <HomeworkSolutionScreen onBack={() => navigate('homework-capture')} onExplainMore={() => navigate('deep-explain')} />;
      case 'deep-explain':
        return <DeepExplainScreen onBack={() => navigate('homework-solution')} />;
      default:
        return <WelcomeScreen onNext={() => navigate('class-select')} profile={profile} setProfile={setProfile} />;
    }
  };

  return (
    <div className="max-w-md mx-auto h-screen relative overflow-hidden bg-background-dark">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="h-full w-full"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
