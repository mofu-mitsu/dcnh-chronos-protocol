import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Smile } from 'lucide-react';
import { Question, DialogueOption } from '../data';
// @ts-ignore
import soupImg from '../assets/images/gohoubi_pork_soup_1781778140522.jpg';
// @ts-ignore
import gohoubiImg from './gohoubi.png';

interface GohoubiPorkProps {
  question: Question;
  onAnswer: (score: any) => void;
  onLogAction?: (log: string) => void;
}

interface Message {
  sender: 'gohoubi' | 'user';
  text: string;
  id: number;
  timestamp: string;
  isStamp?: boolean;
  isImage?: boolean;
  imageUrl?: string;
}

export default function GohoubiPork({ question, onAnswer, onLogAction }: GohoubiPorkProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'gohoubi',
      text: question.text,
      id: 1,
      timestamp: '午後 12:00',
    },
  ]);
  const [selectedOpt, setSelectedOpt] = useState<DialogueOption | null>(null);
  const [showOptions, setShowOptions] = useState(true);
  const [stampOpen, setStampOpen] = useState(false);
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

    onLogAction?.(`ご褒美くんに「${opt.text}」を送信（豚骨スープ / ツインテール / 排除）`);

    // ユーザー
    const userMsg: Message = {
      sender: 'user',
      text: opt.text,
      id: Date.now(),
      timestamp: getNowTime(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // ご褒美
    setTimeout(() => {
      const repMsg: Message = {
        sender: 'gohoubi',
        text: opt.reaction,
        id: Date.now() + 1,
        timestamp: getNowTime(),
      };
      setMessages((prev) => [...prev, repMsg]);

      // スープ画像をさらにご褒美送信！
      setTimeout(() => {
        const imgMsg: Message = {
          sender: 'gohoubi',
          text: 'ご褒美の濃厚出汁、特製豚骨スープの写真だゾッ！ウマウマやんけ！',
          id: Date.now() + 2,
          timestamp: getNowTime(),
          isImage: true,
          imageUrl: soupImg
        };
        setMessages((prev) => [...prev, imgMsg]);
        onLogAction?.('ご褒美くん（出汁豚骨）から実写特製スープのご褒美画像を受信！');
      }, 950);
    }, 1100);
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
    };
    setMessages((prev) => [...prev, userMsg]);
    onLogAction?.(`ご褒美くんにスタンプ「${stamp}」を送信`);

    // ご褒美のリアクション (ドM全開語尾「だゾ！」)
    setTimeout(() => {
      let responseText = '「スタンプありがトン♡ これはまさに最高のご褒美やんけ！だゾッ！」';
      if (stamp === '🌸') responseText = '「花びらが舞っているゾ！ツインテールのわしゃわしゃも、この美しさには敵わんやんけ！だゾッ！」';
      if (stamp === '🐷') responseText = '「ぎえぇー！拙者の本体スタンプだゾッ！ 拙者の豚骨仕立てのスープを飲んで一緒にブーブー鳴くやんけ！」';
      if (stamp === '🐛') responseText = '「芋虫くんだゾ！ 彼は論理オタク機械だけど、お散歩姿は可愛いからワシャワシャしたいんだゾッ！」';
      if (stamp === '❤️') responseText = '「ぶふぉぉっ！？ハ、ハートマークだゾッ！拙者のINFP魂が臨界爆発、ご褒美にダイブしちゃうやんけ、ありがトンー！！！」';
      if (stamp === '🔨') responseText = '「ハンマーでぶっ叩かれるのも、これまた最高のご褒美だゾ♡ ありがトンー♡」';

      const reply: Message = {
        sender: 'gohoubi',
        text: responseText,
        id: Date.now() + 1,
        timestamp: getNowTime(),
      };
      setMessages((prev) => [...prev, reply]);

      // スープ画像送信！
      setTimeout(() => {
        const imgMsg: Message = {
          sender: 'gohoubi',
          text: 'スタンプお礼に、拙者のエキスの詰まった超特製出汁ベーススープをプレゼントだゾ！',
          id: Date.now() + 3,
          timestamp: getNowTime(),
          isImage: true,
          imageUrl: soupImg
        };
        setMessages((prev) => [...prev, imgMsg]);
      }, 950);
    }, 1000);
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
          {/* 絵文字アバターに最適化し重複を破棄 */}
          <div className="w-10 h-10 rounded-full bg-amber-50 overflow-hidden shrink-0 shadow-sm relative border-2 border-amber-200">
            <img src={gohoubiImg} alt="ご褒美" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-white flex items-center gap-1">
              <span>ご褒美 (豚オタク / IEI)</span>
              <span className="text-[7.5px] bg-yellow-400 text-stone-900 font-bold px-1 rounded">ツインテ大好き</span>
            </span>
            <span className="text-[9px] text-[#d4e1f5] font-mono leading-none">
              エニア 4w3 | 太ったドM豚オタクだゾ！
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            onLogAction?.('ご褒美くん（出汁豚骨）のLINEを既読／未読スルーし、スープベースの沸騰を無視して強制離脱。');
            onAnswer({ D: -1, C: 2, N: 0, H: 1 });
          }}
          className="text-[9.5px] font-mono text-rose-200 bg-rose-950/60 border border-rose-800 hover:bg-rose-900 hover:text-white py-1 px-2.5 rounded-xl cursor-pointer transition-all shrink-0 font-bold active:scale-95 flex items-center gap-1 shadow-sm"
          title="ご褒美くんを無視して次へ進む"
        >
          <span>未読スルー 🔇</span>
        </button>
      </div>

      {/* LINE トークエリア */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-1 py-3 space-y-3.5 custom-scrollbar my-2"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="text-center select-none">
          <span className="bg-black/15 text-[#e5edf9] text-[9px] font-mono py-1 px-3 rounded-full">
            午後 12:00 ご褒美くんとの対話
          </span>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2 max-w-[85%] ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {msg.sender === 'gohoubi' && (
              <div className="w-8 h-8 rounded-full bg-amber-50 overflow-hidden border border-amber-200 shrink-0">
                <img src={gohoubiImg} alt="ご褒美" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
            <div className="flex flex-col max-w-[78%]">
              <span className={`text-[8px] text-[#cbdcf5] mb-0.5 select-none ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.sender === 'gohoubi' ? 'ご褒美' : '被験者（あなた）'}
              </span>

              <div className="flex items-end gap-1.5">
                {msg.sender === 'user' && (
                  <span className="text-[7.5px] text-[#cbdcf5] font-mono select-none leading-none mb-1">既読<br />{msg.timestamp.split(' ')[1]}</span>
                )}
                
                {msg.isImage ? (
                  <div className="bg-white p-1.5 rounded-2xl border border-stone-200 overflow-hidden shadow-sm max-w-[210px] flex flex-col gap-1.5 items-center">
                    <img
                      src={msg.imageUrl}
                      alt="ご褒美だしスープ"
                      className="w-full h-auto rounded-xl object-cover hover:scale-105 transition-transform duration-300 pointer-events-auto"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[9.5px] text-[#2c3e50] font-sans text-center font-bold px-2 bg-amber-100 py-1 rounded border border-amber-200 block w-full">
                      🐷 秘伝・濃厚とんこつスープだゾ！
                    </span>
                  </div>
                ) : (
                  <div
                    className={`p-3 rounded-2xl text-[11.5px] leading-relaxed shadow-sm font-sans ${
                      msg.sender === 'user'
                        ? 'bg-[#89d663] text-stone-900 rounded-tr-none'
                        : 'bg-white text-stone-900 rounded-tl-none font-sans'
                    } ${msg.isStamp ? 'text-3xl bg-transparent shadow-none border-none p-1.5' : ''}`}
                  >
                    {msg.text}
                  </div>
                )}

                {msg.sender === 'gohoubi' && (
                  <span className="text-[7.5px] text-[#cbdcf5] font-mono select-none leading-none mb-1">{msg.timestamp.split(' ')[1]}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* フッター：回答・スタンプパネル */}
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
              {['🌸', '🐷', '🐛', '❤️', '🔨', '😆'].map((st) => (
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

        {/* 回答オプション */}
        {!selectedOpt && showOptions && (
          <div className="bg-white/80 border border-stone-200/80 p-2.5 rounded-2xl space-y-1.5 max-h-44 overflow-y-auto custom-scrollbar select-none shadow-inner">
            <div className="text-[9.5px] text-stone-500 font-bold leading-none mb-1 pl-1">
              💬 ご褒美くんに出汁スープ対応：
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
            {/* 放置する選択肢を追加 */}
            <button
              onClick={() => {
                onLogAction?.('ご褒美くん（出汁豚骨）のLINEをスルーし、返答を強制廃棄して放置。');
                onAnswer({ D: -1, C: 2, N: 0, H: 1 });
              }}
              className="w-full text-left bg-[#ffeaeb] hover:bg-[#ffe0e2] border border-[#fca5a5] p-2.5 rounded-xl text-[10.5px] text-rose-700 leading-normal font-bold transition-colors cursor-pointer flex items-center justify-between"
            >
              <span>💤 返信せず、未読のままスルーして放置する</span>
              <span className="text-xs">🔇</span>
            </button>
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
                <span>次の危険地区へ進む</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
