import { useState, useEffect, Suspense, lazy } from'react';
import { ArrowsClockwise } from'@phosphor-icons/react';
import { signOut } from"firebase/auth";
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, where, getDoc } from"firebase/firestore";
import { auth, db } from'./firebase.js';
import { appId, SITE_URL } from'./constants.js';
import { sendNotification } from'./services/notificationService';
import { useProfile } from'./context/ProfileContext';

// --- Lazy Load Components for Performance ---
const Auth = lazy(() => import('./components/Auth'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const TripList = lazy(() => import('./components/TripList'));
const TripDetail = lazy(() => import('./components/TripDetail'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const Layout = lazy(() => import('./components/Layout'));
const PublicLayout = lazy(() => import('./components/common/PublicLayout'));
const Features = lazy(() => import('./components/Features'));

const About = lazy(() => import('./components/About'));
const VerifyEmail = lazy(() => import('./components/VerifyEmail'));
const ProfileCompletion = lazy(() => import('./components/ProfileCompletion'));
const Profile = lazy(() => import('./components/Profile'));
const ProTips = lazy(() => import('./components/ProTips'));
const GlobalExpenses = lazy(() => import('./components/GlobalExpenses'));
const AppPrivacy = lazy(() => import('./components/AppPrivacy'));
const TermsOfService = lazy(() => import('./components/TermsOfService'));
const NewTripModal = lazy(() => import('./components/NewTripModal'));

import AuthActionHandler from'./components/AuthActionHandler';
import { AppLoadingSkeleton } from'./components/common/LoadingSkeleton';
import SEO from'./components/common/SEO';
import { useConfirm } from'./context/ConfirmContext';
import AuthLoadingTransition from './components/AuthLoadingTransition';

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
  const confirm = useConfirm();

  // --- App View State ---
  // --- App View State ---
  // Initialize from URL query params to persist state on refresh
  const [currentView, setCurrentView] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return p.get('view') ||'dashboard';
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
      if (currentView !=='dashboard') {
        url.searchParams.set('view', currentView);
      } else {
        url.searchParams.delete('view');
      }
    }

    // Only update if changed to avoid unnecessary pushState calls
    if (url.toString() !== window.location.toString()) {
      window.history.pushState({},'', url);
    }
  }, [currentView, currentTripId]);

  const [targetTab, setTargetTab] = useState(null);
  const [tripsList, setTripsList] = useState([]);
  const [tripLoading, setTripLoading] = useState(true);
  const [newTripModalConfig, setNewTripModalConfig] = useState({ isOpen: false, tripId: null });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasStartedTransition, setHasStartedTransition] = useState(false);

  useEffect(() => {
    if (user && isProfileComplete && (!user.email || user.emailVerified)) {
      if (!hasStartedTransition) {
        setIsTransitioning(true);
        setHasStartedTransition(true);
      }
    } else {
      setIsTransitioning(false);
      setHasStartedTransition(false);
    }
  }, [user, isProfileComplete]);

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
      collection(db,'artifacts', appId,'trips'),
      where('collaborators','array-contains', user.uid)
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

  const createNewTrip = (tripId = null) => {
    setNewTripModalConfig({
      isOpen: true,
      tripId: typeof tripId === 'string' ? tripId : null
    });
  };

  // --- Delete Trip Logic ---
  const confirmDeleteTrip = async (tripId, tripName) => {
    if (!tripId) return;

    const tripRef = doc(db,'artifacts', appId,'trips', tripId);
    // Verify current user is the trip owner before allowing deletion
    const tripSnap = await getDoc(tripRef);
    if (!tripSnap.exists()) throw new Error('Trip not found.');
    const tripData = tripSnap.data();
    if (tripData.ownerId !== user.uid) {
      throw new Error('Only the trip owner can delete this trip.');
    }
    const collaborators = tripData.collaborators || [];

      // Filter out current user (the deleter)
      const targetUsers = collaborators.filter(uid => uid !== user.uid);

      // Send notification to each collaborator
      await Promise.all(targetUsers.map(uid =>
        sendNotification(uid, {
          type:'trip_delete',
          tripId: null, // Trip is gone, so no ID to link to
          tripName: tripName ||'A trip',
          senderId: user.uid,
          senderName: user.displayName || user.email ||'Someone',
          message: `${user.displayName ||'Someone'} deleted the trip "${tripName ||'Untitled'}"`,
          timestamp: Date.now()
        })
      ));

      // 2. Delete the trip document (Global)
      await deleteDoc(tripRef);

      // 3. Close if currently open
      if (currentTripId === tripId) setCurrentTripId(null);

      // 4. Log Notification (Self)
      await addDoc(collection(db,'artifacts', appId,'users', user.uid,'notifications'), {
        type:'delete',
        message: `Trip'${tripName ||'Untitled'}' was deleted`,
        user: user.displayName ||'User',
        timestamp: Date.now(),
        read: false
      });

  };

  const deleteTrip = (e, tripId, tripName) => {
    e.stopPropagation();
    confirm({
      title: 'Delete Trip?',
      message: `Are you sure you want to delete "${tripName ||'Untitled'}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      isDestructive: true,
      onConfirm: () => confirmDeleteTrip(tripId, tripName)
    });
  };



  if (loading) {
    return <AppLoadingSkeleton />;
  }

  // Fallback destination check for transition screen
  const transitionDestination = (tripsList.length === 1 && tripsList[0].destination)
    ? tripsList[0].destination
    : null;

  if (isTransitioning) {
    return (
      <AuthLoadingTransition
        isDataReady={!tripLoading}
        destination={transitionDestination}
        onTransitionComplete={() => setIsTransitioning(false)}
      />
    );
  }

  // --- UNAUTHENTICATED OR PUBLIC VIEW HANDLER ---
  // If no user is logged in OR we are explicitly on a public route that we want to show even if logged in 
  // (though usually we'd redirect logged in users to dash, let's keep it simple: if (!user), show public site).
  if (!user) {
    if (currentView ==='dashboard') {
      return (
        <Suspense fallback={<AppLoadingSkeleton />}>
          <LandingPage currentView={currentView} />
        </Suspense>
      );
    }

    // For other public views (features, about, etc.), use the PublicLayout
    return (
      <Suspense fallback={<AppLoadingSkeleton />}>
        <PublicLayout setCurrentView={setCurrentView} currentView={currentView}>
          {currentView ==='features' && <Features />}
          {currentView ==='about' && <About setCurrentView={setCurrentView} />}
          {currentView ==='protips' && <ProTips />}
          {currentView ==='privacy' && <AppPrivacy />}
          {currentView ==='terms' && <TermsOfService />}
          {/* Fallback to Landing if unknown view or is a SEO landing view */}
          {['features','about','protips','privacy','terms'].indexOf(currentView) === -1 && <LandingPage currentView={currentView} />}
        </PublicLayout>
      </Suspense>
    );
  }

  // 1. Email Verification Check (Skip if no email, e.g. Phone Auth)
  if (user.email && !user.emailVerified) {
    return (
      <Suspense fallback={<AppLoadingSkeleton />}>
        <VerifyEmail user={user} />
      </Suspense>
    );
  }

  // 2. Profile Completion Check
  if (!isProfileComplete) {
    return (
      <Suspense fallback={<AppLoadingSkeleton />}>
        <ProfileCompletion user={user} onComplete={() => refreshProfile(user.uid)} />
      </Suspense>
    ); // Force refresh on completion
  }

  // If a specific trip is open, show the editor (Full screen mode)
  // If a specific trip is open, show the editor (Full screen mode)
  if (currentTripId) {
    // Verify user is a collaborator on this trip before rendering
    if (!tripLoading) {
      const isCollaborator = tripsList.some(t => t.id === currentTripId);
      if (!isCollaborator) {
        // User is not a collaborator — show access denied
        return (
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-slate-700">Access Denied</h2>
              <p className="text-slate-500 mt-2">You don't have access to this trip.</p>
              <button onClick={() => { window.history.pushState({}, '', '/'); setCurrentTripId(null); setCurrentView('trips'); }}
                className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg">
                Go to My Trips
              </button>
            </div>
          </div>
        );
      }
    }
    return (
      <Suspense fallback={<AppLoadingSkeleton />}>
        <TripDetail
          user={user}
          tripId={currentTripId}
          setCurrentTripId={setCurrentTripId}
          initialTab={targetTab}
          clearInitialTab={() => setTargetTab(null)}
        />
      </Suspense>
    );
  }

  // Default Layout with Sidebar
  return (
    <Suspense fallback={<AppLoadingSkeleton />}>
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
          title={
            currentView ==='dashboard' ?'Dashboard' :
              currentView ==='about' ?'About Us' :
                currentView ==='profile' ?'My Profile' :
                  currentView ==='protips' ?'Pro Tips' :
                    currentView ==='travel-expense-tracker' ?'Best Travel Expense Tracker & Split Bill App' :
                      currentView ==='group-trip-planner' ?'Group Trip Planner & Organizer' :
                        currentView ==='vacation-budget-app' ?'Vacation Budget Planner & Calculator' :
                          currentView ==='itinerary-builder' ?'Free Travel Itinerary Builder' :'Trip Planner'
          }
          description={
            currentView ==='travel-expense-tracker' ?'Track shared travel expenses, split bills instantly, and manage your vacation budget with TravelCFO. The best free app for group travel costs.' :
              currentView ==='group-trip-planner' ?'Collaborate on trip itineraries with friends in real-time. Vote on activities, share documents, and plan the perfect group trip together.' :
                currentView ==='vacation-budget-app' ?'Calculate your travel costs, set daily limits, and stay on budget. Visual analytics for your flight, hotel, and food expenses.' :
                  currentView ==='itinerary-builder' ?'Build detailed day-by-day travel itineraries. Drag and drop activities, add maps, and export your travel plan to PDF.' :"TravelCFO is the smartest way to plan trips, track expenses, and manage travel budgets. Free, private, and secure."
          }
          keywords={
            currentView ==='travel-expense-tracker' ?'travel expense tracker, split bills, travel budget, cost sharing, expense manager' :
              currentView ==='group-trip-planner' ?'group travel, plan trip with friends, collaborative itinerary, travel organizer' :
                currentView ==='vacation-budget-app' ?'vacation cost, holiday budget, travel finance, trip calculator' :
                  currentView ==='itinerary-builder' ?'trip itinerary, travel schedule, daily planner, travel map' :'travel planner, expense tracker, group travel, itinerary builder'
          }
          canonical={`${SITE_URL}/?view=${currentView}`}
        />

        {currentView ==='dashboard' && (
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

        {currentView ==='trips' && (
          <TripList
            tripsList={tripsList}
            setCurrentTripId={setCurrentTripId}
            createNewTrip={createNewTrip}
            deleteTrip={deleteTrip}
          />
        )}

        {currentView ==='about' && <About setCurrentView={setCurrentView} />}
        {currentView ==='profile' && <Profile user={user} onLogout={handleLogout} />}
        {currentView ==='protips' && <ProTips />}
        {currentView ==='privacy' && <AppPrivacy />}
        {currentView ==='terms' && <TermsOfService />}

        {/* Placeholders for upcoming sections */}
        {currentView ==='expenses' && (
          <GlobalExpenses tripsList={tripsList} setCurrentView={setCurrentView} />
        )}

        {currentView ==='settings' && (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <div className="text-4xl mb-4">🚧</div>
            <h2 className="text-xl font-bold text-slate-600">Coming Soon</h2>
            <p>This module is under development.</p>
          </div>
        )}

      </Layout>
      <NewTripModal
        isOpen={newTripModalConfig.isOpen}
        onClose={() => setNewTripModalConfig({ isOpen: false, tripId: null })}
        tripId={newTripModalConfig.tripId}
        user={user}
        setCurrentTripId={setCurrentTripId}
        setTargetTab={setTargetTab}
      />
    </Suspense>
  );
}
