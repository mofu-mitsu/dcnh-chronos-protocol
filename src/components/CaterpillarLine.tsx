import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Smile, Sparkles, AlertCircle } from 'lucide-react';
import { Question, DialogueOption, CATERPILLAR_LONG_TEXT_1, CATERPILLAR_LONG_TEXT_2 } from '../data';

interface CaterpillarLineProps {
  question: Question;
  onAnswer: (score: any) => void;
  onLogAction?: (log: string) => void;
}

interface Message {
  sender: 'caterpillar' | 'user';
  text: string;
  id: number;
  timestamp: string;
  isStamp?: boolean;
}

export default function CaterpillarLine({ question, onAnswer, onLogAction }: CaterpillarLineProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'caterpillar',
      text: CATERPILLAR_LONG_TEXT_1,
      id: 1,
      timestamp: '午前 11:15',
    },
  ]);
  const [clickCount, setClickCount] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<DialogueOption | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [stampOpen, setStampOpen] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);

  // 10秒おきに「聞いてる？僕の論理について」補足追撃LINE追加！
  useEffect(() => {
    let secondCounter = 0;
    const catTsuigekiTexts = [
      '「おーい、聞いてるかい？ つまり、主観と客観のパリティエラー（通信不調）を回避するためにはだね──」',
      '「補足だけど、脳というハードウェアは、そもそも10の11乗個のニューロンから成る大規模非対称型分散並列処理システムなわけさ」',
      '「シカト（応答なし）は、ソシオニクス的には【関係性の遮断プロトコル（パケットロス）】と解釈されるんだぞ」',
      '「折り紙。折り紙を折る行為は、2次元平面から3次元幾何学を創る極めて論理的な行為なんだ。トコトコ」',
      '「無視？ もしや君の内部変数に【再現性不安(Ni)】が過負荷しているのかな。僕が最適関数を教えてあげるから心配いらないよ」',
      '「僕を30回タップした時の衝撃パラメータについても、3次元ベクトル解析モデルで解説できるんだが…」',
    ];

    intervalRef.current = window.setInterval(() => {
      if (selectedOpt) return; // 回答済みの場合は追撃しない

      secondCounter += 1;
      if (secondCounter >= 10) {
        secondCounter = 0;
        const newMsg: Message = {
          sender: 'caterpillar',
          text: catTsuigekiTexts[Math.floor(Math.random() * catTsuigekiTexts.length)],
          id: Date.now() + Math.random(),
          timestamp: getNowTime(),
        };
        setMessages((prev) => [...prev, newMsg]);
        onLogAction?.('LSI芋虫のLINE無視お仕置き追撃長文が発火した');
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [selectedOpt]);

  // トーク更新で最下部スクロール
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, showOptions]);

  const getNowTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const min = String(now.getMinutes()).padStart(2, '0');
    return `${hours >= 12 ? '午後' : '午前'} ${hours % 12 || 12}:${min}`;
  };

  const [isOverrun, setIsOverrun] = useState(false);

  // ちょっと何いってるかわからない（ツッコミ）ボタン
  const handleNaniCore = () => {
    if (selectedOpt || isOverrun) return;
    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    onLogAction?.(`LSI芋虫にツッコミ送信：「(  ˙꒳˙ )ﾁｮｯﾄﾅﾆｲｯﾃﾙｶﾜｶﾗﾅｲ」 (${nextCount}回目/30)`);

    // ユーザー発言
    const userMsg: Message = {
      sender: 'user',
      text: '(  ˙꒳˙ )ﾁｮｯﾄﾅﾆｲｯﾃﾙｶﾜｶﾗﾅｲ',
      id: Date.now(),
      timestamp: getNowTime(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // 30回連打で強制突破！
    if (nextCount >= 30) {
      setIsOverrun(true);
      onLogAction?.(`LSI芋虫への「(  ˙꒳˙ )ﾁｮｯﾄﾅﾆｲｯﾃﾙｶﾜｶﾗﾅｲ」を30回連打突破！感覚Seが限界沸騰。`);
      
      const userAnnounce: Message = {
        sender: 'user',
        text: '💥 (  ˙꒳˙ )ﾁｮｯﾄﾅﾆｲｯﾃﾙｶﾜｶﾗﾅｲ連打突風・パリティ崩壊！！！',
        id: Date.now() + 10,
        timestamp: getNowTime(),
      };
      setMessages((prev) => [...prev, userAnnounce]);

      setTimeout(() => {
        const catError: Message = {
          sender: 'caterpillar',
          text: '「ぎゃ、ぎゃあああーーッ！！ 連打スタックが30に到達して、僕の論理一貫パラメータのローカル軸が極限熱融解を起こしたよ！前提条件もトコトコのお散歩経路も、すべてバーストしてしまっているよ！強大・圧制的な感覚（Se極大値）の入力は、理論的な整合性を破壊するんだ……ッ。くっ、次の危険地区に強制ポータル接続がロード（マウント）されてしまう……！！退避、緊急デバッグ退避を申請する……！！」',
          id: Date.now() + 20,
          timestamp: getNowTime(),
        };
        setMessages((prev) => [...prev, catError]);
      }, 500);

      // 連打のお礼にD（Se）を大幅アップ！自動遷移は廃止し、承認ボタンを表示して手動遷移させる
      return;
    }

    // 芋虫の長文返答
    setTimeout(() => {
      const texts = [
        CATERPILLAR_LONG_TEXT_2,
        `「何だと？ まだ合意形成のパリティチェックが通らないのかい？
しようがないな、ではモデルの階層を極限まで抽象化した【12次元カレンダー幾何学】について解説するよ。
これは、君の『何言っているかわからない』という知能イベントそのものが、エントロピーの損失に寄与している数式的証明んだ。

【補助概念モジュール M-${nextCount}】：
主観的時間の伸縮性、すなわち『君の一秒の退屈』と、僕が歩くスピードの関係式さ──」`,
      ];

      const caterpillarMsg: Message = {
        sender: 'caterpillar',
        text: texts[Math.min(nextCount - 1, texts.length - 1)] || `「デバッグ深度 ${nextCount}/30。君がツッコミボタンを入力するパルス圧が、僕の脳のコンパイル許容閾値を超えようとしているよ。もし30回に達すると、僕の防御プロトコルが自動破綻して次の危険地区がマウントされるよ」`,
        id: Date.now() + 1,
        timestamp: getNowTime(),
      };
      setMessages((prev) => [...prev, caterpillarMsg]);
    }, 850);

    // 2回以上ツッコむと、自動で選択肢が出てくる設定
    if (nextCount >= 2) {
      setTimeout(() => {
        setShowOptions(true);
      }, 1600);
    }
  };

  // 通常回答の送信
  const handleSelectOption = (opt: DialogueOption) => {
    if (selectedOpt) return;
    setSelectedOpt(opt);
    setShowOptions(false);

    onLogAction?.(`LSI芋虫への回答決定：「${opt.text}」`);

    // ユーザー発言
    const userMsg: Message = {
      sender: 'user',
      text: opt.text,
      id: Date.now(),
      timestamp: getNowTime(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // 芋虫の返答
    setTimeout(() => {
      const repMsg: Message = {
        sender: 'caterpillar',
        text: opt.reaction,
        id: Date.now() + 1,
        timestamp: getNowTime(),
      };
      setMessages((prev) => [...prev, repMsg]);
    }, 1100);
  };

  // スタンプ（絵文字）の送信
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
    onLogAction?.(`LSI芋虫にスタンプ「${stamp}」を送信`);

    // 芋虫からの知的リアクション
    setTimeout(() => {
      let responseText = '「不規則なデバッグシグナルだ。乱数リセットを検知した。」';
      if (stamp === '🌸') responseText = '「ふにゃ？ 折り紙の手紙。僕の触覚センサ（Si）が不思議な調和を検知した。トコトコ。たまにはお散歩も統計的に正しいかもしれないな」';
      if (stamp === '🐷') responseText = '「ご褒美（IEI）のシンボルだね。彼はドMのパラメータが臨界突破しているので、罵倒するとエネルギー変換効率が上がるんだ、不思議だね」';
      if (stamp === '🐛') responseText = '「僕のデジタルアイコン！ 整合性が取れており、美しいペアリンクを示しているよ」';
      if (stamp === '❤️') responseText = '「ひぇっ！？ ハートはFe（外向感情）が過負荷になる。僕の論理回路のキャパシティ（Ti）がドキドキしてオーバーフローしそうだ…！」';

      const catReply: Message = {
        sender: 'caterpillar',
        text: responseText,
        id: Date.now() + 1,
        timestamp: getNowTime(),
      };
      setMessages((prev) => [...prev, catReply]);
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
          <div className="w-10 h-10 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-2xl select-none shadow-sm shrink-0">
            🐛
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-white flex items-center gap-1">
              <span>LSI知識芋虫</span>
              <span className="text-[8px] bg-emerald-500 text-white font-mono px-1 rounded-full scale-90">ONLINE</span>
            </span>
            <span className="text-[9px] text-[#d4e1f5] font-mono leading-none">
              思考中 | FVLE
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            onLogAction?.('LSI芋虫からのLINE長文を既読／未読スルーし、返答バッファを強制廃棄（スルー突破）。');
            onAnswer({ D: -1, C: 1, N: -1, H: 2 });
          }}
          className="text-[9.5px] font-mono text-rose-200 bg-rose-950/60 border border-rose-800 hover:bg-rose-900 hover:text-white py-1 px-2.5 rounded-xl cursor-pointer transition-all shrink-0 font-bold active:scale-95 flex items-center gap-1 shadow-sm"
          title="返答を無視して次の地区へ"
        >
          <span>未読スルー 🔇</span>
        </button>
      </div>

      {/* LINEトークルーム */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-1 py-3 space-y-3.5 custom-scrollbar my-2"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="text-center select-none">
          <span className="bg-black/15 text-[#e5edf9] text-[9px] font-mono py-1 px-3 rounded-full">
            午前 11:15 前提条件同期プロトコル
          </span>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2 max-w-[85%] ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {msg.sender === 'caterpillar' && (
              <div className="w-8 h-8 rounded-full bg-stone-100/90 flex items-center justify-center text-lg shrink-0 select-none border border-stone-200">
                🐛
              </div>
            )}
            <div className="flex flex-col max-w-[78%]">
              <span className={`text-[8px] text-[#cbdcf5] mb-0.5 select-none ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.sender === 'caterpillar' ? 'LSI芋虫' : '被験者（あなた）'}
              </span>

              <div className="flex items-end gap-1.5">
                {msg.sender === 'user' && (
                  <span className="text-[7.5px] text-[#cbdcf5] font-mono select-none leading-none mb-1">既読<br />{msg.timestamp.split(' ')[1]}</span>
                )}
                
                <div
                  className={`p-3 rounded-2xl text-[11.5px] leading-relaxed shadow-sm whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-[#89d663] text-stone-900 rounded-tr-none'
                      : 'bg-white text-stone-900 rounded-tl-none font-mono text-[10px]'
                  } ${msg.isStamp ? 'text-3xl bg-transparent shadow-none border-none p-1.5' : ''}`}
                >
                  {msg.text}
                </div>

                {msg.sender === 'caterpillar' && (
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
              {['🌸', '🐷', '🐛', '❤️', '🔨', '🧐'].map((st) => (
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

        {/* 4択オプション */}
        {!selectedOpt && showOptions && !isOverrun && (
          <div className="bg-white/80 border border-stone-200/80 p-2.5 rounded-2xl space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar select-none shadow-inner">
            <div className="text-[9.5px] text-stone-500 font-bold leading-none mb-1 pl-1">
              💬 LSI芋虫への返信を指定：
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
                onLogAction?.('LSI芋虫からのLINE長文を未読スルーし、返答を強制廃棄して放置。');
                onAnswer({ D: -1, C: 1, N: -1, H: 2 });
              }}
              className="w-full text-left bg-rose-50 hover:bg-rose-100 border border-rose-200 p-2.5 rounded-xl text-[10.5px] text-rose-700 leading-normal font-bold transition-colors cursor-pointer flex items-center justify-between"
            >
              <span>💤 返信せず、未読のままスルーして放置する</span>
              <span className="text-xs">🔇</span>
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 w-full">
          {isOverrun ? (
            <div className="w-full text-center">
              <button
                onClick={() => onAnswer({ D: 5, C: -1, N: -1, H: 1 })}
                className="w-full bg-rose-600 hover:bg-rose-500 border-2 border-rose-700 text-white font-mono text-[10px] font-bold py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer animate-pulse active:scale-95 transition-all"
              >
                <span>🚨 崩壊完了：危険地区ポータルを接続する（承認）</span>
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : !selectedOpt ? (
            <>
              {/* 「ちょっと何言ってるかわからない」ツッコミボタン */}
              <button
                onClick={handleNaniCore}
                className="bg-rose-500 hover:bg-rose-400 text-white border border-rose-600 rounded-xl px-2.5 py-2 text-[10px] font-bold shadow-sm flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <AlertCircle className="w-3.5 h-3.5 text-white animate-pulse" />
                <span>ﾅﾆｲｯﾃﾙｶﾜｶﾗﾅｲ ({clickCount})</span>
              </button>

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
                className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-100 text-[10px] font-bold py-2 px-3 rounded-xl cursor-pointer flex items-center justify-center gap-1 border border-stone-700"
              >
                <span>返信する</span>
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