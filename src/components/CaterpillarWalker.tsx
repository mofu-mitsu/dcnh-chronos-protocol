import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Swords, ShieldX } from 'lucide-react';

interface CaterpillarWalkerProps {
  onSquish: () => void;
  squished: boolean;
  onCaterpillarEvent: (active: boolean) => void;
  eventActive: boolean;
  onLogAction?: (log: string) => void;
}

interface ZombieEmoji {
  id: number;
  initialEmoji: string;
  isCaterpillar: boolean;
  x: number;
  y: number;
  delay: number;
}

export default function CaterpillarWalker({
  onSquish,
  squished,
  onCaterpillarEvent,
  eventActive,
  onLogAction,
}: CaterpillarWalkerProps) {
  const [isWalking, setIsWalking] = useState(false);
  const [positionX, setPositionX] = useState(-250);
  const [tapCount, setTapCount] = useState(0);
  const [speech, setSpeech] = useState<string | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<{ id: number; text: string; x: number; y: number }[]>([]);
  const [zombies, setZombies] = useState<ZombieEmoji[]>([]);
  
  const speechTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (positionX > window.innerWidth + 100) {
        setPositionX(window.innerWidth + 80);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [positionX]);

  // お散歩タイマー制御（「たまに戻る」のを防ぐため、移動が完了していない時の上書きを完全防止）
  // 散歩中でない時に次の散歩までのカウントダウン（18秒）を開始
  useEffect(() => {
    if (squished || eventActive || isWalking) return;

    const triggerNextWalk = () => {
      // 画面の右端（スタート位置）に「一瞬で」配置（一瞬なのでムーンウォークしない）
      setPositionX(window.innerWidth + 80);
      
      // 50ms 後にスムーズな移動を開始
      setTimeout(() => {
        setIsWalking(true);
      }, 50);
    };

    // 散歩が終わってから18秒後に自動で再散歩をトリガー
    const timeout = setTimeout(triggerNextWalk, 18000);
    return () => clearTimeout(timeout);
  }, [squished, eventActive, isWalking]);

  // 初回起動時の最初の散歩
  useEffect(() => {
    if (squished || eventActive) return;
    const initialTimeout = setTimeout(() => {
      setPositionX(window.innerWidth + 80);
      setTimeout(() => {
        setIsWalking(true);
      }, 50);
    }, 4500);
    return () => clearTimeout(initialTimeout);
  }, [squished, eventActive]);

  // 移動（50msおきに4pxずつきめ細かくスムーズに左移動）
  useEffect(() => {
    if (squished || eventActive || !isWalking) return;

    let speechTickCount = 0;
    const interval = setInterval(() => {
      setPositionX((prev) => {
        const step = 4.2;
        const nextX = prev - step;
        // -300 以下（完全に左端の画面外に見えなくなるまで）歩かせる
        if (nextX < -320) {
          setIsWalking(false);
          return -350;
        }
        return nextX;
      });

      // 定期的にたまに喋る（歩行移動の進行度に応じて吹き出しを出す）
      speechTickCount++;
      if (speechTickCount % 120 === 0 && Math.random() < 0.4) {
        const phrases = [
          '「前提条件の同期パリティを計算中…トコトコ」',
          '「バグのない世界、それは折り紙の中だけにあるのさ」',
          '「画面最下部（デバッグコンソール付近）を巡回中…」',
          '「…そこにいるのはSLE(強烈な感覚)じゃないよね？」',
          '「水のエレメントが心地よい水位になっているね」',
          '「ふむ、この足元のパリティが一番落ち着くんだ」',
        ];
        showCaterpillarSpeech(phrases[Math.floor(Math.random() * phrases.length)]);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [squished, eventActive, isWalking]);

  // 逆襲イベント
  useEffect(() => {
    if (eventActive) {
      onLogAction?.('LSI芋虫(🐛)を激怒させ、逆襲イベントを発生させた！');
      const startEmojis = ['🧟', '💀', '👽', '👿', '🤡', '🤖', '👾', '😡', '💥', '👀'];
      const generated: ZombieEmoji[] = Array.from({ length: 28 }).map((_, i) => {
        const edgeX = Math.random() < 0.5 ? (Math.random() * 20) : (80 + Math.random() * 20);
        const edgeY = Math.random() < 0.5 ? (Math.random() * 20) : (80 + Math.random() * 20);
        return {
          id: i,
          initialEmoji: startEmojis[Math.floor(Math.random() * startEmojis.length)],
          isCaterpillar: false,
          x: edgeX,
          y: edgeY,
          delay: Math.random() * 1.5,
        };
      });
      setZombies(generated);

      const transformTimeout = setTimeout(() => {
        setZombies((prev) =>
          prev.map((z) => ({ ...z, isCaterpillar: true }))
        );
        onLogAction?.('逆襲イベント中にゾンビ絵文字がすべて芋虫(🐛)に変身した！');
      }, 1600);

      return () => clearTimeout(transformTimeout);
    } else {
      setZombies([]);
    }
  }, [eventActive]);

  const showCaterpillarSpeech = (text: string) => {
    setSpeech(text);
    if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
    speechTimeoutRef.current = window.setTimeout(() => {
      setSpeech(null);
    }, 3200);
  };

  const handleTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (squished || eventActive) return;

    const nextTapCount = tapCount + 1;
    setTapCount(nextTapCount);

    const phrases = [
      '「ふにゃ！？ 触るな！」',
      '「不規則なノイズシグナルを検知！」',
      '「僕を押し潰す気かい？再現不能バグだ！」',
      '「お、お仕事の邪魔をしないで！」',
      '「僕たちの前提をこれ以上揺るがすな！」',
      '「つ、強い指圧（Se）に、身がよじれるぞ！」',
      '「警告：攻撃スタックが沸騰に達しようとしている！」',
    ];

    // ローカル相対座標を用いて、イモムシ(positionX)の真上を基準にする
    const newFloat = {
      id: Date.now() + Math.random(),
      text: `${phrases[Math.floor(Math.random() * phrases.length)]} (${nextTapCount}/30)`,
      x: positionX + 15, // イモムシの現在位置にローカル追従！
      y: -25,            // イモムシの真上の高さ
    };
    setFloatingTexts((prev) => [...prev, newFloat]);

    onLogAction?.(`LSI芋虫をタップした (${nextTapCount}/30回)`);
    showCaterpillarSpeech(`「タップ：${nextTapCount}/30。強大なSe刺激を監査中…」`);

    if (nextTapCount >= 30) {
      onSquish();
      onCaterpillarEvent(true);
    }
  };

  return (
    <div className="absolute inset-x-0 bottom-0 h-28 pointer-events-none overflow-visible z-55">
      {/* フローティングテキストエフェクト：ローカル座標で完全にイモムシに追従 */}
      <AnimatePresence>
        {floatingTexts.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 1, y: item.y, x: item.x }}
            animate={{ opacity: 0, y: item.y - 80, scale: 1.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            onAnimationComplete={() => {
              setFloatingTexts((prev) => prev.filter((t) => t.id !== item.id));
            }}
            style={{ position: 'absolute' }}
            className="pointer-events-none text-rose-500 font-sans text-[11.5px] font-bold bg-stone-900 border border-rose-900 text-shadow px-3 py-1.5 rounded-xl shadow-xl z-55 whitespace-nowrap"
          >
            {item.text}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 芋虫本体：真下（最下部底面に密着）にきれいに配置 */}
      {!squished && (
        <div
          style={{
            position: 'absolute',
            left: `${positionX}px`,
            bottom: '0px',
            transition: isWalking ? 'left 0.05s linear' : 'none',
          }}
          className="pointer-events-auto cursor-pointer flex flex-col items-center group"
          onClick={handleTap}
        >
          {/* 吹き出し */}
          <AnimatePresence>
            {speech && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: -10 }}
                className="absolute bottom-12 bg-stone-900 border border-emerald-400 text-emerald-400 text-[10px] px-3 py-1.5 rounded-xl shadow-lg font-mono whitespace-nowrap z-50 pointer-events-none"
              >
                {speech}
                <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-1.5 h-1.5 bg-stone-900 border-r border-b border-emerald-400 rotate-45"></div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 芋虫のグラフィック */}
          <motion.div
            animate={{
              scaleY: [1, 0.85, 1],
              scaleX: [1, 1.15, 1],
              rotate: [0, -3, 3, 0],
            }}
            transition={{
              duration: 0.85,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative text-3xl select-none p-1 transition-all"
          >
            🐛
          </motion.div>
        </div>
      )}

      {/* 逆襲イベントオーバーレイ */}
      <AnimatePresence>
        {eventActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-950/90 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-auto z-50 px-4 text-center select-none"
          >
            {/* ゾンビ・変身芋虫の突撃アニメーション */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {zombies.map((z) => (
                <motion.div
                  key={z.id}
                  initial={{ 
                    x: `${z.x}vw`, 
                    y: `${z.y}vh`, 
                    opacity: 0,
                    scale: 0.5 
                  }}
                  animate={{ 
                    x: ['40vw', '50vw', '60vw', '50vw'][z.id % 4], 
                    y: ['45vh', '50vh', '55vh', '50vh'][z.id % 4], 
                    opacity: [0, 1, 1, 0],
                    scale: [0.8, 1.4, 1.4, 0.5],
                  }}
                  transition={{ 
                    duration: 3.5, 
                    delay: z.delay, 
                    repeat: Infinity,
                    ease: 'easeInOut' 
                  }}
                  className="absolute text-3xl select-none filter drop-shadow"
                >
                  {z.isCaterpillar ? '🐛' : z.initialEmoji}
                </motion.div>
              ))}
            </div>

            <motion.div
              animate={{
                x: [0, -2, 2, -2, 2, 0],
              }}
              transition={{ repeat: Infinity, duration: 0.4 }}
              className="max-w-md bg-stone-900 border-2 border-rose-500 rounded-3xl p-6 shadow-xl relative overflow-hidden text-stone-100"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-rose-500 animate-pulse"></div>

              <h3 className="text-sm font-mono text-rose-500 font-bold mb-2 tracking-widest flex items-center justify-center gap-1.5">
                <span>🚨 SYSTEM BUFFER EXCEEDED (CATA-SQUISH)</span>
              </h3>

              <div className="text-stone-300 font-mono text-xs text-left mb-5 space-y-3 bg-stone-950 border border-stone-800 p-4 rounded-2xl leading-relaxed max-h-52 overflow-y-auto">
                <p className="text-rose-400 font-bold">
                  「僕を30回もペチペチ叩くなんて……！君はもしや破壊的な感覚（Se）に満ちたドミナントか！？！？」
                </p>
                <p className="text-stone-400 text-[11px]">
                  物理的介入を検知。
                  前提条件を無視し強襲タップを入力されたため、ゾンビ感情シグナルが反乱を起こし、すべて無邪気な『LSI芋虫(🐛)』に変化してデッドロックしてしまいました。
                </p>
                <p className="text-emerald-400 font-semibold text-[11px]">
                  「だが、僕はただ寝ているわけではない。僕たちのパリティを論理的に再構築する選択肢を用意した。さあ、どう同期調和させる？」
                </p>
              </div>

              <div className="flex flex-col gap-2 font-mono">
                <button
                  onClick={() => {
                    onCaterpillarEvent(false);
                    onSquish();
                    onLogAction?.('論理的なデバッグ対話でおとなしくさせた（N強化）');
                    showCaterpillarSpeech('「……素晴らしい。再現性不安を解消した。僕たちの同期セッションを正常に戻すよ」');
                  }}
                  className="bg-emerald-700 hover:bg-emerald-600 text-emerald-100 text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-2 font-bold cursor-pointer transition-all border border-emerald-600"
                >
                  <span>「落ちつけ。このカオスも、より強固な一貫性を創るデバッグだ」（論理調和）</span>
                </button>

                <button
                  onClick={() => {
                    onCaterpillarEvent(false);
                    onSquish();
                    onLogAction?.('破壊的パワーで無理やり戦闘解除した（D/C強化、Se上昇）');
                    showCaterpillarSpeech('「ひえぇぇ！やっぱり感覚（Se）の覇王じゃないか！一時退避！」');
                  }}
                  className="bg-rose-900 hover:bg-rose-800 text-rose-100 text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-2 font-bold cursor-pointer transition-all border border-rose-700"
                >
                  <span>「僕がルールだ。うるさい、お散歩の道と折り紙を消すぞ」（武力制覇）</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
