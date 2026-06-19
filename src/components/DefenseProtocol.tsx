import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Terminal, Sparkles, RefreshCw, CheckCircle, ShieldCheck, Droplets, Calendar, BookOpen, User } from 'lucide-react';
import { BAD_WORDS } from '../data';

interface DefenseProtocolProps {
  onStart: (username: string, selfType: string, bypassMode?: boolean) => void;
  addLog?: (log: string) => void;
}

// ソシオニクス16タイプ一覧
const SOCIONICS_TYPES = [
  { value: 'LII', label: 'LII (INTJ / 研究者 / 論理的組織型)' },
  { value: 'IEI', label: 'IEI (INFPs / 叙情家 / 直感的人間関係型)' },
  { value: 'EII', label: 'EII (INFJs / 人道主義者 / 倫理的一関性型)' },
  { value: 'LSI', label: 'LSI (ISTJ / 知識芋虫 / 組織システム型)' },
  { value: 'ILE', label: 'ILE (ENTP / 発明家 / 直感的客観型)' },
  { value: 'SEI', label: 'SEI (ISFP / 調停者 / 感覚的快楽型)' },
  { value: 'ESE', label: 'ESE (ESFJ / 熱狂者 / 主観的情熱型)' },
  { value: 'SLE', label: 'SLE (ESTP / 征服者 / 破壊的圧力型)' },
  { value: 'SEE', label: 'SEE (ESFP / 政治家 / 主観的活力型)' },
  { value: 'ILI', label: 'ILI (INTJs / 批評家 / 直感的客観型)' },
  { value: 'LIE', label: 'LIE (ENTJ / 起業家 / 効率的能動型)' },
  { value: 'ESI', label: 'ESI (ISFJ / 守護者 / 客観的倫理型)' },
  { value: 'LSE', label: 'LSE (ESTJ / 管理者 / 組織能動型)' },
  { value: 'EIE', label: 'EIE (ENFJ / 表現者 / 倫理的感応型)' },
  { value: 'SLI', label: 'SLI (ISTP / 職人 / 感覚的能動型)' },
  { value: 'IEE', label: 'IEE (ENFP / 助言者 / 直感的関係型)' },
  { value: 'unknown', label: '未決定 / 自認なし' },
];

export default function DefenseProtocol({ onStart, addLog }: DefenseProtocolProps) {
  const [username, setUsername] = useState('');
  const [selfType, setSelfType] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [protocolStep, setProtocolStep] = useState(0); // 0: 入力画面, 1: 解析合格, 2: 悪口検出による特殊証明
  const [logs, setLogs] = useState<string[]>([]);
  const [proofChecked, setProofChecked] = useState(false);
  const [darlingBeginCheck, setDarlingBeginCheck] = useState('yes'); // 'yes' | 'no'

  const startAnalysis = () => {
    const finalName = username.trim() || 'ダーリン';
    const finalSelfType = selfType.trim() && selfType.trim() !== 'unknown' ? selfType.trim() : 'なし';

    setAnalyzing(true);
    setLogs([
      `[SYSTEM_INIT] 被験者コード "${finalName}" の伝送プロトコルを同期中...`,
      `[META] 自認タイプ「${finalSelfType}」を空間スロットに定義。`,
      '[CHECK] 被験者の情緒的脆弱性、デバッガ耐性をスキャン開始...'
    ]);

    // 悪口が含まれているかの検証
    const foundBadWord = BAD_WORDS.some((word) => 
      finalName.toLowerCase().includes(word.toLowerCase())
    );

    const isRebel = darlingBeginCheck === 'no';

    setTimeout(() => {
      if (foundBadWord || isRebel) {
        if (isRebel) {
          setLogs((prev) => [
            ...prev,
            '[ALERT_VIOLATION] 「いいえ / やだ」の反抗的応答を検出！',
            '[WARN] ダーリンちゃんからの「診断始める？♡」という厚意をシカトした、もしくは断った痕跡があります。',
            '[ALERT] ダーリンちゃん＆LSI芋虫がお怒りです。この先、愛ある不条理な追撃に耐えられる「強靭な精神力の証明（ジョーク耐性証明）」が必要です！'
          ]);
          addLog?.(`被験者「${finalName}」が案内人への協力を拒否。特別耐性証明プロトコルを起動。`);
        } else {
          setLogs((prev) => [
            ...prev,
            '[ALERT_VIOLATION] 愉快で破壊的なキーワードが名前空間で検知されました！',
            '[WARN] 通常、このバグ領域を名前として登録する被験者は、案内人たちの辛口対話に耐えきれずに途中でF5連打するリスクが統計的ノイズ外で発生します。',
            '[ALERT] ダーリンちゃん＆LSI芋虫に逆襲されても絶対に崩壊しない「強靭な精神力の証明」が必要です。'
          ]);
          addLog?.(`名前「${finalName}」にフィルターがヒットした。特別耐性証明プロトコルを起動。`);
        }
        setProtocolStep(2);
      } else {
        setLogs((prev) => [
          ...prev,
          `[SUCCESS] 被験者「${finalName}」の論理整合性を承認しました。`,
          `[INFO] 心の冷却ファン(Ti)は円滑に回転しており、Fe(外向感情)のバッファオーバーフロー兆候はありません。`,
          '[ANALYSIS_RESULT] 水と幾何学のカレンダーへの侵入を許可。安全な通信が確立されました。'
        ]);
        setProtocolStep(1);
      }
      setAnalyzing(false);
    }, 1500);
  };

  const handleStart = () => {
    const finalName = username.trim() || 'ダーリン';
    const finalSelfType = selfType.trim() && selfType.trim() !== 'unknown' ? selfType.trim() : 'なし';
    addLog?.(`自認タイプ:「${finalSelfType}」を持った被験者:「${finalName}」が診断セッションに入場。`);
    onStart(finalName, finalSelfType, protocolStep === 2);
  };

  return (
    <div className="w-full max-w-2xl mx-auto paper-bg border-4 border-stone-300 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col gap-6 text-left selection:bg-cyan-100 font-sans">
      
      {/* 繊細な装飾 */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-cyan-500 via-indigo-400 to-cyan-500"></div>

      {/* ホームへ戻るリンク */}
      <div className="flex justify-start">
        <a
          href="https://mofu-mitsu.github.io/lab.html"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-600 hover:text-cyan-800 transition-colors bg-stone-100 hover:bg-stone-200 border border-stone-200 px-3 py-1.5 rounded-full cursor-pointer leading-none font-sans"
        >
          <span>← 研究室ホームに戻る</span>
        </a>
      </div>

      {/* メインタイトル */}
      <div className="text-center space-y-2 mt-2">
        <div className="flex justify-center items-center gap-1">
          <span className="text-[10px] bg-cyan-700/10 text-cyan-800 font-mono py-0.5 px-3 rounded-full border border-cyan-200 uppercase font-black tracking-widest">
            DCNH Subtype Matrix
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight leading-tight">
          水と幾何学のカレンダー
          <span className="block text-sm md:text-base text-cyan-700 font-medium tracking-normal mt-1">
            〜 DCNHサブタイプ診断検証プロトコル 〜
          </span>
        </h1>
        <p className="text-xs text-stone-400 font-mono uppercase tracking-wider">
          Water dynamics & temporal calendar geometry
        </p>
      </div>

      {/* DCNHミニ説明セクション */}
      <div className="bg-white/80 border border-stone-200/80 rounded-2xl p-4.5 space-y-3.5 shadow-xs select-text">
        <h2 className="text-xs font-bold text-stone-700 flex items-center gap-1 border-b border-stone-200 pb-1.5 uppercase font-mono tracking-wider">
          <BookOpen className="w-4 h-4 text-cyan-600" />
          <span>DCNH診断とは？（ソシオニクス・サブタイプシステム）</span>
        </h2>
        <p className="text-xs text-stone-600 leading-relaxed font-sans">
          人の基本的な「性格の骨組み（16タイプ等）」の上で、<strong>どのように外部と関わり、どのような役割・エネルギーを好んで出力するか</strong>を分析する4つのサブタイプ理論です。
        </p>

        {/* 4つのマトリクス簡易解説 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="bg-indigo-50/50 border border-indigo-100 p-2.5 rounded-xl text-left space-y-0.5">
            <span className="text-[11px] font-mono font-bold text-indigo-900 flex items-center gap-1 leading-none">
              <span className="bg-indigo-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px]">D</span>
              <span>ドミナント (支配型)</span>
            </span>
            <p className="text-[10.5px] text-stone-500 font-sans leading-relaxed">
              高い推進力と目標志向。カオスを統治し、集団を外向きに牽引する戦闘司令官。
            </p>
          </div>

          <div className="bg-amber-50/50 border border-amber-200 p-2.5 rounded-xl text-left space-y-0.5">
            <span className="text-[11px] font-mono font-bold text-amber-900 flex items-center gap-1 leading-none">
              <span className="bg-amber-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px]">C</span>
              <span>クリエイター (創造型)</span>
            </span>
            <p className="text-[10.5px] text-stone-500 font-sans leading-relaxed">
              爆発的な遊び心とアイデア。固定概念をバイパスし、バグ的なカオスを愛するハッカー。
            </p>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-100 p-2.5 rounded-xl text-left space-y-0.5">
            <span className="text-[11px] font-mono font-bold text-emerald-900 flex items-center gap-1 leading-none">
              <span className="bg-emerald-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px]">N</span>
              <span>ノーマライザー (規範型)</span>
            </span>
            <p className="text-[10.5px] text-stone-500 font-sans leading-relaxed">
              客観的な正しさと論理の一貫性。散らかった変数を綺麗にソートする信頼の守護者。
            </p>
          </div>

          <div className="bg-cyan-50/50 border border-cyan-100 p-2.5 rounded-xl text-left space-y-0.5">
            <span className="text-[11px] font-mono font-bold text-cyan-900 flex items-center gap-1 leading-none">
              <span className="bg-cyan-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px]">H</span>
              <span>ハーモナイザー (調和型)</span>
            </span>
            <p className="text-[10.5px] text-stone-500 font-sans leading-relaxed">
              環境への適応と静寂。過負荷なノイズを吸収し、穏やかに時間の経過と調和する調律師。
            </p>
          </div>
        </div>

        <p className="text-[10.5px] text-stone-500 italic text-center font-sans">
          このテストでは、あなたの中にあるこれらの比率（時空パラメータ強度）をリアルタイムに算出します。
        </p>
      </div>

      {/* プロトコルの入力フォーム */}
      <div className="bg-white border text-stone-900 border-stone-200 rounded-2xl p-5 md:p-6 space-y-4 shadow-xs">
        <h3 className="text-xs font-bold text-stone-700 uppercase font-mono tracking-wider flex items-center gap-1 border-b border-stone-200 pb-1.5 leading-none">
          <Terminal className="w-4 h-4 text-stone-600" />
          <span>時空被験者ポータルへのログイン認証</span>
        </h3>

        {protocolStep === 0 && !analyzing && (
          <div className="space-y-4">
            {/* ダーリンの誘いかけチェック */}
            <div className="bg-cyan-50/70 border border-cyan-200/60 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 select-none">
              <span className="text-xs font-bold text-cyan-900 flex items-center gap-2">
                <span className="text-lg">🥺</span>
                <span>ダーリンちゃん「ねぇ、診断始める？♡」</span>
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDarlingBeginCheck('yes')}
                  className={`text-xs px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                    darlingBeginCheck === 'yes'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'bg-white border text-stone-650 hover:bg-stone-50'
                  }`}
                >
                  はい、ぜひ！♡
                </button>
                <button
                  type="button"
                  onClick={() => setDarlingBeginCheck('no')}
                  className={`text-xs px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                    darlingBeginCheck === 'no'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-white border text-stone-650 hover:bg-stone-50'
                  }`}
                >
                  いいえ、やだ
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. ニックネーム */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1 font-sans">
                  <User className="w-3.5 h-3.5 text-stone-500" />
                  <span>被験者ニックネーム (※空欄でもOK)</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={14}
                  placeholder="ダーリン / 旅人 など"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-800 outline-none focus:border-cyan-500 focus:bg-white transition-all shadow-inner font-sans"
                />
              </div>

              {/* 2. 自認16タイプ */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1 font-sans">
                  <Sparkles className="w-3.5 h-3.5 text-stone-500" />
                  <span>あなたの自認タイプ / 心理機能</span>
                </label>
                <input
                  type="text"
                  value={selfType}
                  onChange={(e) => setSelfType(e.target.value)}
                  maxLength={25}
                  placeholder="INTJ, 5w6, LII"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-800 outline-none focus:border-cyan-500 focus:bg-white transition-all shadow-inner font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* リアルタイム監査ログ表示 */}
        {(logs.length > 0 || analyzing) && (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 font-mono text-[10.5px] text-zinc-300 leading-normal space-y-1.5 h-40 overflow-y-auto custom-scrollbar shadow-inner select-none">
            {logs.map((log, index) => (
              <div
                key={index}
                className={
                  log.startsWith('[ALERT_VIOLATION]')
                    ? 'text-rose-400 font-bold'
                    : log.startsWith('[WARN]')
                    ? 'text-amber-400'
                    : log.includes('[SUCCESS]')
                    ? 'text-emerald-400 font-bold'
                    : log.startsWith('[SYSTEM_INIT]')
                    ? 'text-cyan-400'
                    : 'text-zinc-400'
                }
              >
                {log}
              </div>
            ))}
            {analyzing && (
              <div className="flex items-center gap-1.5 text-stone-400 italic animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
                <span>心の防衛パリティチェック及び脳内脆弱性を走査中...</span>
              </div>
            )}
          </div>
        )}

        {/* 暴言入力時の特別耐久テスト */}
        {protocolStep === 2 && !analyzing && (
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 space-y-2.5 text-rose-950 font-sans">
            <h4 className="text-[11.5px] font-bold flex items-center gap-1.5 text-rose-800 select-none">
              <ShieldCheck className="w-4 h-4 text-rose-600 animate-bounce" />
              <span>強靭なジョーク・不条理耐性の特別証明が必要だゾ！</span>
            </h4>
            <p className="text-[10.5px] leading-relaxed text-rose-900">
              あなたの登録行動には、ダーリンちゃんに対する反抗的な応答、または少しアバンギャルドなニックネーム設計が検知されました。
              ここから先の「非同期LINEチャット危険地区」では、ツンデレなダーリン、超論理早口オタクのLSI芋虫(🐛)、風呂上がりの豚骨IEIご褒美くん、そして裏に潜むLII作者など、個性的な変数ノードから「かなり突飛な追撃メッセージ」が容赦なく飛び交います。
            </p>
            <label className="flex items-center gap-2 cursor-pointer pt-1 text-[11px] font-bold select-none">
              <input
                type="checkbox"
                checked={proofChecked}
                onChange={(e) => setProofChecked(e.target.checked)}
                className="rounded border-rose-300 text-rose-600 focus:ring-rose-400 cursor-pointer"
              />
              <span className="text-rose-800 hover:text-rose-950">「私は脆弱者ではなく、この不条理を愛嬌あるバラエティ・ハックとして受け止めるやんけ」</span>
            </label>
          </div>
        )}

        {/* 操作ボタン */}
        <div className="flex justify-center pt-2">
          {protocolStep === 0 && !analyzing && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={startAnalysis}
              className="w-full sm:w-auto bg-stone-800 hover:bg-stone-700 text-stone-100 font-mono text-xs font-bold py-3.5 px-10 rounded-full cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow"
            >
              <RefreshCw className="w-4 h-4" />
              <span>脆弱性スキャナー及び自認整合性を起動</span>
            </motion.button>
          )}

          {protocolStep === 1 && !analyzing && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleStart}
              className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-mono text-xs font-bold py-3.5 px-10 rounded-full cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow"
            >
              <CheckCircle className="w-4 h-4" />
              <span>脆弱性合格。DCNHセッションの時空に同期する</span>
            </motion.button>
          )}

          {protocolStep === 2 && !analyzing && (
            <div className="w-full flex flex-col md:flex-row gap-2 items-center justify-center">
              <button
                onClick={() => {
                  setLogs([]);
                  setProtocolStep(0);
                  setUsername('');
                }}
                className="w-full md:w-auto bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-600 font-mono text-xs py-3 px-5 rounded-full cursor-pointer shrink-0"
              >
                もう一度やり直す
              </button>
              


              <motion.button
                disabled={!proofChecked}
                whileHover={proofChecked ? { scale: 1.03 } : {}}
                whileTap={proofChecked ? { scale: 0.97 } : {}}
                onClick={handleStart}
                className={`w-full md:w-auto font-mono text-xs font-bold py-3.5 px-8 rounded-full cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow shrink-0 ${
                  proofChecked
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>ジョーク証明で突入</span>
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
