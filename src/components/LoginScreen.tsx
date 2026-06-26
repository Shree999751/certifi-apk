import React, { useState, useEffect } from 'react';
import type { UserProfile } from './initialIssues';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  t: Record<string, string>;
  fbServices?: { auth: any; db: any } | null;
  onDisconnectFirebase?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ 
  onLoginSuccess, 
  t, 
  fbServices,
  onDisconnectFirebase 
}) => {

  const [isLoginTab, setIsLoginTab] = useState(true);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration state
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'citizen' | 'admin'>('citizen');
  const [deptCode, setDeptCode] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Reset errors and success messages on database status toggle
  useEffect(() => {
    setErrorMsg('');
    setSuccessMsg('');
  }, [fbServices]);


  // Initial user seeding helper
  const getUsersList = (): any[] => {
    const stored = localStorage.getItem('civic_users');
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Preset demo accounts
    const presets = [
      {
        username: 'citizen',
        password: 'password',
        fullName: 'Rohan K. (Citizen)',
        role: 'citizen',
        points: 150,
        level: 2,
        badges: ['pothole_patrol', 'super_verifier'],
        userId: 'user-preset-citizen',
        votedIssues: ['mock-1']
      },
      {
        username: 'admin',
        password: 'password',
        fullName: 'Officer Sharma (Municipal)',
        role: 'admin',
        points: 0,
        level: 1,
        badges: [],
        userId: 'user-preset-admin',
        votedIssues: []
      }
    ];
    localStorage.setItem('civic_users', JSON.stringify(presets));
    return presets;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (fbServices) {
      try {
        const { auth, db } = fbServices;
        const email = username.includes('@') ? username : `${username.toLowerCase()}@hyperlocal.com`;
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;
        
        const userDocRef = doc(db, 'users', uid);
        const userSnapshot = await getDoc(userDocRef);
        
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data() as UserProfile;
          onLoginSuccess({
            ...userData,
            userId: uid
          });
        } else {
          const defaultUser: UserProfile = {
            username: username,
            fullName: username + (username.toLowerCase() === 'admin' ? ' (Municipal)' : ' (Citizen)'),
            role: username.toLowerCase() === 'admin' ? 'admin' : 'citizen',
            points: username.toLowerCase() === 'admin' ? 0 : 100,
            level: 1,
            badges: [],
            userId: uid,
            votedIssues: []
          };
          await setDoc(userDocRef, defaultUser);
          onLoginSuccess(defaultUser);
        }
      } catch (err: any) {
        console.error(err);
        if (err.code === 'auth/configuration-not-found' || (err.message && err.message.includes('configuration-not-found'))) {
          setSuccessMsg("Firebase Auth not configured. Switching to Local Mode...");
          setTimeout(() => {
            onDisconnectFirebase?.();
            const users = getUsersList();
            const found = users.find(
              u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
            );
            if (found) {
              onLoginSuccess(found);
            } else {
              setErrorMsg('Invalid username or password. Try using the quick demo logins!');
            }
          }, 1500);
        } else {
          setErrorMsg(`Firebase sign-in failed: ${err.message || 'Check credentials'}`);
        }
      }

    } else {
      const users = getUsersList();
      const found = users.find(
        u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
      );

      if (found) {
        onLoginSuccess(found);
      } else {
        setErrorMsg('Invalid username or password. Try using the quick demo logins!');
      }
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regFullName.trim() || !regUsername.trim() || !regPassword.trim()) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (regRole === 'admin') {
      const code = deptCode.trim().toUpperCase();
      if (!code.startsWith('MC-') || code.length < 6) {
        setErrorMsg('Invalid Municipal verification code. Officers must use format: MC-CITY-YEAR (e.g. MC-DELHI-2026).');
        return;
      }
    }

    if (fbServices) {
      try {
        const { auth, db } = fbServices;
        const email = regUsername.includes('@') ? regUsername : `${regUsername.toLowerCase()}@hyperlocal.com`;
        const userCredential = await createUserWithEmailAndPassword(auth, email, regPassword);
        const uid = userCredential.user.uid;
        
        let adminCity: string | undefined = undefined;
        if (regRole === 'admin') {
          const parts = deptCode.trim().split('-');
          if (parts.length >= 2) {
            adminCity = parts[1].charAt(0).toUpperCase() + parts[1].slice(1).toLowerCase();
          }
        }

        const newUser: UserProfile = {
          username: regUsername.trim(),
          fullName: regFullName.trim() + (regRole === 'admin' ? ' (Municipal)' : ' (Citizen)'),
          role: regRole,
          points: regRole === 'citizen' ? 100 : 0,
          level: 1,
          badges: [],
          userId: uid,
          votedIssues: [],
          city: adminCity
        };
        
        await setDoc(doc(db, 'users', uid), newUser);
        setSuccessMsg('Firebase account created successfully! Signing in...');
        
        setTimeout(() => {
          onLoginSuccess(newUser);
        }, 1200);
      } catch (err: any) {
        console.error(err);
        if (err.code === 'auth/configuration-not-found' || (err.message && err.message.includes('configuration-not-found'))) {
          setSuccessMsg("Firebase Auth not configured. Switching to Local Mode...");
          setTimeout(() => {
            onDisconnectFirebase?.();
            const users = getUsersList();
            const exists = users.some(u => u.username.toLowerCase() === regUsername.toLowerCase());

            if (exists) {
              const found = users.find(u => u.username.toLowerCase() === regUsername.toLowerCase());
              if (found) {
                onLoginSuccess(found);
              } else {
                setErrorMsg('Username is already taken.');
              }
              return;
            }

            let adminCity: string | undefined = undefined;
            if (regRole === 'admin') {
              const parts = deptCode.trim().split('-');
              if (parts.length >= 2) {
                adminCity = parts[1].charAt(0).toUpperCase() + parts[1].slice(1).toLowerCase();
              }
            }

            const newUser: UserProfile = {
              username: regUsername.trim(),
              fullName: regFullName.trim() + (regRole === 'admin' ? ' (Municipal)' : ' (Citizen)'),
              role: regRole,
              points: regRole === 'citizen' ? 100 : 0,
              level: 1,
              badges: [],
              userId: 'user-' + Math.random().toString(36).substr(2, 9),
              votedIssues: [],
              city: adminCity
            };

            const updatedUsers = [...users, { ...newUser, password: regPassword }];
            localStorage.setItem('civic_users', JSON.stringify(updatedUsers));
            onLoginSuccess(newUser);
          }, 1500);
        } else {
          setErrorMsg(`Firebase sign-up failed: ${err.message}`);
        }
      }

    } else {
      const users = getUsersList();
      const exists = users.some(u => u.username.toLowerCase() === regUsername.toLowerCase());

      if (exists) {
        setErrorMsg('Username is already taken.');
        return;
      }

      let adminCity: string | undefined = undefined;
      if (regRole === 'admin') {
        const parts = deptCode.trim().split('-');
        if (parts.length >= 2) {
          adminCity = parts[1].charAt(0).toUpperCase() + parts[1].slice(1).toLowerCase();
        }
      }

      const newUser: UserProfile = {
        username: regUsername.trim(),
        fullName: regFullName.trim() + (regRole === 'admin' ? ' (Municipal)' : ' (Citizen)'),
        role: regRole,
        points: regRole === 'citizen' ? 100 : 0,
        level: 1,
        badges: [],
        userId: 'user-' + Math.random().toString(36).substr(2, 9),
        votedIssues: [],
        city: adminCity
      };

      const updatedUsers = [...users, { ...newUser, password: regPassword }];
      localStorage.setItem('civic_users', JSON.stringify(updatedUsers));
      
      setSuccessMsg('Registration successful! You can now log in.');
      
      setTimeout(() => {
        setIsLoginTab(true);
        setUsername(regUsername);
        setPassword(regPassword);
        setRegFullName('');
        setRegUsername('');
        setRegPassword('');
        setDeptCode('');
        setSuccessMsg('');
      }, 1500);
    }
  };

  const triggerQuickLogin = async (role: 'citizen' | 'admin') => {
    const targetUsername = role === 'admin' ? 'admin' : 'citizen';
    
    if (fbServices) {
      setErrorMsg('');
      setIsLoginTab(true);
      const { auth, db } = fbServices;
      const email = `${targetUsername}@hyperlocal.com`;
      const pass = 'password';
      
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        const uid = userCredential.user.uid;
        
        const userSnapshot = await getDoc(doc(db, 'users', uid));
        if (userSnapshot.exists()) {
          onLoginSuccess({
            ...(userSnapshot.data() as UserProfile),
            userId: uid
          });
        } else {
          const defaultUser: UserProfile = {
            username: targetUsername,
            fullName: role === 'admin' ? 'Officer Sharma (Municipal)' : 'Rohan K. (Citizen)',
            role: role,
            points: role === 'citizen' ? 150 : 0,
            level: role === 'citizen' ? 2 : 1,
            badges: role === 'citizen' ? ['pothole_patrol', 'super_verifier'] : [],
            userId: uid,
            votedIssues: role === 'citizen' ? ['mock-1'] : []
          };
          await setDoc(doc(db, 'users', uid), defaultUser);
          onLoginSuccess(defaultUser);
        }
      } catch (err: any) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            const uid = userCredential.user.uid;
            
            const defaultUser: UserProfile = {
              username: targetUsername,
              fullName: role === 'admin' ? 'Officer Sharma (Municipal)' : 'Rohan K. (Citizen)',
              role: role,
              points: role === 'citizen' ? 150 : 0,
              level: role === 'citizen' ? 2 : 1,
              badges: role === 'citizen' ? ['pothole_patrol', 'super_verifier'] : [],
              userId: uid,
              votedIssues: role === 'citizen' ? ['mock-1'] : []
            };
            
            await setDoc(doc(db, 'users', uid), defaultUser);
            onLoginSuccess(defaultUser);
          } catch (regErr: any) {
            console.error(regErr);
            setErrorMsg(`Demo login failed to seed: ${regErr.message}`);
          }
        } else if (err.code === 'auth/configuration-not-found' || (err.message && err.message.includes('configuration-not-found'))) {
          setSuccessMsg("Firebase Auth not configured. Switching to Local Mode...");
          setTimeout(() => {
            onDisconnectFirebase?.();
            const users = getUsersList();
            const found = users.find(u => u.username === targetUsername);
            if (found) {
              onLoginSuccess(found);
            }
          }, 1500);
        } else {
          console.error(err);
          setErrorMsg(`Demo login failed: ${err.message}`);
        }
      }
    } else {
      setErrorMsg('');
      const users = getUsersList();
      const found = users.find(u => u.username === targetUsername);
      if (found) {
        onLoginSuccess(found);
      }
    }

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas-soft relative overflow-hidden font-sans p-4">
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] mesh-gradient-glow rounded-full pointer-events-none z-0"></div>
      
      {/* Glass Panel */}
      <div className="relative z-10 w-full max-w-md bg-canvas/80 border border-hairline rounded-2xl shadow-level5 backdrop-blur-md overflow-hidden flex flex-col p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Brand Logo */}
        <div className="flex flex-col items-center text-center space-y-2 mb-6">
          <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center text-on-primary font-mono font-bold text-2xl shadow-level3 select-none">
            H
          </div>
          <div>
            <h1 className="text-xl font-black text-primary tracking-tight font-sans">{t.appName || 'HYPERLOCAL HUB'}</h1>
            <p className="text-[11px] font-mono text-mute uppercase tracking-widest mt-0.5">Civic Governance Platform</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-hairline mb-5 select-none font-mono">
          <button
            onClick={() => { setIsLoginTab(true); setErrorMsg(''); }}
            className={`flex-1 pb-3 text-xs font-bold border-b-2 transition cursor-pointer ${isLoginTab ? 'border-primary text-primary' : 'border-transparent text-mute hover:text-primary'}`}
          >
            SIGN IN
          </button>
          <button
            onClick={() => { setIsLoginTab(false); setErrorMsg(''); }}
            className={`flex-1 pb-3 text-xs font-bold border-b-2 transition cursor-pointer ${!isLoginTab ? 'border-primary text-primary' : 'border-transparent text-mute hover:text-primary'}`}
          >
            REGISTER
          </button>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="bg-error-soft/30 border border-error/15 text-error px-3 py-2 rounded-lg text-xs mb-4 font-mono">
            ⚠️ {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-success/10 border border-success/20 text-success px-3 py-2 rounded-lg text-xs mb-4 font-mono">
            ✓ {successMsg}
          </div>
        )}

        {/* Login Form */}
        {isLoginTab ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-body">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full h-10 border border-hairline bg-canvas rounded px-3 text-sm focus:outline-none focus:border-hairline-strong font-mono"
                placeholder="citizen or admin"
              />
            </div>
            
            <div className="space-y-1">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-body">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-10 border border-hairline bg-canvas rounded px-3 text-sm focus:outline-none focus:border-hairline-strong font-mono"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full h-10 bg-primary text-on-primary hover:bg-primary/95 rounded-full font-semibold transition mt-2 shadow-level3 cursor-pointer flex items-center justify-center text-sm"
            >
              Sign In
            </button>
          </form>
        ) : (
          /* Registration Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-body">Full Name</label>
              <input
                type="text"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                required
                className="w-full h-9 border border-hairline bg-canvas rounded px-3 text-xs focus:outline-none focus:border-hairline-strong"
                placeholder="e.g. Officer Sharma, Anjali K."
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-body">Username</label>
              <input
                type="text"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                required
                className="w-full h-9 border border-hairline bg-canvas rounded px-3 text-xs focus:outline-none focus:border-hairline-strong font-mono"
                placeholder="e.g. officer_sharma"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-body">Password</label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
                className="w-full h-9 border border-hairline bg-canvas rounded px-3 text-xs focus:outline-none focus:border-hairline-strong font-mono"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-body">Account Role</label>
              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value as any)}
                className="w-full h-9 border border-hairline bg-canvas rounded px-3 text-xs focus:outline-none focus:border-hairline-strong font-mono"
              >
                <option value="citizen">Citizen (User)</option>
                <option value="admin">Municipal Officer (Admin)</option>
              </select>
            </div>

            {regRole === 'admin' && (
              <div className="space-y-1 animate-in slide-in-from-top-3 duration-150">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-body">Verification Code</label>
                  <span className="text-[9px] font-mono text-mute">Format: MC-CITY-YEAR</span>
                </div>
                <input
                  type="text"
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                  required
                  className="w-full h-9 border border-hairline bg-canvas rounded px-3 text-xs focus:outline-none focus:border-hairline-strong font-mono uppercase"
                  placeholder="e.g. MC-DELHI-2026"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full h-9 bg-primary text-on-primary hover:bg-primary/95 rounded-full font-semibold transition mt-3 shadow-level3 cursor-pointer flex items-center justify-center text-xs"
            >
              Create Account
            </button>
          </form>
        )}

        {/* Quick Demo Logins Section */}
        <div className="border-t border-hairline mt-6 pt-5 flex flex-col space-y-2.5">
          <p className="text-[10px] font-mono text-mute uppercase tracking-wider text-center select-none">Quick Demo Auto-Logins</p>
          <div className="flex gap-2">
            <button
              onClick={() => triggerQuickLogin('citizen')}
              className="flex-1 h-8 border border-hairline hover:border-hairline-strong bg-canvas-soft text-[11px] rounded-lg font-semibold text-primary transition shadow-level1 cursor-pointer"
            >
              👤 Demo Citizen
            </button>
            <button
              onClick={() => triggerQuickLogin('admin')}
              className="flex-1 h-8 border border-[#7928ca]/20 hover:border-[#7928ca]/40 bg-[#7928ca]/5 text-[11px] rounded-lg font-semibold text-[#7928ca] transition shadow-level1 cursor-pointer"
            >
              💼 Demo Admin
            </button>
          </div>

          {fbServices && onDisconnectFirebase && (
            <button
              type="button"
              onClick={onDisconnectFirebase}
              className="w-full h-8 border border-dashed border-mute/30 hover:border-mute/50 bg-canvas-soft text-[11px] rounded-lg font-semibold text-mute hover:text-primary transition shadow-level1 cursor-pointer mt-1"
            >
              📴 Switch to Local Cache Mode
            </button>
          )}
        </div>


      </div>
    </div>
  );
};
