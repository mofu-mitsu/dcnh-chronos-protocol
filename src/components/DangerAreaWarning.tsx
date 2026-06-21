import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Ghost, ArrowRight, MessageSquareOff, Sparkles } from 'lucide-react';

interface DangerAreaWarningProps {
  onConfirm: () => void;
  onBypass: () => void;
  username: string;
}

export default function DangerAreaWarning({ onConfirm, onBypass, username }: DangerAreaWarningProps) {
  return (
    <div className="w-full max-w-md mx-auto bg-stone-900 border-4 border-amber-500/80 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col gap-5 text-center select-none font-mono">
      {/* 警告テクスチャ */}
      <div className="absolute inset-0 bg-radial-gradient from-amber-950/40 via-stone-950 to-stone-950 opacity-90 pointer-events-none" />

      {/* ネタ演出であることを伝えるコミカルなヘッダー */}
      <div className="relative z-10 -mt-2 -mx-2 bg-amber-500/25 border border-amber-500/40 rounded-xl py-2 px-3 text-amber-300 font-sans text-[11px] leading-relaxed flex items-center justify-center gap-1.5 shadow-inner">
        <Sparkles className="w-4 h-4 text-amber-400" />
        <span className="font-bold">※ホラーではありません。ギャグ・ネタ演出です！</span>
      </div>

      {/* 警告アニメーション */}
      <div className="relative z-10 flex flex-col items-center gap-3 mt-1">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-16 h-16 rounded-full bg-amber-950 border-2 border-amber-500 flex items-center justify-center text-amber-500 relative"
        >
          <Ghost className="w-8 h-8 text-amber-500" />
          <span className="absolute -top-2.5 -right-5 bg-amber-500 text-stone-950 text-[8px] font-sans font-bold px-1.5 py-0.5 rounded-md transform rotate-12 shadow-md">
            ネタだゾ
          </span>
        </motion.div>
        
        <h2 className="text-base md:text-lg font-bold text-amber-500 tracking-wider">
          【 警告：精神汚染危険地区（ネタ枠） 】
        </h2>
        
        <span className="text-[9px] bg-amber-950/80 text-amber-400 border border-amber-500/30 px-3 py-0.5 rounded-full text-center">
          SYSTEM: COMEDY ZONE TRANSITION
        </span>
      </div>

      <div className="relative z-10 space-y-3 bg-stone-950/80 border border-amber-950/60 p-4 rounded-2xl text-left font-sans text-stone-300">
        <p className="text-xs leading-relaxed">
          被験者 <strong className="text-white font-mono">{username || 'みつき'}</strong>、通常フェーズの幾何学観測が終了しました。
        </p>
        <p className="text-xs leading-relaxed">
          ここから先は、案内人ダーリンちゃん、LSI知識芋虫、ご褒美くん（IEI）、およびLII作者が実在する<span className="text-amber-400 font-bold">非同期LINEチャット次元（ネタ爆笑攻撃地区）</span>となります。
        </p>
        <p className="text-xs leading-relaxed text-stone-400">
          ※10秒以上放置するとキャラクターから連続追撃LINEが自動発火する不条理バグや、連打逆襲ハック、ドMの出汁豚骨わしゃわしゃ要求など、各種の脳内パリティエラーが想定されます。
        </p>
        <div className="text-[10px] text-emerald-400/90 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-900/40 leading-relaxed font-sans mt-2">
          💡 <strong>安心・通常4択ルート分岐：</strong><br />
          このような個性の強いキャラクターとのLINE対話、ギミックなどが苦手な方は、下記の<strong>「通常迂回」ボタン</strong>をタップし、穏やかな<strong>『普通の4択問題（5問）』</strong>へと即座に安全スイッチ可能です（診断精度は変わりません）。
        </div>
        <p className="text-[11px] font-bold text-amber-400/90 text-center border-t border-amber-950/60 pt-2.5">
          「十分な覚悟のうえ、送信セッションに同期せよ──」
        </p>
      </div>

      <div className="relative z-10 pt-1 flex flex-col gap-3">
        <motion.button
          whileHover={{ scale: 1.03, backgroundColor: '#d97706' }}
          whileTap={{ scale: 0.97 }}
          onClick={onConfirm}
          className="w-full bg-amber-600 hover:bg-amber-500 border border-amber-400 text-stone-950 font-mono text-xs font-bold py-3 px-6 rounded-full shadow-lg shadow-amber-950/50 flex items-center justify-center gap-1.5 cursor-pointer mx-auto leading-none"
        >
          <span>危険地区へ突入（※ネタです）</span>
          <ArrowRight className="w-4 h-4 text-stone-950" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03, backgroundColor: '#059669' }}
          whileTap={{ scale: 0.97 }}
          onClick={onBypass}
          className="w-full bg-emerald-700 hover:bg-emerald-600 border border-emerald-500 text-white font-sans text-xs font-bold py-3 px-6 rounded-full flex items-center justify-center gap-2 cursor-pointer mx-auto leading-none shadow-md shadow-emerald-950/15"
        >
          <span>🌲 安全モードで通常診断を始める</span>
        </motion.button>
      </div>
    </div>
  );
}
