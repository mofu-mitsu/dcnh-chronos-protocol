import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Skull, ArrowRight, MessageSquareOff } from 'lucide-react';

interface DangerAreaWarningProps {
  onConfirm: () => void;
  onBypass: () => void;
  username: string;
}

export default function DangerAreaWarning({ onConfirm, onBypass, username }: DangerAreaWarningProps) {
  return (
    <div className="w-full max-w-md mx-auto bg-stone-900 border-4 border-red-600 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col gap-6 text-center select-none font-mono">
      {/* 警告テクスチャ */}
      <div className="absolute inset-0 bg-radial-gradient from-red-950/40 via-stone-950 to-stone-950 opacity-90 pointer-events-none" />

      {/* 警告アニメーション */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-16 h-16 rounded-full bg-red-950 border-2 border-red-500 flex items-center justify-center text-red-500"
        >
          <Skull className="w-8 h-8 text-red-500" />
        </motion.div>
        
        <h2 className="text-lg md:text-xl font-bold text-red-500 tracking-wider">
          【 警告：精神汚染危険地区 】
        </h2>
        
        <span className="text-[10px] bg-red-950/80 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-center">
          SYSTEM: DANGER ZONE TRANSITION
        </span>
      </div>

      <div className="relative z-10 space-y-3.5 bg-stone-950/80 border border-red-950 p-4 rounded-2xl text-left font-sans text-stone-300">
        <p className="text-xs leading-relaxed">
          被験者 <strong className="text-white font-mono">{username || 'みつき'}</strong>、通常フェーズの幾何学観測が終了しました。
        </p>
        <p className="text-xs leading-relaxed">
          ここから先は、案内人ダーリンちゃん、LSI知識芋虫、ご褒美くん（IEI）、およびLII作者が実在する<span className="text-red-400 font-bold">非同期LINEチャット次元（精神バグ攻撃地区）</span>となります。
        </p>
        <p className="text-xs leading-relaxed text-stone-400">
          ※10秒以上放置するとキャラクターから連続追撃LINEが自動発火する不条理バグや、連打逆襲ハック、ドMの出汁豚骨わしゃわしゃ要求など、各種の脳内パリティエラーが想定されます。
        </p>
        <div className="text-[10px] text-emerald-400/90 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-900/40 leading-relaxed font-sans mt-2">
          💡 <strong>安心・通常4択ルート分岐：</strong><br />
          このような個性の強いキャラクターとのLINE対話、放置・連打ハックなどの不条理ギミックが苦手な方は、下記の<strong>「通常迂回」ボタン</strong>をタップし、穏やかな<strong>『普通の4択問題（5問）』</strong>へと即座に安全スイッチ可能です（診断精度は変わりません）。
        </div>
        <p className="text-[11px] font-bold text-red-400/90 text-center border-t border-red-950 pt-2.5">
          「十分な覚悟のうえ、送信セッションに同期せよ──」
        </p>
      </div>

      <div className="relative z-10 pt-2 flex flex-col gap-3">
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: '#dc2626' }}
          whileTap={{ scale: 0.95 }}
          onClick={onConfirm}
          className="w-full bg-red-700 hover:bg-red-600 border border-red-500 text-white font-mono text-xs font-bold py-3 px-6 rounded-full shadow-lg shadow-red-950/50 flex items-center justify-center gap-1.5 cursor-pointer mx-auto leading-none"
        >
          <span>危険地区へ突入（不条理LINEを開始）</span>
          <ArrowRight className="w-4 h-4 text-white" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: '#059669' }}
          whileTap={{ scale: 0.95 }}
          onClick={onBypass}
          className="w-full bg-emerald-700 hover:bg-emerald-600 border border-emerald-500 text-white font-sans text-xs font-bold py-3 px-6 rounded-full flex items-center justify-center gap-2 cursor-pointer mx-auto leading-none shadow-md shadow-emerald-950/15"
        >
          <span>🌲 安全モードで通常診断を始める</span>
        </motion.button>
      </div>
    </div>
  );
}
