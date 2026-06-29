import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MapContainer } from './components/MapContainer';
import { IssueCard } from './components/IssueCard';
import { ReportModal } from './components/ReportModal';
import { Analytics } from './components/Analytics';
import { Leaderboard } from './components/Leaderboard';
import { CivicDirectory } from './components/CivicDirectory';
import { initialIssues } from './components/initialIssues';
import type { CivicIssue, UserProfile } from './components/initialIssues';
import { translations } from './components/translations';
import type { LanguageCode } from './components/translations';
import { LoginScreen } from './components/LoginScreen';
import { initFirebase } from './firebase';
import type { FirebaseConfig, FirebaseServices } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot
} from 'firebase/firestore';

interface LocationState {
  city: string;
  state: string;
  lat: number;
  lng: number;
}

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function App() {
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [location, setLocation] = useState<LocationState>({
    city: 'Bengaluru',
    state: 'Karnataka',
    lat: 12.9716,
    lng: 77.5946
  });
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({});
  const [translatingId, setTranslatingId] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [editedActionPlan, setEditedActionPlan] = useState<string | null>(null);
  
  // Firebase configuration state
  const [fbConfig, setFbConfig] = useState<FirebaseConfig | null>(null);
  const [fbServices, setFbServices] = useState<FirebaseServices | null>(null);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'ai' | 'firebase'>('ai');
  const [adminFilterStatus, setAdminFilterStatus] = useState<'All' | 'Pending' | 'Resolved'>('All');
  const [adminCommentTexts, setAdminCommentTexts] = useState<Record<string, string>>({});
  const [adminActionPlans, setAdminActionPlans] = useState<Record<string, string>>({});

  const [activeTab, setActiveTab] = useState<'feed' | 'analytics' | 'leaderboard' | 'contacts'>('feed');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  
  // Modal states
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isApiOpen, setIsApiOpen] = useState(false);
  const [inspectedIssueId, setInspectedIssueId] = useState<string | null>(null);
  
  // API key state
  const [apiKey, setApiKey] = useState('');
  
  // Inspector comment text
  const [commentText, setCommentText] = useState('');
  
  // Selected map clicked coordinates
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Initial Load from localStorage
  useEffect(() => {
    // Issues Seeding
    const storedIssues = localStorage.getItem('civic_issues');
    if (storedIssues) {
      setIssues(JSON.parse(storedIssues));
    } else {
      localStorage.setItem('civic_issues', JSON.stringify(initialIssues));
      setIssues(initialIssues);
    }

    // Location Seeding
    const storedLocation = localStorage.getItem('user_active_location');
    if (storedLocation) {
      setLocation(JSON.parse(storedLocation));
    }

    // Language Seeding
    const storedLang = localStorage.getItem('user_active_language');
    if (storedLang) {
      setLanguage(storedLang as LanguageCode);
    }

    // Restore logged in user session
    const storedSession = localStorage.getItem('logged_in_user');
    if (storedSession) {
      setCurrentUser(JSON.parse(storedSession));
    }

    const urlParams = new URLSearchParams(window.location.search);
    const forceLocal = urlParams.get('db') === 'local' || localStorage.getItem('force_local_mode') === 'true';

    if (forceLocal) {
      setFbConfig(null);
      setFbServices(null);
    } else {

      // Restore Firebase credentials
      const storedConfig = localStorage.getItem('user_firebase_config');
      if (storedConfig) {
        try {
          const parsed = JSON.parse(storedConfig);
          setFbConfig(parsed);
          const services = initFirebase(parsed);
          setFbServices(services);
        } catch (err) {
          console.error('Failed loading persisted Firebase credentials:', err);
        }
      } else {
        // Fallback credentials from environment variables
        const envConfig = {
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'hyperlocal-hub-community-hero.firebaseapp.com',
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'hyperlocal-hub-community-hero',
          storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'hyperlocal-hub-community-hero.firebasestorage.app',
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '9235004494',
          appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:9235004494:web:af0ade14581f49e662d71f'
        };
        if (envConfig.apiKey && envConfig.projectId) {
          setFbConfig(envConfig);
          const services = initFirebase(envConfig);
          setFbServices(services);
        }
      }
    }


    // API Key
    setApiKey(localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '');
  }, []);

  // Sync action plan text field on inspected item change
  useEffect(() => {
    setEditedActionPlan(null);
  }, [inspectedIssueId]);

  // Dynamic initialization when config updates
  useEffect(() => {
    if (fbConfig) {
      const services = initFirebase(fbConfig);
      setFbServices(services);
    } else {
      setFbServices(null);
    }
  }, [fbConfig]);

  // Real-time synchronization Firestore listener
  useEffect(() => {
    if (!fbServices) {
      const storedIssues = localStorage.getItem('civic_issues');
      if (storedIssues) {
        setIssues(JSON.parse(storedIssues));
      } else {
        localStorage.setItem('civic_issues', JSON.stringify(initialIssues));
        setIssues(initialIssues);
      }
      return;
    }

    const { db } = fbServices;
    const q = query(collection(db, 'issues'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: CivicIssue[] = [];
      snapshot.forEach((docSnap) => {
        docs.push({
          id: docSnap.id,
          ...(docSnap.data() as Omit<CivicIssue, 'id'>)
        });
      });

      // Self-seed remote DB if empty
      if (docs.length === 0) {
        setIssues(initialIssues);
        localStorage.setItem('civic_issues', JSON.stringify(initialIssues));
        initialIssues.forEach(async (issue) => {
          try {
            await setDoc(doc(db, 'issues', issue.id), issue);
          } catch (err) {
            console.error('Failed to seed issue:', issue.id, err);
          }
        });
      } else {
        setIssues(docs);
        localStorage.setItem('civic_issues', JSON.stringify(docs));
      }
    }, (error) => {
      console.error('Firestore listener error:', error);
      // Fallback to local cache mode on connection/permission failure
      setFbServices(null);
    });

    return () => unsubscribe();
  }, [fbServices]);

  // Log in success handler
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('logged_in_user', JSON.stringify(user));
  };

  // Log out session
  const handleLogout = () => {
    localStorage.removeItem('logged_in_user');
    setCurrentUser(null);
  };

  // Update localStorage issues
  const updateIssues = (newIssues: CivicIssue[]) => {
    setIssues(newIssues);
    localStorage.setItem('civic_issues', JSON.stringify(newIssues));
  };

  const handleLocationChange = (newLoc: LocationState) => {
    setLocation(newLoc);
    localStorage.setItem('user_active_location', JSON.stringify(newLoc));
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang as LanguageCode);
    localStorage.setItem('user_active_language', lang);
    setTranslatedTexts({});
  };

  const handleAiTranslateText = async (text: string, targetFieldId: string, onTranslated: (translatedText: string) => void) => {
    if (!apiKey) {
      alert("Please configure your Gemini API Key first by clicking 'AI Config' in the header.");
      return;
    }
    
    setTranslatingId(targetFieldId);
    
    const langNames: Record<string, string> = {
      en: 'English',
      hi: 'Hindi (हिन्दी)',
      kn: 'Kannada (ಕನ್ನಡ)',
      ta: 'Tamil (தமிழ்)',
      te: 'Telugu (తెలుగు)',
      mr: 'Marathi (मराठी)'
    };
    
    const targetLanguageName = langNames[language] || 'English';

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Translate the following text into ${targetLanguageName}. Respond ONLY with the translated text. Do not add any introduction, explanations, quotes, or formatting. Text: "${text}"`
            }]
          }]
        })
      });

      if (!response.ok) throw new Error('Translation failed');
      const result = await response.json();
      const translatedText = result.candidates[0].content.parts[0].text.trim();
      onTranslated(translatedText);
    } catch (err) {
      console.error(err);
      alert('AI translation failed. Please verify your API key.');
    } finally {
      setTranslatingId(null);
    }
  };

  // Dynamic Seeder: if there are no issues in the selected location, auto-generate 3 mock issues nearby
  useEffect(() => {
    if (issues.length === 0) return;

    const nearby = issues.filter(issue => getDistanceKm(location.lat, location.lng, issue.lat, issue.lng) <= 50);
    if (nearby.length === 0) {
      const newMockIssues = [
        {
          id: 'issue-auto-1-' + Date.now(),
          title: `Pothole on Main Road in ${location.city}`,
          description: `A large pothole has developed on the main arterial road in ${location.city}. Stalls traffic and poses high danger to two-wheelers.`,
          category: 'Pothole' as const,
          severity: 'High' as const,
          lat: location.lat + (Math.random() - 0.5) * 0.02,
          lng: location.lng + (Math.random() - 0.5) * 0.02,
          image: '',
          status: 'Reported' as const,
          upvotes: 12,
          downvotes: 0,
          votedBy: [],
          comments: [],
          createdAt: new Date(Date.now() - 36e5 * 24).toISOString(),
          actionPlan: `Deploy asphalt repair crew from nearest ${location.city} civic division.`,
          address: `Main Road, ${location.city}, ${location.state}`,
          reporterName: 'Community Assistant'
        },
        {
          id: 'issue-auto-2-' + Date.now(),
          title: `Broken Streetlight near Junction`,
          description: `Streetlight fixture is completely broken near a busy junction in ${location.city}, making the crossing pitch black at night. Pedestrians are unable to cross safely.`,
          category: 'Damaged Streetlight' as const,
          severity: 'Medium' as const,
          lat: location.lat + (Math.random() - 0.5) * 0.02,
          lng: location.lng + (Math.random() - 0.5) * 0.02,
          image: '',
          status: 'Reported' as const,
          upvotes: 7,
          downvotes: 0,
          votedBy: [],
          comments: [],
          createdAt: new Date(Date.now() - 36e5 * 12).toISOString(),
          actionPlan: `Replace burnt LED element on junction pole.`,
          address: `Near Junction, ${location.city}, ${location.state}`,
          reporterName: 'Community Assistant'
        },
        {
          id: 'issue-auto-3-' + Date.now(),
          title: `Overflowing Waste Bin`,
          description: `Large municipal garbage container in ${location.city} is overflowing. Stray animals are scattering trash across the street. Emitting strong odors.`,
          category: 'Waste Management' as const,
          severity: 'Medium' as const,
          lat: location.lat + (Math.random() - 0.5) * 0.02,
          lng: location.lng + (Math.random() - 0.5) * 0.02,
          image: '',
          status: 'Reported' as const,
          upvotes: 15,
          downvotes: 1,
          votedBy: [],
          comments: [],
          createdAt: new Date(Date.now() - 36e5 * 4).toISOString(),
          actionPlan: `Schedule emergency waste collection disposal truck.`,
          address: `Near municipal container, ${location.city}, ${location.state}`,
          reporterName: 'Community Assistant'
        }
      ];

      if (fbServices) {
        const { db } = fbServices;
        newMockIssues.forEach(async (issue) => {
          try {
            await setDoc(doc(db, 'issues', issue.id), issue);
          } catch (err) {
            console.error('Failed writing mock issue to Firestore:', err);
          }
        });
      } else {
        const nextIssues = [...issues, ...newMockIssues];
        updateIssues(nextIssues);
      }
    }
  }, [location, issues]);

  // Sync / update user profile details in state and localStorage
  const updateCurrentUserProfile = (newProfile: UserProfile) => {
    setCurrentUser(newProfile);
    localStorage.setItem('logged_in_user', JSON.stringify(newProfile));
    
    // Also update this user inside the civic_users list in localStorage
    const users = localStorage.getItem('civic_users');
    if (users) {
      const parsedUsers = JSON.parse(users);
      const updated = parsedUsers.map((u: any) => u.username.toLowerCase() === newProfile.username.toLowerCase() ? { ...u, ...newProfile } : u);
      localStorage.setItem('civic_users', JSON.stringify(updated));
    }

    // Write to Firestore if connected
    if (fbServices && newProfile.userId) {
      const { db } = fbServices;
      setDoc(doc(db, 'users', newProfile.userId), newProfile).catch(err => {
        console.error('Failed writing user profile to Firestore:', err);
      });
    }
  };

  // Submit new issue
  const handleSubmitIssue = async (newDetails: {
    title: string;
    description: string;
    category: CivicIssue['category'];
    severity: CivicIssue['severity'];
    lat: number;
    lng: number;
    image: string;
    video: string;
    actionPlan: string;
    address: string;
  }) => {
    const issueId = 'issue-' + Date.now();
    const newIssue: CivicIssue = {
      id: issueId,
      title: newDetails.title,
      description: newDetails.description,
      category: newDetails.category,
      severity: newDetails.severity,
      lat: newDetails.lat,
      lng: newDetails.lng,
      image: newDetails.image,
      video: newDetails.video,
      status: 'Reported',
      upvotes: 1,
      downvotes: 0,
      votedBy: [currentUser?.userId || 'current-user'],
      comments: [],
      createdAt: new Date().toISOString(),
      actionPlan: newDetails.actionPlan,
      city: location.city,
      address: newDetails.address,
      reporterName: currentUser?.fullName || 'Anonymous Citizen'
    };

    if (fbServices) {
      try {
        const { db } = fbServices;
        await setDoc(doc(db, 'issues', issueId), newIssue);
        const nextIssues = [newIssue, ...issues];
        updateIssues(nextIssues);
      } catch (err) {
        console.error('Failed submitting issue to Firestore:', err);
        alert('Firestore write error, falling back locally.');
        const nextIssues = [newIssue, ...issues];
        updateIssues(nextIssues);
      }
    } else {
      const nextIssues = [newIssue, ...issues];
      updateIssues(nextIssues);
    }

    if (currentUser && currentUser.role === 'citizen') {
      const nextPoints = currentUser.points + 50;
      const nextLevel = Math.floor(nextPoints / 100) + 1;
      const nextBadges = [...currentUser.badges];

      if (newDetails.category === 'Pothole' && !nextBadges.includes('pothole_patrol')) {
        nextBadges.push('pothole_patrol');
      } else if (newDetails.category === 'Waste Management' && !nextBadges.includes('trash_buster')) {
        nextBadges.push('trash_buster');
      } else if (newDetails.category === 'Damaged Streetlight' && !nextBadges.includes('streetlight_savior')) {
        nextBadges.push('streetlight_savior');
      }

      if (nextLevel > currentUser.level) {
        alert(`Congratulations! You leveled up to Level ${nextLevel}!`);
      }

      updateCurrentUserProfile({
        ...currentUser,
        points: nextPoints,
        level: nextLevel,
        badges: nextBadges
      });
    }

    setIsReportOpen(false);
    setSelectedCoords(null);
  };

  // Upvote / Dispute validation handler
  const handleVote = async (issueId: string, direction: 'up' | 'down') => {
    if (!currentUser) return;
    if (currentUser.votedIssues.includes(issueId)) {
      alert("You have already validated/flagged this issue!");
      return;
    }

    const currentIssue = issues.find(i => i.id === issueId);
    if (!currentIssue) return;

    const nextUpvotes = direction === 'up' ? currentIssue.upvotes + 1 : currentIssue.upvotes;
    const nextDownvotes = direction === 'down' ? currentIssue.downvotes + 1 : currentIssue.downvotes;

    if (fbServices) {
      try {
        const { db } = fbServices;
        await updateDoc(doc(db, 'issues', issueId), {
          upvotes: nextUpvotes,
          downvotes: nextDownvotes
        });
        const nextIssues = issues.map(i => {
          if (i.id === issueId) {
            return {
              ...i,
              upvotes: nextUpvotes,
              downvotes: nextDownvotes
            };
          }
          return i;
        });
        updateIssues(nextIssues);
      } catch (err) {
        console.error('Failed upvoting in Firestore:', err);
      }
    } else {
      const nextIssues = issues.map(i => {
        if (i.id === issueId) {
          return {
            ...i,
            upvotes: nextUpvotes,
            downvotes: nextDownvotes
          };
        }
        return i;
      });
      updateIssues(nextIssues);
    }

    if (currentUser.role === 'citizen') {
      const bonus = direction === 'up' ? 10 : 5;
      const nextPoints = currentUser.points + bonus;
      const nextLevel = Math.floor(nextPoints / 100) + 1;
      const nextVoted = [...currentUser.votedIssues, issueId];
      const nextBadges = [...currentUser.badges];

      if (nextVoted.length >= 5 && !nextBadges.includes('super_verifier')) {
        nextBadges.push('super_verifier');
      }

      if (nextLevel > currentUser.level) {
        alert(`Congratulations! You leveled up to Level ${nextLevel}!`);
      }

      updateCurrentUserProfile({
        ...currentUser,
        points: nextPoints,
        level: nextLevel,
        votedIssues: nextVoted,
        badges: nextBadges
      });
    } else {
      const nextVoted = [...currentUser.votedIssues, issueId];
      updateCurrentUserProfile({
        ...currentUser,
        votedIssues: nextVoted
      });
    }
  };

  const handleSubmitComment = async (issueId: string, text: string) => {
    if (!text.trim() || !currentUser) return;

    const currentIssue = issues.find(i => i.id === issueId);
    if (!currentIssue) return;

    const newComment = {
      id: 'comment-' + Date.now(),
      author: currentUser.fullName,
      text: text.trim(),
      createdAt: new Date().toISOString()
    };

    const nextComments = [...currentIssue.comments, newComment];

    if (fbServices) {
      try {
        const { db } = fbServices;
        await updateDoc(doc(db, 'issues', issueId), {
          comments: nextComments
        });
        const nextIssues = issues.map(i => {
          if (i.id === issueId) {
            return {
              ...i,
              comments: nextComments
            };
          }
          return i;
        });
        updateIssues(nextIssues);
      } catch (err) {
        console.error('Failed commenting in Firestore:', err);
      }
    } else {
      const nextIssues = issues.map(i => {
        if (i.id === issueId) {
          return {
            ...i,
            comments: nextComments
          };
        }
        return i;
      });
      updateIssues(nextIssues);
    }

    if (currentUser.role === 'citizen') {
      const nextPoints = currentUser.points + 10;
      const nextLevel = Math.floor(nextPoints / 100) + 1;
      if (nextLevel > currentUser.level) {
        alert(`Congratulations! You leveled up to Level ${nextLevel}!`);
      }
      updateCurrentUserProfile({
        ...currentUser,
        points: nextPoints,
        level: nextLevel
      });
    }
  };

  // Add Comment to issue
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !inspectedIssueId) return;
    await handleSubmitComment(inspectedIssueId, commentText);
    setCommentText('');
  };

  // Mark Issue as Resolved (Citizen resolve route)
  const handleResolveIssue = async (issueId: string) => {
    if (!currentUser) return;
    const currentIssue = issues.find(i => i.id === issueId);
    if (!currentIssue) return;

    // Crowdsourced verification consensus threshold check
    if (currentUser.role !== 'admin' && currentIssue.upvotes < 3) {
      alert(`Civic Verification Required: Citizen-led resolutions require at least 3 community vouches (upvotes). Currently has ${currentIssue.upvotes}/3. Vouch or share to verify!`);
      return;
    }

    const note = prompt(
      "Provide resolution details / evidence notes for community review:", 
      "Issue status resolved and verified in citizen field audit."
    );
    if (note === null) return; // User cancelled resolution

    const systemComment = {
      id: 'comment-sys-' + Date.now(),
      author: `${currentUser.fullName} (${currentUser.role === 'admin' ? 'Officer' : 'Citizen Witness'})`,
      text: note.trim() || 'Issue status resolved and verified in citizen field audit.',
      createdAt: new Date().toISOString()
    };

    const nextComments = [...currentIssue.comments, systemComment];

    if (fbServices) {
      try {
        const { db } = fbServices;
        await updateDoc(doc(db, 'issues', issueId), {
          status: 'Resolved',
          comments: nextComments
        });
        const nextIssues = issues.map(i => {
          if (i.id === issueId) {
            return {
              ...i,
              status: 'Resolved' as const,
              comments: nextComments
            };
          }
          return i;
        });
        updateIssues(nextIssues);
      } catch (err) {
        console.error('Failed resolving issue in Firestore:', err);
      }
    } else {
      const nextIssues = issues.map(i => {
        if (i.id === issueId) {
          return {
            ...i,
            status: 'Resolved' as const,
            comments: nextComments
          };
        }
        return i;
      });
      updateIssues(nextIssues);
    }

    if (currentUser.role === 'citizen') {
      const nextPoints = currentUser.points + 30;
      const nextLevel = Math.floor(nextPoints / 100) + 1;
      
      if (nextLevel > currentUser.level) {
        alert(`Congratulations! You leveled up to Level ${nextLevel}!`);
      }

      updateCurrentUserProfile({
        ...currentUser,
        points: nextPoints,
        level: nextLevel
      });
    }
  };

  // Admin-specific actions
  const handleStatusChange = async (issueId: string, newStatus: CivicIssue['status']) => {
    const currentIssue = issues.find(i => i.id === issueId);
    if (!currentIssue) return;

    const statusComment = {
      id: 'comment-sys-' + Date.now(),
      author: `${currentUser?.fullName || 'Municipal Officer'}`,
      text: `Status updated to ${newStatus}.`,
      createdAt: new Date().toISOString()
    };

    const nextComments = [...currentIssue.comments, statusComment];

    if (fbServices) {
      try {
        const { db } = fbServices;
        await updateDoc(doc(db, 'issues', issueId), {
          status: newStatus,
          comments: nextComments
        });
        const nextIssues = issues.map(i => {
          if (i.id === issueId) {
            return {
              ...i,
              status: newStatus,
              comments: nextComments
            };
          }
          return i;
        });
        updateIssues(nextIssues);
      } catch (err) {
        console.error('Failed status change in Firestore:', err);
      }
    } else {
      const nextIssues = issues.map(i => {
        if (i.id === issueId) {
          return {
            ...i,
            status: newStatus,
            comments: nextComments
          };
        }
        return i;
      });
      updateIssues(nextIssues);
    }
  };

  const handleDeleteIssue = async (issueId: string) => {
    if (confirm('Are you sure you want to delete this reported issue?')) {
      if (fbServices) {
        try {
          const { db } = fbServices;
          await deleteDoc(doc(db, 'issues', issueId));
          const nextIssues = issues.filter(i => i.id !== issueId);
          updateIssues(nextIssues);
          setInspectedIssueId(null);
        } catch (err) {
          console.error('Failed deleting issue in Firestore:', err);
        }
      } else {
        const nextIssues = issues.filter(i => i.id !== issueId);
        updateIssues(nextIssues);
        setInspectedIssueId(null);
      }
    }
  };

  const handleUpdateActionPlan = async (issueId: string, overrideText?: string) => {
    const planText = overrideText !== undefined ? overrideText : editedActionPlan;
    if (planText === null || planText === undefined) return;
    
    if (fbServices) {
      try {
        const { db } = fbServices;
        await updateDoc(doc(db, 'issues', issueId), {
          actionPlan: planText
        });
        const nextIssues = issues.map(i => {
          if (i.id === issueId) {
            return {
              ...i,
              actionPlan: planText
            };
          }
          return i;
        });
        updateIssues(nextIssues);
        setEditedActionPlan(null);
        alert('Action Plan updated successfully.');
      } catch (err) {
        console.error('Failed action plan override in Firestore:', err);
      }
    } else {
      const nextIssues = issues.map(i => {
        if (i.id === issueId) {
          return {
            ...i,
            actionPlan: planText
          };
        }
        return i;
      });
      updateIssues(nextIssues);
      setEditedActionPlan(null);
      alert('Action Plan updated successfully.');
    }
  };

  // Map Click coordinate selector
  const handleMapClick = (lat: number, lng: number) => {
    setSelectedCoords({ lat, lng });
    setIsReportOpen(true);
  };

  // Save API Key Setup
  const handleSaveApiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setApiKey(key);
    setIsApiOpen(false);
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setIsApiOpen(false);
  };

  const handleSaveFirebaseConfig = (config: FirebaseConfig) => {
    localStorage.setItem('user_firebase_config', JSON.stringify(config));
    localStorage.removeItem('force_local_mode');
    setFbConfig(config);
    setIsApiOpen(false);
  };

  const handleDisconnectFirebase = () => {
    localStorage.removeItem('user_firebase_config');
    localStorage.setItem('force_local_mode', 'true');
    setFbConfig(null);
    setFbServices(null);
    setIsApiOpen(false);
  };


  const nearbyIssues = issues.filter(issue => {
    return getDistanceKm(location.lat, location.lng, issue.lat, issue.lng) <= 50;
  });

  const filteredIssues = nearbyIssues.filter(issue => {
    if (filterCategory === 'All') return true;
    return issue.category === filterCategory;
  });

  const adminFilteredIssues = issues.filter(issue => {
    // 1. Designated city check
    if (currentUser && currentUser.role === 'admin' && currentUser.city) {
      const issueCity = issue.city || '';
      if (issueCity.toLowerCase().trim() !== currentUser.city.toLowerCase().trim()) {
        return false;
      }
    } else {
      // Default to 50km radius
      const dist = getDistanceKm(location.lat, location.lng, issue.lat, issue.lng);
      if (dist > 50) return false;
    }

    // 2. Category Filter
    if (filterCategory !== 'All' && issue.category !== filterCategory) {
      return false;
    }

    // 3. Status Filter
    if (adminFilterStatus === 'Pending' && issue.status === 'Resolved') {
      return false;
    }
    if (adminFilterStatus === 'Resolved' && issue.status !== 'Resolved') {
      return false;
    }

    return true;
  });

  const inspectedIssue = issues.find(i => i.id === inspectedIssueId);

  const activeCount = (currentUser && currentUser.role === 'admin' && currentUser.city)
    ? issues.filter(i => i.city && i.city.toLowerCase().trim() === currentUser.city!.toLowerCase().trim() && i.status !== 'Resolved').length
    : nearbyIssues.filter(i => i.status !== 'Resolved').length;

  const resolvedCount = (currentUser && currentUser.role === 'admin' && currentUser.city)
    ? issues.filter(i => i.city && i.city.toLowerCase().trim() === currentUser.city!.toLowerCase().trim() && i.status === 'Resolved').length
    : nearbyIssues.filter(i => i.status === 'Resolved').length;

  const t = translations[language] || translations.en;

  const statusColors: Record<string, string> = {
    'Reported': 'bg-warning-soft text-warning-deep border-warning-deep/20',
    'Under Review': 'bg-cyan-soft text-cyan-deep border-cyan-deep/20',
    'In Progress': 'bg-link-bg-soft text-link border-link/20',
    'Resolved': 'bg-success/10 text-success border-success/20'
  };

  if (!currentUser) {
    return (
      <LoginScreen 
        onLoginSuccess={handleLoginSuccess} 
        t={t} 
        fbServices={fbServices} 
        onDisconnectFirebase={handleDisconnectFirebase} 
      />
    );
  }


  return (
    <div className="min-h-screen bg-canvas-soft text-ink font-sans">
      <Header 
        activeCount={activeCount}
        resolvedCount={resolvedCount}
        points={currentUser ? currentUser.points : 0}
        level={currentUser ? currentUser.level : 1}
        onOpenApiModal={() => setIsApiOpen(true)}
        currentLocation={location}
        onLocationChange={handleLocationChange}
        currentLanguage={language}
        onLanguageChange={handleLanguageChange}
        t={t}
        currentUser={currentUser}
        onLogout={handleLogout}
        dbStatus={fbServices ? 'firebase' : 'local'}
      />

      <main className="relative overflow-hidden min-h-[calc(100vh-64px)] pb-16">
        {/* Mesh gradient ambient element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[350px] mesh-gradient-glow rounded-full pointer-events-none z-0"></div>

        {currentUser.role === 'admin' ? (
          <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 pt-10 pb-16 space-y-8 animate-in fade-in duration-200">
            {/* Top Header / Stats Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-canvas border border-hairline p-6 rounded-2xl shadow-level3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#7928ca]/5 rounded-full blur-xl pointer-events-none"></div>
              
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 bg-[#7928ca]/10 border border-[#7928ca]/20 px-3 py-1 rounded-full text-[#7928ca]">
                  <span className="inline-block w-2 h-2 bg-[#7928ca] rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Municipal Officer Portal</span>
                </div>
                <h1 className="text-2xl font-bold text-primary">
                  Welcome, {currentUser.fullName}
                </h1>
                <p className="text-xs text-mute flex items-center gap-1.5 font-mono">
                  <span>🏢 Assigned Jurisdiction:</span>
                  <span className="bg-[#7928ca]/5 text-[#7928ca] px-2 py-0.5 rounded font-bold border border-[#7928ca]/10">
                    {currentUser.city || 'Global'}
                  </span>
                </p>
              </div>

              {/* Counters */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full md:w-auto">
                <div className="bg-canvas border border-hairline px-2 sm:px-4 py-3 rounded-xl shadow-level1 text-center min-w-0 sm:min-w-[100px]">
                  <span className="block text-[9px] sm:text-[10px] font-mono text-mute uppercase truncate">Pending</span>
                  <span className="text-base sm:text-xl font-extrabold text-warning-deep">{activeCount}</span>
                </div>
                <div className="bg-canvas border border-hairline px-2 sm:px-4 py-3 rounded-xl shadow-level1 text-center min-w-0 sm:min-w-[100px]">
                  <span className="block text-[9px] sm:text-[10px] font-mono text-mute uppercase truncate">Resolved</span>
                  <span className="text-base sm:text-xl font-extrabold text-success">{resolvedCount}</span>
                </div>
                <div className="bg-canvas border border-hairline px-2 sm:px-4 py-3 rounded-xl shadow-level1 text-center min-w-0 sm:min-w-[100px]">
                  <span className="block text-[9px] sm:text-[10px] font-mono text-mute uppercase truncate">Total</span>
                  <span className="text-base sm:text-xl font-extrabold text-primary">{activeCount + resolvedCount}</span>
                </div>
              </div>
            </div>

            {/* Filter Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-canvas border border-hairline p-4 rounded-xl shadow-level2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-primary">Filter Reports:</span>
                <span className="text-[10px] bg-canvas-soft-2 border border-hairline px-2 py-0.5 rounded font-mono font-bold text-mute">
                  Showing {adminFilteredIssues.length} issues
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Category Dropdown */}
                <div className="flex items-center gap-1">
                  <label className="text-[10px] font-mono text-mute uppercase">Category:</label>
                  <select 
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="h-8 border border-hairline bg-canvas rounded px-3 text-xs text-body focus:outline-none font-mono cursor-pointer"
                  >
                    <option value="All">{t.allCategories}</option>
                    <option value="Pothole">{t.pothole}</option>
                    <option value="Waste Management">{t.wasteManagement}</option>
                    <option value="Damaged Streetlight">{t.streetlight}</option>
                    <option value="Water Leakage">{t.waterLeakage}</option>
                    <option value="Public Infrastructure">{t.infrastructure}</option>
                  </select>
                </div>

                {/* Status Dropdown */}
                <div className="flex items-center gap-1">
                  <label className="text-[10px] font-mono text-mute uppercase">Status:</label>
                  <select 
                    value={adminFilterStatus}
                    onChange={(e) => setAdminFilterStatus(e.target.value as any)}
                    className="h-8 border border-hairline bg-canvas rounded px-3 text-xs text-body focus:outline-none font-mono cursor-pointer"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending Only</option>
                    <option value="Resolved">Resolved Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Reports Vertical List */}
            <div className="space-y-6">
              {adminFilteredIssues.length === 0 ? (
                <div className="border border-hairline border-dashed rounded-2xl p-16 text-center text-xs text-mute font-mono bg-canvas select-none space-y-2">
                  <div className="text-2xl">📋</div>
                  <div>No reports found matching the selected filters.</div>
                </div>
              ) : (
                adminFilteredIssues.map(issue => {
                  const isResolved = issue.status === 'Resolved';
                  
                  return (
                    <div key={issue.id} className="bg-canvas border border-hairline rounded-2xl shadow-level3 hover:shadow-level4 p-6 transition duration-200 flex flex-col md:flex-row gap-6 relative overflow-hidden">
                      {/* Highlight bar for high severity */}
                      {issue.severity === 'High' && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-error"></div>
                      )}
                      {issue.severity === 'Medium' && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-warning-deep"></div>
                      )}
                      
                      {/* Checkmark Column / Section */}
                      <div className="flex flex-row md:flex-col items-center justify-between md:justify-start gap-4">
                        <button
                          onClick={() => {
                            if (isResolved) {
                              handleStatusChange(issue.id, 'Reported');
                            } else {
                              handleResolveIssue(issue.id);
                            }
                          }}
                          className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-level2 focus:outline-none cursor-pointer group ${
                            isResolved 
                              ? 'bg-success/15 border-success text-success hover:bg-success/20' 
                              : 'bg-canvas border-hairline-strong text-mute hover:border-primary hover:text-primary'
                          }`}
                          title={isResolved ? "Mark as Unresolved" : "Mark as Resolved"}
                        >
                          {isResolved ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" className="animate-in zoom-in-50 duration-200"><polyline points="20 6 9 17 4 12"/></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" className="opacity-40 group-hover:opacity-100 transition-opacity"><polyline points="20 6 9 17 4 12"/></svg>
                          )}
                        </button>
                        <span className="text-[10px] font-mono font-bold text-mute uppercase tracking-wider select-none hidden md:block">
                          {isResolved ? 'Resolved' : 'Resolve'}
                        </span>
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 space-y-4">
                        {/* Header Details */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[9px] font-bold uppercase tracking-wider bg-canvas-soft-2 text-primary border border-hairline px-2 py-0.5 rounded">
                              {t[issue.category.toLowerCase()] || issue.category}
                            </span>
                            <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${statusColors[issue.status] || 'bg-canvas-soft'}`}>
                              {issue.status}
                            </span>
                            <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                              issue.severity === 'High' ? 'bg-error-soft/30 text-error border-error/20' : 
                              issue.severity === 'Medium' ? 'bg-warning-soft text-warning-deep border-warning-deep/20' : 
                              'bg-cyan-soft text-cyan-deep border-cyan-deep/20'
                            }`}>
                              {issue.severity} Severity
                            </span>
                          </div>
                          <span className="text-[10px] text-mute font-mono">
                            {new Date(issue.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </span>
                        </div>

                        {/* Title and Info */}
                        <div className="space-y-2">
                          <h3 className="text-base font-extrabold text-primary leading-snug">{issue.title}</h3>
                          
                          {/* Location details */}
                          <p className="text-xs text-mute flex items-center gap-1.5 font-mono">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-primary"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                            <span>{issue.address || 'No location address'}</span>
                          </p>

                          <p className="text-xs text-body leading-relaxed bg-canvas-soft border border-hairline p-3 rounded-xl">
                            {issue.description}
                          </p>
                        </div>

                        {/* Attachments Section */}
                        {(issue.image || issue.video) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {issue.image && (
                              <div className="aspect-[16/10] bg-canvas-soft border border-hairline rounded-xl overflow-hidden flex relative group shadow-level1">
                                <img className="w-full h-full object-cover" src={issue.image} alt="Complaint evidence photo" />
                                <span className="absolute top-2 left-2 bg-primary/70 backdrop-blur-[2px] text-on-primary text-[8px] font-mono font-bold px-2 py-0.5 rounded uppercase">Image Evidence</span>
                              </div>
                            )}

                            {issue.video && (
                              <div className="aspect-[16/10] bg-black border border-hairline rounded-xl overflow-hidden flex relative shadow-level1">
                                <video 
                                  className="w-full h-full object-contain" 
                                  src={issue.video} 
                                  controls 
                                  playsInline 
                                  preload="metadata"
                                />
                                <span className="absolute top-2 left-2 bg-primary/70 backdrop-blur-[2px] text-on-primary text-[8px] font-mono font-bold px-2 py-0.5 rounded uppercase">Video Complaint</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* AI Fix Plan Box */}
                        <div className="bg-violet-soft/10 border border-violet-soft/30 p-4 rounded-xl space-y-2">
                          <div className="flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" className="text-violet-deep"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/></svg>
                            <span className="block text-[10px] font-mono font-bold text-violet-deep uppercase tracking-wider">AI Fix Recommendation Plan</span>
                          </div>
                          <p className="text-xs text-body italic leading-relaxed">
                            {issue.actionPlan}
                          </p>
                        </div>

                        {/* Administrative Controls Block */}
                        <div className="bg-[#7928ca]/5 border border-[#7928ca]/20 p-4 rounded-xl space-y-3">
                          <div className="flex items-center justify-between border-b border-[#7928ca]/10 pb-2">
                            <span className="block text-[9px] font-mono font-bold text-[#7928ca] uppercase tracking-wider">Administrative Controls</span>
                            <button 
                              onClick={() => handleDeleteIssue(issue.id)}
                              className="text-[9px] font-mono text-error hover:underline cursor-pointer"
                            >
                              Delete Complaint
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                            {/* Update Status Selection */}
                            <div className="space-y-1">
                              <label className="block text-[9px] font-mono text-mute uppercase font-bold">Override Status</label>
                              <select 
                                value={issue.status}
                                onChange={(e) => handleStatusChange(issue.id, e.target.value as any)}
                                className="w-full h-8 border border-hairline bg-canvas rounded px-2.5 text-xs focus:outline-none focus:border-hairline-strong font-mono cursor-pointer"
                              >
                                <option value="Reported">Reported</option>
                                <option value="Under Review">Under Review</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                              </select>
                            </div>

                            {/* Plan Override Field */}
                            <div className="space-y-1">
                              <label className="block text-[9px] font-mono text-mute uppercase font-bold">Override Fix Plan</label>
                              <div className="flex gap-2">
                                <input 
                                  type="text"
                                  value={adminActionPlans[issue.id] !== undefined ? adminActionPlans[issue.id] : issue.actionPlan}
                                  onChange={(e) => setAdminActionPlans(prev => ({ ...prev, [issue.id]: e.target.value }))}
                                  className="flex-1 h-8 border border-hairline bg-canvas rounded px-2.5 text-xs focus:outline-none focus:border-hairline-strong text-body"
                                  placeholder="Update scheduling or materials details..."
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateActionPlan(issue.id, adminActionPlans[issue.id])}
                                  className="h-8 bg-[#7928ca] text-on-primary hover:bg-[#7928ca]/90 px-3 rounded-lg text-xs font-semibold font-mono transition cursor-pointer"
                                >
                                  Update Plan
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Comments Log & verification logs */}
                        <div className="border-t border-hairline pt-4 space-y-3">
                          <span className="block text-[9px] font-mono font-bold text-mute uppercase tracking-wider">Verification Updates & Comments Logs ({issue.comments.length})</span>
                          
                          {/* List of comments */}
                          {issue.comments.length > 0 && (
                            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                              {issue.comments.map(comment => (
                                <div key={comment.id} className="border border-hairline bg-canvas-soft-2 p-2.5 rounded-lg space-y-1">
                                  <div className="flex items-center justify-between text-[10px] font-mono">
                                    <span className="font-bold text-primary">{comment.author}</span>
                                    <span className="text-mute/80">{new Date(comment.createdAt).toLocaleTimeString(undefined, { timeStyle: 'short' })}</span>
                                  </div>
                                  <p className="text-xs text-body">{comment.text}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Comment Submit Form */}
                          <form 
                            onSubmit={async (e) => {
                              e.preventDefault();
                              const text = adminCommentTexts[issue.id];
                              if (!text || !text.trim()) return;
                              await handleSubmitComment(issue.id, text);
                              setAdminCommentTexts(prev => ({ ...prev, [issue.id]: '' }));
                            }}
                            className="flex gap-2"
                          >
                            <input 
                              type="text"
                              value={adminCommentTexts[issue.id] || ''}
                              onChange={(e) => setAdminCommentTexts(prev => ({ ...prev, [issue.id]: e.target.value }))}
                              placeholder="Add verification note or admin comment..."
                              className="flex-1 h-9 border border-hairline bg-canvas rounded px-3 text-xs focus:outline-none focus:border-hairline-strong"
                            />
                            <button 
                              type="submit" 
                              className="h-9 border border-hairline rounded-full bg-canvas hover:bg-canvas-soft-2 px-4 text-xs font-semibold font-mono transition cursor-pointer"
                            >
                              Post Note
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Hero Area */}
            <section className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-6 sm:pb-10 text-center space-y-6">
              <div className="inline-flex items-center gap-1.5 bg-canvas border border-hairline px-3 py-1 rounded-full shadow-level1">
                <span className="inline-block w-1.5 h-1.5 bg-violet-deep rounded-full animate-pulse"></span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-body">Civic Automation & Tracking</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-extrabold text-primary tracking-tight max-w-2xl mx-auto leading-[1.05] font-sans">
                {t.heroTitle}
              </h1>
              
              <p className="text-base text-body max-w-xl mx-auto font-sans leading-relaxed">
                {t.heroSubtitle}
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                <button 
                  onClick={() => setIsReportOpen(true)}
                  className="h-9 sm:h-11 bg-primary text-on-primary hover:bg-primary/95 rounded-full px-4 sm:px-6 text-xs sm:text-sm font-semibold shadow-level4 flex items-center gap-1.5 sm:gap-2 transition duration-150 cursor-pointer whitespace-nowrap"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="sm:w-4 sm:h-4"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                  <span>{t.reportButton}</span>
                </button>
                
                <button 
                  onClick={() => {
                    setActiveTab('feed');
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  className="h-9 sm:h-11 bg-canvas border border-hairline hover:bg-canvas-soft-2 rounded-full px-4 sm:px-6 text-xs sm:text-sm font-semibold shadow-level2 transition duration-150 cursor-pointer whitespace-nowrap"
                >
                  {t.exploreMapButton}
                </button>
              </div>
            </section>

            {/* Tab Controls workspace */}
            <section className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6">
              <div className="flex items-center justify-start sm:justify-start border-b border-hairline overflow-x-auto gap-2 pb-px select-none scrollbar-none w-full">
                <button 
                  onClick={() => setActiveTab('feed')}
                  className={`pb-3 px-4 border-b-2 font-sans text-xs focus:outline-none transition cursor-pointer flex-shrink-0 ${activeTab === 'feed' ? 'border-primary text-primary font-semibold' : 'border-transparent text-mute hover:text-primary font-medium'}`}
                >
                  {t.feedTab}
                </button>
                <button 
                  onClick={() => setActiveTab('analytics')}
                  className={`pb-3 px-4 border-b-2 font-sans text-xs focus:outline-none transition cursor-pointer flex-shrink-0 ${activeTab === 'analytics' ? 'border-primary text-primary font-semibold' : 'border-transparent text-mute hover:text-primary font-medium'}`}
                >
                  {t.analyticsTab}
                </button>
                <button 
                  onClick={() => setActiveTab('leaderboard')}
                  className={`pb-3 px-4 border-b-2 font-sans text-xs focus:outline-none transition cursor-pointer flex-shrink-0 ${activeTab === 'leaderboard' ? 'border-primary text-primary font-semibold' : 'border-transparent text-mute hover:text-primary font-medium'}`}
                >
                  {t.leaderboardTab}
                </button>
                <button 
                  onClick={() => setActiveTab('contacts')}
                  className={`pb-3 px-4 border-b-2 font-sans text-xs focus:outline-none transition cursor-pointer flex-shrink-0 ${activeTab === 'contacts' ? 'border-primary text-primary font-semibold' : 'border-transparent text-mute hover:text-primary font-medium'}`}
                >
                  🏢 {t.contactsTab}
                </button>
              </div>

              {/* Render Active Tab Pane */}
              {activeTab === 'feed' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Interactive Map */}
                  <div className="lg:col-span-7 h-[320px] sm:h-[400px] lg:h-[580px] lg:sticky lg:top-24">
                    <MapContainer 
                      issues={filteredIssues}
                      onSelectCoordinates={handleMapClick}
                      onInspectIssue={setInspectedIssueId}
                      centerLat={location.lat}
                      centerLng={location.lng}
                    />
                  </div>

                  {/* Right Column: Feed Items */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-canvas border border-hairline p-4 rounded-lg shadow-level2">
                      <div className="flex items-baseline gap-1.5">
                        <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-primary">{t.liveIssues}</h2>
                        <span className="text-[10px] bg-canvas-soft-2 border border-hairline px-2 py-0.5 rounded font-bold font-mono">
                          {filteredIssues.length}
                        </span>
                      </div>

                      <select 
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="h-8 border border-hairline bg-canvas rounded px-3 text-xs text-body focus:outline-none font-mono cursor-pointer"
                      >
                        <option value="All">{t.allCategories}</option>
                        <option value="Pothole">{t.pothole}</option>
                        <option value="Waste Management">{t.wasteManagement}</option>
                        <option value="Damaged Streetlight">{t.streetlight}</option>
                        <option value="Water Leakage">{t.waterLeakage}</option>
                        <option value="Public Infrastructure">{t.infrastructure}</option>
                      </select>
                    </div>

                    <div className="space-y-4 lg:max-h-[580px] lg:overflow-y-auto pr-1">
                      {filteredIssues.length === 0 ? (
                        <div className="border border-hairline border-dashed rounded-lg p-8 text-center text-xs text-mute font-mono bg-canvas select-none">
                          {t.noIssues}
                        </div>
                      ) : (
                        filteredIssues.map(issue => (
                          <IssueCard 
                            key={issue.id}
                            issue={issue}
                            onInspect={setInspectedIssueId}
                            onVote={handleVote}
                            t={t}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <Analytics 
                  issues={nearbyIssues} 
                  t={t} 
                  currentLocation={location}
                  apiKey={apiKey}
                />
              )}

              {activeTab === 'leaderboard' && (
                <Leaderboard 
                  points={currentUser ? currentUser.points : 0}
                  level={currentUser ? currentUser.level : 1}
                  badges={currentUser ? currentUser.badges : []}
                  issuesCount={issues.filter(i => i.id.startsWith('issue-')).length}
                  votesCount={currentUser ? currentUser.votedIssues.length : 0}
                  cityName={location.city}
                  t={t}
                  currentUser={currentUser}
                  onUpdateUserProfile={updateCurrentUserProfile}
                  commentsCount={issues.flatMap(i => i.comments).filter(c => currentUser && c.author === currentUser.fullName).length}
                />
              )}

              {activeTab === 'contacts' && (
                <CivicDirectory 
                  currentLocation={location}
                  t={t}
                />
              )}
            </section>
          </>
        )}

        {/* SEO Friendly FAQ Section with JSON-LD Schema */}
        <section id="faq-section" className="relative z-10 max-w-[800px] mx-auto px-6 mt-16 pt-8 border-t border-hairline space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-primary tracking-tight font-sans">
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-xs text-mute font-mono">
              Learn how Community Hero empowers you to improve your local community.
            </p>
          </div>

          <div className="space-y-4 font-sans select-none">
            {/* FAQ Item 1 */}
            <details id="faq-item-1" className="group border border-hairline bg-canvas/80 backdrop-blur-sm rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden transition duration-150">
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer focus:outline-none hover:bg-canvas-soft-2 transition">
                <span className="text-sm font-bold text-primary font-sans leading-snug">
                  What is Community Hero and how does it work?
                </span>
                <span className="ml-1.5 flex-shrink-0 transition duration-300 group-open:-rotate-180">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-mute group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="px-5 pb-5 pt-1 text-xs text-body leading-relaxed border-t border-hairline/50 animate-in fade-in duration-200">
                <p>
                  Community Hero is a hyperlocal civic governance platform designed to empower citizens to report, track, and resolve local issues like potholes, broken streetlights, or waste accumulation. By pinning hazards on an interactive map and submitting evidence, you alert municipal officers and coordinate civic actions to make your locality safer.
                </p>
              </div>
            </details>

            {/* FAQ Item 2 */}
            <details id="faq-item-2" className="group border border-hairline bg-canvas/80 backdrop-blur-sm rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden transition duration-150">
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer focus:outline-none hover:bg-canvas-soft-2 transition">
                <span className="text-sm font-bold text-primary font-sans leading-snug">
                  How does the community verification consensus (vouch) system work?
                </span>
                <span className="ml-1.5 flex-shrink-0 transition duration-300 group-open:-rotate-180">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-mute group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="px-5 pb-5 pt-1 text-xs text-body leading-relaxed border-t border-hairline/50 animate-in fade-in duration-200">
                <p>
                  To maintain high data integrity, citizen resolutions require community verification. An issue can only be marked as &ldquo;Resolved&rdquo; when it receives at least three vouches (upvotes) from other local citizens, or direct sign-off from an authorized municipal officer. This consensus model prevents premature or false reports of resolutions.
                </p>
              </div>
            </details>

            {/* FAQ Item 3 */}
            <details id="faq-item-3" className="group border border-hairline bg-canvas/80 backdrop-blur-sm rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden transition duration-150">
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer focus:outline-none hover:bg-canvas-soft-2 transition">
                <span className="text-sm font-bold text-primary font-sans leading-snug">
                  Can I upload video evidence when reporting a hazard?
                </span>
                <span className="ml-1.5 flex-shrink-0 transition duration-300 group-open:-rotate-180">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-mute group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="px-5 pb-5 pt-1 text-xs text-body leading-relaxed border-t border-hairline/50 animate-in fade-in duration-200">
                <p>
                  Yes! When reporting an issue, you can capture and upload a video clip ranging from 30 seconds to 1 minute. Video uploads provide crucial visual context, such as the flow of water leaks or the scale of street hazards, helping dispatch crews prepare correct tools and materials.
                </p>
              </div>
            </details>

            {/* FAQ Item 4 */}
            <details id="faq-item-4" className="group border border-hairline bg-canvas/80 backdrop-blur-sm rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden transition duration-150">
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer focus:outline-none hover:bg-canvas-soft-2 transition">
                <span className="text-sm font-bold text-primary font-sans leading-snug">
                  What rewards do I earn for participating in civic actions?
                </span>
                <span className="ml-1.5 flex-shrink-0 transition duration-300 group-open:-rotate-180">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-mute group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="px-5 pb-5 pt-1 text-xs text-body leading-relaxed border-t border-hairline/50 animate-in fade-in duration-200">
                <p>
                  Community Hero rewards civic engagement through a points and gamification system. You earn 50 points for submitting a new report, 10 points for verifying/upvoting an issue, and 10 points for leaving comments. Accumulating points helps you level up and earn specialized badges such as &ldquo;Pothole Patrol&rdquo; or &ldquo;Super Verifier.&rdquo;
                </p>
              </div>
            </details>

            {/* FAQ Item 5 */}
            <details id="faq-item-5" className="group border border-hairline bg-canvas/80 backdrop-blur-sm rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden transition duration-150">
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer focus:outline-none hover:bg-canvas-soft-2 transition">
                <span className="text-sm font-bold text-primary font-sans leading-snug">
                  How do municipal officers use the platform?
                </span>
                <span className="ml-1.5 flex-shrink-0 transition duration-300 group-open:-rotate-180">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-mute group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="px-5 pb-5 pt-1 text-xs text-body leading-relaxed border-t border-hairline/50 animate-in fade-in duration-200">
                <p>
                  Municipal officers log in using designated authority codes (like <code>MC-DELHI-2026</code>). The platform automatically locks their control center to their assigned jurisdiction (e.g., Delhi), displaying a streamlined reports checklist where they can override AI fix plans, schedule crew dispatch, update statuses, or delete invalid reports.
                </p>
              </div>
            </details>
          </div>

          {/* JSON-LD Schema for FAQ SEO */}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What is Community Hero and how does it work?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Community Hero is a hyperlocal civic governance platform designed to empower citizens to report, track, and resolve neighborhood issues like potholes, broken streetlights, or waste accumulation. By pinning hazards on an interactive map and submitting evidence, you alert municipal officers and coordinate civic actions to make your locality safer."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How does the community verification consensus (vouch) system work?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "To maintain high data integrity, citizen resolutions require community verification. An issue can only be marked as \"Resolved\" when it receives at least three vouches (upvotes) from other local citizens, or direct sign-off from an authorized municipal officer. This consensus model prevents premature or false reports of resolutions."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I upload video evidence when reporting a hazard?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! When reporting an issue, you can capture and upload a video clip ranging from 30 seconds to 1 minute. Video uploads provide crucial visual context, such as the flow of water leaks or the scale of street hazards, helping dispatch crews prepare correct tools and materials."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What rewards do I earn for participating in civic actions?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Community Hero rewards civic engagement through a points and gamification system. You earn 50 points for submitting a new report, 10 points for verifying/upvoting an issue, and 10 points for leaving comments. Accumulating points helps you level up and earn specialized badges such as \"Pothole Patrol\" or \"Super Verifier.\""
                  }
                },
                {
                  "@type": "Question",
                  "name": "How do municipal officers use the platform?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Municipal officers log in using designated authority codes (like MC-DELHI-2026). The platform automatically locks their control center to their assigned jurisdiction (e.g., Delhi), displaying a streamlined reports checklist where they can override AI fix plans, schedule crew dispatch, update statuses, or delete invalid reports."
                  }
                }
              ]
            })}
          </script>
        </section>
      </main>

      <footer className="relative z-10 w-full border-t border-hairline bg-canvas py-8 text-center text-xs text-mute font-mono space-y-3 px-4">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          <a href="about.html" className="hover:text-primary transition whitespace-nowrap">About Us</a>
          <a href="privacy.html" className="hover:text-primary transition whitespace-nowrap">Privacy Policy</a>
          <a href="terms.html" className="hover:text-primary transition whitespace-nowrap">Terms of Service</a>
          <a href="contact.html" className="hover:text-primary transition whitespace-nowrap">Contact Us</a>
        </div>
        <p className="leading-relaxed">© 2026 Community Hero Hyperlocal Solver. All rights reserved.</p>
      </footer>


      {/* Overlay Modal Components */}
      <ReportModal 
        isOpen={isReportOpen}
        lat={selectedCoords ? selectedCoords.lat : null}
        lng={selectedCoords ? selectedCoords.lng : null}
        onClose={() => {
          setIsReportOpen(false);
          setSelectedCoords(null);
        }}
        onSubmitIssue={handleSubmitIssue}
        t={t}
        currentLocation={location}
      />

      {/* AI Key & Firebase Settings Modal */}
      {isApiOpen && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4">
          <div onClick={() => setIsApiOpen(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-[2px]"></div>
          <div className="relative bg-canvas border border-hairline rounded-lg w-full max-w-md p-6 shadow-level5 z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-2">
              <h3 className="text-xs font-bold font-mono text-primary uppercase tracking-wider">System Config Settings</h3>
              <button onClick={() => setIsApiOpen(false)} className="text-mute hover:text-primary transition p-1 hover:bg-canvas-soft-2 rounded cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-hairline mb-4 font-mono select-none">
              <button 
                onClick={() => setActiveSettingsTab('ai')}
                className={`flex-1 pb-2 text-xs font-bold border-b-2 transition cursor-pointer ${activeSettingsTab === 'ai' ? 'border-primary text-primary' : 'border-transparent text-mute hover:text-primary'}`}
              >
                Gemini AI Config
              </button>
              <button 
                onClick={() => setActiveSettingsTab('firebase')}
                className={`flex-1 pb-2 text-xs font-bold border-b-2 transition cursor-pointer ${activeSettingsTab === 'firebase' ? 'border-primary text-primary' : 'border-transparent text-mute hover:text-primary'}`}
              >
                Firebase DB Config
              </button>
            </div>

            {activeSettingsTab === 'ai' ? (
              <div className="space-y-4">
                <div className="space-y-2 text-xs">
                  <p className="text-body leading-relaxed">
                    Provide your **Google AI Studio Gemini API Key** to enable real-time multimodal image analysis.
                  </p>
                  <div className="bg-violet-soft/20 border border-violet-soft text-violet-deep p-3 rounded-md leading-snug">
                    💡 **Get a free key** instantly at the <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="underline font-semibold hover:text-violet-deep/80">Google AI Studio API Dashboard</a>.
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-body">Gemini API Key</label>
                  <input 
                    type="password" 
                    defaultValue={apiKey}
                    id="api-key-input"
                    className="w-full h-10 border border-hairline bg-canvas rounded px-3 text-sm focus:outline-none focus:border-hairline-strong font-mono" 
                    placeholder="AIzaSy..." 
                  />
                </div>

                <p className="text-[10px] text-mute leading-relaxed font-mono">
                  *Your key is saved locally in your browser cache and is never sent to any backend servers.*
                </p>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-hairline">
                  <button 
                    onClick={handleClearApiKey}
                    className="h-9 border border-hairline rounded-full bg-canvas text-error hover:bg-error-soft/30 hover:text-error px-4 text-xs font-semibold transition cursor-pointer"
                  >
                    Delete Key
                  </button>
                  <button 
                    onClick={() => {
                      const input = document.getElementById('api-key-input') as HTMLInputElement;
                      if (input) handleSaveApiKey(input.value);
                    }}
                    className="h-9 border border-hairline rounded-full bg-primary text-on-primary hover:bg-primary/95 px-5 text-xs font-semibold shadow-level4 transition cursor-pointer"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-body leading-relaxed">
                  Enter your **Firebase Web Project Credentials** to connect the app to a live, real-time Firestore database and Auth environment.
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-mono font-bold uppercase text-body">API Key</label>
                    <input 
                      type="password" 
                      id="fb-api-key"
                      defaultValue={fbConfig?.apiKey || ''}
                      className="w-full h-9 border border-hairline bg-canvas rounded px-2.5 text-xs font-mono focus:outline-none focus:border-hairline-strong" 
                      placeholder="AIzaSy..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-mono font-bold uppercase text-body">Project ID</label>
                    <input 
                      type="text" 
                      id="fb-project-id"
                      defaultValue={fbConfig?.projectId || ''}
                      className="w-full h-9 border border-hairline bg-canvas rounded px-2.5 text-xs font-mono focus:outline-none focus:border-hairline-strong" 
                      placeholder="my-civic-app"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-mono font-bold uppercase text-body">Auth Domain</label>
                    <input 
                      type="text" 
                      id="fb-auth-domain"
                      defaultValue={fbConfig?.authDomain || ''}
                      className="w-full h-9 border border-hairline bg-canvas rounded px-2.5 text-xs font-mono focus:outline-none focus:border-hairline-strong" 
                      placeholder="my-civic-app.firebaseapp.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-mono font-bold uppercase text-body">Storage Bucket</label>
                    <input 
                      type="text" 
                      id="fb-storage-bucket"
                      defaultValue={fbConfig?.storageBucket || ''}
                      className="w-full h-9 border border-hairline bg-canvas rounded px-2.5 text-xs font-mono focus:outline-none focus:border-hairline-strong" 
                      placeholder="my-civic-app.appspot.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-mono font-bold uppercase text-body">Messaging Sender ID</label>
                    <input 
                      type="text" 
                      id="fb-messaging-sender-id"
                      defaultValue={fbConfig?.messagingSenderId || ''}
                      className="w-full h-9 border border-hairline bg-canvas rounded px-2.5 text-xs font-mono focus:outline-none focus:border-hairline-strong" 
                      placeholder="1234567890"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-mono font-bold uppercase text-body">App ID</label>
                    <input 
                      type="text" 
                      id="fb-app-id"
                      defaultValue={fbConfig?.appId || ''}
                      className="w-full h-9 border border-hairline bg-canvas rounded px-2.5 text-xs font-mono focus:outline-none focus:border-hairline-strong" 
                      placeholder="1:1234:web:abcd"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-hairline">
                  {fbConfig && (
                    <button 
                      onClick={handleDisconnectFirebase}
                      className="h-9 border border-hairline rounded-full bg-canvas text-error hover:bg-error-soft/30 hover:text-error px-4 text-xs font-semibold transition cursor-pointer"
                    >
                      Disconnect DB
                    </button>
                  )}
                  
                  <button 
                    onClick={() => {
                      const apiKeyVal = (document.getElementById('fb-api-key') as HTMLInputElement)?.value;
                      const projectIdVal = (document.getElementById('fb-project-id') as HTMLInputElement)?.value;
                      const authDomainVal = (document.getElementById('fb-auth-domain') as HTMLInputElement)?.value;
                      const storageBucketVal = (document.getElementById('fb-storage-bucket') as HTMLInputElement)?.value;
                      const messagingSenderIdVal = (document.getElementById('fb-messaging-sender-id') as HTMLInputElement)?.value;
                      const appIdVal = (document.getElementById('fb-app-id') as HTMLInputElement)?.value;

                      if (!apiKeyVal || !projectIdVal) {
                        alert('API Key and Project ID are required to initialize Firebase.');
                        return;
                      }

                      handleSaveFirebaseConfig({
                        apiKey: apiKeyVal,
                        projectId: projectIdVal,
                        authDomain: authDomainVal || '',
                        storageBucket: storageBucketVal || '',
                        messagingSenderId: messagingSenderIdVal || '',
                        appId: appIdVal || ''
                      });
                    }}
                    className="h-9 border border-hairline rounded-full bg-primary text-on-primary hover:bg-primary/95 px-5 text-xs font-semibold shadow-level4 transition cursor-pointer"
                  >
                    Connect Database
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Details Inspector Modal */}
      {inspectedIssue && (
        <div className="fixed inset-0 z-[5500] flex items-center justify-center p-4 animate-fade-in">
          <div onClick={() => setInspectedIssueId(null)} className="absolute inset-0 bg-primary/40 backdrop-blur-md"></div>
          <div className="relative bg-canvas border border-hairline rounded-xl w-full max-w-lg p-6 shadow-level5 z-10 max-h-[90vh] overflow-y-auto flex flex-col animate-slide-up">
            
            <div className="flex items-center justify-between border-b border-hairline pb-3 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider bg-canvas-soft-2 text-primary border border-hairline px-2 py-0.5 rounded">{t[inspectedIssue.category.toLowerCase()] || inspectedIssue.category}</span>
                <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${statusColors[inspectedIssue.status] || 'bg-canvas-soft'}`}>{inspectedIssue.status}</span>
              </div>
              <button onClick={() => setInspectedIssueId(null)} className="text-mute hover:text-primary transition p-1 hover:bg-canvas-soft-2 rounded cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-bold text-primary leading-snug">{inspectedIssue.title}</h3>

              {inspectedIssue.reporterName && (
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-mute bg-canvas-soft border border-hairline px-2.5 py-1 rounded-full w-fit">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" className="text-primary"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span>Reported by: <span className="font-bold text-primary">{inspectedIssue.reporterName}</span></span>
                </div>
              )}

              {inspectedIssue.image && (
                <div className="w-full h-48 bg-canvas-soft border border-hairline rounded-lg overflow-hidden flex">
                  <img className="w-full h-full object-cover" src={inspectedIssue.image} alt="Evidence photo" />
                </div>
              )}

              {inspectedIssue.video && (
                <div className="w-full h-48 bg-black border border-hairline rounded-lg overflow-hidden flex relative">
                  <video 
                    className="w-full h-full object-contain" 
                    src={inspectedIssue.video} 
                    controls 
                    playsInline 
                    preload="metadata"
                  />
                </div>
              )}

              {/* Location info */}
              <div className="flex items-center gap-2 text-xs text-mute font-mono bg-canvas-soft border border-hairline p-2.5 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-primary flex-shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-semibold text-primary truncate" title={inspectedIssue.address || `${inspectedIssue.city || location.city}`}>
                    {inspectedIssue.address || `${inspectedIssue.city || location.city}`}
                  </span>
                  <span className="text-[10px] text-mute/70">Coordinates: {inspectedIssue.lat.toFixed(5)}, {inspectedIssue.lng.toFixed(5)}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="block text-[10px] font-mono font-bold text-mute uppercase tracking-wider">{t.detailsTitle}</span>
                  {language !== 'en' && (
                    <button 
                      onClick={() => handleAiTranslateText(inspectedIssue.description, `desc-${inspectedIssue.id}`, (translated) => {
                        setTranslatedTexts(prev => ({ ...prev, [`desc-${inspectedIssue.id}`]: translated }));
                      })}
                      className="text-[10px] font-mono text-link hover:underline flex items-center gap-1 cursor-pointer"
                      disabled={translatingId === `desc-${inspectedIssue.id}`}
                    >
                      🌐 {translatingId === `desc-${inspectedIssue.id}` ? 'Translating...' : t.aiTranslate}
                    </button>
                  )}
                </div>
                <p className="text-xs text-body leading-relaxed bg-canvas-soft border border-hairline p-3 rounded-lg">
                  {translatedTexts[`desc-${inspectedIssue.id}`] || inspectedIssue.description}
                </p>
              </div>

              <div className="space-y-1 bg-violet-soft/10 border border-violet-soft/30 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" className="text-violet-deep"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/></svg>
                    <span className="block text-[10px] font-mono font-bold text-violet-deep uppercase tracking-wider">{t.aiFixPlan}</span>
                  </div>
                  {language !== 'en' && (
                    <button 
                      onClick={() => handleAiTranslateText(inspectedIssue.actionPlan, `plan-${inspectedIssue.id}`, (translated) => {
                        setTranslatedTexts(prev => ({ ...prev, [`plan-${inspectedIssue.id}`]: translated }));
                      })}
                      className="text-[10px] font-mono text-violet-deep hover:underline flex items-center gap-1 cursor-pointer"
                      disabled={translatingId === `plan-${inspectedIssue.id}`}
                    >
                      🌐 {translatingId === `plan-${inspectedIssue.id}` ? 'Translating...' : t.aiTranslate}
                    </button>
                  )}
                </div>
                <p className="text-xs text-body italic leading-relaxed">
                  {translatedTexts[`plan-${inspectedIssue.id}`] || inspectedIssue.actionPlan}
                </p>
              </div>

              {currentUser?.role === 'admin' ? (
                <div className="border-t border-b border-hairline py-4 space-y-4">
                  <div className="bg-[#7928ca]/5 border border-[#7928ca]/20 p-4 rounded-xl space-y-3">
                    <span className="block text-[10px] font-mono font-bold text-[#7928ca] uppercase tracking-wider">Administrative Officer Panel</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono text-mute uppercase font-bold">Issue Status</label>
                        <select 
                          value={inspectedIssue.status}
                          onChange={(e) => handleStatusChange(inspectedIssue.id, e.target.value as any)}
                          className="w-full h-9 border border-hairline bg-canvas rounded px-3 text-xs focus:outline-none focus:border-hairline-strong font-mono cursor-pointer"
                        >
                          <option value="Reported">Reported</option>
                          <option value="Under Review">Under Review</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono text-mute uppercase font-bold">Officer Options</label>
                        <button 
                          type="button"
                          onClick={() => handleDeleteIssue(inspectedIssue.id)}
                          className="w-full h-9 border border-error/20 bg-error-soft/10 text-error hover:bg-error-soft/30 px-3 text-xs font-semibold rounded font-mono transition cursor-pointer"
                        >
                          Delete Report
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 border-t border-hairline pt-3 mt-2">
                      <label className="block text-[9px] font-mono text-mute uppercase font-bold">Override AI Action Fix Plan</label>
                      <textarea 
                        value={editedActionPlan !== null ? editedActionPlan : inspectedIssue.actionPlan}
                        onChange={(e) => setEditedActionPlan(e.target.value)}
                        rows={2}
                        className="w-full border border-hairline bg-canvas rounded p-3 text-xs focus:outline-none focus:border-hairline-strong text-body"
                        placeholder="Customize target repair schedule or directions..."
                      />
                      <button 
                        type="button"
                        onClick={() => handleUpdateActionPlan(inspectedIssue.id)}
                        className="h-8 bg-[#7928ca] text-on-primary hover:bg-[#7928ca]/90 text-xs px-4 rounded-full font-semibold transition mt-2 cursor-pointer shadow-level2 active-press"
                      >
                        Save Updated Fix Plan
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-t border-b border-hairline py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-mute">{t.persistsQ}</span>
                    <button 
                      onClick={() => handleVote(inspectedIssue.id, 'up')}
                      className="h-8 border border-hairline rounded-full bg-canvas text-body hover:bg-canvas-soft-2 px-3 flex items-center gap-1 transition cursor-pointer font-mono active-press"
                    >
                      <span>{t.vouch}</span>
                      <span className="font-bold">{inspectedIssue.upvotes}</span>
                    </button>
                  </div>

                  {inspectedIssue.status !== 'Resolved' && (
                    <button 
                      onClick={() => {
                        handleResolveIssue(inspectedIssue.id);
                      }}
                      className="h-8 border border-hairline rounded-full bg-primary text-on-primary hover:bg-primary/95 px-4 font-semibold transition cursor-pointer active-press"
                    >
                      {t.resolved}
                    </button>
                  )}
                </div>
              )}

              {/* Comments */}
              <div className="space-y-2">
                <span className="block text-[10px] font-mono font-bold text-mute uppercase tracking-wider">{t.comments}</span>
                
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {inspectedIssue.comments.length === 0 ? (
                    <div className="text-[10px] font-mono text-mute py-4 text-center">No reports or verify notes log yet.</div>
                  ) : (
                    inspectedIssue.comments.map(comment => (
                      <div key={comment.id} className="border border-hairline bg-canvas-soft-2 p-2.5 rounded-lg space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="font-bold text-primary">{comment.author}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-mute">verified update</span>
                            {language !== 'en' && (
                              <button 
                                onClick={() => handleAiTranslateText(comment.text, `comment-${comment.id}`, (translated) => {
                                  setTranslatedTexts(prev => ({ ...prev, [`comment-${comment.id}`]: translated }));
                                })}
                                className="text-[9px] text-link hover:underline cursor-pointer"
                                disabled={translatingId === `comment-${comment.id}`}
                              >
                                🌐 {translatingId === `comment-${comment.id}` ? '...' : t.aiTranslate}
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-body">
                          {translatedTexts[`comment-${comment.id}`] || comment.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                  <input 
                    type="text" 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    required 
                    className="flex-1 h-9 border border-hairline bg-canvas rounded px-3 text-xs focus:outline-none focus:border-hairline-strong" 
                    placeholder={t.addComment} 
                  />
                  <button type="submit" className="h-9 border border-hairline rounded-full bg-canvas hover:bg-canvas-soft-2 px-4 text-xs font-semibold transition cursor-pointer active-press">
                    {t.commentButton}
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
