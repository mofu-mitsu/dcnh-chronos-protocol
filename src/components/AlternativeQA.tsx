import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Award } from 'lucide-react';
import { Question, DialogueOption } from '../data';

interface AlternativeQAProps {
  key?: React.Key;
  question: Question;
  currentStepIndex: number;
  totalSteps: number;
  onAnswer: (score: any) => void;
  onLogAction?: (log: string) => void;
}

export default function AlternativeQA({
  question,
  currentStepIndex,
  totalSteps,
  onAnswer,
  onLogAction,
}: AlternativeQAProps) {
  const [selectedOpt, setSelectedOpt] = useState<DialogueOption | null>(null);

  // ポチョン（水滴）効果音
  const playPochon = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      // AudioContextブロック時のフォールバック
    }
  };

  const handleSelectOption = (opt: DialogueOption) => {
    setSelectedOpt(opt);
    playPochon();
    onLogAction?.(`通常診断（迂回）：質問 ${currentStepIndex + 1} に「${opt.text}」と回答`);
    
    // 1秒後に次の質問に進む
    setTimeout(() => {
      onAnswer(opt.score);
      setSelectedOpt(null);
    }, 800);
  };

  return (
    <div className="w-full max-w-xl mx-auto paper-bg border-4 border-emerald-800/20 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col gap-6">
      {/* 繊細な幾何学模様 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div className="flex flex-col">
          <span className="text-[9px] font-mono text-emerald-800 font-bold tracking-widest uppercase">
            Normalizer Protocol Mode
          </span>
          <h2 className="text-sm font-bold text-stone-800 mt-1 font-sans flex items-center gap-1.5">
            <Award className="w-4.5 h-4.5 text-emerald-700" />
            {question.title}
          </h2>
          {question.subtitle && (
            <p className="text-[9.5px] font-mono text-stone-400 mt-1">{question.subtitle}</p>
          )}
        </div>
        <div className="font-mono text-[10px] bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-100 font-bold">
          Step {currentStepIndex + 1} / {totalSteps}
        </div>
      </div>

      {/* 質問本文 */}
      <div className="bg-emerald-50/40 border border-emerald-100 p-5 rounded-2xl">
        <p className="text-xs md:text-sm text-stone-800 font-sans leading-relaxed whitespace-pre-line">
          {question.text}
        </p>
      </div>

      {/* 選択肢ボタン */}
      <div className="flex flex-col gap-3">
        {question.options?.map((opt) => {
          const isSelected = selectedOpt?.id === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => handleSelectOption(opt)}
              disabled={selectedOpt !== null}
              className={`w-full text-left p-4 rounded-xl text-xs font-sans transition-all border flex items-center justify-between shadow-xs ${
                isSelected
                  ? 'bg-emerald-800 border-emerald-700 text-white shadow-emerald-200'
                  : 'bg-white hover:bg-stone-50/80 border-stone-200/80 text-stone-700 hover:border-stone-300'
              }`}
            >
              <span className="leading-relaxed flex-1 pr-3">{opt.text}</span>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                  isSelected ? 'border-white bg-white/20' : 'border-stone-300 bg-stone-50'
                }`}
              >
                {isSelected && (
                  <div className="w-1.5 h-1.5 bg-emerald-800 rounded-full" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
