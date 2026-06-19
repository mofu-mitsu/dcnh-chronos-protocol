import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Droplets, Calendar, ChevronRight, Play, RefreshCw, Trash2, Check, Sparkles } from 'lucide-react';
import { Question, SubtypeScore } from '../data';

interface WaterCalendarQAProps {
  key?: React.Key;
  question: Question;
  currentStepIndex: number;
  totalSteps: number;
  onAnswer: (score: Partial<SubtypeScore>) => void;
  onLogAction: (log: string) => void;
}

// 1. スケジュールアイテム
interface ScheduleItem {
  id: string;
  name: string;
  emoji: string;
  desc: string;
}

// 2. 迷路用セル
interface MazeCell {
  r: number;
  c: number;
  isPath: boolean;
}

// 3. 通知アイテム
interface NotificationItem {
  id: number;
  title: string;
  body: string;
  time: string;
  type: 'system' | 'calendar' | 'caterpillar' | 'darling';
}

export default function WaterCalendarQA({
  question,
  currentStepIndex,
  totalSteps,
  onAnswer,
  onLogAction,
}: WaterCalendarQAProps) {
  // ─── 波紋エフェクト (Ripple) 状態 ───
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const triggerPlayPochon = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const newRipple = { id: Date.now() + Math.random(), x, y };
    setRipples((prev) => [...prev, newRipple]);

    // 1.2秒後に削除
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 1200);
  };

  // ─── スケジュール管理ギミック状態 ───
  const [schedule, setSchedule] = useState<ScheduleItem[]>([
    { id: 'work', name: '💼 優先仕事', desc: 'Te/Fiを統合する社会義務タスク', emoji: '💼' },
    { id: 'study', name: '📚 論理学習', desc: 'Ti/Neを磨く前提条件デバッグ', emoji: '📚' },
    { id: 'hobby', name: '🎨 自由発想', desc: 'Ne/Seを刺激するクリエイター遊び', emoji: '🎨' },
    { id: 'friend', name: '🤝 友達対話', desc: 'Fe/Fiを稼働させる調和会話', emoji: '🤝' },
    { id: 'nap', name: '😴 全力昼寝', desc: 'Si/Niを安息に導くシャットダウン', emoji: '😴' },
  ]);

  const moveSchedule = (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    triggerPlayPochon(e.clientX, e.clientY);
    const newSchedule = [...schedule];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSchedule.length) return;
    
    // 入れ替え
    const temp = newSchedule[index];
    newSchedule[index] = newSchedule[targetIndex];
    newSchedule[targetIndex] = temp;
    setSchedule(newSchedule);
  };

  const submitSchedule = (e: React.MouseEvent) => {
    triggerPlayPochon(e.clientX, e.clientY);
    // スコア算出 (上部にある項目が優先)
    // 1番上が 'study' もしくは 'work' なら N や D 寄り
    // 1番上が 'hobby' や 'nap' なら C や H 寄り
    const p1 = schedule[0].id;
    const p2 = schedule[1].id;

    let calScore: Partial<SubtypeScore> = { D: 0, C: 0, N: 0, H: 0 };
    if (p1 === 'study' || p1 === 'work') calScore.N = (calScore.N || 0) + 2;
    if (p1 === 'work' || p1 === 'friend') calScore.D = (calScore.D || 0) + 2;
    if (p1 === 'hobby') calScore.C = (calScore.C || 0) + 3;
    if (p1 === 'nap') calScore.H = (calScore.H || 0) + 3;

    if (p2 === 'hobby' || p2 === 'nap') calScore.C = (calScore.C || 0) + 1;
    if (p2 === 'study') calScore.N = (calScore.N || 0) + 1;

    const listStr = schedule.map((s) => s.name).join(' → ');
    onLogAction(`スケジュールに「${listStr}」の優先順位を登録しました`);
    onAnswer(calScore);
  };

  // ─── 芋虫を誘導ギミック状態 ───
  const [maze, setMaze] = useState<MazeCell[]>(() => {
    const list: MazeCell[] = [];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        // スタート (0,0)、ゴール (4,4)
        list.push({ r, c, isPath: (r === 0 && c === 0) || (r === 4 && c === 4) });
      }
    }
    return list;
  });
  const [mazeReachedGoal, setMazeReachedGoal] = useState(false);
  const [caterpillarPos, setCaterpillarPos] = useState({ r: 0, c: 0 }); // 芋虫の吸着マス座標
  const [lastTouchedCell, setLastTouchedCell] = useState({ r: 0, c: 0 }); // ドラッグ中一番近いセル
  const constraintsRef = React.useRef<HTMLDivElement>(null);

  // ─── 芋虫プール（蟻のプール）ジレンマ割り込み状態 ───
  const [showPoolDilemma, setShowPoolDilemma] = useState(false);
  const [pendingScore, setPendingScore] = useState<Partial<SubtypeScore> | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isHoveringGrass, setIsHoveringGrass] = useState(false);
  const [poolSpeech, setPoolSpeech] = useState('「ショートする！論理回路にお水がぁ…！」');

  // プール内のLSI芋虫のセリフ自動切り替え
  useEffect(() => {
    if (isSaved || !showPoolDilemma) return;
    const speeches = [
      '「ショートする！論理回路にお水がぁ…！トコトコできない！」',
      '「水滴が1.2ミリグラムも…！感覚過負荷(Se)だッ！」',
      '「前提条件に【陸地】を同期してくれー！」',
      '「お散歩の座標(X,Y)が水没インデックスにバーストしているよ！」',
      '「誰か、芝生へのポータルを開いて…！トコトコしたい！」',
      '「このプールの最大水位は統計的限界を超えようとしているよ！」'
    ];
    const interval = setInterval(() => {
      if (!isHoveringGrass) {
        setPoolSpeech(prev => {
          const nextSet = speeches.filter(s => s !== prev);
          return nextSet[Math.floor(Math.random() * nextSet.length)];
        });
      }
    }, 4500);
    return () => clearInterval(interval);
  }, [isSaved, showPoolDilemma, isHoveringGrass]);

  const handleRescueSuccess = () => {
    setIsSaved(true);
    setIsHoveringGrass(false);
    setPoolSpeech('「ふぅ…助かった！芝生最高、トコトコ。やはり人間には調和の心（Fe）が必要だな！」');
    
    // 実質的な 'action' (D+4, C+1) の意思決定を自動選好、1秒待って次に進む
    setTimeout(() => {
      if (pendingScore) {
        const updatedScore = { ...pendingScore };
        updatedScore.D = (updatedScore.D || 0) + 4;
        updatedScore.C = (updatedScore.C || 0) + 1;
        
        // 元に戻す
        setShowPoolDilemma(false);
        setIsSaved(false);
        onAnswer(updatedScore);
      }
    }, 1500); // セリフを読めるように1.5秒に調整
  };

  // 芋虫のトコトコ歩行処理（隣接マスのみタップ式）
  const handleCellClick = (r: number, c: number, e: React.MouseEvent) => {
    // すでにゴールしている場合は操作無効
    if (mazeReachedGoal) return;

    // 隣接判定 (上下左右1マス)
    const isAdjacent = Math.abs(r - caterpillarPos.r) + Math.abs(c - caterpillarPos.c) === 1;
    if (!isAdjacent) return;

    triggerPlayPochon(e.clientX, e.clientY);
    
    // 芋虫の位置を更新
    setCaterpillarPos({ r, c });
    setLastTouchedCell({ r, c });

    // 通過したマスをパスに（スタート・ゴール含むすべて）
    setMaze((prev) =>
      prev.map((cell) =>
        cell.r === r && cell.c === c ? { ...cell, isPath: true } : cell
      )
    );

    // ゴール到達
    if (r === 4 && c === 4) {
      setMazeReachedGoal(true);
      onLogAction(`LSI芋虫がゴール駅【📅 カレンダー】に到達。安定誘導に成功。`);
    }
  };

  // お散歩ルートのリセット
  const handleResetMaze = (e: React.MouseEvent) => {
    triggerPlayPochon(e.clientX, e.clientY);
    setCaterpillarPos({ r: 0, c: 0 });
    setLastTouchedCell({ r: 0, c: 0 });
    setMazeReachedGoal(false);
    setMaze((prev) =>
      prev.map((cell) => ({
        ...cell,
        isPath: cell.r === 0 && cell.c === 0, // スタートのみ true
      }))
    );
    onLogAction(`LSI芋虫のお散歩ルートを全パージし、スタート地点にリセットしました。`);
  };

  const submitMaze = (e: React.MouseEvent) => {
    triggerPlayPochon(e.clientX, e.clientY);
    let calScore: Partial<SubtypeScore> = { D: 0, C: 0, N: 0, H: 0 };

    // 実際に通ったマス目の合計
    const pathCount = maze.filter((m) => m.isPath).length;
    if (pathCount <= 5) {
      calScore.N = 3;
      calScore.D = 1;
      onLogAction(`LSI芋虫の誘導：最短直進ルート（距離 ${pathCount}マス）で即座に同期した。理論的一貫性を好む傾向。`);
    } else if (pathCount > 5 && pathCount <= 10) {
      calScore.H = 2;
      calScore.N = 2;
      onLogAction(`LSI芋虫の誘導：標準的お散歩ルート（距離 ${pathCount}マス）に配置。安定した調和を保つ傾向。`);
    } else {
      calScore.C = 3;
      calScore.H = 1;
      onLogAction(`LSI芋虫の誘導：うねうねと遠回りするお散歩ルート（距離 ${pathCount}マス）を構築。余白と遊び心を好む創造型。`);
    }
    onAnswer(calScore);
  };

  // ─── 水位調整スライダー ───
  const [waterLevel, setWaterLevel] = useState(50);

  const handleWaterSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWaterLevel(Number(e.target.value));
  };

  const submitWaterSlider = (e: React.MouseEvent) => {
    triggerPlayPochon(e.clientX, e.clientY);
    let calScore: Partial<SubtypeScore> = { D: 0, C: 0, N: 0, H: 0 };

    if (waterLevel <= 25) {
      calScore.D = 3;
      onLogAction(`水位を【極限飢餓レベル（${waterLevel}%）】にし、攻撃的意志（Te/Se）を強めた`);
    } else if (waterLevel > 25 && waterLevel <= 70) {
      calScore.N = 3;
      onLogAction(`水位を【安定的基準値（${waterLevel}%）】に保ち、一貫性を担保した（Ti/Fi）`);
    } else {
      calScore.H = 3;
      calScore.C = 1;
      onLogAction(`水位を【波なみ満水レベル（${waterLevel}%）】まで満たし、調和＆変革を促した`);
    }
    onAnswer(calScore);
  };

  // ─── 通知祭り ───
  const [notificationsExpanded, setNotificationsExpanded] = useState(false);
  const [activeActionType, setActiveActionType] = useState<'purge' | 'read' | 'stamp' | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const base: NotificationItem[] = [
      { id: 1, title: '🔔 カレンダー警告', body: '予定「昼寝」がスタックエラーを起こしています', time: '今', type: 'calendar' },
      { id: 2, title: '🐛 LSI芋虫のLINE通知', body: '僕たちの前提条件について7部作で丁寧に論証するよ。読むよね？', time: '1分前', type: 'caterpillar' },
      { id: 3, title: '🐷 ご褒美くん(急速接近)', body: 'ねぇ、ツインテールをワシャワシャしなさい、だゾッ！🐷', time: '2分前', type: 'darling' },
      { id: 4, title: '⚙️ システム警告', body: 'これ以上不穏な割り込みをパージしてください', time: '5分前', type: 'system' },
      { id: 5, title: '🐷 ご褒美くん', body: 'お風呂上がったやんけ！拙者の激ウマ豚骨だしを今すぐ届けるやんけ！だゾ！🐷', time: '6分前', type: 'darling' },
    ];

    // 残りの45枚を愉快＆カオスなダミー通知で埋める
    const templates = [
      { title: '🐷 ご褒美くん連投', body: 'ツインテールは正義だゾッ！ウマウマ豚骨スープを飲んで！🐷', type: 'darling' },
      { title: '🐛 LSI芋虫の追加補足', body: '次に、前提条件をさらに7つの概念に分解して証明しよう。', type: 'caterpillar' },
      { title: '⚙️ 時空パリティ安全監視', body: '第3レイヤーでわずかなメモリリークを検知。', type: 'system' },
      { title: '📅 カレンダー自動同期', body: '折り紙ワークショップの時間が10時間引き伸ばされました。', type: 'calendar' },
      { title: '🐷 ご褒美くん(豚骨)', body: 'ブーブー！拙者はカレンダーの隅に潜む豚骨オタクだゾッ！🐷', type: 'darling' },
    ];

    for (let i = 6; i <= 50; i++) {
      const temp = templates[(i - 6) % templates.length];
      base.push({
        id: i,
        title: `${temp.title} (${i})`,
        body: temp.body,
        time: `${i + 1}分前`,
        type: temp.type as 'darling' | 'caterpillar' | 'calendar' | 'system'
      });
    }

    return base;
  });

  const handleNotificationAction = (action: 'purge_all' | 'read_all' | 'stamps', e: React.MouseEvent) => {
    triggerPlayPochon(e.clientX, e.clientY);
    if (action === 'purge_all') {
      setActiveActionType('purge');
      onLogAction('未読通知祭り：【すべて一括削除（パージ）】をクリックした。すべての割り込みの監査を開始。');
    } else if (action === 'read_all') {
      setActiveActionType('read');
      onLogAction('未読通知祭り：【すべて開封して丁寧に対処】をクリックした。内省的監査を開始。');
    } else {
      setActiveActionType('stamp');
      onLogAction('未読通知祭り：【無視してスタンプや犬の鳴き声を乱れ打ち】をクリックした。バグ化プロセスを開始。');
    }
    setNotificationsExpanded(true);
  };

  const finishNotifications = (e: React.MouseEvent) => {
    triggerPlayPochon(e.clientX, e.clientY);
    let calScore: Partial<SubtypeScore> = { D: 0, C: 0, N: 0, H: 0 };

    if (activeActionType === 'purge') {
      calScore.D = 3;
      calScore.N = 1;
    } else if (activeActionType === 'read') {
      calScore.N = 3;
      calScore.H = 1;
    } else {
      // 無視してスタンプ乱舞（バグ化）は、クリエイター（C）をマイナス評価とし、調和（H）＋２とする
      calScore.C = -1;
      calScore.H = 2;
    }
    onAnswer(calScore);
  };

  // ─── カレンダー落書き ───
  const [scribbles, setScribbles] = useState<{ day: number; stamp: string }[]>([]);
  const [selectedStamp, setSelectedStamp] = useState('⭐');

  const addScribble = (day: number, e: React.MouseEvent) => {
    triggerPlayPochon(e.clientX, e.clientY);
    // 既に押してあるか
    const exists = scribbles.find((s) => s.day === day);
    if (exists) {
      if (exists.stamp === selectedStamp) {
        // 同じスタンプなら消す
        setScribbles((prev) => prev.filter((s) => s.day !== day));
      } else {
        // 違うスタンプなら上書き
        setScribbles((prev) => prev.map((s) => s.day === day ? { ...s, stamp: selectedStamp } : s));
      }
    } else {
      setScribbles((prev) => [...prev, { day, stamp: selectedStamp }]);
    }
  };

  const submitScribbles = (e: React.MouseEvent) => {
    triggerPlayPochon(e.clientX, e.clientY);
    let calScore: Partial<SubtypeScore> = { D: 0, C: 0, N: 0, H: 0 };
    const count = scribbles.length;

    if (count === 0) {
      calScore.N = 3;
      onLogAction('カレンダー落書き：落書きを拒み、整然とした白いグリッドを保った（Ti/規範重視）');
    } else if (count > 0 && count <= 5) {
      if (scribbles.some((s) => s.stamp === '💖')) {
        calScore.H = 2;
        calScore.N = 1;
      } else {
        calScore.D = 2;
        calScore.N = 1;
      }
      onLogAction(`カレンダー落書き：${count}箇所に控えめかつ注意深くマークした`);
    } else {
      calScore.C = 3;
      calScore.H = 1;
      onLogAction(`カレンダー落書き：【限界突破カオス（${count}箇所）】にスタンプを乱れ押しした！`);
    }

    setPendingScore(calScore);
    setShowPoolDilemma(true);
  };

  // 進捗状況（カレンダーの日付イメージを変動させる）
  const simDate = 10 + currentStepIndex * 4;

  if (showPoolDilemma) {
    const handleDilemmaAnswer = (optionType: 'empathy' | 'action' | 'curiosity' | 'ignore') => {
      if (!pendingScore) return;

      const updatedScore = { ...pendingScore };
      if (optionType === 'empathy') {
        updatedScore.H = (updatedScore.H || 0) + 3;
        updatedScore.N = (updatedScore.N || 0) + 1;
        onLogAction('【芋虫プールジレンマ】：命への共感を表明し、霊的インスピレーションから抗議を通知送信(H+3/N+1)を選択。');
      } else if (optionType === 'action') {
        updatedScore.D = (updatedScore.D || 0) + 4;
        updatedScore.C = (updatedScore.C || 0) + 1;
        onLogAction('【芋虫プールジレンマ】：嫌悪感を押し殺し、肉体的に泥と水に手を突っ込んで物理的力（Se/Te出力: D+4/C+1）で直接救出。');
      } else if (optionType === 'curiosity') {
        updatedScore.C = (updatedScore.C || 0) + 3;
        updatedScore.N = (updatedScore.N || 0) + 2;
        onLogAction('【芋虫プールジレンマ】：感情を遮断し、浮力・溺殺限界プロトコルとして純粋に状況（C+3/N+2）を観察した。');
      } else {
        // 放置する
        updatedScore.H = (updatedScore.H || 0) + 2;
        onLogAction('【芋虫プールジレンマ】：関与せず、そっとその場を離れて放置すること（H+2）を選択した。');
      }

      setShowPoolDilemma(false);
      onAnswer(updatedScore);
    };

    return (
      <div className="w-full max-w-xl mx-auto bg-stone-900 border-4 border-stone-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col gap-6 text-stone-200 select-none z-55 min-h-[520px] justify-between font-sans">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b border-stone-850 pb-3">
          <div className="flex flex-col text-left">
            <span className="text-[9px] font-mono font-bold tracking-widest text-teal-400 bg-teal-950 px-2 rounded-full inline-block w-fit uppercase">
              LSI Emergency Simulation
            </span>
            <h2 className="text-xs font-bold text-stone-300 mt-1 flex items-center gap-1.5">
              ⚠️ 特別倫理判定：芋虫プール (Caterpillar Pool) ジレンマ
            </h2>
          </div>
          <span className="text-[10px] font-mono text-stone-500 bg-stone-950/80 px-2 py-0.5 rounded border border-stone-850">
            Phase 5w6
          </span>
        </div>

        {/* シチュエーション説明 */}
        <div className="bg-stone-950/80 border border-stone-850 p-4.5 rounded-2xl text-left space-y-3">
          <p className="text-[11.5px] text-stone-300 leading-relaxed font-sans">
            ステップを確定した瞬間、あなたの脳内（Ni）に幼少期の記憶パケットがロードされました。<br />
            公園で、友達がバケツに水を張って蟻や芋虫を浮かべ、『芋虫プールだw』と好奇心だけで砂をかけて沈めようとしています。<br />
            「それ死んじゃうよ！」と抗議すると、友達はニヤニヤしながらこう答えました。<br />
            <strong className="text-teal-400 font-bold">「じゃあさ、お前がその砂の中に手突っ込んで、そいつ助けなよwww」</strong>
          </p>
          <div className="text-[9.5px] text-stone-500 font-mono italic leading-normal border-t border-stone-850 pt-2 flex items-center gap-1.5">
            <span>※ あなたは実は虫がものすごく嫌い（汚れるのも触るのも嫌）です。</span>
          </div>
        </div>

        {/* ─── ガチの芋虫プールビジュアルギミック ─── */}
        <div className="p-3 bg-stone-950/60 rounded-2xl border border-stone-850 flex flex-col items-center gap-2">
          <span className="text-[10px] text-stone-400 font-bold tracking-wider">
            【ギミック】実際に芋虫（🐛）を指でつまんで、安全な芝生（🌿）へ救出してあげよう！
          </span>

          <div className="flex justify-around items-center w-full gap-4 py-2 relative">
            {/* 溺れそうなバケツ */}
            <div className="flex flex-col items-center gap-1 shrink-0 relative">
              <span className="text-[9px] font-mono text-cyan-400 animate-pulse">🌊 溺れそうなプール</span>
              
              {/* LSI芋虫の吹き出し（溺れ中・ドラッグ中) */}
              <AnimatePresence>
                {!isSaved && poolSpeech && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute -top-16 bg-stone-950 border border-emerald-400 text-emerald-400 text-[8.5px] p-2 rounded-xl shadow-lg w-32 leading-relaxed z-50 text-center font-mono pointer-events-none"
                  >
                    {poolSpeech}
                    <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-1.5 h-1.5 bg-stone-950 border-r border-b border-emerald-400 rotate-45"></div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div id="pool-area" className="relative w-28 h-28 bg-gradient-to-b from-cyan-950 to-cyan-900 border-4 border-cyan-800 rounded-full flex items-center justify-center overflow-hidden shadow-inner">
                {/* 水のゆらゆら揺れアニメーション */}
                <motion.div
                  animate={{ y: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="absolute inset-x-0 bottom-0 h-4/5 bg-cyan-500/15 border-t border-cyan-400/30"
                />
                
                {/* プカプカ浮く芋虫 🐛 */}
                {!isSaved ? (
                  <motion.div
                    drag
                    dragElastic={0.15}
                    dragMomentum={false}
                    onDrag={(e, info) => {
                      // 右または下に 40px 以上ドラッグされたらホバー状態とする
                      const maxOffset = Math.max(info.offset.x, info.offset.y);
                      if (maxOffset >= 40) {
                        setIsHoveringGrass(true);
                        setPoolSpeech('「わ、ワシャワシャされてる！感覚Seが臨界沸騰…！でも草地(🌿)が近いぞ！」');
                      } else {
                        setIsHoveringGrass(false);
                        setPoolSpeech('「つままれて、僕の表面積の比率が3D幾何学的に反転しているぞ！」');
                      }
                    }}
                    onDragEnd={(e, info) => {
                      const maxOffset = Math.max(info.offset.x, info.offset.y);
                      if (maxOffset >= 40) {
                        handleRescueSuccess();
                      } else {
                        setIsHoveringGrass(false);
                        setPoolSpeech('「うわ、プールに逆戻りだ！前提条件が再び浸水(Tiショート)しているよ！」');
                      }
                    }}
                    whileDrag={{ scale: 1.4, zIndex: 10 }}
                    animate={isHoveringGrass ? { scale: 1.2 } : { y: [0, -3, 0] }}
                    transition={{ y: { repeat: Infinity, duration: 2, ease: 'easeInOut' } }}
                    className="text-3xl cursor-grab active:cursor-grabbing z-10 filter drop-shadow select-none hover:scale-110 animate-pulse"
                  >
                    🐛
                  </motion.div>
                ) : (
                  <span className="text-xl text-stone-600 font-mono italic">EMPTY</span>
                )}
              </div>
            </div>

            {/* 指示の矢印 */}
            <div className="flex flex-col items-center text-stone-500 font-sans text-[9px] gap-1 shrink-0 select-none">
              <span>つまんで</span>
              <span className="text-base animate-pulse">➔</span>
              <span>引き出す</span>
            </div>

            {/* 安全な草むら（クリックでも救出可能の親切設計） */}
            <div className="flex flex-col items-center gap-1 shrink-0 relative">
              <span className="text-[9px] font-mono text-emerald-400">🌿 安全な芝生</span>

              {/* LSI芋虫の吹き出し（救出成功後) */}
              <AnimatePresence>
                {isSaved && poolSpeech && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute -top-16 bg-stone-950 border border-emerald-400 text-emerald-400 text-[8.5px] p-2 rounded-xl shadow-lg w-32 leading-relaxed z-50 text-center font-mono pointer-events-none"
                  >
                    {poolSpeech}
                    <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-1.5 h-1.5 bg-stone-950 border-r border-b border-emerald-400 rotate-45"></div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <button
                onClick={() => {
                  if (!isSaved) handleRescueSuccess();
                }}
                disabled={isSaved}
                className={`w-28 h-28 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSaved
                    ? 'border-emerald-500 bg-emerald-950/50 text-emerald-300'
                    : isHoveringGrass
                    ? 'border-amber-400 bg-amber-950/40 text-amber-300 scale-105 shadow-md shadow-amber-500/20'
                    : 'border-stone-700 bg-stone-900/40 text-stone-500 hover:border-emerald-700 hover:bg-emerald-950/10'
                }`}
              >
                {isSaved ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center gap-1"
                  >
                    <span className="text-3xl">✨🐛✨</span>
                    <span className="text-[10px] font-black tracking-wider animate-bounce">救出成功！</span>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center gap-1 p-1 text-center font-sans tracking-tight">
                    <span className="text-2xl">🌿</span>
                    <span className="text-[9px] font-bold leading-relaxed text-stone-400 group-hover:text-emerald-300">
                      ここに運んで<br />放す（またはタップ）
                    </span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ─── その他の選択肢（意志選択） ─── */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[10px] text-stone-500 font-bold text-left ml-1">
            あるいは、手の肉体的介入（救出）を行わず、別の意志表示をして確定する：
          </span>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleDilemmaAnswer('empathy')}
              disabled={isSaved}
              className="w-full text-left p-2.5 rounded-xl text-[10.5px] font-bold transition-all border border-stone-800 bg-stone-950 hover:bg-stone-850 text-stone-300 hover:border-teal-600/30 flex items-center justify-between select-none cursor-pointer group active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex-1 pr-1.5 leading-relaxed text-teal-300/95 group-hover:text-teal-200 font-sans">
                🕊️ 命を奪うのはだめ！と友達に強く抗議する（共感）
              </span>
              <span className="text-base shrink-0">📣</span>
            </button>

            <button
              onClick={() => handleDilemmaAnswer('curiosity')}
              disabled={isSaved}
              className="w-full text-left p-2.5 rounded-xl text-[10.5px] font-bold transition-all border border-stone-800 bg-stone-950 hover:bg-stone-850 text-stone-300 hover:border-teal-600/30 flex items-center justify-between select-none cursor-pointer group active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex-1 pr-1.5 leading-relaxed text-teal-300/95 group-hover:text-teal-200 font-sans">
                🧪 生存限界の実験か…と、純粋な好奇心でじっと観察する（思考・探求）
              </span>
              <span className="text-base shrink-0">🔬</span>
            </button>

            <button
              onClick={() => handleDilemmaAnswer('ignore')}
              disabled={isSaved}
              className="w-full text-left p-2.5 rounded-xl text-[10.5px] font-bold transition-all border border-stone-800 bg-stone-950 hover:bg-stone-850 text-stone-300 hover:border-teal-600/30 flex items-center justify-between select-none cursor-pointer group active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex-1 pr-1.5 leading-relaxed text-teal-300/95 group-hover:text-teal-200 font-sans">
                💤 「ふーん、まあ自然の摂理だし、放置しとけばいいや」とそっと離れる（放置）
              </span>
              <span className="text-base shrink-0">🛌</span>
            </button>
          </div>
        </div>

        {/* フッター */}
        <div className="text-center text-[8px] text-stone-600 font-mono tracking-wider border-t border-stone-850 pt-2.5">
          SOCIONICS ALIGNMENT CALIBRATOR // PORT INTRUSION COMPLETE
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onClick={(e) => triggerPlayPochon(e.clientX, e.clientY)}
      className="w-full max-w-2xl mx-auto paper-bg border-4 border-stone-300 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col gap-6"
    >
      {/* 水面波紋エフェクトレイヤー */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {ripples.map((rip) => (
          <div
            key={rip.id}
            className="ripple-effect"
            style={{
              left: rip.x - 25,
              top: rip.y - 25,
              width: 50,
              height: 50,
            }}
          />
        ))}
      </div>

      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b-2 border-stone-200 pb-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#0f172a] bg-amber-100 py-0.5 px-2.5 rounded-full inline-block">
            {question.title}
          </span>
          <span className="text-xs text-stone-500 font-sans mt-1">
            {question.subtitle || '水とカレンダーの幾何学的質問'}
          </span>
        </div>

        {/* カレンダー時計と水滴シンボル */}
        <div className="flex items-center gap-3">
          <div className="text-right font-mono text-[10px] text-stone-500 bg-stone-100/80 p-1.5 rounded-xl border border-stone-200">
            <div>PROGRESS: {currentStepIndex + 1} / {totalSteps}</div>
            <div className="font-bold text-stone-700">DATE: 6月{simDate}日</div>
          </div>
          <div className="flex items-center gap-1 text-cyan-600">
            <Droplets className="w-5 h-5 animate-pulse" />
          </div>
        </div>
      </div>

      {/* イントロテキスト */}
      <div className="bg-[#f2efe4]/60 border border-stone-200 p-5 rounded-2xl relative">
        <p className="text-xs md:text-sm text-stone-800 font-sans leading-relaxed whitespace-pre-line handwritten-ink">
          {question.text}
        </p>
      </div>

      {/* ─── 各ギミックインタラクション部分 ─── */}
      <div className="min-h-[240px] flex items-center justify-center z-10 bg-white/40 border border-stone-200/80 rounded-2xl p-4">
        
        {/* 1. スケジュール並び替え */}
        {question.type === 'gimmick_schedule' && (
          <div className="w-full space-y-4">
            <div className="text-center text-[10px] text-[#0f172a] font-bold">
              👇 タスクを上下に入れ替えて、あなたが楽だと思う順番に並び替えてください！
            </div>
            <div className="space-y-2">
              {schedule.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-stone-50 border border-stone-200 px-4 py-2 rounded-xl shadow-sm hover:bg-stone-100/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl select-none">{item.emoji}</span>
                    <div className="text-left">
                      <div className="text-xs font-bold text-stone-800">{item.name}</div>
                      <div className="text-[9px] text-stone-400 font-mono">{item.desc}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <button
                      disabled={index === 0}
                      onClick={(e) => moveSchedule(index, 'up', e)}
                      className={`px-2 py-1 border rounded-lg text-[9px] font-bold ${
                        index === 0
                          ? 'border-stone-100 text-stone-300'
                          : 'border-stone-300 hover:bg-stone-200 text-stone-700 cursor-pointer'
                      }`}
                    >
                      ▲ 上へ
                    </button>
                    <button
                      disabled={index === schedule.length - 1}
                      onClick={(e) => moveSchedule(index, 'down', e)}
                      className={`px-2 py-1 border rounded-lg text-[9px] font-bold ${
                        index === schedule.length - 1
                          ? 'border-stone-100 text-stone-300'
                          : 'border-stone-300 hover:bg-stone-200 text-stone-700 cursor-pointer'
                      }`}
                    >
                      ▼ 下へ
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center pt-2">
              <button
                onClick={(e) => submitSchedule(e)}
                className="bg-stone-800 hover:bg-stone-700 text-white font-bold text-[11px] py-2 px-6 rounded-full cursor-pointer transition-all shadow-sm flex items-center gap-1 mx-auto"
              >
                <span>この順序に決定する</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 2. 芋虫を誘導 */}
        {question.type === 'gimmick_maze' && (
          <div className="w-full flex flex-col items-center gap-4">
            <div className="text-center text-[10px] text-stone-600 font-bold max-w-sm leading-normal">
              👇 芋虫をトコトコ進めてみよう！<br />
              現在位置の <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">上下左右に隣接しているマスをタップ (クリック)</span> して、右下のカレンダー【📅】までお散歩させてあげてください！
            </div>
            
            <div className="relative bg-[#f5f2eb] p-3 rounded-2xl border-2 border-stone-300 shadow-inner select-none">
              <div className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: 5 }).map((_, r) =>
                  Array.from({ length: 5 }).map((__, c) => {
                    const cell = maze.find((m) => m.r === r && m.c === c);
                    const isStart = r === 0 && c === 0;
                    const isEnd = r === 4 && c === 4;
                    const isCaterpillarHere = caterpillarPos.r === r && caterpillarPos.c === c;
                    
                    // 進める隣接マス判定 (上下左右1マス、かつゴール前)
                    const isWalkable = Math.abs(r - caterpillarPos.r) + Math.abs(c - caterpillarPos.c) === 1 && !mazeReachedGoal;

                    return (
                      <button
                        key={`${r}-${c}`}
                        id={`maze-cell-${r}-${c}`}
                        onClick={(e) => handleCellClick(r, c, e)}
                        disabled={!isWalkable || mazeReachedGoal}
                        className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold select-none transition-all relative ${
                          isStart
                            ? 'bg-emerald-50 border border-emerald-300'
                            : isEnd
                            ? 'bg-amber-50 border-2 border-amber-400 font-sans'
                            : cell?.isPath && !isCaterpillarHere
                            ? 'bg-emerald-100/90 border border-emerald-200 text-emerald-700 shadow-xs text-xs font-sans'
                            : isWalkable
                            ? 'bg-emerald-50/70 border-2 border-dashed border-emerald-400/60 animate-pulse cursor-pointer hover:bg-emerald-100/40'
                            : 'bg-white/80 border border-stone-250/40 cursor-not-allowed'
                        }`}
                      >
                        {isCaterpillarHere ? (
                          <motion.span
                            layoutId="caterpillar-maze-sprite"
                            animate={{ scale: [1, 1.15, 1], rotate: [0, -3, 3, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                            className="text-2xl z-25 select-none filter drop-shadow inline-block cursor-pointer"
                          >
                            🐛
                          </motion.span>
                        ) : isStart ? (
                          '🏠'
                        ) : isEnd ? (
                          '📅'
                        ) : cell?.isPath ? (
                          '🐾'
                        ) : (
                          ''
                        )}
                        {isWalkable && (
                          <span className="absolute inset-0 bg-emerald-500/5 rounded-xl pointer-events-none animate-pulse" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* コントロール・リセット・決定 */}
            <div className="w-full pt-1.5 text-center">
              <div className="flex flex-col gap-3 items-center">
                {mazeReachedGoal ? (
                  <div className="text-xs text-emerald-600 font-bold flex items-center justify-center gap-1 animate-pulse">
                    ✨ ゴールのカレンダーに到着しました！お散歩完了！ ✨
                  </div>
                ) : (
                  <div className="text-[9.5px] text-stone-500 font-medium">
                    移動歩数: <strong className="text-stone-700 font-mono">{maze.filter(m => m.isPath).length - 1}</strong> 歩 / 現在地: ({caterpillarPos.r + 1}, {caterpillarPos.c + 1})
                  </div>
                )}
                
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={(e) => handleResetMaze(e)}
                    className="border border-stone-350 hover:bg-stone-100 text-stone-600 text-xs py-1.5 px-4 rounded-full cursor-pointer transition-all font-bold flex items-center gap-1 bg-white shadow-xs"
                  >
                    <span>🔄 散歩やり直し</span>
                  </button>

                  <button
                    onClick={(e) => {
                      triggerPlayPochon(e.clientX, e.clientY);
                      const calScore = { H: 3, N: 1 };
                      onLogAction?.(`LSI芋虫のお散歩を途中で中断し、そっと草むらに放置した。そっとしておく調和（H+3, N+1）を選択。`);
                      onAnswer(calScore);
                    }}
                    className="border border-amber-300 hover:bg-amber-50 text-amber-700 text-xs py-1.5 px-4 rounded-full cursor-pointer transition-all font-bold flex items-center gap-1 bg-white shadow-xs"
                    title="お散歩を途中でやめて、芋虫を放置して次へ進む"
                  >
                    <span>💤 散歩をサボって放置する</span>
                  </button>

                  <button
                    onClick={(e) => submitMaze(e)}
                    disabled={!mazeReachedGoal}
                    className={`font-bold text-xs py-2 px-8 rounded-full cursor-pointer transition-all shadow-md inline-flex items-center gap-1 leading-none ${
                      mazeReachedGoal 
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                        : 'bg-stone-250 text-stone-400 border border-stone-300 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <span>このお散歩ルートに決定する</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. 水位調整 */}
        {question.type === 'gimmick_water_slider' && (
          <div className="w-full space-y-5 flex flex-col items-center">
            <div className="text-center text-[10px] text-stone-500 font-bold max-w-sm">
              スライダーをスライドさせて、コンテナの『水位』をあなたの好きな位置に決定してください。
            </div>

            {/* 水面シミュレータビジュアル */}
            <div className="w-56 h-32 bg-stone-100 border border-stone-300 rounded-2xl relative overflow-hidden shadow-inner flex flex-col justify-end">
              <motion.div
                animate={{
                  y: [0, -3, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: 'easeInOut',
                }}
                style={{ height: `${waterLevel}%` }}
                className="w-full bg-gradient-to-t from-cyan-600/60 via-cyan-500/50 to-cyan-400/70 border-t border-cyan-300/80 transition-all duration-300 flex items-center justify-center font-bold font-sans text-white text-xs text-shadow-sm select-none relative"
              >
                {waterLevel}% {waterLevel >= 75 ? '🌊 波なみ' : waterLevel <= 25 ? '⚠️ 乾き気味' : '💧 適正'}
                {/* 泡のアニメーション */}
                <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white/40 rounded-full animate-bounce"></div>
                <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse"></div>
              </motion.div>
            </div>

            {/* スライダーコントロール */}
            <div className="w-full max-w-xs space-y-2">
              <input
                type="range"
                min="0"
                max="100"
                value={waterLevel}
                onChange={handleWaterSlider}
                className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-cyan-600 outline-none"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                <span>0% (乾燥)</span>
                <span>50% (中位)</span>
                <span>100% (波なみ)</span>
              </div>
            </div>

            <button
              onClick={(e) => submitWaterSlider(e)}
              className="bg-stone-800 hover:bg-stone-700 text-white font-bold text-[11px] py-2 px-6 rounded-full cursor-pointer transition-all shadow-sm flex items-center gap-1 mx-auto"
            >
              <span>この水位に保つ</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 4. 未読通知祭り */}
        {question.type === 'gimmick_notifications' && (
          <div className="w-full space-y-4">
            {!notificationsExpanded ? (
              <>
                <div className="text-center text-[10px] text-stone-500 font-bold mb-2">
                  ⚠️ システムに突如 50件 の不穏な割り込み（インタラプト）が発生しました！どう片付けますか？
                </div>

                 {/* 通知カード의 重なり風（最初の5枚のみ軽量に重ねてプレビュー表示） */}
                <div className="relative h-32 max-w-xs mx-auto flex items-center justify-center">
                  {notifications.slice(0, 5).map((notif, index) => (
                    <motion.div
                      key={notif.id}
                      style={{
                        transform: `rotate(${index * 4 - 8}deg) translateY(${index * 5 - 10}px)`,
                        zIndex: 10 + index,
                      }}
                      className="absolute w-64 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 shadow-sm flex items-start gap-2 max-h-24 pointer-events-none"
                    >
                      <span className="text-sm shrink-0">
                        {notif.type === 'calendar' && '📅'}
                        {notif.type === 'caterpillar' && '🐛'}
                        {notif.type === 'darling' && '🐷'}
                        {notif.type === 'system' && '⚙️'}
                      </span>
                      <div className="text-left flex-1 min-w-0">
                        <div className="text-[10px] font-bold text-stone-800 truncate">{notif.title}</div>
                        <p className="text-[9px] text-stone-500 leading-normal line-clamp-1">{notif.body}</p>
                      </div>
                      <span className="text-[8px] font-mono text-zinc-400">{notif.time}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="text-center text-[9px] font-mono text-stone-500/80 mb-2 leading-none select-none">
                  🔔 さらに他 45 件の割り込みが蓄積中（計：50件の通知）
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto pt-1 font-sans text-xs">
                  <button
                    onClick={(e) => handleNotificationAction('purge_all', e)}
                    className="w-full sm:w-auto bg-stone-800 hover:bg-stone-700 text-white font-bold py-2 px-4 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    全てパージ（一括消去）
                  </button>
                  <button
                    onClick={(e) => handleNotificationAction('read_all', e)}
                    className="w-full sm:w-auto bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 font-bold py-2 px-4 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    全開封（マニュアル監査）
                  </button>
                  <button
                    onClick={(e) => handleNotificationAction('stamps', e)}
                    className="w-full sm:w-auto bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold py-2 px-4 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    無視してスタンプ乱舞（バグ化）
                  </button>
                </div>
              </>
            ) : (
              <div className="w-full space-y-4 text-left">
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-center text-xs text-amber-900 font-bold">
                  {activeActionType === 'purge' && '🗑️ 割り込みパージプロトコル：緊急ログを全開して脅威監査を行っています'}
                  {activeActionType === 'read' && '🧐 マニュアル読了監査：感情・論理パケットの整合性を丹念に精査しています'}
                  {activeActionType === 'stamp' && '💥 スタンプ乱舞防御：割り込みを犬のスタンプやバグで塞ぎ込みました'}
                </div>

                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {notifications.map((notif) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-xl border flex gap-3 ${
                        activeActionType === 'purge'
                          ? 'bg-rose-50/50 border-rose-200'
                          : activeActionType === 'read'
                          ? 'bg-stone-50/80 border-stone-200'
                          : 'bg-yellow-50/40 border-yellow-200'
                      }`}
                    >
                      <div className="text-xl">
                        {notif.type === 'calendar' && '📅'}
                        {notif.type === 'caterpillar' && '🐛'}
                        {notif.type === 'darling' && '🐷'}
                        {notif.type === 'system' && '⚙️'}
                      </div>
                      <div className="flex-1 text-xs">
                        <div className="font-bold text-stone-800 flex justify-between">
                          <span>{notif.title}</span>
                          <span className="text-[9px] text-stone-400 font-mono">{notif.time}</span>
                        </div>
                        <p className="text-stone-600 mt-1 leading-relaxed font-sans whitespace-pre-wrap">
                          {activeActionType === 'stamp' ? `${notif.body} 🐶🐾 (スタンプ連打中！) 🐕💢` : notif.body}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="text-center pt-2">
                  <button
                    onClick={(e) => finishNotifications(e)}
                    className="bg-stone-800 hover:bg-stone-700 text-white font-bold text-[11px] py-2 px-6 rounded-full cursor-pointer transition-all shadow-sm flex items-center gap-1 mx-auto"
                  >
                    <span>すべての通知を処理したことを認める (次へ)</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. カレンダーへの落書き */}
        {question.type === 'gimmick_scribble' && (
          <div className="w-full space-y-4">
            <div className="text-center text-[10px] text-stone-500 font-bold flex flex-col gap-1 items-center">
              <span>カレンダーのグリッドを選択して、スタンプ「⭐」「❤️」「⭕」を自由に落書き（マーク）してください。</span>
              <div className="flex items-center gap-2 font-mono py-1">
                <span>落書き筆種を選択：</span>
                {['⭐', '💖', '⭕'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStamp(st)}
                    className={`w-6 h-6 rounded-lg border text-sm flex items-center justify-center cursor-pointer ${
                      selectedStamp === st
                        ? 'border-amber-500 bg-amber-50 text-white'
                        : 'border-stone-300 bg-white hover:bg-stone-50'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* 30日間のカレンダーを縮小グリッド化して表示 */}
            <div className="grid grid-cols-7 gap-1.5 bg-stone-50 p-3 rounded-2xl border border-stone-200 max-w-md mx-auto shadow-inner">
              {Array.from({ length: 28 }).map((_, i) => {
                const day = i + 1;
                const match = scribbles.find((s) => s.day === day);
                return (
                  <div
                    key={day}
                    onClick={(e) => addScribble(day, e)}
                    className={`w-9 h-9 rounded bg-white border border-stone-200/65 flex flex-col items-center justify-between p-0.5 cursor-pointer hover:bg-stone-100 select-none relative ${
                      match ? 'scale-102 border-amber-300 shadow-sm bg-amber-50/20' : ''
                    }`}
                  >
                    <span className="text-[7.5px] font-mono text-stone-400 absolute top-0.5 left-0.5">{day}</span>
                    <div className="w-full flex-1 flex items-center justify-center text-sm pt-2 select-none">
                      {match?.stamp}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center">
              <button
                onClick={(e) => submitScribbles(e)}
                className="bg-stone-800 hover:bg-stone-700 text-white font-bold text-[11px] py-2 px-6 rounded-full cursor-pointer transition-all shadow-sm flex items-center gap-1 mx-auto"
              >
                <span>落書きを完了して決定する ({scribbles.length}マス)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
