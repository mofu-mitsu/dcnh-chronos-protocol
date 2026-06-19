import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Cpu, ChevronRight, Zap, RefreshCw, MessageSquare } from 'lucide-react';
import { SubtypeScore } from '../data';

interface RobotBuilderProps {
  onComplete: (
    scoreBonus: Partial<SubtypeScore>,
    robotData: { head: string; core: string; arm: string; headId?: string; coreId?: string; armId?: string; phrase: string }
  ) => void;
  username: string;
}

export default function RobotBuilder({ onComplete, username }: RobotBuilderProps) {
  // ─── パーツ選択状態 ───
  const [head, setHead] = useState<'visor' | 'camera' | 'monocle'>('visor');
  const [core, setCore] = useState<'quantum' | 'steam' | 'fluidic'>('quantum');
  const [arm, setArm] = useState<'cannon' | 'claw' | 'probe'>('cannon');
  const [phrase, setPhrase] = useState('');
  const [isAssembled, setIsAssembled] = useState(false);
  const [speechActive, setSpeechActive] = useState(false);

  // コンフィグ説明
  const headDocs = {
    visor: { name: '🔴 水平式オプティカル・バイザー', desc: '広角パノラマ知覚。感覚の検出プロトコルの優先。' },
    camera: { name: '👁️ 単眼同軸フォーカス・カメラ', desc: '局所的、精緻なターゲット走査。' },
    monocle: { name: '📐 幾何学アナライズ・モノクル', desc: '構造的・多次元情報から未来予測を演算。' },
  };

  const coreDocs = {
    quantum: { name: '💎 量子多世界コプロセッサ', desc: '確率の重ね合わせ状態を直接並列処理。' },
    steam: { name: '🔥 熱力学高圧エンタルピー釜', desc: '推進意志、物理圧力エネルギーの直接出力。' },
    fluidic: { name: '💧 流体パリティ調和コンデンサ', desc: '環境低周波と水位を静寂同調させる。' },
  };

  const armDocs = {
    cannon: { name: '💥 圧縮粒子パルス・キャノン', desc: '物理的作用・強制同期用。' },
    claw: { name: '🛠️ 多関節精密マニピュレータ・クロー', desc: '物理的構築・パリティデバッグ用。工作アーム。' },
    probe: { name: '💉 化学パルス・超伝導マイクロプローブ', desc: '低侵襲スキャン、微細成分の抽出用センサアーム。' },
  };

  const handleAssemble = () => {
    setIsAssembled(true);
    setSpeechActive(true);
  };

  const handleProceed = () => {
    // スコアブースト構築
    const scoreBonus: Partial<SubtypeScore> = { D: 0, C: 0, N: 0, H: 0 };

    // パーツ組み立て加点
    if (head === 'visor') scoreBonus.D = (scoreBonus.D || 0) + 1;
    if (head === 'camera') scoreBonus.N = (scoreBonus.N || 0) + 1;
    if (head === 'monocle') scoreBonus.C = (scoreBonus.C || 0) + 1;

    if (core === 'quantum') scoreBonus.C = (scoreBonus.C || 0) + 2;
    if (core === 'steam') scoreBonus.D = (scoreBonus.D || 0) + 2;
    if (core === 'fluidic') scoreBonus.H = (scoreBonus.H || 0) + 2;

    if (arm === 'cannon') scoreBonus.D = (scoreBonus.D || 0) + 1;
    if (arm === 'claw') scoreBonus.C = (scoreBonus.C || 0) + 1;
    if (arm === 'probe') scoreBonus.N = (scoreBonus.N || 0) + 1;

    // 言葉（フレーズ）による追加パラメータ算出
    const lowerPhrase = phrase.toLowerCase();
    
    // 1. 強烈な自己意志、あるいは攻撃的・侮蔑的（ドミナント）
    const hasAggressive = ['きも', 'キモ', 'ぶっ潰す', '消えろ', '支配', 'ドミナント', '命令', '豚', 'ぶた', '出汁', 'スープ', 'スープ', '罵る', 'ぶっかけ'].some(word => lowerPhrase.includes(word));
    if (hasAggressive) {
      scoreBonus.D = (scoreBonus.D || 0) + 3;
    }

    // 2. 独創的・遊び・カオス・バグ・クリエイター
    const hasCreator = ['バグ', 'ハック', 'ロボット', 'クリエイター', '宇宙', '量子', '面白い', 'カオス', '折り紙', 'イタズラ', 'おもちゃ'].some(word => lowerPhrase.includes(word));
    if (hasCreator) {
      scoreBonus.C = (scoreBonus.C || 0) + 3;
    }

    // 3. 論理、一貫性、検証、正確、カレンダー、システム（ノーマナイザー）
    const hasNormalizer = ['論理', '一貫', '再現', 'デバッグ', '変数', '計算', '定義', '構造', 'マッピング', 'パリティ', '仕様'].some(word => lowerPhrase.includes(word));
    if (hasNormalizer) {
      scoreBonus.N = (scoreBonus.N || 0) + 3;
    }

    // 4. 調和、おやすみ、眠い、そっと、水、穏やか、愛、優しさ（ハーモナイザー）
    const hasHarmonizer = ['調和', '穏やか', '優しい', '愛', 'おやすみ', '見守る', '安息', '水', '睡眠', '折り紙', 'ポチョン'].some(word => lowerPhrase.includes(word));
    if (hasHarmonizer) {
      scoreBonus.H = (scoreBonus.H || 0) + 3;
    }

    onComplete(scoreBonus, {
      head: headDocs[head].name,
      core: coreDocs[core].name,
      arm: armDocs[arm].name,
      headId: head,
      coreId: core,
      armId: arm,
      phrase: phrase.trim() || 'SYSTEM COG INITIALIZED // READY',
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-black text-zinc-100 rounded-3xl p-6 md:p-8 space-y-6 border-2 border-zinc-800 shadow-[0_0_30px_rgba(0,0,0,0.9)] relative overflow-hidden font-mono text-left select-none">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(24,24,27,0.8),transparent)] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

      {/* ヘッダー */}
      <div className="border-b border-zinc-800 pb-4 flex items-center justify-between z-10 relative">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span className="text-[9px] tracking-[0.2em] font-bold text-red-500 bg-red-950/40 px-2 py-0.5 rounded border border-red-900/30">
              CREATOR MODE ACTIVE
            </span>
          </div>
          <h2 className="text-sm font-bold tracking-tight text-zinc-200">
            🔳 独立意思構造アセンブラ：自律デバッグ個体の構築
          </h2>
        </div>
        <div className="text-[10px] text-zinc-500 font-mono text-right hidden sm:block bg-zinc-950 px-2 py-1 rounded border border-zinc-900">
          SYS_ID: {username || 'UNKNOWN'}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isAssembled ? (
          <motion.div
            key="assembly-menu"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6 z-10 relative"
          >
            {/* 左側：カスタマイズインプット (7cols) */}
            <div className="md:col-span-7 space-y-5">
              <p className="text-[10.5px] text-zinc-400 leading-relaxed font-sans border border-zinc-900 bg-zinc-950 p-3 rounded-xl">
                すべての危険地区を通過した被験者のための特別ステージ。<br />
                白と黒だけで記述された冷酷なモデリング端末を用いて、あなた自身の属性(DCNH)をハードウェアへと結晶させ、自律稼働する「ロボット個体」を設計してください。
              </p>

              {/* 1. 頭部パーツ */}
              <div className="space-y-2">
                <label className="text-[10.5px] text-zinc-500 font-bold flex items-center gap-1">
                  <span>Ⅰ. 頭部・走査センサの選定</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['visor', 'camera', 'monocle'] as const).map((h) => (
                    <button
                      key={h}
                      onClick={() => setHead(h)}
                      className={`text-[10px] font-bold p-2.5 rounded-xl border transition-all cursor-pointer text-center ${
                        head === h
                          ? 'bg-zinc-100 text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.2)]'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-850 hover:bg-zinc-900'
                      }`}
                    >
                      {h === 'visor' ? 'バイザー' : h === 'camera' ? 'フォーカス単眼' : 'アナライザ'}
                    </button>
                  ))}
                </div>
                <div className="text-[9px] text-zinc-400 leading-normal bg-zinc-950 p-2 rounded-lg border border-zinc-900 italic">
                  {headDocs[head].desc}
                </div>
              </div>

              {/* 2. コアプロセッサ */}
              <div className="space-y-2">
                <label className="text-[10.5px] text-zinc-500 font-bold flex items-center gap-1">
                  <span>Ⅱ. 主幹エンジン(コア)のチャージ</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['quantum', 'steam', 'fluidic'] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCore(c)}
                      className={`text-[10px] font-bold p-2.5 rounded-xl border transition-all cursor-pointer text-center ${
                        core === c
                          ? 'bg-zinc-100 text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.2)]'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-850 hover:bg-zinc-900'
                      }`}
                    >
                      {c === 'quantum' ? '量子多世界' : c === 'steam' ? '熱力釜' : '流体同調'}
                    </button>
                  ))}
                </div>
                <div className="text-[9px] text-zinc-400 leading-normal bg-zinc-950 p-2 rounded-lg border border-zinc-900 italic">
                  {coreDocs[core].desc}
                </div>
              </div>

              {/* 3. マニピュレータ・アーム */}
              <div className="space-y-2">
                <label className="text-[10.5px] text-zinc-500 font-bold flex items-center gap-1">
                  <span>Ⅲ. 実働マニピュレータ(アーム)の装備</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['cannon', 'claw', 'probe'] as const).map((a) => (
                    <button
                      key={a}
                      onClick={() => setArm(a)}
                      className={`text-[10px] font-bold p-2.5 rounded-xl border transition-all cursor-pointer text-center ${
                        arm === a
                          ? 'bg-zinc-100 text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.2)]'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-850 hover:bg-zinc-900'
                      }`}
                    >
                      {a === 'cannon' ? 'パルスキャノン' : a === 'claw' ? 'デバッグクロー' : '超伝導プローブ'}
                    </button>
                  ))}
                </div>
                <div className="text-[9px] text-zinc-400 leading-normal bg-zinc-950 p-2 rounded-lg border border-zinc-900 italic">
                  {armDocs[arm].desc}
                </div>
              </div>

              {/* 4. フレーズ入力 */}
              <div className="space-y-2">
                <label className="text-[10.5px] text-zinc-400 font-bold flex items-center justify-between">
                  <span>Ⅳ. 主導言語プロトコルの記述（音声合成登録）</span>
                  <span className="text-[8px] font-mono text-zinc-600">Max 50文字</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={50}
                    placeholder="例: この退屈をハッキングする。/ 眠いからパリティ停止してね。 / ブーブー！"
                    value={phrase}
                    onChange={(e) => setPhrase(e.target.value)}
                    className="w-full bg-zinc-950 text-stone-100 placeholder-zinc-700 border border-zinc-800 rounded-xl py-3.5 px-4 text-xs font-mono outline-none focus:border-zinc-400 transition-all font-bold pr-10"
                  />
                  <MessageSquare className="absolute right-3.5 top-3.5 w-4 h-4 text-zinc-700" />
                </div>
                <div className="text-[8px] text-zinc-600 font-mono tracking-normal leading-normal">
                  ※ここで入力したプロトコル単語は、アセンブラ評価によるパラメータ補正に影響する。最後は実際にこのロボットが不気味に読み上げるゾ。
                </div>
              </div>
            </div>

            {/* 右側：ロボットビジュアルプレビュー (5cols) */}
            <div className="md:col-span-5 flex flex-col justify-between border border-zinc-850 bg-zinc-950/70 p-4 rounded-2xl relative min-h-[350px]">
              <div className="text-[8.5px] text-zinc-500 font-bold tracking-wider uppercase flex justify-between">
                <span>WIRE_MODEL_VISUALIZER</span>
                <span className="animate-pulse">● FEED</span>
              </div>

              {/* ロボットのスケルトンSVG描画 */}
              <div className="flex-1 flex items-center justify-center p-2">
                <svg className="w-48 h-48 text-zinc-400" viewBox="0 0 100 100">
                  {/* アンテナ / 頭頂部 */}
                  <line x1="50" y1="20" x2="50" y2="10" stroke="currentColor" strokeWidth="1" strokeDasharray="1,1" />
                  <circle cx="50" cy="10" r="1.5" className="fill-red-500" />

                  {/* 頭部（頭） */}
                  <rect x="35" y="20" width="30" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  
                  {/* アイカメラ (頭部選択肢) */}
                  {head === 'visor' && (
                    <line x1="38" y1="30" x2="62" y2="30" stroke="currentColor" strokeWidth="3" className="text-red-500" />
                  )}
                  {head === 'camera' && (
                    <circle cx="50" cy="30" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <animate attributeName="r" values="3.5;4.5;3.5" dur="3s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {head === 'monocle' && (
                    <>
                      <circle cx="43" cy="28" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="52" y1="25" x2="60" y2="35" stroke="currentColor" strokeWidth="1" />
                      <rect x="52" y="25" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1" />
                    </>
                  )}

                  {/* 首 */}
                  <rect x="47" y="40" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="1" />

                  {/* 胴体（コア選択肢ビジュアル） */}
                  <rect x="25" y="46" width="50" height="34" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  
                  {/* コア内部 */}
                  {core === 'quantum' && (
                    <>
                      {/* 量子っぽいうずまき、ダッシュ */}
                      <circle cx="50" cy="63" r="8" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2">
                        <animateTransform attributeName="transform" type="rotate" from="0 50 63" to="360 50 63" dur="5s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="50" cy="63" r="3" className="fill-zinc-200" />
                    </>
                  )}
                  {core === 'steam' && (
                    <>
                      {/* 熱力、歯車 */}
                      <rect x="43" y="56" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1" />
                      <line x1="50" y1="52" x2="50" y2="74" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="39" y1="63" x2="61" y2="63" stroke="currentColor" strokeWidth="1.5" />
                    </>
                  )}
                  {core === 'fluidic' && (
                    <>
                      {/* 水、たゆたうウェーブ */}
                      <path d="M 32 63 Q 41 55 50 63 T 68 63" fill="none" stroke="currentColor" strokeWidth="1" />
                      <path d="M 32 68 Q 41 60 50 68 T 68 68" fill="none" stroke="currentColor" strokeWidth="1" />
                    </>
                  )}

                  {/* アームパーツ（左・右選択） */}
                  {/* 左アーム（固定アニマ） */}
                  <path d="M 25 55 L 12 55 L 12 68" fill="none" stroke="currentColor" strokeWidth="1" />
                  <circle cx="12" cy="68" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />

                  {/* 右アーム（選択肢アニマ） */}
                  {arm === 'cannon' && (
                    <>
                      <path d="M 75 55 L 88 55" fill="none" stroke="currentColor" strokeWidth="1" />
                      <rect x="88" y="51" width="8" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="91" y1="55" x2="95" y2="55" stroke="currentColor" strokeWidth="1" />
                    </>
                  )}
                  {arm === 'claw' && (
                    <>
                      <path d="M 75 55 L 85 55 L 90 65" fill="none" stroke="currentColor" strokeWidth="1" />
                      <path d="M 88 65 Q 93 60 92 68" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M 91 64 Q 96 61 95 69" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    </>
                  )}
                  {arm === 'probe' && (
                    <>
                      <path d="M 75 55 L 86 63 L 95 63" fill="none" stroke="currentColor" strokeWidth="1" />
                      <line x1="95" y1="63" x2="98" y2="63" stroke="currentColor" strokeWidth="3" className="text-red-400" />
                    </>
                  )}

                  {/* 脚部下盤 */}
                  <line x1="38" y1="80" x2="33" y2="92" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="62" y1="80" x2="67" y2="92" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="28" y="92" width="10" height="3" fill="currentColor" />
                  <rect x="62" y="92" width="10" height="3" fill="currentColor" />
                </svg>
              </div>

              {/* スペックパラメータプレビュー */}
              <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 font-mono text-[8px] text-zinc-500 space-y-1">
                <div className="flex justify-between">
                  <span>MODULE_ALPHA:</span>
                  <span className="text-zinc-300 font-bold">{headDocs[head].name.split(' ')[1]}</span>
                </div>
                <div className="flex justify-between">
                  <span>PROCES_GAMMA:</span>
                  <span className="text-zinc-300 font-bold">{coreDocs[core].name.split(' ')[1]}</span>
                </div>
                <div className="flex justify-between">
                  <span>ACTUAT_OMEGA:</span>
                  <span className="text-zinc-300 font-bold">{armDocs[arm].name.split(' ')[1]}</span>
                </div>
              </div>
            </div>

            {/* ボトムサブミットエリア */}
            <div className="md:col-span-12 pt-4 flex justify-between items-center border-t border-zinc-900">
              <span className="text-[8px] text-zinc-600 tracking-widest hidden sm:inline">
                ESTHETICS OF BLACK AND WHITE TERMINAL // CR. MATRIX
              </span>
              <button
                onClick={handleAssemble}
                className="w-full sm:w-auto bg-zinc-100 hover:bg-white text-black font-bold text-xs py-3 px-10 rounded-xl cursor-pointer shadow-lg active:scale-95 transition-all text-center flex items-center justify-center gap-1"
              >
                <Cpu className="w-4 h-4 text-black animate-spin" />
                <span>この構成で個体をアセンブル（確定）する</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="assembly-success"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col items-center py-10 space-y-8 z-10 relative"
          >
            <div className="relative">
              <div className="absolute inset-0 w-36 h-36 bg-white/5 rounded-full blur-2xl animate-ping" />
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: 'easeInOut',
                }}
                className="w-40 h-40 border-2 border-zinc-500 rounded-full flex items-center justify-center bg-zinc-950 shadow-[0_0_20px_rgba(255,255,255,0.1)] relative"
              >
                {/* 組み立て後のビジュアル */}
                <span className="text-5xl select-none filter grayscale block">🤖</span>
                <span className="absolute -top-1 -right-1 text-base animate-pulse">⚙️</span>
                <span className="absolute -bottom-1 -left-1 text-sm animate-bounce">⚡</span>
                <div className="absolute top-1/2 left-2 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
              </motion.div>
            </div>

            {/* ロボットのダークメッセージ吹き出し会話 */}
            <div className="w-full max-w-md bg-zinc-950 border-2 border-zinc-800 p-5 rounded-3xl relative text-left shadow-inner">
              <span className="absolute -top-2.5 left-8 text-[7.5px] font-mono select-none bg-black text-zinc-500 border border-zinc-850 px-2.5 py-0.5 rounded-full">
                🧠 教授済プロトコル：自律出力
              </span>
              <p className="text-xs text-zinc-200 font-mono italic leading-relaxed text-center py-2 relative">
                「{phrase.trim() || 'SYSTEM COG INITIALIZED // READY...'}」
              </p>
              <div className="text-[7px] text-zinc-600 font-mono text-right mt-1.5 tracking-wider border-t border-zinc-900/40 pt-1.5">
                PARITY: ONLINE // EMITTED BY CORE_{core.toUpperCase()}
              </div>

              {/* 吹き出しのしっぽ（CSS） */}
              <div className="absolute -bottom-2.5 left-10 w-4.5 h-4.5 bg-zinc-950 border-r-2 border-b-2 border-zinc-800 transform rotate-45 select-none" />
            </div>

            <div className="space-y-4 text-center">
              <div className="text-[10px] text-zinc-500 max-w-md mx-auto leading-relaxed">
                アセンブル及び意識同期に成功しました。あなた独自の「クリエイター的お遊びパーツアソシエーション」および「プロトコル言葉」はログに正常に登録され、DCNH診断パラメータに最後のバフを与えました。
              </div>

              <button
                onClick={handleProceed}
                className="bg-zinc-100 hover:bg-white text-black font-bold text-xs py-3 px-12 rounded-full cursor-pointer transition-all shadow-md inline-flex items-center gap-1"
              >
                <span>診断結果マトリクスを表示する</span>
                <ChevronRight className="w-4 h-4 text-black" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
