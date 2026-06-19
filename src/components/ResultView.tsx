import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Trophy, RotateCcw, Share2, AlertCircle, FileText, CheckCircle, Terminal, Copy, Download, Database, Send } from 'lucide-react';
import { toPng } from 'html-to-image';
import { RESULT_PROFILES, SubtypeScore, ResultProfile } from '../data';

interface ResultViewProps {
  score: SubtypeScore;
  onReset: () => void;
  squishedCaterpillar: boolean;
  actionLogs: string[];
  username: string;
  selfType?: string;
  assembledRobot?: { head: string; core: string; arm: string; headId?: string; coreId?: string; armId?: string; phrase: string } | null;
}

export default function ResultView({
  score,
  onReset,
  squishedCaterpillar,
  actionLogs,
  username,
  selfType = '',
  assembledRobot = null,
}: ResultViewProps) {
  const [exporting, setExporting] = useState(false);

  // みつき専用：Googleスプレッドシート(GAS)自動同期
  const MASTER_GAS_URL = 'https://script.google.com/macros/s/AKfycbyGh72N4qyYSVYDsDHyRVjvRcViR405ThFtZ-lSytCXLVigpc-DVjt7vb34gtv_WF4q/exec';
  const [isSendingToGas, setIsSendingToGas] = useState(false);
  const [gasStatus, setGasStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // マウント時に、完全に自動でマスターデータベースに結果を同期させる！
  React.useEffect(() => {
    const autoSendToDatabase = async () => {
      setIsSendingToGas(true);
      setGasStatus('idle');

      const isNone = !selfType || selfType === 'none' || selfType === 'なし' || selfType.trim() === '';
      const displaySelfType = isNone ? 'なし (純粋行動測定モデル)' : selfType;

      const payload = {
        username: username || '非公開被験者',
        mainType: mainProfile.name,
        subType: subProfile.name,
        selfType: displaySelfType,
        scoreD: score.D,
        scoreC: score.C,
        scoreN: score.N,
        scoreH: score.H,
        robot: assembledRobot 
          ? `頭:${assembledRobot.head} | コア:${assembledRobot.core} | 腕:${assembledRobot.arm} (フレーズ: ${assembledRobot.phrase})`
          : '未構成',
        logs: actionLogs.join('\n')
      };

      try {
        await fetch(MASTER_GAS_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        setGasStatus('success');
      } catch (err) {
        console.error('Master database synchronization error:', err);
        setGasStatus('error');
      } finally {
        setIsSendingToGas(false);
      }
    };

    autoSendToDatabase();
  }, []);

  const handleCopyLogs = () => {
    const logsText = `【DCNH診断 行動パリティログ】\n` + actionLogs.map((log, i) => `[${i + 1}] ${log}`).join('\n');
    navigator.clipboard.writeText(logsText);
    alert('行動ログをすべてクリップボードにコピーしたよ！(  ˙꒳˙ )');
  };

  const handleDownloadImage = async () => {
    const element = document.getElementById('result-report-card-export');
    if (!element) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(element, { 
        backgroundColor: '#fafaf9', 
        pixelRatio: 2.5,
        style: {
          borderRadius: '0px',
        }
      });
      const link = document.createElement('a');
      link.download = `dcnh_diagnostic_report_${username || 'momoka'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert('申し訳ありません。iframe制限により画像保存がブロックされました。アプリを新しいブラウザタブで開くと正常に保存できますよ！');
    } finally {
      setExporting(false);
    }
  };

  const handleShare = () => {
    const isNone = !selfType || selfType === 'none' || selfType === 'なし' || selfType.trim() === '';
    const shareText = `【DCNH精密精神診断報告】\n測定タイプ: ${mainProfile.name} (${mainProfile.englishName})\n${isNone ? '純粋行動測定モデル' : `自認: ${selfType}`} \n被験者: ${username || '名無し'}\n選択履歴から精密に気質をプロファイリングしました！ #DCNH精神診断`;
    if (navigator.share) {
      navigator.share({
        title: 'DCNH精密精神診断結果',
        text: shareText,
        url: window.location.href,
      }).catch(() => {
        navigator.clipboard.writeText(shareText);
        alert('診断結果のサマリーをクリップボードにコピーしたよ！');
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('診断結果のサマリーをクリップボードにコピーしたよ！');
    }
  };

  // メインとサブの決定
  const sortedSubtypes = (Object.keys(score) as Array<'D' | 'C' | 'N' | 'H'>)
    .map((key) => ({
      key,
      val: score[key],
    }))
    .sort((a, b) => b.val - a.val);

  const mainTypeKey = sortedSubtypes[0].key;
  const subTypeKey = sortedSubtypes[1]?.key || sortedSubtypes[0].key;

  const mainProfile: ResultProfile = RESULT_PROFILES[mainTypeKey];
  const subProfile: ResultProfile = RESULT_PROFILES[subTypeKey];

  const getSelfTypeAnalysis = (self: string, main: string, sub: string) => {
    const isNone = !self || self === 'none' || self === 'なし' || self.trim() === '';
    if (isNone) {
      const generalAnalyses: Record<string, string> = {
        'D': '【独立意思の開拓者（ドミナント特化型）】\n特定のソシオタイプに囚われず、非常に強固な実践エネルギー（Te / Se）を主軸に置く、圧倒的なアクティブ・リーダータイプだゾ！ビジョンに向けた突破力があり、周囲が「バグかも？」と尻込みする困難や例外事項にも、自ら物理的な手を突っ込んで解決する強力な主導力を秘めています。',
        'C': '【カオスの探求者（クリエイター特化型）】\n自認の枠に収まらない、無限の自由さと発想の柔軟性（Ne / Se）を誇るオルタナティブ・ハッカータイプだゾ！退屈なルールや固定観念の枠（カレンダー）をハサミで切り刻み、全く新しい体験や彩りを生み出します。遊び心と、バグすら楽しみながら進化させる柔軟なハック精神があります。',
        'N': '【一貫性の守護者（ノーマライザー特化型）】\n特定のタイプ枠を超え、論理の再現性と客観的な正しさ（Ti / Fi）を追求し続ける最高精度デバッガータイプだゾ！周囲の感情レベルのノイズに流されず、「何が再現可能で、何が定義上一貫しているか」を冷徹かつ美しいクラス図に分類し、完璧なアプローチで調和させます。',
        'H': '【静寂の観測調律師（ハーモナイザー特化型）】\n特定の構造的役割を持たずとも、その場にいる人々のピリピリ感を消音（Fi / Ni）し、物事を優しく受け流すことができるマスター・バランサータイプだゾ！時間経過とシンクロしながら余白と安らぎをもたらし、あらゆる例外処理エラーも穏やかな知性で静かに調和（デバッグ）させます。',
      };
      
      const mainDesc = generalAnalyses[main] || '測定サブタイプの調和的共振を検知しました。';
      return `【自認なし：純粋気質測定】\n${mainDesc}\n\n主たる測定サブタイプ『${RESULT_PROFILES[main as 'D'|'C'|'N'|'H'].name}』と第2気質『${RESULT_PROFILES[sub as 'D'|'C'|'N'|'H'].name}』の掛け合わせにより、あなた自身の素の行動原理がダイレクトに発揮されています。`;
    }

    const type = self.toUpperCase();
    
    const analyses: Record<string, string> = {
      'LII-N': '【完全精神静音同期】LII（論理・組織）✕ ノーマライザー（規範型）。LII研究者の最も自然で強靭な究極進化系だゾ！あらゆる不条理さ・不正確さという「バグ」に対して、冷静沈着にデバッグ措置を施す客観世界のガーディアン。芋虫（LSI）が「ふむ、さすがの精密さだな」と小さくヤキモチを妬きながら頷くほど、論理構造の美しさと時間の正確さを極限状態で維持できます。',
      'LII-C': '【知的トリックスター】LII（論理・組織）✕ クリエイター（創造型）。Ne（外向直感）が最大出力で狂い咲いている、お遊び大好きの不敵な天才ハッカー。美しい整合性のシステムを自分で作っては、「もっと面白くBypassできるのでは？」と自分の遊び心で裏口（Bypass）を作るチャーミングな狂気があります。',
      'LII-D': '【アーキテクト将軍】LII（論理・組織）✕ ドミナント（支配型）。ふだんは静かに思索に耽っていたLIIが、外界のエラーと非効率性に堪えかねて、ついに指令剣を抜いてしまった戦闘指揮官。確かな論理空間モデルに裏打ちされた意志により、カオスの宇宙をマイルストーンで綺麗に切り開いて統括します。',
      'LII-H': '【孤高の観測隠者】LII（論理・組織）✕ ハーモナイザー（調和型）。脳内冷却効率の極致。静寂に包まれた自分の秘密基地を愛し、水面を伝わる時間経過とシンクロしながら世界をデバッグ。調和パリティが極めて高いため、外界の人々の過負荷な感情に対しても「なるほど、興味深い気圧配置だ」と完全に受け流す静かな湖のような超然さがあります。',
      
      'IEI-C': '【叙情カオスハッカー】IEI（叙情家）✕ クリエイター（創造型）。ご褒美くん（IEI）も大興奮の直感お遊び領域だゾ！言葉の泡、気まぐれなエモい衝動、そして予測不可能な逆襲ハックを操って、退屈な日常のフレームワークをバグらせます。「お風呂上がりの出汁豚骨をわしゃわしゃする」ような、愛され気質なぶっ飛び加減で天才的に世界を彩るタイプ。',
      'IEI-H': '【夢幻の調律師】IEI（叙情家）✕ ハーモナイザー（調和型）。時間が運ぶ無形の情緒と、相手の心のさざ波に究極までシンクロする隠者。過酷な現実（Se）の暴力ノイズに対して、一番安全な布団の中から夢のバリアを展開しています。相手のピリピリ感を瞬時に消音する力がある、超繊細・高解像度ヒーラー。',
      'IEI-N': '【叙情の番人】IEI（叙情家）✕ ノーマライザー（規範型）。感受性の豊かさと、一貫性の管理能力がマインド内で高度に調和している状態。感情のうねりやインスピレーションを、美しい言語化や精微なカレンダーのルールによって「標本」のように整然と並べ替える、不思議な秩序感を持っています。',
      'IEI-D': '【悲劇のカリスマ指導者】IEI（叙情家）✕ ドミナント（支配型）。自らの強烈なヴィジョンや情緒美学によって、人々の魂を激震させ、自発的に動かす強力な心理パワーを持つリーダーです。',

      'EII-H': '【精神浄土の守護神】EII（人道主義者）✕ ハーモナイザー（調和型）。繊細なINFJ/EIIの性格に、癒やしのハーモナイザーが極度に同期。相手の怒り、精神汚染、脳内エラーなどを、自らの優しき湖面（H）の共振(Fi)によって自動修復（デバッグ）してしまう、穏やかで高潔な魂。傷つきやすいけれど、心を許した相手にはめっちゃノリよくなるやんけ！',
      'EII-N': '【道徳のプロトコル管理者】EII（人道主義者）✕ ノーマライザー（規範型）。心の安全一貫性、誠実さ、公正さを追求するシステム保守者。誰も傷つくことのないよう「完璧にやさしいセキュリティ規律」をそっと裏方で守り、秩序ある対話をコーディネート。',
      'EII-C': '【愛 of ディスラプター】EII（人道主義者）✕ クリエイター（創造型）。奥深い思いやりと、突然の可愛い遊び心（変則Ne）を隠し持つトリックスター。ルールや義務といった冷たい枠組みを、美しくあたたかい視点からハックして遊べちゃう自由さがあります。',
      'EII-D': '【静かななる殉教闘士】EII（人道主義者）✕ ドミナント（支配型）。外界の愛なき不条理や他者への暴力を目の当たりにした瞬間、静かに、しかし絶対不退転の意志（D）で不義に立ちはだかる、道徳的守護神。',

      'LSI-N': '【最強秩序メカニズム】LSI（知識芋虫）✕ ノーマライザー（規範型）。LSI知識芋虫(🐛)の直系にしてまさに生息地そのもの！定義漏れや遅れといった脳内ダストを完全にパージし、完璧な仕様通りに現実をマッピングする高精度コントローラー。',
      'LSI-D': '【無慈悲な執行プロトコル】LSI（知識芋虫）✕ ドミナント（支配型）。不整合やマナー違反に徹底した監査 of メスを入れ、岩のような強靭さと行動推進力をもってその場を無言で統括・執行します。',
      'LSI-C': '【からくり設計技師】LSI（知識芋虫）✕ クリエイター（創造型）。硬質な論理（Ti-Se）を守りつつも、遊び心ある裏コマンドやユーモラスな仕掛けをハードウェア上に実装する、ヤバい執着お茶目エンジニア。',
      'LSI-H': '【寡黙な自動盾防衛インフラ】LSI（知識芋虫）✕ ハーモナイザー（調和型）。徹底した安全省エネ。自分のテリトリーに余計な人間や不確定ノイズ（Fe）が侵入するのを完全にブロックし、インフラを最適レベルで無言保守します。',

      'ILI-H': '【深淵の調和隠者】ILI ✕ ハーモナイザー。ダーリンちゃん（ILI-Ni）と極度に同期。完全に一歩引いた特等席から、他者の感情的オーバーフローを「論理の脱水機（Te）」で優しく絞り切る、静けさの調律者。',
    };

    const key = `${type}-${main}`;
    if (analyses[key]) return analyses[key];
    
    // 16タイプ×4サブタイプ合成エンジンによる、不公平のない完全なプロファイリングコラム生成
    const TYPE_CORE_INFO: Record<string, { name: string, nickname: string, trait: string }> = {
      'LII': { name: 'LII (INTJ / 研究者 / 論理的組織型)', nickname: 'LII研究者', trait: 'Ti-Ne（内向論理・外向直感）を主軸とする知的構造の設計者' },
      'IEI': { name: 'IEI (INFP / 叙情家 / 直感的人間関係型)', nickname: 'IEI叙情家', trait: 'Ni-Fe（内向直感・外向感情）を主軸とする時間と心のさざ波の調律師' },
      'EII': { name: 'EII (INFJ / 人道主義者 / 倫理的一関性型)', nickname: 'EII人道審判者', trait: 'Fi-Ne（内向倫理・外向直感）を主軸とする道徳的美学の番人' },
      'LSI': { name: 'LSI (ISTJ / 知識芋虫 / 組織システム型)', nickname: 'LSI知識芋虫', trait: 'Ti-Se（内向論理・外向感覚）を主軸とする高精度な現実統制官' },
      'ILE': { name: 'ILE (ENTP / 発明家 / 直感的客観型)', nickname: 'ILE発明家', trait: 'Ne-Ti（外向直感・内向論理）を主軸とする愉快な未来可能性ハッカー' },
      'SEI': { name: 'SEI (ISFP / 調停者 / 感覚的快楽型)', nickname: 'SEI調停者', trait: 'Si-Fe（内向感覚・外向感情）を主軸とする快適性と安らぎのガーディアン' },
      'ESE': { name: 'ESE (ESFJ / 熱狂者 / 主観的情熱型)', nickname: 'ESE熱狂者', trait: 'Fe-Si（外向感情・内向感覚）を主軸とするパッションと楽しさのプロデューサー' },
      'SLE': { name: 'SLE (ESTP / 征服者 / 破壊的圧力型)', nickname: 'SLE征服者', trait: 'Se-Ti（外向感覚・内向論理）を主軸とする強大で直感不信の物理的支配者' },
      'SEE': { name: 'SEE (ESFP / 政治家 / 主観的活力型)', nickname: 'SEE政治家', trait: 'Se-Fi（外向感覚・内向倫理）を主軸とする圧倒的カリスマと実生活リーダー' },
      'ILI': { name: 'ILI (INTJ / 批評家 / 直感的客観型)', nickname: 'ILI批評家/案内人型', trait: 'Ni-Te（内向直感・外向論理）を主軸とする時空の冷徹な観察アナリスト' },
      'LIE': { name: 'LIE (ENTJ / 起業家 / 効率的能動型)', nickname: 'LIE起業家', trait: 'Te-Ni（外向論理・内向直感）を主軸とする効率社会インフラの高速展開者' },
      'ESI': { name: 'ESI (ISFJ / 守護者 / 客観的倫理型)', nickname: 'ESI守護者', trait: 'Fi-Se（内向倫理・外向感覚）を主軸とする愛憎と自己テリトリー防衛の盾' },
      'LSE': { name: 'LSE (ESTJ / 管理者 / 組織能動型)', nickname: 'LSE管理者', trait: 'Te-Si（外向論理・内向感覚）を主軸とする完璧主義と安定実務の統括者' },
      'EIE': { name: 'EIE (ENFJ / 表現者 / 倫理的感応型)', nickname: 'EIE表現者', trait: 'Fe-Ni（外向感情・内向直感）を主軸とするドラマチックな精神思想誘導者' },
      'SLI': { name: 'SLI (ISTP / 職人 / 感覚的能動型)', nickname: 'SLI職人', trait: 'Si-Te（内向感覚・外向論理）を主軸とする静音設計と高効率省エネエンジニア' },
      'IEE': { name: 'IEE (ENFP / 助言者 / 直感的関係型)', nickname: 'IEE助言者', trait: 'Ne-Fi（外向直感・内向倫理）を主軸とする多次元的な人間ドラマの編集者' },
    };

    const parts = key.split('-');
    const coreType = parts[0];
    const subType = parts[1] || main;

    if (TYPE_CORE_INFO[coreType]) {
      const info = TYPE_CORE_INFO[coreType];
      
      const subDescriptions: Record<string, string> = {
        'D': `【行動執行パラディン】${info.nickname} ✕ ドミナント（支配型）。本来宿る ${info.trait} に、テストで測定された支配気質（ドミナント:D）がダイレクトに上書き共振。他者を巻き込む強力な現実突破力を得ています。論理や倫理的信念をただ頭で考えるだけでなく、物理世界というマトリクスを力強く同期・切り開いて統括する、圧倒的カリスマを秘めたフロント・リーダーです！`,
        'C': `【カオスを遊ぶクリエイティブハッカー】${info.nickname} ✕ クリエイター（創造型）。本来宿る ${info.trait} に、テストで測定された創造型気質（クリエイター:C）がダイレクトに上書き共振。既存の規則やカレンダーの枠をハサミで切り刻み、自由で予測不能なお茶目さを生み出します。退屈をバイパス（Bypass）し、自らお遊びシステムや面白いユーモアをハードウェア上に実装する、天才的な仕掛け人モデルです！`,
        'N': `【一貫性の高精度デバッガー】${info.nickname} ✕ ノーマライザー（規範型）。本来宿る ${info.trait} に、テストで測定された規範型気質（ノーマライザー:N）がダイレクトに上書き共振。客観的真実、論理モデル、あるいは道徳的正しさの正確さを極限に高めています。日常に発生する抜け漏れや感情レベルのバグノイズを進んでパージ（デバッグ）し、美しく整然としたプログラムを完璧に構築・保守し続けます！`,
        'H': `【静寂のチル調和隠者】${info.nickname} ✕ ハーモナイザー（調和型）。本来宿る ${info.trait} に、テストで測定された調和型気質（ハーモナイザー:H）がダイレクトに上書き共振。外界の過負荷な感情ノイズを完全に消音（マフラー）し、水面のように穏やかな環境を受容します。時間の流れに優しく追従し、周囲の人々に適度な余白と深い安らぎをプレゼントする、非常に洗練されたマインド・バランサーです。`
      };

      if (subDescriptions[subType]) {
        return subDescriptions[subType];
      }
    }

    // デフォルトフォールバック
    return `【複合共振モデル】${type}が紡ぐ固有の世界線に、測定サブタイプ『${RESULT_PROFILES[main as 'D'|'C'|'N'|'H'].name}』および第2気質『${RESULT_PROFILES[sub as 'D'|'C'|'N'|'H'].name}』が交差・検知されました。タイプ本来の魅力的な資質とサブタイプのユニークな気質が美しく響き合い、あなたならではの個性的な日常適応と、多次元的なアプローチをもたらします。`;
  };

  const totalPoints = score.D + score.C + score.N + score.H || 1;

  // テーマごとの上品なアクセントカラー（黒枠は絶対使わない。ソフトに仕上げる）
  const themeAccentStyle: Record<'D'|'C'|'N'|'H', { ring: string; textBg: string; border: string; bg: string }> = {
    D: { ring: 'ring-indigo-100', textBg: 'bg-indigo-50 text-indigo-800', border: 'border-indigo-100', bg: 'bg-indigo-50/40' },
    C: { ring: 'ring-amber-100', textBg: 'bg-amber-50 text-amber-800', border: 'border-amber-100', bg: 'bg-amber-50/40' },
    N: { ring: 'ring-emerald-100', textBg: 'bg-emerald-50 text-emerald-800', border: 'border-emerald-100', bg: 'bg-emerald-50/40' },
    H: { ring: 'ring-cyan-100', textBg: 'bg-cyan-50 text-cyan-800', border: 'border-cyan-100', bg: 'bg-cyan-50/40' },
  };

  const accent = themeAccentStyle[mainTypeKey] || themeAccentStyle.N;

  // PC幅(768px)で画像を保存するための共通レンダラー
  const renderReportCardContents = (isExport: boolean) => {
    return (
      <div 
        id={isExport ? "result-report-card-export" : "result-report-card"} 
        className={`${isExport ? "w-[768px]" : "w-full"} paper-bg border border-stone-200 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col bg-[#fafaf9] ${isExport ? "gap-6 p-8" : "gap-6"}`}
        style={isExport ? { width: '768px', minWidth: '768px', maxWidth: '768px' } : undefined}
      >
        {/* 水のカラー波紋デザイン */}
        <div className={`absolute -top-24 -right-24 w-80 h-80 rounded-full bg-gradient-to-tr ${mainProfile.watercolor} opacity-15 blur-3xl pointer-events-none`}></div>
        
        {/* ヘッダー */}
        <div className="flex justify-between items-start border-b border-stone-200/80 pb-4 select-none">
          <div>
            <span className="text-[9px] font-mono tracking-widest text-stone-400 block uppercase">DCNH Psychological Session</span>
            <h1 className="text-xl font-bold text-stone-800 flex items-center gap-1.5 mt-0.5">
              <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
              <span>DCNH 脳内電子監査報告証</span>
            </h1>
          </div>
          <div className="text-right font-mono">
            <span className="text-[8px] text-stone-400 block">SUBJECT NICKNAME</span>
            <span className="text-sm font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded shadow-sm">{username || '被験者みつき'}</span>
          </div>
        </div>

        {/* 診断結果タイトルエリア (枠線を上品なトーンに変更) */}
        <div className={`rounded-2xl p-5 border ${accent.border} ${accent.bg} flex justify-between items-center gap-4 ${isExport ? "flex-row text-left" : "flex-col md:flex-row text-center md:text-left"}`}>
          <div className={`space-y-1.5 ${isExport ? "text-left" : "text-center md:text-left"}`}>
            <div className={`flex flex-wrap items-center gap-2 ${isExport ? "justify-start" : "justify-center md:justify-start"}`}>
              <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold shadow-xs ${accent.textBg}`}>
                Primary Subtype
              </span>
              {subTypeKey !== mainTypeKey && (
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold bg-stone-100 text-stone-600 shadow-xs border border-stone-200">
                  Secondary: {subProfile.name.split('（')[0]}
                </span>
              )}
            </div>
            
            <h2 className={`text-2xl font-black tracking-tight ${
              mainTypeKey === 'D' ? 'text-indigo-900' :
              mainTypeKey === 'C' ? 'text-amber-800' :
              mainTypeKey === 'N' ? 'text-emerald-800' :
              'text-cyan-900'
            }`}>
              {mainProfile.name}
            </h2>
            <p className="text-[10px] font-mono text-stone-500 uppercase tracking-wider">
              {mainProfile.englishName}
            </p>
          </div>

          {/* サークルパラメータサマリー */}
          <div className="w-28 h-28 shrink-0 bg-white border border-stone-200 rounded-full p-4 flex flex-col items-center justify-center relative shadow-sm">
            <div className="absolute inset-1 border border-dashed border-stone-300 rounded-full animate-spin" style={{ animationDuration: '45s' }}></div>
            <div className="text-center font-mono">
              <span className="text-[8px] text-stone-400 block tracking-widest leading-none mb-1">CUMULATIVE</span>
              <span className="text-sm font-bold text-stone-800 block leading-none mb-1">SCORE</span>
              <div className="text-[8px] font-bold bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded-sm inline-block scale-95 mt-0.5">
                {mainTypeKey}{score[mainTypeKey]} / {subTypeKey}{score[subTypeKey]}
              </div>
            </div>
          </div>
        </div>

        {/* 測定記述 */}
        <div className="bg-white/60 p-4 border border-stone-200/60 rounded-2xl">
          <p className="text-xs text-stone-700 leading-relaxed font-sans select-text">
            {mainProfile.description}
          </p>
        </div>

        {/* 詳細ビジュアルゲージ */}
        <div className="bg-white/80 border border-stone-200 p-4 rounded-2xl space-y-3 shadow-inner select-none">
          <h3 className="text-[10px] font-bold text-stone-700 font-sans border-l-2 border-stone-400 pl-1.5 leading-none">
            📊 精神パラメータ個別強度（累積値）
          </h3>
          
          <div className="space-y-2.5">
            {[
              { tag: 'D', name: 'ドミナント (Dominant)', color: 'bg-indigo-500', val: score.D },
              { tag: 'C', name: 'クリエイター (Creator)', color: 'bg-amber-500', val: score.C },
              { tag: 'N', name: 'ノーマライザー (Normalizer)', color: 'bg-emerald-500', val: score.N },
              { tag: 'H', name: 'ハーモナイザー (Harmonizer)', color: 'bg-cyan-500', val: score.H },
            ].map((bar) => {
              const pr = totalPoints > 0 ? (bar.val / totalPoints) * 100 : 0;
              return (
                <div key={bar.tag} className="space-y-1">
                  <div className="flex justify-between items-center text-[9px] font-sans">
                    <span className="font-bold text-stone-800">{bar.name}</span>
                    <span className="font-mono font-bold text-stone-600">{bar.val}pt ({Math.round(pr)}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200/50">
                    <div
                      className={`${bar.color} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(4, pr)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 自認タイプ ✕ 測定DCNHの化学反応コラム */}
        <div className="bg-cyan-50/40 border border-cyan-100 rounded-2xl p-4 md:p-5 space-y-1.5">
          <h3 className="font-mono text-[10px] text-cyan-800 font-bold flex items-center gap-1.5 border-b border-cyan-100 pb-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span>{(!selfType || selfType === 'none' || selfType === 'なし' || selfType.trim() === '') ? '精密気質プロファイリング ✕ 特性解析コラム' : `自認 ${selfType} ✕ 測定サブタイプ 解析コラム`}</span>
          </h3>
          <p className="text-xs text-stone-700 font-sans leading-relaxed whitespace-pre-wrap text-left select-text pt-1">
            {getSelfTypeAnalysis(selfType, mainTypeKey, subTypeKey)}
          </p>
        </div>

        {/* 強み・弱み (マイルドなトーンに落とす) */}
        <div className={`grid grid-cols-1 gap-4 ${isExport ? "grid-cols-2" : "md:grid-cols-2"}`}>
          <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-2xl text-left">
            <h4 className="text-[10px] font-bold text-stone-700 font-sans tracking-wide border-b border-stone-200 pb-1.5 mb-2 uppercase flex items-center gap-1 leading-none select-none">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>心理機能の強化傾向</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-600 list-inside font-sans pl-0.5">
              {mainProfile.strengths.map((str, i) => (
                <li key={i} className="leading-relaxed list-none flex items-start gap-1 select-text">
                  <span className="text-emerald-500 text-sm leading-none shrink-0">✓</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-2xl text-left">
            <h4 className="text-[10px] font-bold text-stone-700 font-sans tracking-wide border-b border-stone-200 pb-1.5 mb-2 uppercase flex items-center gap-1 leading-none select-none">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>システム脆弱性</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-600 list-inside font-sans pl-0.5">
              {mainProfile.weaknesses.map((weak, i) => (
                <li key={i} className="leading-relaxed list-none flex items-start gap-1 select-text">
                  <span className="text-rose-400 text-sm leading-none shrink-0">⚠️</span>
                  <span>{weak}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 案内人からのフィードバックログ */}
        <div className="space-y-3 pt-2 text-left">
          <h3 className="font-bold text-[10px] text-stone-600 border-b border-stone-200 pb-1.5 flex items-center gap-1 select-none leading-none">
            <FileText className="w-3.5 h-3.5 text-stone-400" />
            <span>案内人らのセッション総括</span>
          </h3>

          <div className="space-y-2.5">
            {/* ダーリンちゃん */}
            <div className="flex gap-3 items-start bg-white border border-stone-200/60 p-3 rounded-xl relative shadow-xs">
              <span className="text-xl select-none shrink-0 pt-0.5">🥺</span>
              <div className="space-y-1">
                <div className="text-[8.5px] font-mono text-cyan-700 font-bold leading-none">
                  ダーリンちゃん (ILI-Ni / LVEF)
                </div>
                <p className="text-xs text-stone-600 leading-relaxed italic select-text">
                  {mainProfile.darlingComment}
                </p>
              </div>
            </div>

            {/* LSI芋虫 */}
            <div className="flex gap-3 items-start bg-white border border-stone-200/60 p-3 rounded-xl relative shadow-xs">
              <span className="text-xl select-none shrink-0 pt-0.5">🐛</span>
              <div className="space-y-1">
                <div className="text-[8.5px] font-mono text-emerald-700 font-bold leading-none">
                  LSI 知識芋虫 (LSI-Ni / 5w6)
                </div>
                <p className="text-xs text-stone-600 font-mono leading-relaxed italic select-text">
                  {mainProfile.caterpillarComment}
                </p>
              </div>
            </div>

            {/* ご褒美くん */}
            <div className="flex gap-3 items-start bg-white border border-stone-200/60 p-3 rounded-xl relative shadow-xs">
              <span className="text-xl select-none shrink-0 pt-0.5">🐷</span>
              <div className="space-y-1">
                <div className="text-[8.5px] font-mono text-amber-700 font-bold leading-none">
                  ご褒美くん (INFP / IEI / 4w3)
                </div>
                <p className="text-xs text-stone-600 leading-relaxed italic select-text">
                  {mainProfile.gohoubiComment}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* クリエイターロボットプレビュー（診断対象に特別表示） */}
        {assembledRobot && (
          <div className="bg-zinc-950 text-zinc-300 border border-zinc-800 rounded-2xl p-4 md:p-5 text-left relative overflow-hidden shadow-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5 mb-3">
              <div className="flex items-center gap-1.5 animate-pulse">
                <span className="text-sm">🤖</span>
                <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-400">
                  YOUR ASSEMBLED COG // 構築された独立意思ユニット
                </span>
              </div>
              <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/60 leading-none">
                ● ONLINE
              </span>
            </div>

            <div className={`flex items-stretch gap-4 ${isExport ? "flex-row" : "flex-col sm:flex-row"}`}>
              {/* 美しいアセンブルされたロボットそのものをSVG再現表示する！ */}
              <div className={`flex justify-center items-center bg-zinc-900/80 border border-zinc-850 p-2.5 rounded-xl h-24 w-24 shrink-0 shadow-inner ${isExport ? "mx-0" : "mx-auto sm:mx-0"}`}>
                <svg viewBox="0 0 100 100" className="w-full h-full text-zinc-300">
                  {/* 頭部（頭） */}
                  <rect x="35" y="20" width="30" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  
                  {/* アイカメラ (頭部選択肢) */}
                  {(assembledRobot.headId === 'visor' || assembledRobot.head === 'visor' || assembledRobot.head.includes('バイザー') || assembledRobot.head.includes('visor')) && (
                    <line x1="38" y1="30" x2="62" y2="30" stroke="#f43f5e" strokeWidth="3" />
                  )}
                  {(assembledRobot.headId === 'camera' || assembledRobot.head === 'camera' || assembledRobot.head.includes('カメラ') || assembledRobot.head.includes('camera')) && (
                    <circle cx="50" cy="30" r="4" fill="none" stroke="#22c55e" strokeWidth="1.5" />
                  )}
                  {(assembledRobot.headId === 'monocle' || assembledRobot.head === 'monocle' || assembledRobot.head.includes('モノクル') || assembledRobot.head.includes('monocle')) && (
                    <>
                      <circle cx="43" cy="28" r="3.5" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
                      <line x1="52" y1="25" x2="60" y2="35" stroke="currentColor" strokeWidth="1" />
                      <rect x="52" y="25" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1" />
                    </>
                  )}

                  {/* 首 */}
                  <rect x="47" y="40" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="1" />

                  {/* 胴体（コア選択肢ビジュアル） */}
                  <rect x="25" y="46" width="50" height="34" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  
                  {/* コア内部 */}
                  {(assembledRobot.coreId === 'quantum' || assembledRobot.core === 'quantum' || assembledRobot.core.includes('量子') || assembledRobot.core.includes('quantum')) && (
                    <>
                      <circle cx="50" cy="63" r="8" fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="2,2" />
                      <circle cx="50" cy="63" r="3.5" className="fill-purple-500 stroke-none" />
                    </>
                  )}
                  {(assembledRobot.coreId === 'steam' || assembledRobot.core === 'steam' || assembledRobot.core.includes('熱力') || assembledRobot.core.includes('歯車') || assembledRobot.core.includes('steam')) && (
                    <>
                      <rect x="43" y="56" width="14" height="14" fill="none" stroke="#eab308" strokeWidth="1" />
                      <line x1="50" y1="52" x2="50" y2="74" stroke="#eab308" strokeWidth="1.5" />
                      <line x1="39" y1="63" x2="61" y2="63" stroke="#eab308" strokeWidth="1.5" />
                    </>
                  )}
                  {(assembledRobot.coreId === 'fluidic' || assembledRobot.core === 'fluidic' || assembledRobot.core.includes('流体') || assembledRobot.core.includes('fluidic')) && (
                    <>
                      <path d="M 32 63 Q 41 55 50 63 T 68 63" fill="none" stroke="#06b6d4" strokeWidth="1" />
                      <path d="M 32 68 Q 41 60 50 68 T 68 68" fill="none" stroke="#06b6d4" strokeWidth="1" />
                    </>
                  )}

                  {/* 左アーム（固定アニマ） */}
                  <path d="M 25 55 L 12 55 L 12 68" fill="none" stroke="currentColor" strokeWidth="1" />
                  <circle cx="12" cy="68" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />

                  {/* 右アーム（選択肢アニマ） */}
                  {(assembledRobot.armId === 'cannon' || assembledRobot.arm === 'cannon' || assembledRobot.arm.includes('キャノン') || assembledRobot.arm.includes('cannon')) && (
                    <>
                      <path d="M 75 55 L 88 55" fill="none" stroke="currentColor" strokeWidth="1" />
                      <rect x="88" y="51" width="8" height="8" rx="1" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
                      <line x1="91" y1="55" x2="95" y2="55" stroke="#3b82f6" strokeWidth="1" />
                    </>
                  )}
                  {(assembledRobot.armId === 'claw' || assembledRobot.arm === 'claw' || assembledRobot.arm.includes('クロー') || assembledRobot.arm.includes('claw')) && (
                    <>
                      <path d="M 75 55 L 85 55 L 90 65" fill="none" stroke="currentColor" strokeWidth="1" />
                      <path d="M 88 65 Q 93 60 92 68" fill="none" stroke="#a855f7" strokeWidth="1.5" />
                      <path d="M 91 64 Q 96 61 95 69" fill="none" stroke="#a855f7" strokeWidth="1.5" />
                    </>
                  )}
                  {(assembledRobot.armId === 'probe' || assembledRobot.arm === 'probe' || assembledRobot.arm.includes('プローブ') || assembledRobot.arm.includes('probe')) && (
                    <>
                      <path d="M 75 55 L 86 63 L 95 63" fill="none" stroke="currentColor" strokeWidth="1" />
                      <line x1="95" y1="63" x2="98" y2="63" strokeWidth="2.5" stroke="#f43f5e" />
                    </>
                  )}

                  {/* 脚部下盤 */}
                  <line x1="38" y1="80" x2="33" y2="92" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="62" y1="80" x2="67" y2="92" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="28" y="92" width="10" height="3" fill="currentColor" />
                  <rect x="62" y="92" width="10" height="3" fill="currentColor" />
                </svg>
              </div>

              <div className="flex-1 flex flex-col justify-between gap-3">
                <div className={`grid gap-3 ${isExport ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}>
                  <div className="space-y-1 text-xs">
                    <div className="text-[7.5px] font-mono text-zinc-500 font-bold leading-none uppercase">
                      [SPECIFICATION] アセンブリ構成機体スペック
                    </div>
                    <ul className="text-[10px] text-zinc-400 space-y-1 font-mono pl-1">
                      <li>🧩 走査・ヘッド: <strong className="text-zinc-200">{(assembledRobot.headId === 'visor' || assembledRobot.head === 'visor' || assembledRobot.head.includes('バイザー') || assembledRobot.head.includes('visor')) ? 'Visor-S (バイザー)' : (assembledRobot.headId === 'camera' || assembledRobot.head === 'camera' || assembledRobot.head.includes('カメラ') || assembledRobot.head.includes('camera')) ? 'Camera-L (カメラ)' : 'Monocle-H (モノクル)'}</strong></li>
                      <li>🔮 中華・コア: <strong className="text-zinc-200">{(assembledRobot.coreId === 'quantum' || assembledRobot.core === 'quantum' || assembledRobot.core.includes('量子') || assembledRobot.core.includes('quantum')) ? 'Quantum-Q (量子)' : (assembledRobot.coreId === 'steam' || assembledRobot.core === 'steam' || assembledRobot.core.includes('歯車') || assembledRobot.core.includes('steam') || assembledRobot.core.includes('熱力')) ? 'Steam-G (歯車)' : 'Fluidic-W (流体)'}</strong></li>
                      <li>⚔️ 実動・アーム: <strong className="text-zinc-200">{(assembledRobot.armId === 'cannon' || assembledRobot.arm === 'cannon' || assembledRobot.arm.includes('キャノン') || assembledRobot.arm.includes('cannon')) ? 'Cannon-X (キャノン)' : (assembledRobot.armId === 'claw' || assembledRobot.arm === 'claw' || assembledRobot.arm.includes('クロー') || assembledRobot.arm.includes('claw')) ? 'Claw-A (クロー)' : 'Probe-M (プローブ)'}</strong></li>
                    </ul>
                  </div>

                  <div className="bg-zinc-900/80 border border-zinc-850 p-2.5 rounded-xl relative flex flex-col justify-center min-h-[4rem]">
                    <span className="absolute -top-2 left-2 text-[7px] font-mono text-zinc-500 bg-black px-1.5 py-0.5 rounded border border-zinc-850 scale-90">
                      🗣️ PROCLAIMED // ロボットの呟き
                    </span>
                    <p className="text-[10.5px] text-zinc-200 italic font-mono leading-relaxed pl-1 pt-0.5 text-center">
                      「{assembledRobot.phrase}」
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 font-sans">
      
      {/* 画面表示用 */}
      {renderReportCardContents(false)}

      {/* 画像エクスポート専用クローン（画面外配置：PC等倍768pxレイアウトでレンダリング） */}
      <div 
        style={{ 
          position: 'absolute', 
          left: '-9999px', 
          top: '-9999px', 
          width: '768px',
          pointerEvents: 'none'
        }}
      >
        {renderReportCardContents(true)}
      </div>

      {/* 診断デバッグ行動履歴 (画像保存用のカードコンテナから外側に配置することで、画像保存時には行動ログが含まれないようにする) */}
      {actionLogs.length > 0 && (
        <div className="space-y-2 text-left">
          <h3 className="font-bold text-[10px] text-stone-600 flex items-center justify-between ml-0.5 select-none leading-none">
            <div className="flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-stone-400" />
              <span>電子検証セッション・行動パリティログ</span>
            </div>
            <button
              onClick={handleCopyLogs}
              className="text-[8.5px] font-mono text-cyan-700 bg-cyan-50/50 border border-cyan-100 py-1 px-2.5 rounded hover:bg-cyan-100 flex items-center gap-1 transition-all cursor-pointer shadow-xs leading-none"
            >
              <Copy className="w-2.5 h-2.5" />
              <span>コピー</span>
            </button>
          </h3>
          <div className="bg-stone-900 text-stone-200 border border-stone-800 rounded-xl p-3.5 font-mono text-[9px] leading-relaxed h-36 overflow-y-auto custom-scrollbar shadow-inner select-text">
            <div className="text-cyan-400 font-bold mb-1 select-none">[SYSTEM_AUDIT_LOG_ONLINE]</div>
            {actionLogs.map((log, i) => (
              <div key={i} className="flex gap-1.5">
                <span className="text-stone-500 shrink-0 select-none">[{i + 1}]</span>
                <span>{log}</span>
              </div>
            ))}
            <div className="text-emerald-400 font-bold mt-1 select-none">[SUCCESS] 全変数の抽出・監査を完了しました。</div>
          </div>
        </div>
      )}



      {/* ボトムボタン (画像保存など印刷対象外) */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-3 border-t border-stone-200/80 pt-5 mt-2 select-none">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleShare}
          className="w-full sm:w-auto bg-stone-800 hover:bg-stone-700 text-white font-mono text-xs font-bold py-3 px-6 rounded-full shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
        >
          <Share2 className="w-4 h-4 text-white" />
          <span>結果を共有する！</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDownloadImage}
          disabled={exporting}
          className="w-full sm:w-auto bg-cyan-700 hover:bg-cyan-600 text-white font-mono text-xs font-bold py-3 px-6 rounded-full shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
        >
          <Download className="w-4 h-4 text-white" />
          <span>{exporting ? '保存中...' : '診断書を画像保存'}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onReset}
          className="w-full sm:w-auto bg-white hover:bg-stone-50 border border-stone-200 text-stone-600 font-mono text-xs py-3 px-6 rounded-full flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors"
        >
          <RotateCcw className="w-4 h-4 text-stone-400" />
          <span>再診断（リセット）</span>
        </motion.button>
      </div>
    </div>
  );
}
