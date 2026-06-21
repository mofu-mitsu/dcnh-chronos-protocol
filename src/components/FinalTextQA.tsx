import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, FileText, Sparkles, RefreshCw } from 'lucide-react';
import { Question, BAD_WORDS, SubtypeScore } from '../data';

interface FinalTextQAProps {
  question: Question;
  onAnswer: (score: Partial<SubtypeScore>) => void;
  onLogAction?: (log: string) => void;
}

export default function FinalTextQA({ question, onAnswer, onLogAction }: FinalTextQAProps) {
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const handleSubmit = () => {
    setAnalyzing(true);

    setTimeout(() => {
      let dScore = 0;
      let cScore = 0;
      let nScore = 0;
      let hScore = 0;

      const len = text.length;

      if (len > 0) {
        // 1. 長さ判定
        if (len >= 60) {
          nScore += 2;
          hScore += 2;
        } else if (len <= 15) {
          dScore += 2;
          cScore += 2;
        }

        // 2. 漢字・ひらがな比率判定
        const kanjiMatch = text.match(/[\u4e00-\u9faf]/g) || [];
        const hiraganaMatch = text.match(/[\u3041-\u3096]/g) || [];
        
        const kanjiRatio = kanjiMatch.length / len;
        const hiraRatio = hiraganaMatch.length / len;

        if (kanjiRatio >= 0.3) {
          nScore += 2; // 硬めの表現 (論文/論理一貫)
        }
        if (hiraRatio >= 0.5) {
          hScore += 2; // 柔らかい表現 (感情/適応)
        }

        // 3. キーワード判定
        // 悪口が含まれるか
        const hasBad = BAD_WORDS.some((word) => text.includes(word));
        if (hasBad) {
          dScore += 3;
          cScore += 2;
        }

        // 折り紙・お散歩キーワード
        if (text.includes('折り紙') || text.includes('おりがみ') || text.includes('お散歩') || text.includes('おさんぽ')) {
          hScore += 3;
        }
        // 水・カレンダー
        if (text.includes('水') || text.includes('カレンダー') || text.includes('日付')) {
          nScore += 2;
        }
        // ご褒美
        if (text.includes('ご褒美') || text.includes('豚')) {
          cScore += 2;
        }

        onLogAction?.(`記述質問の回答：「${text}」(総文字数:${len}, 漢字数:${kanjiMatch.length}, ひらがな数:${hiraganaMatch.length})`);
      } else {
        // 空白で送信（沈黙プロトコル：調和 H +2）
        hScore += 2;
        onLogAction?.(`記述質問を空白のまま送信（沈黙プロトコル）`);
      }

      setAnalyzing(false);
      onAnswer({ D: dScore, C: cScore, N: nScore, H: hScore });
    }, 1500);
  };

  return (
    <div className="w-full max-w-2xl mx-auto paper-bg border-4 border-stone-300 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col gap-6">
      
      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b-2 border-stone-200 pb-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono font-bold tracking-widest text-slate-800 bg-amber-100 py-0.5 px-2.5 rounded-full inline-block">
            {question.title}
          </span>
          <span className="text-xs text-stone-500 font-sans mt-1">
            {question.subtitle || '自由記述形式の最終解析'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-xs text-stone-600">
          <FileText className="w-4 h-4 text-stone-500" />
          <span>Final Checkpoint</span>
        </div>
      </div>

      {/* ノート風説明 */}
      <div className="bg-[#fcfbf7] border border-stone-200/80 p-5 rounded-2xl relative">
        <p className="text-xs md:text-sm text-stone-800 font-sans leading-relaxed whitespace-pre-line handwritten-ink">
          {question.text}
        </p>
      </div>

      {/* ノート罫線つきテキストエリア */}
      <div className="relative">
        {analyzing && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center z-10 rounded-2xl">
            <RefreshCw className="w-8 h-8 text-cyan-600 animate-spin mb-2" />
            <span className="text-xs font-bold text-stone-700">あなたの精神の軌跡からシグナルを解析中...</span>
          </div>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={400}
          placeholder="この診断プロセス全体の所感、ふと感じたこと、カレンダーや折り紙、水のエレメントの思い出など、なんでも自由に記述してください。"
          className="w-full h-44 paper-bg text-stone-900 border-2 border-stone-300 rounded-2xl p-4 md:p-5 text-xs md:text-sm font-sans focus:border-cyan-500 outline-none select-text resize-none shadow-inner leading-[2rem] notebook-ruled"
          style={{ letterSpacing: '0.04em' }}
        />
        <div className="text-right text-[10px] text-stone-400 font-mono mt-1 pr-1">
          {text.length} / 400文字
        </div>
      </div>

      {/* ボタン */}
      <div className="text-center pt-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={analyzing}
          className="bg-stone-800 hover:bg-stone-700 text-white font-mono text-xs font-bold py-3 px-8 rounded-full shadow-md cursor-pointer flex items-center gap-2 mx-auto leading-none transition-all duration-200"
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>証言を確定して最終診断結果を算出する</span>
        </motion.button>
      </div>
    </div>
  );
}
