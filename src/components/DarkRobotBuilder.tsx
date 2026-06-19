import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Settings, MessageSquare, Sparkles, AlertTriangle, ShieldAlert } from 'lucide-react';
import { SubtypeScore } from '../data';

interface DarkRobotBuilderProps {
  onAnswer: (score: Partial<SubtypeScore>) => void;
  onLogAction: (log: string) => void;
}

export default function DarkRobotBuilder({ onAnswer, onLogAction }: DarkRobotBuilderProps) {
  const [head, setHead] = useState('mono'); // mono, insect, porcine, twilight
  const [chest, setChest] = useState('boiler'); // boiler, matrix, dynamic, core
  const [arm, setArm] = useState('origami'); // origami, twin_tail, pork_cannon, antenna
  const [moveSpeed, setMoveSpeed] = useState(50);
  const [taughtWord, setTaughtWord] = useState('');
  const [isAssembled, setIsAssembled] = useState(false);
  const [robotSpeech, setRobotSpeech] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // パーツ名のマップ
  const headsMap: Record<string, { emoji: string; name: string; desc: string }> = {
    mono: { emoji: '🤖', name: '単眼パリティ・ブロック', desc: '客観的なTi整合性を監視する単眼スロット' },
    insect: { emoji: '🐛', name: 'LSI芋虫コプロセッサ', desc: '前提条件の論理ループを高速演算する触覚ヘッド' },
    porcine: { emoji: '🐷', name: 'IEI出汁ブースター', desc: 'ワシャワシャされると熱力学的に加速する感情受容機' },
    twilight: { emoji: '👁️', name: '案内人ダークアイ', desc: '監視と内省的パリティを往復する鋭い水晶体' },
  };

  const chestsMap: Record<string, { emoji: string; name: string; desc: string }> = {
    boiler: { emoji: '📟', name: '真空管エントロピーボイラー', desc: 'カオス燃焼によるクリエイティブエネルギー機関' },
    matrix: { emoji: '🩺', name: '30日グリッド行列コア', desc: 'カレンダー落書きにより拡張された幾何学的容量' },
    dynamic: { emoji: '🔋', name: 'Se高密弾幕コンデンサ', desc: '連打クリックによる圧力を運動性エネルギーへ変換' },
    core: { emoji: '🌀', name: '深層パリティ特異点', desc: '白と黒の境界で無限の例外をパージし続ける虚数軸' },
  };

  const armsMap: Record<string, { emoji: string; name: string; weapon: string; desc: string }> = {
    origami: { emoji: '🌸🕊️', name: '折り紙ナノウイング', desc: '折り紙', weapon: '次元拡張・千羽鶴フレア' },
    twin_tail: { emoji: '🎀🌟', name: 'ツインテールランチャー', desc: 'ツインテール', weapon: '超次元ツインテール・スパイラル' },
    pork_cannon: { emoji: '🐷🍜', name: '豚骨スープ重圧キャノン', desc: '風呂上がりだし', weapon: '濃厚豚骨しぶきブラスター' },
    antenna: { emoji: '📡🐛', name: 'LSI芋虫パトロールアンテナ', desc: 'トコトコ', weapon: '前提条件・論理ミサイル' },
  };

  const handleAssemble = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAssembled(true);

    const headName = headsMap[head].name;
    const chestName = chestsMap[chest].name;
    const armName = armsMap[arm].name;
    const taughtMsg = taughtWord.trim() || '…コ、コンパイル、完了…（ツインテール、わしゃわしゃ…）';

    onLogAction(`ダークロボット構築：[頭部:${headName}], [胴体:${chestName}], [追加兵装:${armName}] を組み立て、言葉「${taughtMsg}」を同期。`);

    // ロボットが喋る演出
    setTimeout(() => {
      triggerSpeak();
    }, 800);
  };

  const triggerSpeak = () => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    const words = taughtWord.trim() || '前提条件ノ同期エラー…ト骨だし、ウマウマだゾッ！';
    setRobotSpeech(words);

    // 擬似的なシンセボイス点滅
    let speakCount = 0;
    const interval = setInterval(() => {
      speakCount += 1;
      if (speakCount > 8) {
        clearInterval(interval);
        setIsSpeaking(false);
      }
    }, 300);
  };

  const handleFinish = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 組み立ての組み合わせによってスコアを変動
    let score: Partial<SubtypeScore> = { D: 0, C: 0, N: 0, H: 0 };
    
    // クリエイター（C）要素はモノづくりのため基本＋1。
    score.C = 2;

    // 武装やヘッドの選択
    if (arm === 'pork_cannon' || arm === 'twin_tail') {
      score.D = (score.D || 0) + 1; // 攻撃・感覚(Se)
      onLogAction('ダークロボット構築：攻撃的かつ強靭な出汁/物理兵器を好む傾向。');
    } else {
      score.H = (score.H || 0) + 1; // 調和・直観
      onLogAction('ダークロボット構築：折り紙やアンテナなどの調和・観察機構を好む傾向。');
    }

    if (head === 'mono' || chest === 'core') {
      score.N = (score.N || 0) + 1; // 論理一貫性(Ti)
    }

    onAnswer(score);
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-stone-950 text-stone-100 border-4 border-stone-800 rounded-3xl p-5 md:p-7 shadow-2xl relative overflow-hidden flex flex-col gap-5 select-none font-mono">
      {/* ノイズテクスチャ */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e1e1e_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none"></div>

      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-3 z-10">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-stone-400 animate-spin" style={{ animationDuration: '6s' }} />
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold tracking-widest text-shadow text-white flex items-center gap-1.5">
              <span>PHASE 5.5: THE DARK CONSTRUCTOR</span>
              <span className="bg-red-500/20 text-red-400 text-[8px] px-1 py-0.5 rounded border border-red-500/40 font-bold animate-pulse">LII-MODE</span>
            </span>
            <span className="text-[9px] text-stone-500 tracking-wider">
              不完全な時空境界における、自律型異形モジュールの再構成。
            </span>
          </div>
        </div>
        <Cpu className="w-5 h-5 text-stone-500" />
      </div>

      {!isAssembled ? (
        // ─── 組み立て画面 ───
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 z-10 text-xs">
          {/* 左：セレクトエリア */}
          <div className="space-y-3.5 bg-stone-900/60 p-4 rounded-2xl border border-stone-800/80">
            <h4 className="text-[10px] font-bold text-stone-400 border-b border-stone-800 pb-1.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              パーツスロットの同期選択
            </h4>

            {/* ① 頭部 */}
            <div className="space-y-1 text-left">
              <label className="text-[9px] font-bold text-stone-500">【Head UNIT】頭部センサ</label>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.keys(headsMap).map((k) => (
                  <button
                    key={k}
                    onClick={() => setHead(k)}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      head === k
                        ? 'bg-stone-100 text-stone-950 border-white font-bold'
                        : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span>{headsMap[k].emoji}</span>
                      <span className="truncate">{headsMap[k].name.split('・')[0].split(' ')[0]}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ② 胴体コア */}
            <div className="space-y-1 text-left">
              <label className="text-[9px] font-bold text-stone-500">【Core ENGINE】エネルギー胴体</label>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.keys(chestsMap).map((k) => (
                  <button
                    key={k}
                    onClick={() => setChest(k)}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      chest === k
                        ? 'bg-stone-100 text-stone-950 border-white font-bold'
                        : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span>{chestsMap[k].emoji}</span>
                      <span className="truncate">{chestsMap[k].name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ③ 特殊追加兵装 */}
            <div className="space-y-1 text-left">
              <label className="text-[9px] font-bold text-stone-500">【Weapon SYNERGY】特殊アタッチアーム </label>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.keys(armsMap).map((k) => (
                  <button
                    key={k}
                    onClick={() => setArm(k)}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      arm === k
                        ? 'bg-stone-100 text-stone-950 border-white font-bold'
                        : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span>{armsMap[k].emoji}</span>
                      <span className="truncate">{armsMap[k].name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 言葉を教える */}
            <div className="space-y-1 text-left">
              <label className="text-[9px] font-bold text-stone-500">【Memory INJECT】ロボットに教え込む言葉</label>
              <input
                type="text"
                value={taughtWord}
                onChange={(e) => setTaughtWord(e.target.value.slice(0, 30))}
                placeholder="好きな言葉、教えてあげて"
                className="w-full bg-stone-950 border border-stone-800 p-2 rounded-xl text-[10px] text-white outline-none focus:border-red-500 transition-all text-shadow shadow-inner"
              />
            </div>
          </div>

          {/* 右：プレビュー・設計仕様 */}
          <div className="flex flex-col justify-between bg-stone-950 border border-stone-800 p-4 rounded-2xl relative min-h-[290px]">
            <div>
              <h4 className="text-[10px] font-bold text-stone-500 border-b border-stone-800 pb-1.5 text-left mb-2.5">
                ⚙️ 構成中のプロトタイプ・プレビュー
              </h4>

              {/* クールなロボットアスキーアート＆絵文字プレビュー */}
              <div className="w-full h-32 bg-stone-900 border border-stone-800 rounded-xl flex flex-col items-center justify-center p-2 relative">
                {/* 異形の外骨格 */}
                <div className="text-zinc-500 text-[9px] font-mono absolute top-2 left-3 select-none">
                  ID: LII-RBT-X3
                </div>

                <div className="flex flex-col items-center gap-0.5 mt-2">
                  <motion.div animate={{ y: [0, -1.5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-3xl filter drop-shadow">
                    {headsMap[head].emoji}
                  </motion.div>
                  
                  <div className="flex items-center justify-center gap-4 relative">
                    <span className="text-xl -mr-1 animate-pulse">{armsMap[arm].emoji.split('')[0]}</span>
                    <div className="text-2xl mt-0.5 bg-zinc-800 rounded px-1.5 border border-zinc-700">
                      {chestsMap[chest].emoji}
                    </div>
                    <span className="text-xl -ml-1 animate-pulse">{armsMap[arm].emoji.split('')[1]}</span>
                  </div>

                  <div className="text-[10px] text-zinc-600 tracking-wide font-sans mt-0.5">
                    ( |||  ||| )
                  </div>
                </div>
              </div>

              {/* 性能インフォ */}
              <div className="text-[10px] text-left mt-3.5 space-y-1.5 text-stone-400">
                <div>🤖 <strong>{headsMap[head].name}</strong></div>
                <div className="text-[9px] text-stone-500 pl-4">{headsMap[head].desc}</div>
                <div>⚔️ <strong>武装: {armsMap[arm].weapon}</strong></div>
                <div className="text-[9px] text-stone-500 pl-4">{armsMap[arm].desc}</div>
              </div>
            </div>

            <button
              onClick={handleAssemble}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-4 rounded-xl cursor-pointer shadow-lg shadow-red-950/20 text-[11px] mt-4 tracking-widest flex items-center justify-center gap-1.5 uppercase transition-all"
            >
              <Cpu className="w-4 h-4 text-white animate-spin" />
              <span>異形モジュールの組み立て・コンパイル</span>
            </button>
          </div>
        </div>
      ) : (
        // ─── 稼働＆発火画面 ───
        <div className="flex flex-col items-center justify-center gap-5 z-10 text-xs py-2">
          <div className="max-w-md w-full bg-stone-900 border border-stone-800 p-5 rounded-2xl text-center space-y-4 shadow-xl">
            <div className="flex items-center justify-center gap-2 text-red-500">
              <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
              <span className="font-bold tracking-wider text-shadow">SYSTEM INTERLOCK ENGAGED</span>
            </div>

            {/* 稼働状態のロボットビジュアル */}
            <div className="w-full h-36 bg-stone-950 border border-stone-800 rounded-xl flex flex-col items-center justify-center p-3 relative overflow-hidden">
              {/* スキャンビジュアル */}
              <div className="absolute inset-x-0 h-0.5 bg-red-500/30 top-1/2 animate-bounce"></div>

              <div className="flex flex-col items-center gap-1">
                <motion.div
                  animate={isSpeaking ? { 
                    y: [0, -4, 0, -4, 0], 
                    scale: [1, 1.05, 1, 1.05, 1],
                    rotate: [0, -2, 2, -2, 0]
                  } : { 
                    y: [0, -1, 0] 
                  }}
                  transition={{ repeat: Infinity, duration: isSpeaking ? 0.6 : 2 }}
                  className="text-4xl filter drop-shadow-md select-none"
                >
                  {headsMap[head].emoji}
                </motion.div>
                
                <div className="flex items-center justify-center gap-5 relative">
                  <span className="text-2xl animate-pulse">{armsMap[arm].emoji}</span>
                  <div className="text-3xl bg-zinc-800 rounded-xl px-2.5 py-1 border border-zinc-700 flex items-center justify-center shadow-lg">
                    {chestsMap[chest].emoji}
                  </div>
                </div>
              </div>

              {/* セリフ吹き出し */}
              <AnimatePresence>
                {robotSpeech && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -15 }}
                    onClick={triggerSpeak}
                    className="absolute bottom-1 bg-red-950 border border-red-800/60 text-red-200 text-[10px] px-3 py-1 rounded shadow-lg max-w-[90%] truncate cursor-pointer z-50 filter drop-shadow-md animate-pulse leading-none flex items-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3 text-red-400 shrink-0" />
                    <span>「{robotSpeech}」</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-2 bg-stone-950 p-4 border border-stone-850 rounded-xl text-left font-sans text-[11px] leading-relaxed text-stone-400">
              <p>
                🤖 <strong className="font-mono text-red-400">開発コード名「{headsMap[head].name.split('・')[0]}」：</strong><br />
                真空管エントロピーボイラーを駆動させ、異形追加モジュール【{armsMap[arm].name}】がオンラインになりました。空間拡張、および物理Seへのパリティ調整が完了しました。
              </p>
              <p className="text-[10px] text-stone-500 border-t border-stone-850 pt-2 font-mono">
                💡 ロボット上のバルーンをタップすると、教え込んだボイス「<strong>{taughtWord || 'みつき大好きだゾッ！'}</strong>」をシンセサイザー回路を通じていつでも何度でもお喋りさせることができます。
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={triggerSpeak}
                disabled={isSpeaking}
                className="bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold py-2.5 px-5 rounded-xl cursor-pointer border border-stone-600 text-[10.5px] transition-all"
              >
                言葉を喋らせる (再生)
              </button>

              <button
                onClick={handleFinish}
                className="bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-6 rounded-xl cursor-pointer text-[10.5px] shadow-lg shadow-red-950/20 flex items-center gap-1 transition-all"
              >
                <span>時空境界のパリティ同期を確定する</span>
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
