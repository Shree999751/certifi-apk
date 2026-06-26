import React, { useState } from 'react';
import type { UserProfile } from './initialIssues';

interface LeaderboardProps {
  points: number;
  level: number;
  badges: string[];
  issuesCount: number;
  votesCount: number;
  cityName?: string;
  t: Record<string, string>;
  currentUser?: UserProfile | null;
  onUpdateUserProfile?: (newProfile: UserProfile) => void;
  commentsCount?: number;
}

const badgeMocks: Record<string, { title: string; desc: string; icon: string; color: string }> = {
  'pothole_patrol': {
    title: 'Pothole Patrol',
    desc: 'Reported your first road pothole.',
    icon: '🚧',
    color: 'bg-error-soft border-error/25 text-error-deep'
  },
  'trash_buster': {
    title: 'Trash Buster',
    desc: 'Reported waste accumulation.',
    icon: '🗑️',
    color: 'bg-warning-soft border-warning/25 text-warning-deep'
  },
  'super_verifier': {
    title: 'Super Verifier',
    desc: 'Vouched for 5+ community issues.',
    icon: '✅',
    color: 'bg-cyan-soft border-cyan/25 text-cyan-deep'
  },
  'streetlight_savior': {
    title: 'Light Bringer',
    desc: 'Flagged streetlight failures.',
    icon: '💡',
    color: 'bg-violet-soft border-violet/25 text-violet-deep'
  }
};

interface AvatarInfo {
  id: string;
  name: string;
  emoji: string;
  description: string;
  minLevel: number;
  requiredBadge?: string;
  bgColor: string;
  textColor: string;
}

const avatarsRegistry: AvatarInfo[] = [
  {
    id: 'ally',
    name: 'Civic Ally',
    emoji: '🤝',
    description: 'A helper standing up for localized community coordination.',
    minLevel: 1,
    bgColor: 'bg-canvas-soft border-hairline text-body',
    textColor: 'text-body'
  },
  {
    id: 'defender',
    name: 'Civic Defender',
    emoji: '🛡️',
    description: 'Guards streets against structural degradation and hazards.',
    minLevel: 1,
    bgColor: 'bg-indigo-soft/40 border-indigo-deep/20 text-indigo-deep',
    textColor: 'text-indigo-deep'
  },
  {
    id: 'knight',
    name: 'Pothole Knight',
    emoji: '🛠️',
    description: 'Champions the defense of roads and fixes deep pavement potholes.',
    minLevel: 2,
    requiredBadge: 'pothole_patrol',
    bgColor: 'bg-error-soft/30 border-error/20 text-error-deep',
    textColor: 'text-error-deep'
  },
  {
    id: 'warrior',
    name: 'Waste Warrior',
    emoji: '🗑️',
    description: 'Conquers trash bins and battles garbage heaps to clear alleys.',
    minLevel: 2,
    requiredBadge: 'trash_buster',
    bgColor: 'bg-warning-soft/30 border-warning/20 text-warning-deep',
    textColor: 'text-warning-deep'
  },
  {
    id: 'mage',
    name: 'Streetlight Wizard',
    emoji: '💡',
    description: 'Summons light beams to chase dark pockets out of public parks.',
    minLevel: 3,
    requiredBadge: 'streetlight_savior',
    bgColor: 'bg-violet-soft/30 border-violet/20 text-violet-deep',
    textColor: 'text-violet-deep'
  },
  {
    id: 'druid',
    name: 'Eco Sentinel',
    emoji: '🌳',
    description: 'Spreads urban green, monitors air, and supports public parks.',
    minLevel: 4,
    bgColor: 'bg-success/15 border-success/20 text-success-deep',
    textColor: 'text-success-deep'
  }
];

interface TriviaQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  fact: string;
}

const triviaQuestions: TriviaQuestion[] = [
  {
    question: "What is the primary emergency helpline number for fire services across most cities in India?",
    options: ["100", "101", "102", "108"],
    correctIndex: 1,
    fact: "101 connects you directly to the fire control room. 100 is for Police and 102 is for Ambulance."
  },
  {
    question: "Which local authority is generally responsible for internal neighborhood street repairs and solid waste collection?",
    options: ["State Highways Wing", "National Highways Authority", "Local Municipal Corporation (MCD/BBMP/BMC)", "Central Road Research Institute"],
    correctIndex: 2,
    fact: "Municipal corporations hold constitutional authority over civic cleanup, streetlight grids, and community roads."
  },
  {
    question: "In India, what is the official toll-free National Highway Helpline number for emergency assistance?",
    options: ["1912", "1916", "1033", "1969"],
    correctIndex: 2,
    fact: "1033 handles highway medical dispatch, breakdown cranes, and safety reports 24/7."
  },
  {
    question: "Which central application was officially launched for crowdsourced national cleanliness audit logs?",
    options: ["Swachhata App (1969)", "MyGov Portal", "Digital India Hub", "National Grievance Portal"],
    correctIndex: 0,
    fact: "The Swachhata App lets citizens photograph garbage spots and coordinates municipal action records."
  },
  {
    question: "What action does Community Hero use to confirm peer validation and elevate reports to municipal officers?",
    options: ["Registering duplicate tickets", "Upvoting / Vouching for reports", "Filing emails to the Commissioner", "Commenting raw GPS logs"],
    correctIndex: 1,
    fact: "Crowdsourced vouches provide peer audits, moving reports to high-priority resolution pipelines."
  }
];

export const Leaderboard: React.FC<LeaderboardProps> = ({
  points,
  level,
  badges,
  issuesCount,
  votesCount,
  cityName,
  t,
  currentUser,
  onUpdateUserProfile,
  commentsCount = 0
}) => {
  const levelNames: Record<number, string> = {
    1: 'Level 1: Novice Observer',
    2: 'Level 2: Active Guardian',
    3: 'Level 3: Community Hero',
    4: 'Level 4: Civic Sentinel',
    5: 'Level 5: Neighborhood Legend'
  };

  const nextLevelThreshold = level * 100 + 100;
  const prevLevelThreshold = level * 100;
  const progressPercent = Math.min(((points - prevLevelThreshold) / 100) * 100, 100);

  // States
  const [claimedQuests, setClaimedQuests] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('civic_claimed_quests');
    return saved ? JSON.parse(saved) : {};
  });

  const [answeredQuestions, setAnsweredQuestions] = useState<Record<number, number>>(() => {
    const saved = localStorage.getItem('civic_trivia_answered');
    return saved ? JSON.parse(saved) : {};
  });

  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(() => {
    const saved = localStorage.getItem('civic_trivia_active_idx');
    return saved ? parseInt(saved) : 0;
  });

  const [showCelebration, setShowCelebration] = useState<{
    show: boolean;
    title: string;
    sub: string;
    xp: number;
  }>({ show: false, title: '', sub: '', xp: 0 });

  // Quest thresholds
  const quests = [
    {
      id: 'quest_report',
      title: 'Sentinel Patrol',
      desc: 'Submit at least 1 new civic report in your neighborhood.',
      target: 1,
      current: issuesCount,
      xp: 50
    },
    {
      id: 'quest_vouch',
      title: 'Vouch Verification',
      desc: 'Verify and upvote 2 active issues reported by neighbors.',
      target: 2,
      current: votesCount,
      xp: 30
    },
    {
      id: 'quest_comment',
      title: 'Talk of the Town',
      desc: 'Write 1 comment update on any active hazard ticket.',
      target: 1,
      current: commentsCount,
      xp: 20
    }
  ];

  // Dynamic ranking list
  const mockSolvers = [
    { fullName: 'Ananya Sharma', username: 'ananya', points: 850, level: 9, avatar: 'druid', avatarTitle: 'Eco Sentinel', isCurrentUser: false },
    { fullName: 'Rahul Patel', username: 'rahul', points: 620, level: 7, avatar: 'knight', avatarTitle: 'Pothole Knight', isCurrentUser: false },
    { fullName: 'Nisha Mohan', username: 'nisha', points: 480, level: 5, avatar: 'mage', avatarTitle: 'Streetlight Wizard', isCurrentUser: false },
    { fullName: 'Devendra K.', username: 'devendra', points: 350, level: 4, avatar: 'warrior', avatarTitle: 'Waste Warrior', isCurrentUser: false }
  ];

  const userEntry = {
    fullName: currentUser?.fullName || 'You (Citizen)',
    username: currentUser?.username || 'you',
    points: points,
    level: level,
    avatar: currentUser?.avatar || 'ally',
    avatarTitle: currentUser?.avatarTitle || 'Civic Ally',
    isCurrentUser: true
  };

  const sortedSolvers = [...mockSolvers, userEntry].sort((a, b) => b.points - a.points);

  const handleClaimQuest = (questId: string, rewardXp: number) => {
    if (claimedQuests[questId]) return;
    const nextClaimed = { ...claimedQuests, [questId]: true };
    setClaimedQuests(nextClaimed);
    localStorage.setItem('civic_claimed_quests', JSON.stringify(nextClaimed));

    if (currentUser && onUpdateUserProfile) {
      const nextPoints = currentUser.points + rewardXp;
      const nextLevel = Math.floor(nextPoints / 100) + 1;

      onUpdateUserProfile({
        ...currentUser,
        points: nextPoints,
        level: nextLevel
      });

      setShowCelebration({
        show: true,
        title: "Quest Completed! 🏆",
        sub: `Sentinel network reports success! Gained +${rewardXp} Experience Points.`,
        xp: rewardXp
      });
    }
  };

  const handleAnswerTrivia = (optionIdx: number) => {
    if (answeredQuestions[activeQuestionIdx] !== undefined) return;
    const nextAnswers = { ...answeredQuestions, [activeQuestionIdx]: optionIdx };
    setAnsweredQuestions(nextAnswers);
    localStorage.setItem('civic_trivia_answered', JSON.stringify(nextAnswers));

    const isCorrect = optionIdx === triviaQuestions[activeQuestionIdx].correctIndex;
    if (isCorrect) {
      const rewardXp = 25;
      if (currentUser && onUpdateUserProfile) {
        const nextPoints = currentUser.points + rewardXp;
        const nextLevel = Math.floor(nextPoints / 100) + 1;

        onUpdateUserProfile({
          ...currentUser,
          points: nextPoints,
          level: nextLevel
        });

        setShowCelebration({
          show: true,
          title: "Civic IQ Boost! 💡",
          sub: `Your answer is correct. You gained +${rewardXp} XP for civic knowledge.`,
          xp: rewardXp
        });
      }
    }
  };

  const handleNextTrivia = () => {
    const nextIdx = (activeQuestionIdx + 1) % triviaQuestions.length;
    setActiveQuestionIdx(nextIdx);
    localStorage.setItem('civic_trivia_active_idx', nextIdx.toString());
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start relative">
      
      {/* Full-Screen Confetti Celebration Overlay Modal */}
      {showCelebration.show && (
        <div className="fixed inset-0 z-[7000] flex items-center justify-center p-4 bg-primary/25 backdrop-blur-md">
          {/* Popping particle effect look elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            {Array.from({ length: 15 }).map((_, i) => (
              <span 
                key={i} 
                className="absolute text-xl animate-ping"
                style={{
                  top: `${Math.random() * 80 + 10}%`,
                  left: `${Math.random() * 80 + 10}%`,
                  animationDuration: `${Math.random() * 2 + 1.5}s`
                }}
              >
                {['✨', '🌟', '🏆', '🔥', '⚡', '🎉'][i % 6]}
              </span>
            ))}
          </div>

          <div className="relative bg-canvas border border-hairline-strong rounded-2xl w-full max-w-sm p-6 text-center shadow-level5 space-y-4 scale-100 transition duration-300">
            <div className="h-16 w-16 bg-primary-soft/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto text-4xl select-none animate-bounce">
              🎉
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-primary leading-tight font-sans">
                {showCelebration.title}
              </h3>
              <p className="text-xs text-body leading-relaxed">
                {showCelebration.sub}
              </p>
            </div>

            <div className="py-2.5 bg-primary-soft/10 border border-primary/20 rounded-xl max-w-[120px] mx-auto">
              <span className="block text-2xl font-black text-primary font-mono leading-none">+{showCelebration.xp}</span>
              <span className="text-[9px] text-mute uppercase font-mono tracking-wider font-bold">XP Points</span>
            </div>

            <button
              onClick={() => setShowCelebration(prev => ({ ...prev, show: false }))}
              className="w-full h-10 rounded-full bg-primary text-on-primary hover:bg-primary/95 text-xs font-semibold shadow-level4 transition cursor-pointer"
            >
              Collect Rewards
            </button>
          </div>
        </div>
      )}

      {/* Left Column: Profile Card & Character Customizer */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Card 1: Citizen Stats & Progress */}
        <div className="bg-canvas border border-hairline rounded-xl p-5 shadow-level2 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-primary mb-1">{t.profileTitle || 'Your Citizen Profile'}</h3>
            <p className="text-xs text-body">{t.profileDesc || 'Your contributions directly improve the civic health of your neighborhood.'}</p>
          </div>
          
          <div className="bg-canvas-soft border border-hairline p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-mute uppercase tracking-wider">{t.levelStatus || 'LEVEL STATUS'}</span>
                <span className="text-xs font-bold text-primary">{levelNames[level] || `Level ${level}: Civic Leader`}</span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-primary text-on-primary py-0.5 px-2 rounded-full">{t.level || 'Lvl'} {level}</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-body">{t.experiencePoints || 'Experience Points (XP)'}</span>
                <span className="text-primary font-bold">{points} / {nextLevelThreshold} XP</span>
              </div>
              <div className="h-2 w-full bg-canvas-soft-2 border border-hairline rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>

            <div className="text-[10px] text-mute font-mono flex justify-between pt-1 border-t border-hairline/60">
              <span>{t.totalReports || 'Total Reports'}: <strong className="text-primary">{issuesCount}</strong></span>
              <span>{t.upvotesDone || 'Upvotes Done'}: <strong className="text-primary">{votesCount}</strong></span>
            </div>
          </div>
        </div>

        {/* Card 2: Interactive Avatar & Character Choice */}
        <div className="bg-canvas border border-hairline rounded-xl p-5 shadow-level2 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-2">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wide font-mono">Civic Persona</h4>
            <span className="text-[9px] text-mute font-mono">Level & Badge Unlocks</span>
          </div>

          {/* Active Spotlight */}
          {(() => {
            const activeAvatar = avatarsRegistry.find(a => a.id === (currentUser?.avatar || 'ally')) || avatarsRegistry[0];
            return (
              <div className="relative border border-primary/20 bg-primary-soft/10 p-3.5 rounded-lg flex items-center gap-3 overflow-hidden shadow-sm hover:shadow transition duration-200">
                <div className="absolute right-[-10px] bottom-[-15px] opacity-10 font-mono text-[72px] select-none pointer-events-none">
                  {activeAvatar.emoji}
                </div>
                <div className="h-12 w-12 rounded-xl bg-canvas border border-hairline flex items-center justify-center text-2xl shadow-level2 animate-pulse">
                  {activeAvatar.emoji}
                </div>
                <div className="flex flex-col overflow-hidden z-10">
                  <span className="text-[8px] font-mono font-bold text-primary uppercase tracking-wider">Active Character</span>
                  <span className="text-xs font-bold text-primary leading-tight">{activeAvatar.name}</span>
                  <span className="text-[10px] text-body/90 leading-tight mt-0.5">{activeAvatar.description}</span>
                </div>
              </div>
            );
          })()}

          {/* Persona selector grid */}
          <div className="grid grid-cols-3 gap-2">
            {avatarsRegistry.map(avatar => {
              const hasLevel = level >= avatar.minLevel;
              const hasBadge = avatar.requiredBadge ? badges.includes(avatar.requiredBadge) : true;
              const isUnlocked = hasLevel && hasBadge;
              const isActive = (currentUser?.avatar || 'ally') === avatar.id;
              
              return (
                <button
                  key={avatar.id}
                  disabled={!isUnlocked || isActive}
                  onClick={() => {
                    if (isUnlocked && onUpdateUserProfile && currentUser) {
                      onUpdateUserProfile({
                        ...currentUser,
                        avatar: avatar.id,
                        avatarTitle: avatar.name
                      });
                    }
                  }}
                  title={
                    !isUnlocked 
                      ? `Locked! Requires Level ${avatar.minLevel}${avatar.requiredBadge ? ` & '${badgeMocks[avatar.requiredBadge]?.title}' badge` : ''}`
                      : `Select ${avatar.name}`
                  }
                  className={`relative p-2 rounded-lg border text-center flex flex-col items-center justify-center gap-1 group transition-all duration-200 ${
                    isActive
                      ? 'border-primary bg-primary/10 text-primary shadow-level1 font-semibold ring-1 ring-primary/20 scale-102'
                      : isUnlocked
                        ? 'border-hairline bg-canvas hover:border-primary/40 hover:bg-canvas-soft cursor-pointer hover:scale-102 active:scale-98 text-body'
                        : 'border-hairline bg-canvas-soft/30 opacity-40 cursor-not-allowed text-mute select-none'
                  }`}
                >
                  <span className={`text-xl transition-transform duration-200 ${isUnlocked && 'group-hover:scale-115'}`}>
                    {isUnlocked ? avatar.emoji : '🔒'}
                  </span>
                  <span className="text-[8px] font-bold tracking-tight truncate w-full leading-tight select-none">
                    {avatar.name.split(' ')[0]}
                  </span>
                  
                  {!isUnlocked && (
                    <span className="absolute -top-1.5 -right-1 px-1 bg-canvas border border-hairline rounded font-mono text-[7px] text-mute scale-90">
                      Lvl {avatar.minLevel}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Card 3: Badges Earned */}
        <div className="bg-canvas border border-hairline rounded-xl p-5 shadow-level2 space-y-4">
          <h4 className="text-xs font-bold text-primary uppercase tracking-wide font-mono border-b border-hairline pb-2">{t.badgesEarned || 'Civic Badges Earned'}</h4>
          <div className="grid grid-cols-2 gap-2.5">
            {Object.keys(badgeMocks).map(badgeId => {
              const badge = badgeMocks[badgeId];
              const isUnlocked = badges.includes(badgeId);

              if (isUnlocked) {
                return (
                  <div key={badgeId} className={`border p-2 rounded-lg flex items-start gap-2 ${badge.color} hover:scale-102 transition duration-200`}>
                    <span className="text-lg select-none">{badge.icon}</span>
                    <div className="flex flex-col">
                      <span className="font-bold text-[10px] leading-tight">{badge.title}</span>
                      <span className="text-[9px] opacity-80 leading-snug">{badge.desc}</span>
                    </div>
                  </div>
                );
              }

              // Locked Badge
              return (
                <div key={badgeId} className="border border-hairline bg-canvas-soft/30 p-2 rounded-lg flex items-start gap-2 opacity-40 select-none grayscale cursor-help" title={`Complete task: ${badge.desc}`}>
                  <span className="text-lg">🔒</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-[10px] leading-tight text-mute">{badge.title}</span>
                    <span className="text-[9px] text-mute leading-snug">Lock: {badge.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Center & Right Column: Interactive Quests, Trivia, & Local Leaderboard */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Card A: Daily Quests Tracker */}
        <div className="bg-canvas border border-hairline rounded-xl p-5 shadow-level2 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-2">
            <div className="flex flex-col">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wide font-mono">Daily Civic Quests</h4>
              <p className="text-[10px] text-mute font-sans mt-0.5">Complete local objectives to verify progress and claim XP boosts</p>
            </div>
            <span className="text-[9px] bg-primary-soft/10 text-primary border border-primary/20 rounded px-2 py-0.5 font-mono font-bold">Rotates in 12h</span>
          </div>

          <div className="space-y-3">
            {quests.map(quest => {
              const isProgressDone = quest.current >= quest.target;
              const isClaimed = claimedQuests[quest.id] || false;
              const progressPct = Math.min((quest.current / quest.target) * 100, 100);

              return (
                <div 
                  key={quest.id} 
                  className={`p-3.5 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition duration-200 ${
                    isClaimed 
                      ? 'bg-canvas-soft/40 border-hairline opacity-60' 
                      : isProgressDone 
                        ? 'border-primary/30 bg-primary-soft/5' 
                        : 'border-hairline bg-canvas'
                  }`}
                >
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary">{quest.title}</span>
                      <span className="text-[8px] bg-primary text-on-primary px-1.5 py-0.5 rounded font-mono font-bold leading-none">
                        +{quest.xp} XP
                      </span>
                    </div>
                    <p className="text-[10px] text-body leading-relaxed">{quest.desc}</p>
                    
                    {/* Progress Slider */}
                    {!isClaimed && (
                      <div className="flex items-center gap-2.5 max-w-sm pt-1">
                        <div className="h-1.5 flex-1 bg-canvas-soft-2 border border-hairline rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${isProgressDone ? 'bg-primary' : 'bg-mute'}`} 
                            style={{ width: `${progressPct}%` }}
                          ></div>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-primary leading-none">
                          {quest.current}/{quest.target}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0 flex items-center justify-end">
                    {isClaimed ? (
                      <span className="text-[10px] font-mono font-bold text-mute border border-hairline px-3 py-1.5 rounded-full bg-canvas-soft select-none">
                        Claimed ✓
                      </span>
                    ) : (
                      <button
                        disabled={!isProgressDone}
                        onClick={() => handleClaimQuest(quest.id, quest.xp)}
                        className={`h-8 px-4 rounded-full text-[10px] font-bold font-sans transition-all duration-150 select-none ${
                          isProgressDone 
                            ? 'bg-primary text-on-primary hover:bg-primary/95 shadow-level3 hover:scale-102 cursor-pointer' 
                            : 'bg-canvas border border-hairline text-mute cursor-not-allowed opacity-50'
                        }`}
                      >
                        Claim Reward
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card B: civic trivia challenge mini game */}
        <div className="bg-canvas border border-hairline rounded-xl p-5 shadow-level2 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-2">
            <div className="flex flex-col">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wide font-mono">Civic IQ Trivia</h4>
              <p className="text-[10px] text-mute font-sans mt-0.5">Test your municipal and emergency guidelines awareness for +25 XP</p>
            </div>
            <span className="text-[9px] bg-success-soft/20 text-success border border-success/15 rounded px-2 py-0.5 font-mono font-bold">Mini-Game</span>
          </div>

          {(() => {
            const activeQuestion = triviaQuestions[activeQuestionIdx];
            const userAnswer = answeredQuestions[activeQuestionIdx];
            const isAnswered = userAnswer !== undefined;

            return (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[8px] font-mono text-mute font-bold uppercase tracking-wider">Question {activeQuestionIdx + 1} of {triviaQuestions.length}</span>
                  <p className="text-xs font-bold text-primary leading-snug">{activeQuestion.question}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeQuestion.options.map((option, oIdx) => {
                    const isSelected = userAnswer === oIdx;
                    const isCorrectOption = oIdx === activeQuestion.correctIndex;
                    
                    let buttonClass = "border border-hairline bg-canvas hover:bg-canvas-soft-2 cursor-pointer text-body";
                    if (isAnswered) {
                      if (isCorrectOption) {
                        buttonClass = "border-success bg-success-soft/25 text-success-deep font-bold";
                      } else if (isSelected) {
                        buttonClass = "border-error bg-error-soft/25 text-error-deep font-bold";
                      } else {
                        buttonClass = "border-hairline bg-canvas opacity-40 cursor-not-allowed";
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={isAnswered}
                        onClick={() => handleAnswerTrivia(oIdx)}
                        className={`p-3 text-left rounded-xl text-xs transition duration-200 flex items-center gap-2 select-none ${buttonClass}`}
                      >
                        <span className="h-5 w-5 rounded-full bg-canvas border border-hairline flex items-center justify-center font-mono font-bold text-[10px] text-mute group-hover:border-primary">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span>{option}</span>
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <div className="p-3.5 bg-canvas-soft-2 border border-hairline rounded-xl space-y-1">
                    <span className="block text-[9px] font-mono font-bold text-primary uppercase tracking-wider">
                      {userAnswer === activeQuestion.correctIndex ? "🎉 Correct Explanation" : "❌ Explanation (Try Next)"}
                    </span>
                    <p className="text-[10px] text-body leading-relaxed">{activeQuestion.fact}</p>
                    
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={handleNextTrivia}
                        className="h-7 px-3 rounded-full bg-primary text-on-primary hover:bg-primary/95 text-[9px] font-bold font-mono transition cursor-pointer"
                      >
                        Next Trivia Question →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Card C: Solvers Rivalry Live Activity Feed */}
        <div className="bg-canvas border border-hairline rounded-xl p-5 shadow-level2 space-y-3">
          <h4 className="text-xs font-bold text-primary uppercase tracking-wide font-mono border-b border-hairline pb-2 flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 bg-success rounded-full animate-ping"></span>
            <span>Live Solvers Feed ({cityName || 'Delhi'})</span>
          </h4>

          <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
            {[
              { citizen: "Ananya Sharma", action: `reported a Pothole on Lajpat Road, ${cityName || 'Delhi'}`, time: "just now", label: "+50 XP" },
              { citizen: "Rahul Patel", action: "vouched for a waste disposal report", time: "3 mins ago", label: "+30 XP" },
              { citizen: "Nisha Mohan", action: "leveled up to Level 6!", time: "8 mins ago", label: "LEVEL UP" },
              { citizen: "Devendra K.", action: "resolved a lighting hazard in West Zone", time: "15 mins ago", label: "+50 XP" }
            ].map((feed, fIdx) => (
              <div key={fIdx} className="p-2 border border-hairline bg-canvas-soft-2 rounded-lg flex items-center justify-between gap-3 text-[10px] font-mono">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span className="font-bold text-primary flex-shrink-0">{feed.citizen}</span>
                  <span className="text-body truncate">{feed.action}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-mute/60">{feed.time}</span>
                  <span className="bg-primary/10 text-primary border border-primary/15 px-1.5 rounded text-[8px] font-bold">{feed.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card D: Local Leaderboard Grid */}
        <div className="bg-canvas border border-hairline rounded-xl p-5 shadow-level2 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div>
              <h3 className="text-sm font-bold text-primary mb-0.5">{t.leaderboardTitle || 'Local Leaderboard'}</h3>
              <p className="text-xs text-body">{t.leaderboardSubtitle || 'Top active solvers in'} {cityName || 'Delhi'}</p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-success/10 text-success border border-success/15 py-0.5 px-2.5 rounded-full animate-pulse">{t.weeklyCycle || 'WEEKLY CYCLE'}</span>
          </div>

          <div className="border border-hairline rounded-lg overflow-hidden font-mono text-xs shadow-sm">
            <div className="grid grid-cols-12 bg-canvas-soft border-b border-hairline p-3 font-bold text-mute uppercase text-[9px] tracking-wider">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-6">Solver Citizen</div>
              <div className="col-span-3 text-right">Points</div>
              <div className="col-span-2 text-right">Level</div>
            </div>

            <div className="divide-y divide-hairline bg-canvas">
              {sortedSolvers.map((solver, idx) => {
                const rank = idx + 1;
                const avatarObj = avatarsRegistry.find(a => a.id === solver.avatar) || avatarsRegistry[0];
                const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}`;
                
                return (
                  <div 
                    key={solver.username} 
                    className={`grid grid-cols-12 items-center p-3 transition duration-150 ${solver.isCurrentUser ? 'bg-primary-soft/15 border-l-4 border-l-primary font-semibold text-primary' : 'text-body hover:bg-canvas-soft'}`}
                  >
                    <div className="col-span-1 text-center font-bold text-primary flex items-center justify-center">
                      <span className="text-sm">{medal}</span>
                    </div>
                    <div className="col-span-6 flex items-center gap-2.5">
                      <div className={`h-8 w-8 rounded-full ${avatarObj.bgColor} flex items-center justify-center text-lg select-none shadow-sm transition hover:rotate-12 hover:scale-110 duration-200 border border-hairline`}>
                        {avatarObj.emoji}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-primary font-semibold font-sans flex items-center gap-1.5 leading-tight">
                          {solver.fullName}
                          {solver.isCurrentUser && (
                            <span className="text-[7px] bg-primary text-on-primary font-mono uppercase tracking-wider px-1 py-0.5 rounded font-bold">
                              You
                            </span>
                          )}
                        </span>
                        <span className="text-[9px] text-mute uppercase font-bold tracking-wider leading-none mt-0.5">{avatarObj.name}</span>
                      </div>
                    </div>
                    <div className="col-span-3 text-right font-bold text-primary font-mono">{solver.points} XP</div>
                    <div className="col-span-2 text-right">
                      <span className="bg-primary text-on-primary text-[9px] font-bold px-2 py-0.5 rounded font-mono">Lvl {solver.level}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
      
    </div>
  );
};
