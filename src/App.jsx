import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { signOut } from "firebase/auth";
import { collection, query, onSnapshot, addDoc, deleteDoc, doc } from "firebase/firestore";
import { auth, db } from './firebase.js';
import { appId } from './constants.js';
import { useProfile } from './context/ProfileContext';

import Auth from './components/Auth';
import TripList from './components/TripList';
import TripDetail from './components/TripDetail';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import About from './components/About';
import VerifyEmail from './components/VerifyEmail';
import ProfileCompletion from './components/ProfileCompletion';
import Profile from './components/Profile';
import ProTips from './components/ProTips';

import AuthActionHandler from './components/AuthActionHandler';

export default function App() {
  // --- Check for Firebase Auth Actions (Email Verify / Password Reset) ---
  const params = new URLSearchParams(window.location.search);
  const authMode = params.get('mode');
  const oobCode = params.get('oobCode');

  if (authMode && oobCode) {
    return <AuthActionHandler />;
  }

  // --- Auth & Profile State (from Context) ---
  const { user, loading, isProfileComplete, refreshProfile } = useProfile();

  // --- App View State ---
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'trips', 'expenses', 'settings'
  const [currentTripId, setCurrentTripId] = useState(null);
  const [targetTab, setTargetTab] = useState(null);
  const [tripsList, setTripsList] = useState([]);

  // Fetch trips (Active when user & profile are ready)
  useEffect(() => {
    if (!user || !isProfileComplete) {
      setTripsList([]);
      return;
    }

    // Create query for user's trips
    const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'trips'));

    // Real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tripsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTripsList(tripsData);
    }, (error) => {
      console.error("Error fetching trips:", error);
    });

    return () => unsubscribe();
  }, [user, isProfileComplete]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentTripId(null);
      setTargetTab(null);
      setCurrentView('dashboard');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const createNewTrip = async () => {
    if (!user) return;
    try {
      const newTrip = {
        tripName: 'New Trip',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        days: [], // Start empty
        travelers: [],
        travelerCount: 0,
        totalCost: 0
      };

      const docRef = await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'trips'), newTrip);
      setCurrentTripId(docRef.id); // Open the new trip immediately
    } catch (error) {
      console.error("Error creating trip:", error);
    }
  };

  const deleteTrip = async (e, tripId) => {
    e.stopPropagation(); // Prevent opening the trip
    if (!confirm('Are you sure you want to delete this trip?')) return;

    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'trips', tripId));
      if (currentTripId === tripId) setCurrentTripId(null);
    } catch (error) {
      console.error("Error deleting trip:", error);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><RefreshCw className="animate-spin text-blue-500" size={32} /></div>;
  }

  if (!user) {
    return <Auth />;
  }

  // 1. Email Verification Check (Skip if no email, e.g. Phone Auth)
  if (user.email && !user.emailVerified) {
    return <VerifyEmail user={user} />;
  }

  // 2. Profile Completion Check
  if (!isProfileComplete) {
    return <ProfileCompletion user={user} onComplete={() => refreshProfile(user.uid)} />; // Force refresh on completion
  }

  // If a specific trip is open, show the editor (Full screen mode)
  if (currentTripId) {
    return (
      <TripDetail
        user={user}
        tripId={currentTripId}
        setCurrentTripId={setCurrentTripId}
        initialTab={targetTab}
        clearInitialTab={() => setTargetTab(null)}
      />
    );
  }

  // Default Layout with Sidebar
  return (
    <Layout
      user={user}
      handleLogout={handleLogout}
      currentView={currentView}
      setCurrentView={setCurrentView}
      setCurrentTripId={setCurrentTripId}
    >
      {currentView === 'dashboard' && (
        <Dashboard
          user={user}
          tripsList={tripsList}
          setCurrentTripId={setCurrentTripId}
          createNewTrip={createNewTrip}
          deleteTrip={deleteTrip}
          setCurrentView={setCurrentView}
          setTargetTab={setTargetTab}
        />
      )}

      {currentView === 'trips' && (
        <TripList
          tripsList={tripsList}
          setCurrentTripId={setCurrentTripId}
          createNewTrip={createNewTrip}
          deleteTrip={deleteTrip}
        />
      )}

      {currentView === 'about' && <About />}
      {currentView === 'profile' && <Profile user={user} />}
      {currentView === 'protips' && <ProTips />}

      {/* Placeholders for upcoming sections */}
      {(currentView === 'expenses' || currentView === 'settings') && (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <div className="text-4xl mb-4">🚧</div>
          <h2 className="text-xl font-bold text-slate-600">Coming Soon</h2>
          <p>This module is under development.</p>
        </div>
      )}

    </Layout>
  );
}
