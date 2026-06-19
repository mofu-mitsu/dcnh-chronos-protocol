import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Calendar, Droplets } from 'lucide-react';
import DefenseProtocol from './components/DefenseProtocol';
import CaterpillarWalker from './components/CaterpillarWalker';
import DarlingGigen from './components/DarlingGigen';
import CaterpillarLine from './components/CaterpillarLine';
import GohoubiPork from './components/GohoubiPork';
import LiiAuthor from './components/LiiAuthor';
import WaterCalendarQA from './components/WaterCalendarQA';
import DangerAreaWarning from './components/DangerAreaWarning';
import AlternativeQA from './components/AlternativeQA';
import FinalTextQA from './components/FinalTextQA';
import ResultView from './components/ResultView';
import RobotBuilder from './components/RobotBuilder';
import { DIAGNOSIS_QUESTIONS, ALTERNATIVE_QUESTIONS, SubtypeScore, BAD_WORDS, FINAL_LETTER_QUESTION } from './data';
import { playPochonSound, startAmbientWaterBGM, stopAmbientWaterBGM, setSFXEnabled, resumeAudioContext } from './utils/audio';

export default function App() {
  const [started, setStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState<SubtypeScore>({ D: 0, C: 0, N: 0, H: 0 });
  const [scoreHistory, setScoreHistory] = useState<SubtypeScore[]>([]);
  const [finished, setFinished] = useState(false);

  // クリエイターロボットアセンブリ関連状態
  const [showRobotBuilder, setShowRobotBuilder] = useState(false);
  const [showFinalLetter, setShowFinalLetter] = useState(false);
  const [assembledRobot, setAssembledRobot] = useState<{ head: string; core: string; arm: string; headId?: string; coreId?: string; armId?: string; phrase: string } | null>(null);

  // BGM & 効果音コントロール
  const [bgmActive, setBgmActive] = useState(false);
  const [sfxActive, setSfxActive] = useState(true);

  // 回答時の水波紋エフェクト
  const [rippleActive, setRippleActive] = useState(false);

  // 被験者ニックネーム
  const [username, setUsername] = useState('');

  // 被験者の自認ソシオニクス16タイプ
  const [selfType, setSelfType] = useState('LII');
  
  // 危険地区警告の承諾フラグ
  const [warningConfirmed, setWarningConfirmed] = useState(false);

  // 通常4択迂回モードフラグ
  const [isAlternativeMode, setIsAlternativeMode] = useState(false);

  // 診断中の詳細行動パリティログ（結果画面のターミナルに表示される）
  const [actionLogs, setActionLogs] = useState<string[]>([]);

  // 芋虫お散歩＆逆襲イベント関連
  const [squished, setSquished] = useState(false);
  const [eventActive, setEventActive] = useState(false);

  // 水のエフェクト用の降る雨粒子
  const [drops, setDrops] = useState<{ id: number; left: string; delay: string; duration: string }[]>([]);

  // BGMの音響管理
  useEffect(() => {
    if (bgmActive) {
      startAmbientWaterBGM();
    } else {
      stopAmbientWaterBGM();
    }
    return () => {
      stopAmbientWaterBGM();
    };
  }, [bgmActive]);

  // 効果音許可トリガー
  useEffect(() => {
    setSFXEnabled(sfxActive);
  }, [sfxActive]);

  const toggleBGMState = () => {
    resumeAudioContext();
    setBgmActive((prev) => !prev);
    // BGMをONにした瞬間に演出としてポチャンと一度ならす
    if (!bgmActive) {
      setTimeout(() => {
        playPochonSound();
      }, 50);
    }
  };

  const toggleSFXState = () => {
    resumeAudioContext();
    const nextVal = !sfxActive;
    setSfxActive(nextVal);
    if (nextVal) {
      // 効果音ONにしてくれたらその瞬間に心地よく鳴らして同期確認する
      setTimeout(() => {
        playPochonSound();
      }, 50);
    }
  };

  useEffect(() => {
    // 水滴パーティクル
    const initialDrops = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${4 + Math.random() * 6}s`,
    }));
    setDrops(initialDrops);
  }, []);

  // 行動ログ追加用ヘルパー
  const addLog = (text: string) => {
    setActionLogs((prev) => [...prev, `${text}`]);
  };

  // 防衛プロトコルでの名前確定
  const handleStartWithUser = (name: string, userSelfType: string, bypassMode = false) => {
    playPochonSound();
    setRippleActive(true);
    setTimeout(() => setRippleActive(false), 1200);

    setUsername(name);
    setSelfType(userSelfType);
    setStarted(true);
    setCurrentQuestionIndex(0);
    setScore({ D: 0, C: 0, N: 0, H: 0 });
    setFinished(false);
    setSquished(false);
    setEventActive(false);
    setWarningConfirmed(false);
    
    // 初期ログ
    setActionLogs([]);
    if (bypassMode) {
      setActionLogs([
        `[セッション開始] ニックネーム: ${name} / 自認タイプ: ${userSelfType} (ジョーク耐性Bypassで突入)`,
        `[変数ブースト] ジョーク耐性を証明。Ti+2, Se+1の初期バグ加算を実行したゾッ！`
      ]);
      setScore({ D: 1, C: 1, N: 2, H: 0 });
    } else {
      setActionLogs([
        `[セッション開始] ニックネーム: ${name} / 自認タイプ: ${userSelfType} (分析準備完了)`,
        `[心理プローブ] 初期安定度パリティチェックをパス。水位1.0に同期。`
      ]);
    }
  };

  const handleAnswer = (answerScore: Partial<SubtypeScore>) => {
    playPochonSound();
    setRippleActive(true);
    setTimeout(() => setRippleActive(false), 1200);

    // 履歴に現在のスコアをディープコピーして記憶
    setScoreHistory((prev) => [...prev, { ...score }]);

    // スコア加算
    setScore((prev) => {
      const next = { ...prev };
      Object.keys(answerScore).forEach((key) => {
        const k = key as keyof SubtypeScore;
        next[k] = (next[k] || 0) + (answerScore[k] || 0);
      });
      return next;
    });

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < DIAGNOSIS_QUESTIONS.length) {
      setCurrentQuestionIndex(nextIndex);
    } else {
      setShowRobotBuilder(true);
      addLog(`[診断終了] 心理質問がすべて完了しました。自律デバッグロボット構築フェーズへ移行します。`);
    }
  };

  const handleRobotComplete = (
    scoreBonus: Partial<SubtypeScore>,
    robotData: { head: string; core: string; arm: string; headId?: string; coreId?: string; armId?: string; phrase: string }
  ) => {
    playPochonSound();
    setRippleActive(true);
    setTimeout(() => setRippleActive(false), 1200);

    setAssembledRobot(robotData);
    setShowRobotBuilder(false);

    // ロボットによる追加スコア変動
    setScore((prev) => {
      const next = { ...prev };
      Object.keys(scoreBonus).forEach((key) => {
        const k = key as keyof SubtypeScore;
        next[k] = (next[k] || 0) + (scoreBonus[k] || 0);
      });
      return next;
    });

    addLog(`[ロボット同期] 独立意思ユニットの構築完了：頭: ${robotData.head} / コア: ${robotData.core} / アーム: ${robotData.arm}`);
    addLog(`[教授言語シンク] 「${robotData.phrase}」をメモリエリアL3に同期。`);
    
    // 最終手紙フェーズに遷移する
    setShowFinalLetter(true);
    addLog(`[手紙フェーズ始動] 構築された自律ユニットを伴い、最終 of 時空証言ステップへ移行。`);
  };

  const handleFinalLetterComplete = (answerScore: Partial<SubtypeScore>) => {
    playPochonSound();
    setRippleActive(true);
    setTimeout(() => setRippleActive(false), 1200);

    setScore((prev) => {
      const next = { ...prev };
      Object.keys(answerScore).forEach((key) => {
        const k = key as keyof SubtypeScore;
        next[k] = (next[k] || 0) + (answerScore[k] || 0);
      });
      return next;
    });

    addLog(`[手紙記録] 最終の時空記録証言が提出されました。データストリームをクローズします。`);
    setShowFinalLetter(false);
    setFinished(true);
    addLog(`[診断完了] 自律個体の構築監査をパス。DCNH値を算出しました。`);
  };

  const handleGoBack = () => {
    playPochonSound();
    setRippleActive(true);
    setTimeout(() => setRippleActive(false), 1200);

    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      
      // スコア履歴の最後の状態を取り出して復元
      setScoreHistory((prev) => {
        const historyCopy = [...prev];
        const lastScore = historyCopy.pop();
        if (lastScore) {
          setScore(lastScore);
        }
        return historyCopy;
      });

      // もしLINEへの警告画面中の戻りであればwarningConfirmedをリセットする
      if (currentQuestionIndex === 5) {
        setWarningConfirmed(false);
      }

      setCurrentQuestionIndex(prevIndex);
      addLog(`[時空修正] 質問${currentQuestionIndex + 1}から前のフェーズにロールバックしました。`);
    }
  };

  const handleSquish = () => {
    if (squished) return;
    setSquished(true);
    addLog(`[Se暴走] 画面下部を歩くLSI芋虫(🐛)が30回酷使され、システム不具合を伴う逆襲が検知されました！物理攻撃パラメーターを +3 (Dom/Cre) 加算。`);
    setScore((prev) => ({
      ...prev,
      C: prev.C + 3,
      D: prev.D + 3,
    }));
  };

  const handleCaterpillarEvent = (active: boolean) => {
    setEventActive(active);
  };

  // 診断のリセット
  const handleReset = () => {
    playPochonSound();
    setRippleActive(true);
    setTimeout(() => setRippleActive(false), 1200);

    setStarted(false);
    setFinished(false);
    setShowRobotBuilder(false);
    setShowFinalLetter(false);
    setAssembledRobot(null);
    setCurrentQuestionIndex(0);
    setScore({ D: 0, C: 0, N: 0, H: 0 });
    setScoreHistory([]);
    setSquished(false);
    setEventActive(false);
    setWarningConfirmed(false);
    setIsAlternativeMode(false);
    setUsername('');
    setActionLogs([]);
  };

  // 警告画面を確認してLINE危険地区へ進入
  const handleConfirmWarning = () => {
    playPochonSound();
    setRippleActive(true);
    setTimeout(() => setRippleActive(false), 1200);

    setWarningConfirmed(true);
    setIsAlternativeMode(false);
    addLog(`[危険地区突入] 被験者が案内人らの精神汚染LINEエリア(フェーズ6)への移行を承認。`);
  };

  // 警告画面を迂回して通常の4択モードへ
  const handleBypassWarning = () => {
    playPochonSound();
    setRippleActive(true);
    setTimeout(() => setRippleActive(false), 1200);

    setIsAlternativeMode(true);
    setWarningConfirmed(true);
    addLog(`[通常迂回] 被験者が精神汚染エリアのバイパスを承認。通常の4択診断モデルへ分岐しました。`);
  };

  const baseQuestion = DIAGNOSIS_QUESTIONS[currentQuestionIndex];
  const isLineZone = baseQuestion && [
    'darling_gigen',
    'caterpillar_line',
    'gohoubi_pork',
    'lii_author'
  ].includes(baseQuestion.type);

  const showWarning = isLineZone && !warningConfirmed;

  const currentQuestion = (isAlternativeMode && currentQuestionIndex >= 5 && currentQuestionIndex <= 8)
    ? ALTERNATIVE_QUESTIONS[currentQuestionIndex - 5]
    : baseQuestion;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col justify-between relative overflow-hidden select-none font-sans">
      
      {/* 質問回答時の波紋（Ripples）じわっと広がるエフェクトレイヤー */}
      <AnimatePresence>
        {rippleActive && (
          <motion.div
            initial={{ scale: 0, opacity: 0.7 }}
            animate={{ scale: 5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            className="absolute inset-x-0 inset-y-0 m-auto pointer-events-none rounded-full border-4 border-cyan-400/50 w-32 h-32 z-40 bg-cyan-300/5 shadow-[0_0_20px_rgba(34,211,238,0.25)]"
          />
        )}
      </AnimatePresence>

      {/* 1. バックグラウンド：降る雨粒子 */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {drops.map((drop) => (
          <motion.div
            key={drop.id}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: '105vh', opacity: [0, 0.4, 0.4, 0] }}
            transition={{
              duration: parseFloat(drop.duration),
              repeat: Infinity,
              delay: parseFloat(drop.delay),
              ease: 'linear',
            }}
            className="absolute w-[1.5px] h-4 bg-cyan-600/10 rounded-full"
            style={{ left: drop.left }}
          />
        ))}

        {/* コグ・カレンダーの幾何学グリッドを背景に優しく投影 */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.012)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        {/* 空間にたゆたう大きな水泡風グラデーション円 */}
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-cyan-200/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-10 w-[450px] h-[450px] bg-indigo-200/10 rounded-full blur-3xl"></div>
      </div>

      {/* 2. お散歩LSI芋虫（アクティブ、ただし結果画面・逆襲イベント中は制限） */}
      {started && !finished && (
        <CaterpillarWalker
          onSquish={handleSquish}
          squished={squished}
          onCaterpillarEvent={handleCaterpillarEvent}
          eventActive={eventActive}
        />
      )}

      {/* 3. ヘッダー（タイトルバー） */}
      <header className="border-b-2 border-stone-200 bg-white/70 backdrop-blur-md px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-700 flex items-center justify-center p-1 border border-cyan-500/20 shadow-sm shrink-0">
            <Droplets className="w-4.5 h-4.5 text-cyan-100 animate-pulse" />
          </div>
          <div className="text-left">
            <h1 className="text-xs font-bold font-sans tracking-tight text-stone-900 leading-none">
              DCNH Subtype Matrix
            </h1>
            <p className="text-[8px] font-mono text-stone-400 leading-none mt-1">
              ESTHETICS OF WATER & TIME
            </p>
          </div>
        </div>

        {/* 公開用の不特定多数向け表記。余計な開発者・テストユーザーのアトリビューションは一切無し */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3">
          {/* BGM & 効果音コントロール */}
          <div className="flex items-center gap-1 bg-stone-100 border border-stone-200 py-0.5 px-2 rounded-full text-[9px] font-bold text-stone-600 scale-95 sm:scale-100 select-none">
            <button
              onClick={toggleBGMState}
              className={`cursor-pointer px-1.5 py-0.5 rounded-full transition-all flex items-center gap-0.5 ${
                bgmActive ? 'bg-cyan-600 text-white shadow-xs font-semibold' : 'text-stone-500 hover:bg-stone-200'
              }`}
              title="BGMの再生/一時停止"
            >
              <span>{bgmActive ? '🎵 BGM: ON' : '❌ BGM: OFF'}</span>
            </button>
            <span className="text-stone-300">|</span>
            <button
              onClick={toggleSFXState}
              className={`cursor-pointer px-1.5 py-0.5 rounded-full transition-all flex items-center gap-0.5 ${
                sfxActive ? 'bg-indigo-600 text-white shadow-xs font-semibold' : 'text-stone-500 hover:bg-stone-200'
              }`}
              title="ポチャン効果音のON/OFF"
            >
              <span>{sfxActive ? '🔊 効果音: ON' : '❌ 効果音: OFF'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {started && !finished && currentQuestionIndex > 0 && !showWarning && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGoBack}
                className="text-[10px] font-bold text-stone-700 hover:text-stone-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 hover:border-amber-300 py-1 px-3 rounded-full cursor-pointer transition-all flex items-center gap-0.5 shadow-sm font-sans"
              >
                <span>← 前の質問に戻る</span>
              </motion.button>
            )}
            <span className="text-[9px] font-mono bg-stone-200 border border-stone-300 text-stone-600 py-0.5 px-2.5 rounded-full">
              v2.1.2-Stable
            </span>
          </div>
        </div>
      </header>

      {/* 4. メインエリア */}
      <main className="flex-1 flex flex-col justify-center p-4 md:p-6 z-10 w-full max-w-4xl mx-auto">
        <div className="w-full flex-1 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {!started ? (
              // ウェルカムおよびニックネーム登録画面
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full max-w-2xl"
              >
                <DefenseProtocol 
                  onStart={handleStartWithUser} 
                  addLog={addLog}
                />
              </motion.div>
            ) : !finished ? (
              // 通常診断中のQ&A、フェーズ制御
              showRobotBuilder ? (
                <motion.div
                  key="robot-builder-zone"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="w-full animate-fade-in"
                >
                  <RobotBuilder onComplete={handleRobotComplete} username={username} />
                </motion.div>
              ) : showFinalLetter ? (
                <motion.div
                  key="final-letter-zone"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="w-full flex justify-center animate-fade-in"
                >
                  <FinalTextQA
                    question={FINAL_LETTER_QUESTION}
                    onAnswer={handleFinalLetterComplete}
                    onLogAction={addLog}
                  />
                </motion.div>
              ) : showWarning ? (
                // 危険地区に入る時の警告
                <motion.div
                  key="warning-zone"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full font-mono scale-[0.98] sm:scale-100"
                >
                  <DangerAreaWarning
                    onConfirm={handleConfirmWarning}
                    onBypass={handleBypassWarning}
                    username={username}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key={`question-${currentQuestionIndex}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full flex justify-center"
                >
                  {/* 1-5問目（通常インタラクティブ・ギミック） */}
                  {[
                    'gimmick_schedule',
                    'gimmick_maze',
                    'gimmick_water_slider',
                    'gimmick_notifications',
                    'gimmick_scribble'
                  ].includes(currentQuestion.type) && (
                    <WaterCalendarQA
                      key={currentQuestion.id}
                      question={currentQuestion}
                      currentStepIndex={currentQuestionIndex}
                      totalSteps={DIAGNOSIS_QUESTIONS.length}
                      onAnswer={handleAnswer}
                      onLogAction={addLog}
                    />
                  )}

                  {/* 迂回フェーズ：普通の4択 */}
                  {currentQuestion.type === 'alternative_4choice' && (
                    <AlternativeQA
                      key={currentQuestion.id}
                      question={currentQuestion}
                      currentStepIndex={currentQuestionIndex}
                      totalSteps={DIAGNOSIS_QUESTIONS.length}
                      onAnswer={handleAnswer}
                      onLogAction={addLog}
                    />
                  )}

                  {/* 6問目（ダーリン監視LINE） */}
                  {currentQuestion.type === 'darling_gigen' && (
                    <DarlingGigen
                      question={currentQuestion}
                      onAnswer={handleAnswer}
                      onLogAction={addLog}
                    />
                  )}

                  {/* 7問目（LSI芋虫長文LINE） */}
                  {currentQuestion.type === 'caterpillar_line' && (
                    <CaterpillarLine
                      question={currentQuestion}
                      onAnswer={handleAnswer}
                      onLogAction={addLog}
                    />
                  )}

                  {/* 8問目（ご褒美くんIEI豚骨） */}
                  {currentQuestion.type === 'gohoubi_pork' && (
                    <GohoubiPork
                      question={currentQuestion}
                      onAnswer={handleAnswer}
                      onLogAction={addLog}
                    />
                  )}

                  {/* 9問目（LII作者既読スルー） */}
                  {currentQuestion.type === 'lii_author' && (
                    <LiiAuthor
                      question={currentQuestion}
                      onAnswer={handleAnswer}
                      onLogAction={addLog}
                    />
                  )}
                </motion.div>
              )
            ) : (
              // 結果画面
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              <ResultView
                score={score}
                onReset={handleReset}
                squishedCaterpillar={squished}
                actionLogs={actionLogs}
                username={username}
                selfType={selfType}
                assembledRobot={assembledRobot}
              />
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </main>

      {/* 5. フッター */}
      <footer className="border-t-2 border-stone-200 bg-white/70 backdrop-blur-xs py-3 text-center font-mono text-[8px] text-stone-400 z-20 flex flex-col sm:flex-row items-center justify-between px-6 gap-2">
        <span>© 2026 DCNH PORTAL SYSTEM. UNDER PUBLIC CODES.</span>
        <span className="flex items-center gap-1.5 text-stone-300">
          <span>WATER FLOWS</span>
          <span className="w-1 h-1 bg-cyan-500 rounded-full"></span>
          <span>CALENDAR TICKS</span>
        </span>
      </footer>
    </div>
  );
}
