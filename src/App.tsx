import React, { useState, useEffect, useRef } from 'react';
import { Sword, Shield, DollarSign, Sparkles, X, ShoppingCart, Trophy, Volume2, VolumeX } from 'lucide-react';

const SWORD_NAMES = [
  "녹슨 검", "낡은 검", "철검", "강철검", "은검",
  "황금검", "크리스탈 검", "마법 검", "영웅의 검", "전설의 검",
  "신성한 검", "용의 검", "불꽃 검", "얼음 검", "번개 검",
  "암흑 검", "빛의 검", "시공의 검", "우주의 검", "창조의 검",
  "파괴의 검", "영원의 검", "무한의 검", "절대의 검", "초월의 검",
  "신화의 검", "전능의 검", "천상의 검", "궁극의 검", "불멸의 검",
  "세계수의 검"
];

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

function App() {
  const [gold, setGold] = useState(1000);
  const [swordLevel, setSwordLevel] = useState(0);
  const [protectionScrolls, setProtectionScrolls] = useState(0);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "fail" | "info">("info");
  const [showShop, setShowShop] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [upgrading, setUpgrading] = useState(false);
  const [animationType, setAnimationType] = useState<"success" | "fail" | "">("");
  const [isMuted, setIsMuted] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: "first_upgrade", title: "첫 강화", description: "+1 달성", icon: "⚔️", unlocked: false },
    { id: "level_5", title: "입문자", description: "+5 달성", icon: "🎖️", unlocked: false },
    { id: "level_10", title: "숙련자", description: "+10 달성", icon: "🏅", unlocked: false },
    { id: "level_15", title: "전문가", description: "+15 달성", icon: "🎗️", unlocked: false },
    { id: "level_20", title: "마스터", description: "+20 달성", icon: "🏆", unlocked: false },
    { id: "level_25", title: "전설", description: "+25 달성", icon: "👑", unlocked: false },
    { id: "level_30", title: "신화", description: "+30 달성!", icon: "✨", unlocked: false },
    { id: "first_destroy", title: "아픈 경험", description: "처음으로 검 파괴", icon: "💔", unlocked: false },
    { id: "rich", title: "부자", description: "10만 골드 보유", icon: "💰", unlocked: false },
    { id: "seller", title: "상인", description: "검 10개 판매", icon: "🛒", unlocked: false },
  ]);

  const [totalSold, setTotalSold] = useState(0);
  const [hasDestroyed, setHasDestroyed] = useState(false);

  // 오디오 컨텍스트
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  // 효과음 재생 함수
  const playSound = (type: 'success' | 'fail' | 'click' | 'coin' | 'achievement') => {
    if (isMuted || !audioContextRef.current) return;

    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
      case 'success':
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        break;
      case 'fail':
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        break;
      case 'click':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
      case 'coin':
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
      case 'achievement':
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(554.37, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.2);
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.6);
        break;
    }
  };

  // 업적 체크
  const checkAchievements = (level: number) => {
    const achievementChecks = [
      { id: "first_upgrade", condition: level >= 1 },
      { id: "level_5", condition: level >= 5 },
      { id: "level_10", condition: level >= 10 },
      { id: "level_15", condition: level >= 15 },
      { id: "level_20", condition: level >= 20 },
      { id: "level_25", condition: level >= 25 },
      { id: "level_30", condition: level >= 30 },
    ];

    achievementChecks.forEach(check => {
      if (check.condition) {
        unlockAchievement(check.id);
      }
    });

    if (gold >= 100000) {
      unlockAchievement("rich");
    }

    if (totalSold >= 10) {
      unlockAchievement("seller");
    }

    if (hasDestroyed) {
      unlockAchievement("first_destroy");
    }
  };

  const unlockAchievement = (id: string) => {
    setAchievements(prev => {
      const achievement = prev.find(a => a.id === id);
      if (achievement && !achievement.unlocked) {
        const newAchievements = prev.map(a => 
          a.id === id ? { ...a, unlocked: true } : a
        );
        
        // 업적 알림 표시
        const unlockedAchievement = newAchievements.find(a => a.id === id);
        if (unlockedAchievement) {
          setNewAchievement(unlockedAchievement);
          playSound('achievement');
          setTimeout(() => setNewAchievement(null), 3000);
        }
        
        return newAchievements;
      }
      return prev;
    });
  };

  useEffect(() => {
    checkAchievements(swordLevel);
  }, [swordLevel, gold, totalSold, hasDestroyed]);

  // 강화 성공 확률 계산
  const getSuccessRate = (level: number): number => {
    if (level < 10) return 80;
    if (level < 15) return 70;
    if (level < 20) return 50;
    if (level < 25) return 30;
    if (level < 28) return 15;
    if (level < 30) return 5;
    return 1;
  };

  // 강화 비용 계산
  const getUpgradeCost = (level: number): number => {
    return Math.floor(100 * Math.pow(1.5, level));
  };

  // 판매 가격 계산
  const getSellPrice = (level: number): number => {
    if (level === 0) return 0;
    return Math.floor(500 * Math.pow(2, level - 1));
  };

  // 필요한 깨짐방지권 개수
  const getRequiredScrolls = (level: number): number => {
    if (level < 15) return 1;
    if (level < 20) return 2;
    if (level < 25) return 3;
    if (level < 28) return 5;
    return 10;
  };

  // 깨짐방지권 가격
  const getScrollPrice = (): number => {
    return 5000;
  };

  // 강화 시도
  const handleUpgrade = () => {
    const cost = getUpgradeCost(swordLevel);
    const requiredScrolls = getRequiredScrolls(swordLevel);
    
    if (swordLevel >= 30) {
      showMessage("이미 최대 강화 레벨입니다!", "info");
      return;
    }

    if (gold < cost) {
      showMessage(`골드가 부족합니다! (필요: ${cost.toLocaleString()}G)`, "fail");
      playSound('fail');
      return;
    }

    setGold(gold - cost);
    setUpgrading(true);
    playSound('click');

    // 강화 애니메이션 딜레이
    setTimeout(() => {
      const successRate = getSuccessRate(swordLevel);
      const random = Math.random() * 100;
      
      if (random < successRate) {
        // 성공
        const newLevel = swordLevel + 1;
        setSwordLevel(newLevel);
        setAnimationType("success");
        playSound('success');
        showMessage(`강화 성공! +${newLevel} ${SWORD_NAMES[newLevel]}`, "success");
        addHistory(`✨ +${newLevel} 강화 성공!`);
      } else {
        // 실패
        setAnimationType("fail");
        if (protectionScrolls >= requiredScrolls) {
          setProtectionScrolls(protectionScrolls - requiredScrolls);
          playSound('click');
          showMessage(`강화 실패... 깨짐방지권 ${requiredScrolls}개 사용으로 검 보호`, "info");
          addHistory(`🛡️ 강화 실패 (깨짐방지권 사용)`);
        } else {
          setSwordLevel(0);
          setHasDestroyed(true);
          playSound('fail');
          showMessage("강화 실패! 검이 파괴되었습니다...", "fail");
          addHistory(`💔 +${swordLevel} 검 파괴...`);
        }
      }

      setTimeout(() => {
        setUpgrading(false);
        setAnimationType("");
      }, 1000);
    }, 1000);
  };

  // 검 판매
  const handleSell = () => {
    if (swordLevel === 0) {
      showMessage("판매할 수 있는 검이 없습니다!", "info");
      return;
    }

    const sellPrice = getSellPrice(swordLevel);
    setGold(gold + sellPrice);
    setTotalSold(totalSold + 1);
    playSound('coin');
    showMessage(`+${swordLevel} ${SWORD_NAMES[swordLevel]}을(를) ${sellPrice.toLocaleString()}G에 판매했습니다!`, "success");
    addHistory(`💰 +${swordLevel} 검 판매 (${sellPrice.toLocaleString()}G)`);
    setSwordLevel(0);
  };

  // 깨짐방지권 구매
  const handleBuyScroll = (amount: number) => {
    const cost = getScrollPrice() * amount;
    if (gold < cost) {
      showMessage(`골드가 부족합니다! (필요: ${cost.toLocaleString()}G)`, "fail");
      playSound('fail');
      return;
    }

    setGold(gold - cost);
    setProtectionScrolls(protectionScrolls + amount);
    playSound('coin');
    showMessage(`깨짐방지권 ${amount}개를 구매했습니다!`, "success");
  };

  const showMessage = (msg: string, type: "success" | "fail" | "info") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  const addHistory = (text: string) => {
    setHistory(prev => [text, ...prev].slice(0, 10));
  };

  const successRate = getSuccessRate(swordLevel);
  const upgradeCost = getUpgradeCost(swordLevel);
  const sellPrice = getSellPrice(swordLevel);
  const requiredScrolls = getRequiredScrolls(swordLevel);
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-white mb-2 flex items-center justify-center gap-3">
            <Sword className="w-10 h-10" />
            검 강화 게임
            <Sword className="w-10 h-10" />
          </h1>
          <p className="text-purple-200">목표: +30 강화 달성!</p>
        </div>

        {/* 상단 정보 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6 border border-white/20">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-purple-200 text-sm">보유 골드</p>
                <p className="text-white text-xl">{gold.toLocaleString()} G</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-purple-200 text-sm">깨짐방지권</p>
                <p className="text-white text-xl">{protectionScrolls}개</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-purple-200 text-sm">업적</p>
                <p className="text-white text-xl">{unlockedCount}/{achievements.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* 검 정보 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 relative overflow-hidden">
            {/* 애니메이션 효과 */}
            {animationType === "success" && (
              <div className="absolute inset-0 bg-yellow-400/30 animate-pulse pointer-events-none z-10" />
            )}
            {animationType === "fail" && (
              <div className="absolute inset-0 bg-red-600/30 animate-pulse pointer-events-none z-10" />
            )}
            
            <div className="text-center relative z-20">
              <div className="mb-6">
                <Sword 
                  className={`w-32 h-32 mx-auto transition-all duration-500 ${
                    upgrading ? 'animate-spin' : ''
                  } ${
                    swordLevel === 0 ? 'text-gray-400' :
                    swordLevel < 10 ? 'text-gray-300' :
                    swordLevel < 20 ? 'text-blue-400' :
                    swordLevel < 30 ? 'text-purple-400' :
                    'text-yellow-400'
                  }`}
                  style={{
                    filter: swordLevel >= 20 ? 'drop-shadow(0 0 20px currentColor)' : 'none',
                    transform: animationType === "success" ? 'scale(1.2)' : 'scale(1)'
                  }}
                />
              </div>
              
              {swordLevel === 0 ? (
                <div>
                  <p className="text-gray-400 text-xl mb-2">검이 없습니다</p>
                  <p className="text-gray-500 text-sm">강화를 시작하세요!</p>
                </div>
              ) : (
                <div>
                  <div className="text-yellow-400 text-3xl mb-2">+{swordLevel}</div>
                  <p className="text-white text-xl mb-4">{SWORD_NAMES[swordLevel]}</p>
                  <div className="bg-white/5 rounded-lg p-3 mb-4">
                    <p className="text-purple-200 text-sm">판매 가격</p>
                    <p className="text-yellow-400 text-xl">{sellPrice.toLocaleString()} G</p>
                  </div>
                  <button
                    onClick={handleSell}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <DollarSign className="w-5 h-5" />
                    검 판매하기
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 강화 정보 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
            <h3 className="text-white text-xl mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              강화 정보
            </h3>
            
            {swordLevel >= 30 ? (
              <div className="text-center py-12">
                <p className="text-yellow-400 text-3xl mb-2 animate-bounce">🎉 축하합니다! 🎉</p>
                <p className="text-white text-xl">최대 강화 달성!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-purple-200 text-sm mb-1">현재 강화</p>
                  <p className="text-white text-2xl">+{swordLevel} → +{swordLevel + 1}</p>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-purple-200 text-sm mb-2">성공 확률</p>
                  <div className="w-full bg-gray-700 rounded-full h-6 overflow-hidden">
                    <div 
                      className={`h-full flex items-center justify-center text-white text-sm transition-all duration-300 ${
                        successRate >= 50 ? 'bg-green-500' :
                        successRate >= 30 ? 'bg-yellow-500' :
                        successRate >= 10 ? 'bg-orange-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${successRate}%` }}
                    >
                      {successRate}%
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-purple-200 text-sm mb-1">강화 비용</p>
                  <p className="text-yellow-400 text-xl">{upgradeCost.toLocaleString()} G</p>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-purple-200 text-sm mb-1">실패 시 필요 깨짐방지권</p>
                  <p className="text-blue-400 text-xl">{requiredScrolls}개</p>
                </div>

                <button
                  onClick={handleUpgrade}
                  disabled={gold < upgradeCost || upgrading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-4 rounded-lg transition-all text-xl flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                >
                  <Sparkles className={`w-6 h-6 ${upgrading ? 'animate-spin' : ''}`} />
                  {upgrading ? '강화 중...' : '강화하기'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <button
            onClick={() => {
              setShowShop(true);
              playSound('click');
            }}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/20 transition-all text-white flex items-center justify-center gap-3"
          >
            <ShoppingCart className="w-6 h-6" />
            상점 열기
          </button>

          <button
            onClick={() => {
              setShowAchievements(true);
              playSound('click');
            }}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/20 transition-all text-white flex items-center justify-center gap-3"
          >
            <Trophy className="w-6 h-6" />
            업적 ({unlockedCount}/{achievements.length})
          </button>

          <button
            onClick={() => {
              setIsMuted(!isMuted);
              playSound('click');
            }}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/20 transition-all text-white flex items-center justify-center gap-3"
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            {isMuted ? '음소거' : '사운드'}
          </button>
        </div>

        {/* 진행도 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
          <p className="text-center text-purple-200 mb-2">
            진행도: <span className="text-white text-xl">{swordLevel}/30</span>
          </p>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-yellow-500 transition-all duration-300"
              style={{ width: `${(swordLevel / 30) * 100}%` }}
            />
          </div>
        </div>

        {/* 강화 기록 */}
        {history.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-white mb-3">최근 기록</h3>
            <div className="space-y-2">
              {history.map((item, index) => (
                <div 
                  key={index}
                  className="text-purple-200 text-sm bg-white/5 rounded px-3 py-2 animate-fadeIn"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 메시지 */}
        {message && (
          <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-4 rounded-lg shadow-lg text-white text-center max-w-md z-50 ${
            messageType === 'success' ? 'bg-green-600 animate-bounce' :
            messageType === 'fail' ? 'bg-red-600 animate-shake' :
            'bg-blue-600 animate-bounce'
          }`}>
            {message}
          </div>
        )}

        {/* 업적 알림 */}
        {newAchievement && (
          <div className="fixed top-8 right-8 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-slideIn max-w-xs">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{newAchievement.icon}</span>
              <div>
                <p className="font-bold">업적 달성!</p>
                <p className="text-sm">{newAchievement.title}</p>
              </div>
            </div>
          </div>
        )}

        {/* 상점 모달 */}
        {showShop && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl p-8 max-w-md w-full border-2 border-white/30 relative animate-scaleIn">
              <button
                onClick={() => {
                  setShowShop(false);
                  playSound('click');
                }}
                className="absolute top-4 right-4 text-white hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-white text-2xl mb-6 flex items-center gap-2">
                <ShoppingCart className="w-8 h-8" />
                상점
              </h2>

              <div className="space-y-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-8 h-8 text-blue-400" />
                    <div>
                      <p className="text-white">깨짐방지권</p>
                      <p className="text-purple-200 text-sm">{getScrollPrice().toLocaleString()} G / 개</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleBuyScroll(1)}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors"
                    >
                      1개
                    </button>
                    <button
                      onClick={() => handleBuyScroll(5)}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors"
                    >
                      5개
                    </button>
                    <button
                      onClick={() => handleBuyScroll(10)}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors"
                    >
                      10개
                    </button>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4 text-purple-200 text-sm">
                  <p className="mb-2">💡 팁:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>강화가 높을수록 더 많은 깨짐방지권이 필요합니다</li>
                    <li>검을 판매하면 많은 골드를 얻을 수 있습니다</li>
                    <li>고강화 구간은 확률이 매우 낮으니 주의하세요!</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 업적 모달 */}
        {showAchievements && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl p-8 max-w-2xl w-full border-2 border-white/30 relative animate-scaleIn max-h-[80vh] overflow-y-auto">
              <button
                onClick={() => {
                  setShowAchievements(false);
                  playSound('click');
                }}
                className="absolute top-4 right-4 text-white hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-white text-2xl mb-6 flex items-center gap-2">
                <Trophy className="w-8 h-8" />
                업적 ({unlockedCount}/{achievements.length})
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`rounded-lg p-4 border-2 transition-all ${
                      achievement.unlocked
                        ? 'bg-yellow-500/20 border-yellow-500'
                        : 'bg-white/5 border-white/10 opacity-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <p className={`${achievement.unlocked ? 'text-yellow-400' : 'text-gray-400'} mb-1`}>
                          {achievement.title}
                        </p>
                        <p className="text-purple-200 text-sm">{achievement.description}</p>
                        {achievement.unlocked && (
                          <p className="text-green-400 text-sm mt-1">✓ 달성!</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;
