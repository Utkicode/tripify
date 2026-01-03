import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { signOut } from "firebase/auth";
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, where } from "firebase/firestore";
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
import GlobalExpenses from './components/GlobalExpenses';
import AppPrivacy from './components/AppPrivacy';
import TermsOfService from './components/TermsOfService';

import AuthActionHandler from './components/AuthActionHandler';
import ConfirmationModal from './components/ConfirmationModal';
import { AppLoadingSkeleton } from './components/common/LoadingSkeleton';
import SEO from './components/common/SEO';

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
  // --- App View State ---
  // Initialize from URL query params to persist state on refresh
  const [currentView, setCurrentView] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return p.get('view') || 'dashboard';
  });

  const [currentTripId, setCurrentTripId] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return p.get('trip') || null;
  });

  // Sync URL with State changes
  useEffect(() => {
    // Avoid interfering with auth action URLs (like verify email)
    if (new URLSearchParams(window.location.search).get('mode')) return;

    const url = new URL(window.location);

    if (currentTripId) {
      url.searchParams.set('trip', currentTripId);
      url.searchParams.delete('view');
    } else {
      url.searchParams.delete('trip');
      if (currentView !== 'dashboard') {
        url.searchParams.set('view', currentView);
      } else {
        url.searchParams.delete('view');
      }
    }

    // Only update if changed to avoid unnecessary pushState calls
    if (url.toString() !== window.location.toString()) {
      window.history.pushState({}, '', url);
    }
  }, [currentView, currentTripId]);

  const [targetTab, setTargetTab] = useState(null);
  const [tripsList, setTripsList] = useState([]);
  const [tripLoading, setTripLoading] = useState(true);

  // Fetch trips (Active when user & profile are ready)
  useEffect(() => {
    if (!user || !isProfileComplete) {
      setTripsList([]);
      setTripLoading(false);
      return;
    }

    setTripLoading(true);

    // New shared query: Find trips where I am a collaborator
    const q = query(
      collection(db, 'artifacts', appId, 'trips'),
      where('collaborators', 'array-contains', user.uid)
    );

    // Real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tripsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTripsList(tripsData);
      setTripLoading(false);
    }, (error) => {
      console.error("Error fetching trips:", error);
      setTripLoading(false);
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
        travelers: [{ id: user.uid, name: user.displayName || 'You', email: user.email }], // Initial traveler is creator
        travelerCount: 1,
        totalCost: 0,
        ownerId: user.uid,
        collaborators: [user.uid] // Critical for access control
      };

      const docRef = await addDoc(collection(db, 'artifacts', appId, 'trips'), newTrip);

      // Log Notification (Global)
      // Note: We might want a separate notifications system later, keeping local for now or moving to global too?
      // Keeping notifications local for now as they are user-specific.
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'notifications'), {
        type: 'create',
        message: `Created a new trip`,
        user: user.displayName || 'User',
        timestamp: Date.now(),
        read: false
      });

      setCurrentTripId(docRef.id); // Open the new trip immediately
    } catch (error) {
      console.error("Error creating trip:", error);
    }
  };

  // --- Delete Trip Logic ---
  const [deleteModalInfo, setDeleteModalInfo] = useState({ isOpen: false, tripId: null, tripName: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDeleteTrip = async () => {
    const { tripId, tripName } = deleteModalInfo;
    if (!tripId) return;

    setIsDeleting(true);
    try {
      // 1. Delete the trip document (Global)
      await deleteDoc(doc(db, 'artifacts', appId, 'trips', tripId));

      // 2. Close if currently open
      if (currentTripId === tripId) setCurrentTripId(null);

      // 3. Log Notification
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'notifications'), {
        type: 'delete',
        message: `Trip '${tripName || 'Untitled'}' was deleted`,
        user: user.displayName || 'User',
        timestamp: Date.now(),
        read: false
      });

    } catch (error) {
      console.error("Error deleting trip:", error);
    } finally {
      setIsDeleting(false);
      setDeleteModalInfo({ isOpen: false, tripId: null, tripName: '' });
    }
  };

  const deleteTrip = (e, tripId, tripName) => {
    e.stopPropagation();
    setDeleteModalInfo({ isOpen: true, tripId, tripName });
  };



  if (loading) {
    return <AppLoadingSkeleton />;
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
    <>
      <Layout
        user={user}
        handleLogout={handleLogout}
        currentView={currentView}
        setCurrentView={setCurrentView}
        setCurrentTripId={setCurrentTripId}
        tripsList={tripsList}
      >
        {/* --- Global SEO & View-Specific SEO --- */}
        <SEO
          title={currentView === 'dashboard' ? 'Dashboard' :
            currentView === 'about' ? 'About Us' :
              currentView === 'profile' ? 'My Profile' :
                currentView === 'protips' ? 'Pro Tips' :
                  'Trip Planner'}
          description="TravelCFO is the smartest way to plan trips, track expenses, and manage travel budgets. Free, private, and secure."
          canonical={`https://tripify-c49b6.web.app/?view=${currentView}`}
        />

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

        {currentView === 'about' && <About setCurrentView={setCurrentView} />}
        {currentView === 'profile' && <Profile user={user} onLogout={handleLogout} />}
        {currentView === 'protips' && <ProTips />}
        {currentView === 'privacy' && <AppPrivacy />}
        {currentView === 'terms' && <TermsOfService />}

        {/* Placeholders for upcoming sections */}
        {currentView === 'expenses' && (
          <GlobalExpenses tripsList={tripsList} setCurrentView={setCurrentView} />
        )}

        {currentView === 'settings' && (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <div className="text-4xl mb-4">🚧</div>
            <h2 className="text-xl font-bold text-slate-600">Coming Soon</h2>
            <p>This module is under development.</p>
          </div>
        )}

      </Layout>
      <ConfirmationModal
        isOpen={deleteModalInfo.isOpen}
        onClose={() => setDeleteModalInfo({ ...deleteModalInfo, isOpen: false })}
        onConfirm={confirmDeleteTrip}
        title="Delete Trip?"
        message={`Are you sure you want to delete "${deleteModalInfo.tripName}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </>
  );
}
