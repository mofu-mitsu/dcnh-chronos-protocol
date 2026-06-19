import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Smile } from 'lucide-react';
import { Question, DialogueOption } from '../data';
import { playWaterSprinkleSound, playLineNotificationSound } from '../utils/audio';

interface LiiAuthorProps {
  question: Question;
  onAnswer: (score: any) => void;
  onLogAction?: (log: string) => void;
}

interface Message {
  sender: 'lii' | 'user';
  text: string;
  id: number;
  timestamp: string;
  isStamp?: boolean;
  isUnread?: boolean;
}

export default function LiiAuthor({ question, onAnswer, onLogAction }: LiiAuthorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'lii',
      text: question.text,
      id: 1,
      timestamp: '午後 1:40',
    },
  ]);
  const [selectedOpt, setSelectedOpt] = useState<DialogueOption | null>(null);
  const [showOptions, setShowOptions] = useState(true);
  const [stampOpen, setStampOpen] = useState(false);
  const [penguins, setPenguins] = useState<{ id: number; left: number; scale: number; rotate: number }[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const getNowTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const min = String(now.getMinutes()).padStart(2, '0');
    return `${hours >= 12 ? '午後' : '午前'} ${hours % 12 || 12}:${min}`;
  };

  const handleSelectOption = (opt: DialogueOption) => {
    if (selectedOpt) return;
    setSelectedOpt(opt);
    setShowOptions(false);

    onLogAction?.(`LII作者にアプローチ：「${opt.text}」`);

    // ユーザー
    const userMsg: Message = {
      sender: 'user',
      text: opt.text,
      id: Date.now(),
      timestamp: getNowTime(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // もし 'lii_opt_stamps' の選択肢だった場合、ペンギン100連発エフェクトおよび効果音を動かす！🐧
    if (opt.id === 'lii_opt_stamps') {
      playWaterSprinkleSound();
      const list = Array.from({ length: 100 }).map((_, i) => ({
        id: i,
        left: Math.random() * 90 + 5, // 5%〜95%
        scale: Math.random() * 1.3 + 0.6,
        rotate: Math.random() * 360,
      }));
      setPenguins(list);
      onLogAction?.(`【ペンギンスタンプ100連発】「既読無視に抗議」選択に連動し100匹のペンギンの爆裂上昇アニメーションを起動！`);

      setTimeout(() => {
        setPenguins([]);
      }, 5000);
    }

    // LII作者の返り
    setTimeout(() => {
      playLineNotificationSound();
      const repMsg: Message = {
        sender: 'lii',
        text: opt.reaction,
        id: Date.now() + 1,
        timestamp: getNowTime(),
      };
      setMessages((prev) => [...prev, repMsg]);
    }, 1200);
  };

  const sendStamp = (stamp: string) => {
    if (selectedOpt) return;
    setStampOpen(false);

    const userMsg: Message = {
      sender: 'user',
      text: stamp,
      id: Date.now(),
      timestamp: getNowTime(),
      isStamp: true,
      isUnread: true,
    };
    setMessages((prev) => [...prev, userMsg]);
    onLogAction?.(`LII作者にスタンプ「${stamp}」を送信（応答なし、未読スルー状態）`);

    // 🐧 が送信された場合、100連発打ち上げエフェクトを起動！🚀
    if (stamp === '🐧') {
      playWaterSprinkleSound();
      const list = Array.from({ length: 100 }).map((_, i) => ({
        id: i,
        left: Math.random() * 90 + 5, // 5%〜95%
        scale: Math.random() * 1.3 + 0.6,
        rotate: Math.random() * 360,
      }));
      setPenguins(list);
      onLogAction?.(`【ペンギンスタンプ100連発】グラフィックレンダラーで100匹のペンギンの爆裂上昇アニメーションを起動！`);

      setTimeout(() => {
        setPenguins([]);
      }, 5000);
    }
  };

  const handleNext = () => {
    if (selectedOpt) {
      onAnswer(selectedOpt.score);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[#7494c4] border-4 border-stone-300 rounded-3xl p-4 shadow-xl flex flex-col h-[580px] justify-between relative overflow-hidden font-sans">
      
      {/* LINEヘッダー */}
      <div className="flex items-center justify-between border-b border-[#5a7ca8] pb-3 bg-[#7494c4] z-10 select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-2xl select-none shrink-0 relative bg-white">
            📝
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-white flex items-center gap-1">
              <span>LII (作者)</span>
              <span className="text-[7.5px] bg-cyan-700 text-cyan-100 font-mono px-1 rounded">INTJ / 5w6</span>
            </span>
            <span className="text-[9px] text-[#d4e1f5] font-mono leading-none">
              未読スルー中 | 作業に没頭気味
            </span>
          </div>
        </div>
        <div className="text-[9px] font-mono text-[#d4e1f5] bg-black/10 py-1 px-2.5 rounded-full">
          非同期処理
        </div>
      </div>

      {/* LINE トークエリア */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-1 py-3 space-y-3.5 custom-scrollbar my-2"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="text-center select-none">
          <span className="bg-black/15 text-[#e5edf9] text-[9px] font-mono py-1 px-3 rounded-full">
            午後 1:40 LII作者との同期
          </span>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2 max-w-[85%] ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {msg.sender === 'lii' && (
              <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center border border-stone-200 select-none shrink-0">
                📝
              </div>
            )}
            <div className="flex flex-col max-w-[78%]">
              <span className={`text-[8px] text-[#cbdcf5] mb-0.5 select-none ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.sender === 'lii' ? 'LII作者' : '被験者（あなた）'}
              </span>

              <div className="flex items-end gap-1.5">
                {msg.sender === 'user' && (
                  <span className="text-[7.5px] text-[#cbdcf5] font-mono select-none leading-none mb-1">
                    {!msg.isUnread && <>既読<br /></>}
                    {msg.timestamp.split(' ')[1]}
                  </span>
                )}
                
                <div
                  className={`p-3 rounded-2xl text-[11.5px] leading-relaxed shadow-sm font-sans ${
                    msg.sender === 'user'
                      ? 'bg-[#89d663] text-stone-900 rounded-tr-none'
                      : 'bg-white text-stone-900 rounded-tl-none font-sans'
                  } ${msg.isStamp ? 'text-3xl bg-transparent shadow-none border-none p-1.5' : ''}`}
                >
                  {msg.text}
                </div>

                {msg.sender === 'lii' && (
                  <span className="text-[7.5px] text-[#cbdcf5] font-mono select-none leading-none mb-1">{msg.timestamp.split(' ')[1]}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* フッター */}
      <div className="border-t border-[#5a7ca8] pt-2.5 bg-[#7494c4] z-20 flex flex-col gap-2 relative">
        
        {/* スタンプピッカー */}
        <AnimatePresence>
          {stampOpen && !selectedOpt && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="absolute bottom-14 left-0 right-0 bg-white/95 rounded-2xl p-2.5 shadow-xl border border-stone-300 flex justify-around items-center z-50 select-none"
            >
              {['🌸', '🐷', '🐛', '❤️', '🔨', '🐧'].map((st) => (
                <button
                  key={st}
                  onClick={() => sendStamp(st)}
                  className="text-2xl hover:scale-130 transition-transform p-1.5 cursor-pointer"
                >
                  {st}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4択 */}
        {!selectedOpt && showOptions && (
          <div className="bg-white/80 border border-stone-200/80 p-2.5 rounded-2xl space-y-1.5 max-h-44 overflow-y-auto custom-scrollbar select-none shadow-inner">
            <div className="text-[9.5px] text-stone-500 font-bold leading-none mb-1 pl-1">
              💬 没頭中の作者への割り込み回答を選択：
            </div>
            {question.options?.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt)}
                className="w-full text-left bg-stone-50 hover:bg-stone-100 border border-stone-200 p-2.5 rounded-xl text-[10.5px] text-stone-800 leading-normal transition-colors cursor-pointer"
              >
                {opt.text}
              </button>
            ))}
          </div>
        )}

        {/* コントロール */}
        <div className="flex items-center gap-2">
          {!selectedOpt ? (
            <>
              {/* スタンプ */}
              <button
                onClick={() => {
                  setStampOpen(!stampOpen);
                  setShowOptions(false);
                }}
                className="bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 p-2 rounded-xl flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Smile className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setShowOptions(!showOptions);
                  setStampOpen(false);
                }}
                className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-100 text-[10px] font-bold py-2.5 px-3 rounded-xl cursor-pointer flex items-center justify-center gap-1 border border-stone-700"
              >
                <span>選択肢を出す (返信)</span>
              </button>
            </>
          ) : (
            <div className="w-full flex justify-center py-1">
              <button
                onClick={handleNext}
                className="bg-stone-800 hover:bg-stone-700 border border-stone-600 text-white font-mono text-[11px] font-bold py-2.5 px-8 rounded-full shadow-lg shadow-black/20 flex items-center gap-1 cursor-pointer"
              >
                <span>最後のチェックポイントへ</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 🐧 100連発打ち上げエフェクトレイヤー 🚀 */}
      {penguins.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
          {penguins.map((p) => (
            <motion.div
              key={p.id}
              initial={{ y: '110%', x: `${p.left}%`, scale: p.scale, rotate: p.rotate, opacity: 0 }}
              animate={{ 
                y: '-120%', 
                opacity: [0, 1, 1, 0],
                rotate: p.rotate + (p.id % 2 === 0 ? 360 : -360)
              }}
              transition={{
                duration: 2.0 + (Math.random() * 1.5),
                delay: (p.id * 0.02), // 均等にパラパラパラと打ち上げる！
                ease: 'easeOut'
              }}
              className="absolute text-4xl select-none"
              style={{ left: `${p.left}%`, bottom: '0px' }}
            >
              🐧
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
