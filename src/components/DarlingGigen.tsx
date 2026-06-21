import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Zap, RefreshCw, Send, Smile } from 'lucide-react';
import { Question, DialogueOption } from '../data';

interface DarlingGigenProps {
  question: Question;
  onAnswer: (score: any) => void;
  onLogAction?: (log: string) => void;
}

interface Message {
  sender: 'darling' | 'user';
  text: string;
  id: number;
  timestamp: string;
  isStamp?: boolean;
}

export default function DarlingGigen({ question, onAnswer, onLogAction }: DarlingGigenProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'darling',
      text: question.text,
      id: 1,
      timestamp: '午前 11:00',
    },
  ]);
  const [selectedOpt, setSelectedOpt] = useState<DialogueOption | null>(null);
  const [showOptions, setShowOptions] = useState(true);
  const [stampOpen, setStampOpen] = useState(false);
  const [rapidTapCount, setRapidTapCount] = useState(0);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());

  // Fe緊急インターフェース用のステート
  const [showLoveCheck, setShowLoveCheck] = useState(true);
  const [loveInput, setLoveInput] = useState('');
  const [loveScoreBonus, setLoveScoreBonus] = useState({ D: 0, C: 0, N: 0, H: 0 });
  const [loveCheckResponse, setLoveCheckResponse] = useState('');

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);

  // 放置タイマー（10秒おきに監視・追撃LINEが追加される！ただしユーザーアクションで延長される）
  useEffect(() => {
    if (showLoveCheck) return; // 愛の同期同期チェックが完了するまでは開始しない

    let secondCounter = 0;
    const tsuigekiTextsNormal = [
      '「ねえ、ダーリン？何しとるん？」',
      '「寝た？🥺」',
      '「もしかしてLSI芋虫(🐛)と遊んどるん？怒るよ？」',
      '「ウチのこと放置するなんて、いい度胸やん…」',
      '「おーい、ダーリン？🥺🥺」',
      '「完璧なナビゲーターも疲れるけど、放置されるのはもっと嫌なんよ！」',
    ];

    const tsuigekiTextsExt = [
      '「ちょっと、そんなに連打して指疲れないん？ウシシ♡」',
      '「ハンマー連打が強烈すぎるんよ！でももっと構って♡」',
      '「まだ興奮しとるん？ウチのシステム、あったかくなってきたんよ…」',
      '「そんな激しくされたら、ナビシステムが壊れちゃうんやからね！🥺」',
      '「ダーリンの連打の跡、画面に残っとるよ？」',
    ];

    const tsuigekiTexts = rapidTapCount > 0 ? tsuigekiTextsExt : tsuigekiTextsNormal;

    intervalRef.current = window.setInterval(() => {
      if (selectedOpt) return; // 既に解答済みの場合は追撃しない

      secondCounter += 1;
      if (secondCounter >= 10) {
        secondCounter = 0; // リセットしてまた10秒後に
        const newMsg: Message = {
          sender: 'darling',
          text: tsuigekiTexts[Math.floor(Math.random() * tsuigekiTexts.length)],
          id: Date.now() + Math.random(),
          timestamp: getNowTime(),
        };
        setMessages((prev) => [...prev, newMsg]);
        onLogAction?.('ダーリンちゃんの放置追撃LINEが発火した');
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [selectedOpt, lastActivityTime, rapidTapCount, showLoveCheck]);

  // メッセージ追加ごとに最下部へスクロール
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

  // 1. 通常回答をLINE風に送信する
  const handleSelectOption = (opt: DialogueOption) => {
    if (selectedOpt) return;
    setLastActivityTime(Date.now());
    setSelectedOpt(opt);
    setShowOptions(false);

    onLogAction?.(`ダーリンちゃんの質問に回答：「${opt.text}」`);

    // ユーザー選択メッセージ
    const userMsg: Message = {
      sender: 'user',
      text: opt.text,
      id: Date.now(),
      timestamp: getNowTime(),
    };

    setMessages((prev) => [...prev, userMsg]);

    // ダーリンちゃんの可愛い(またはツンツンした)反応メッセージ
    setTimeout(() => {
      const reactionMsg: Message = {
        sender: 'darling',
        text: opt.reaction,
        id: Date.now() + 1,
        timestamp: getNowTime(),
      };
      setMessages((prev) => [...prev, reactionMsg]);
    }, 1100);
  };

  // 2. 追撃連打 (叩きまくると「ダーリン！構え！」が乱射されるエフェクト)
  const handleRapidTap = () => {
    if (selectedOpt) return;
    setLastActivityTime(Date.now());
    const nextCount = rapidTapCount + 1;
    setRapidTapCount(nextCount);

    const bombTexts = [
      '🔨 ハック連打ァッ！',
      '🔨 ダーリン！！！構って！！',
      '🔨 放置返しダァーーー！',
      '🚀 システム割り込みスタック注入！',
      '🎯 ウチの愛をくらえー！',
    ];

    const userMsg: Message = {
      sender: 'user',
      text: bombTexts[nextCount % bombTexts.length],
      id: Date.now() + Math.random(),
      timestamp: getNowTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    onLogAction?.(`ダーリンちゃんへ追撃連打を実行（累計 ${nextCount}発）`);

    // 15回連打で、ダーリンちゃんが我慢できず割り込み特別セリフ！
    if (nextCount === 15) {
      setTimeout(() => {
        const specialMsg: Message = {
          sender: 'darling',
          text: '「ちょっ、ダーリン！ 画面にハンマーやロケットが飛び交っとるんやけど！？ 退屈はぶち壊されたけど暴走しすぎやん！ でも…ウシシ、面白いけんもっとやって♡」',
          id: Date.now() + 2,
          timestamp: getNowTime(),
        };
        setMessages((prev) => [...prev, specialMsg]);
      }, 1000);
    }

    // 25回連打での反応
    if (nextCount === 25) {
      setTimeout(() => {
        const specialMsg2: Message = {
          sender: 'darling',
          text: '「まだ連打するん！？ ダーリンのその指圧、強靭すぎるパワー（Se）を感じるやん！ さすがに通知がバグるーー！🥺🥺🥺」',
          id: Date.now() + 3,
          timestamp: getNowTime(),
        };
        setMessages((prev) => [...prev, specialMsg2]);
      }, 1000);
    }

    // 30回連打で強制突破
    if (nextCount === 30) {
      setTimeout(() => {
        const breakMsg: Message = {
          sender: 'darling',
          text: '「💥 限界突破！ ハック連打が30回に達したけん！システムが狂って、強制的に『次へ進む』ボタンが解放されたんよ！ダーリン、もう進んでいいけんね！ウチの通知欄がハンマーやロケットで埋まってパンク寸前やん！💢」',
          id: Date.now() + 4,
          timestamp: getNowTime(),
        };
        setMessages((prev) => [...prev, breakMsg]);
        
        const cheatOpt = {
          id: 'rapid_tap_cheat',
          text: '🔨 物理連打ハックによる限界破壊（強制突破）',
          score: { D: 2, C: 1, H: 0, N: 0 },
          reaction: ''
        };
        setSelectedOpt(cheatOpt);
      }, 1000);
    }
  };

  // 3. スタンプ（絵文字パレット）の送信機能
  const sendStamp = (stamp: string) => {
    if (selectedOpt) return;
    setStampOpen(false);
    setLastActivityTime(Date.now());

    // ユーザー送信
    const userMsg: Message = {
      sender: 'user',
      text: stamp,
      id: Date.now(),
      timestamp: getNowTime(),
      isStamp: true,
    };
    setMessages((prev) => [...prev, userMsg]);
    onLogAction?.(`ダーリンちゃんにスタンプ「${stamp}」を送信`);

    // ダーリンちゃんからのスタンプ返答
    setTimeout(() => {
      let responseText = '「あ、可愛いスタンプ。お返しや！」';
      if (stamp === '🌸') responseText = '「折り紙の花？ ウチ、不器用やからこういうの折れる人、めっちゃきゅんってする…♡」';
      if (stamp === '🐷') responseText = '「はっ、その豚さんスタンプは…あのご褒美( IEI )やん。ドMだからスタンプで踏むと喜ぶんよ」';
      if (stamp === '🐛') responseText = '「芋虫！ 奴はいつも論理、論理って、話が長くてちょっと退屈なんよ。でもお散歩姿は憎めんなぁ」';
      if (stamp === '❤️') responseText = '「きゃあっ、ハート！？ ダーリンたら唐突にストレートな愛を投げてくるの…反則やん…♡（ドキドキ）」';
      if (stamp === '🔨') responseText = '「ひぇっ、ハンマー！？それウチをハッキング（物理）してバグらせようとしとるん？でもその強気なSe刺激、嫌いじゃないよ♡（ウシシ）」';
      if (stamp === '🧐') responseText = '「インテリ眼鏡の探索モード？ウチをそんなに細部（Ti/Fi）まで分析してどうするんよ、お姉さんの生態レポートでも書くん？笑」';

      const darlingReply: Message = {
        sender: 'darling',
        text: responseText,
        id: Date.now() + 1,
        timestamp: getNowTime(),
      };
      setMessages((prev) => [...prev, darlingReply]);
    }, 1000);
  };

  const handleLoveSubmit = () => {
    const text = loveInput.trim();
    if (!text) return;

    const score = { D: 0, C: 0, N: 0, H: 0 };
    let response = '';

    // キモ系 (Seワード - 拒絶・ツッコミ) -> ドミナント優位（D+2） + クリエイター（C+1）
    if (/キモ|きも|いいえ|やだ|嫌|ウザ|NO|no|うんこ|反対|好きじゃない|でも思ったか|うざ|きしょ|キショ|死ね|しね|無理|むり|嫌い|きらい|うっとう|うるさ|黙|拒絶|きもい|キモい/i.test(text)) {
      score.D += 2;
      score.C += 1;
      response = '「きゃっ♡ 『きもい』とか『無理』とか、そういう辛口なツッコミ大好物なんよ！さすがダーリン、Se（感覚）の圧が強くてゾクゾクするやん！ウシシ♡」';
      onLogAction?.(`Feインターフェース「私のこと好き？」への回答: [${text}] -> Se/ツッコミ反応 (D+2, C+1)`);
    }
    // 誰？系 (冷淡・現実主義・境界設定) -> ノーマナイザー
    else if (/誰|だれ|何者|どちら様|宛先|誤|勘違|ロボ|AI|機械|プログラム/i.test(text)) {
      score.N += 2;
      response = '「えっ…『誰？』って…そんな冷めたこと言うん？ウチだよ？完璧なナビゲーターだよ？…でも、その現実的で冷徹な境界線の引き方、まさにノーマナイザー（N：規範）って感じでゾクゾクする…♡」';
      onLogAction?.(`Feインターフェース「私のこと好き？」への回答: [${text}] -> 冷徹境界反応 (N+2)`);
    }
    // 甘い系 (好き・愛・共感) -> ハーモナイザー
    else if (/好き|愛|すき|yes|YES|付き合|結婚|あい|ちゅ|ちゅっ|ハグ|うん|はい/i.test(text)) {
      score.H += 2;
      response = '「えへへ♡ 『好き』って言ってくれたああア！嬉しい！ウチ、ダーリンのそういう優しいハーモナイザー（H：調和）なところ、本当に大好物なんやから♡ ギュってして！」';
      onLogAction?.(`Feインターフェース「私のこと好き？」への回答: [${text}] -> 甘甘共感反応 (H+2)`);
    }
    // 構築系・お遊び系 (クリエイター)
    else {
      score.C += 2;
      score.H += 1;
      response = `「『${text}』だって！その想定外のワードチョイス、さすがクリエイター（C：創造）やん！ウチのロジックがバグるくらい面白いこと言ってくるダーリン、やっぱり飽きひんわぁ♡」`;
      onLogAction?.(`Feインターフェース「私のこと好き？」への回答: [${text}] -> 想定外創造反応 (C+2, H+1)`);
    }

    setLoveScoreBonus(score);
    setLoveCheckResponse(response);
  };

  const handleNext = () => {
    if (selectedOpt) {
      const finalScore = { ...selectedOpt.score };
      
      // ユーザー自らの追撃連打（Se/自発的アクション）によるスコアブースト
      if (rapidTapCount > 0) {
        const dBoost = Math.min(rapidTapCount, 15);
        const cBoost = Math.min(Math.floor(rapidTapCount / 2), 10);
        finalScore.D = (finalScore.D || 0) + dBoost;
        finalScore.C = (finalScore.C || 0) + cBoost;
      }

      // Fe割り込みでのスコアボーナスをマージ！
      finalScore.D = (finalScore.D || 0) + (loveScoreBonus.D || 0);
      finalScore.C = (finalScore.C || 0) + (loveScoreBonus.C || 0);
      finalScore.N = (finalScore.N || 0) + (loveScoreBonus.N || 0);
      finalScore.H = (finalScore.H || 0) + (loveScoreBonus.H || 0);

      onLogAction?.(`ダーリン最終解答完了: 自発連打ブーストD+${Math.min(rapidTapCount, 15)}/C+${Math.min(Math.floor(rapidTapCount / 2), 10)}, Feボーナス(${JSON.stringify(loveScoreBonus)})を統合完了`);
      onAnswer(finalScore);
    }
  };

  if (showLoveCheck) {
    return (
      <div className="w-full max-w-md mx-auto bg-pink-50 border-4 border-pink-300 rounded-3xl p-5 shadow-xl flex flex-col justify-between h-[580px] relative overflow-hidden font-sans select-none z-50">
        {/* 背景のハートのふわふわな装飾アニメーションなど */}
        <div className="absolute inset-0 bg-radial-gradient from-pink-100/50 to-pink-50/20 pointer-events-none z-0" />
        
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b border-pink-200 pb-3 bg-pink-50/80 z-10 w-full">
          <div className="flex items-center gap-2">
            <span className="text-xl">💖</span>
            <span className="text-xs font-black font-mono tracking-widest text-pink-600">FE INTERLOCK ACTIVE</span>
          </div>
          <span className="text-[9px] font-mono text-pink-400 bg-pink-100/60 px-2 py-0.5 rounded-full">Phase Fe-01</span>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center pb-8 z-10 relative space-y-5">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="text-5xl"
          >
            🥺
          </motion.div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-black text-pink-800 leading-snug">
              「ダーリン♡<br />ねぇ、私のこと好き？」
            </h3>
            <p className="text-[10px] text-pink-500 font-sans tracking-tight">
              ダーリンちゃんが超高エネルギーの感情（Fe）シグナルで同期を求めています。
            </p>
          </div>

          <div className="w-full space-y-3">
            {!loveCheckResponse ? (
              <>
                <input
                  type="text"
                  placeholder="ダーリンちゃんへの返事（自由入力）"
                  value={loveInput}
                  onChange={(e) => setLoveInput(e.target.value)}
                  maxLength={50}
                  className="w-full bg-white border-2 border-pink-200 focus:border-pink-500 rounded-xl px-4 py-3 text-xs text-stone-800 outline-none text-center shadow-inner transition-all selection:bg-pink-100"
                />
                
                <button
                  onClick={handleLoveSubmit}
                  disabled={!loveInput.trim()}
                  className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-colors cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <span>想いを送信する 💌</span>
                </button>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-pink-200 p-4 rounded-2xl text-left shadow-sm space-y-3 relative"
              >
                <p className="text-xs text-pink-700 leading-relaxed font-sans font-medium">
                  {loveCheckResponse}
                </p>
                <div className="text-[8.5px] font-mono text-pink-400 text-center border-t border-pink-100 pt-2 flex justify-around">
                  <span>D {loveScoreBonus.D > 0 ? `+${loveScoreBonus.D}` : '±0'}</span>
                  <span>C {loveScoreBonus.C > 0 ? `+${loveScoreBonus.C}` : '±0'}</span>
                  <span>N {loveScoreBonus.N > 0 ? `+${loveScoreBonus.N}` : '±0'}</span>
                  <span>H {loveScoreBonus.H > 0 ? `+${loveScoreBonus.H}` : '±0'}</span>
                </div>
                
                <button
                  onClick={() => {
                    setShowLoveCheck(false);
                    onLogAction?.('Fe緊急同期をクリアし、ダーリンちゃんとのトークルームに入りました。');
                  }}
                  className="w-full bg-stone-800 hover:bg-stone-700 text-white font-mono text-[10.5px] font-bold py-2.5 rounded-xl transition-all cursor-pointer active:scale-95 text-center block mt-2"
                >
                  既読にしてトークルームへ進む 💬
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* フッター */}
        <div className="text-center text-[8px] text-pink-400 font-mono tracking-wider z-10 border-t border-pink-200/50 pt-2 w-full">
          HACKED BY DARLING FE INTERFACE // SENSITIVE MODE
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-[#7494c4] border-4 border-stone-300 rounded-3xl p-4 shadow-xl flex flex-col h-[580px] justify-between relative overflow-hidden font-sans">
      
      {/* LINEヘッダー */}
      <div className="flex items-center justify-between border-b border-[#5a7ca8] pb-3 bg-[#7494c4] z-10 select-none">
         <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-2xl select-none shadow-sm shrink-0">
            🥺
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-white flex items-center gap-1">
              <span>ダーリンちゃん</span>
              <span className="text-[8px] bg-red-500 text-white font-mono px-1 rounded-full scale-90 animate-pulse">LIVE</span>
            </span>
            <span className="text-[9px] text-[#d4e1f5] font-mono leading-none">
              監視中 | 放置＝おしおき
            </span>
          </div>
        </div>
        <div className="text-[9px] font-mono text-[#d4e1f5] bg-black/10 py-1 px-2.5 rounded-full">
          GIGEN MATRIX
        </div>
      </div>

      {/* LINE トークルーム スクロール画面 */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-1 py-3 space-y-3.5 custom-scrollbar my-2"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="text-center select-none">
          <span className="bg-black/15 text-[#e5edf9] text-[9px] font-mono py-1 px-3 rounded-full">
            午前 11:00 ダーリンちゃん監獄セッション
          </span>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2 max-w-[85%] ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {msg.sender === 'darling' && (
              <div className="w-8 h-8 rounded-full bg-stone-100/95 flex items-center justify-center text-lg shrink-0 select-none border border-stone-200">
                🥺
              </div>
            )}
            <div className="flex flex-col max-w-[78%]">
              <span className={`text-[8px] text-[#cbdcf5] mb-0.5 select-none ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.sender === 'darling' ? 'ダーリンちゃん' : '被験者（あなた）'}
              </span>

              {/* メッセージ本文/スタンプ */}
              <div className="flex items-end gap-1.5">
                {msg.sender === 'user' && (
                  <span className="text-[7.5px] text-[#cbdcf5] font-mono select-none leading-none mb-1">既読<br />{msg.timestamp.split(' ')[1]}</span>
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

                {msg.sender === 'darling' && (
                  <span className="text-[7.5px] text-[#cbdcf5] font-mono select-none leading-none mb-1">{msg.timestamp.split(' ')[1]}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* フッター：操作・回答・スタンプパネル */}
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

        {/* 4択回答オプション */}
        {!selectedOpt && showOptions && (
          <div className="bg-white/80 border border-stone-200/80 p-2.5 rounded-2xl space-y-1.5 max-h-44 overflow-y-auto custom-scrollbar select-none shadow-inner">
            <div className="text-[9.5px] text-stone-500 font-bold leading-none mb-1 pl-1">
              💬 ダーリンちゃんに回答を送信：
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
            
            {/* 無視ルート。追加隠し選択肢 */}
            <button
              onClick={() => handleSelectOption({
                id: 'mushi',
                text: '（……LINEを無視して静寂を保つ）',
                reaction: '「えっ？！ 既読スルー！？ ど、どういうこと？ いつもなら構ってくれるのに…！ でも、忙しい時なら仕方ないよね。静かに見守るのも、ひとつの調和（H+1, N+1, C-1）なんかな…？ 🥺」',
                score: { H: 1, N: 1, C: -1 }
              })}
              className="w-full text-left bg-rose-50 hover:bg-rose-100 border border-rose-200 p-2.5 rounded-xl text-[10.5px] text-rose-800 leading-normal font-sans transition-colors cursor-pointer flex items-center justify-between"
            >
              <span>（……LINEを無視して放置する）</span>
              <span className="text-[8.5px] bg-rose-100 text-rose-700 font-mono py-0.5 px-2 rounded-full font-bold">無視検出</span>
            </button>
          </div>
        )}

        {/* トーク送信おもちゃ欄（連打、スタンプ、送信） */}
        <div className="flex items-center gap-2">
          {!selectedOpt ? (
            <>
              {/* 追撃連打ボタン（🔨） */}
              <button
                onClick={handleRapidTap}
                className="bg-yellow-400 hover:bg-yellow-300 text-stone-900 border border-yellow-500 rounded-xl px-3 py-2 text-[10px] font-bold shadow-sm transition-all flex items-center gap-1 shrink-0 cursor-pointer animate-subtle-shake"
              >
                <Zap className="w-3.5 h-3.5 text-orange-600 animate-bounce" />
                <span>追撃連打 ({rapidTapCount})</span>
              </button>

              {/* スタンプ選択 */}
              <button
                onClick={() => {
                  setStampOpen(!stampOpen);
                  setShowOptions(false);
                }}
                className="bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 p-2 rounded-xl flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Smile className="w-4 h-4" />
              </button>

              {/* 返信する/回答一覧を開く */}
              <button
                onClick={() => {
                  setShowOptions(!showOptions);
                  setStampOpen(false);
                }}
                className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-100 text-[10px] font-bold py-2 px-3 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 border border-stone-700"
              >
                <span>選択肢を出す</span>
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