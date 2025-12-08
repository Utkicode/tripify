import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, onSnapshot, addDoc, deleteDoc, doc } from "firebase/firestore";
import { auth, db } from './firebase.js';
import { appId } from './constants.js';

import Auth from './components/Auth';
import TripList from './components/TripList';
import TripDetail from './components/TripDetail';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import About from './components/About';

export default function App() {
  // --- Auth State ---
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // --- App View State ---
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'trips', 'expenses', 'settings'
  const [currentTripId, setCurrentTripId] = useState(null);
  const [tripsList, setTripsList] = useState([]);

  // Listen for auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch trips
  useEffect(() => {
    if (!user) {
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
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentTripId(null);
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

  if (authLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><RefreshCw className="animate-spin text-blue-500" size={32} /></div>;

  if (!user) {
    return <Auth />;
  }

  // If a specific trip is open, show the editor (Full screen mode)
  if (currentTripId) {
    return (
      <TripDetail
        user={user}
        tripId={currentTripId}
        setCurrentTripId={setCurrentTripId}
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
    >
      {currentView === 'dashboard' && (
        <Dashboard
          user={user}
          tripsList={tripsList}
          setCurrentTripId={setCurrentTripId}
          createNewTrip={createNewTrip}
          deleteTrip={deleteTrip}
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
