// Web Audio API を用いた水のエレメントシンセサイザー効果音＆BGM
// 外部ファイルロード不要で、ポチャン音やアンビエントサウンドを自己融解生成します。

let bgmInterval: any = null;
let bgmCtx: AudioContext | null = null;
let bgmGain: GainNode | null = null;
let isSoundEffectsEnabled = true;

// 共通の AudioContext シングルトン（複数のインスタンス生成を極力防ぎ、ブラウザの自動ミュート制限から素早く回復）
let sharedCtx: AudioContext | null = null;

function getSharedContext(): AudioContext | null {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!sharedCtx) {
      sharedCtx = new AudioContextClass();
    }
    // suspended 状態なら resume を試みる
    if (sharedCtx.state === 'suspended') {
      sharedCtx.resume();
    }
    return sharedCtx;
  } catch (e) {
    console.error("Failed to initialize central AudioContext:", e);
    return null;
  }
}

// ユーザーアクション時にこれを叩くと、ブラウザの音響ブロックが解除される！
export function resumeAudioContext() {
  const ctx = getSharedContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().then(() => {
      console.log("Central Audio Context resumed successfully via user gesture.");
    });
  }
}

// 効果音ON/OFF設定
export function setSFXEnabled(enabled: boolean) {
  isSoundEffectsEnabled = enabled;
}

export function getSFXEnabled(): boolean {
  return isSoundEffectsEnabled;
}

// 🔊 1. ポチャン（水滴音）のシンセサイザー
export function playPochonSound(volumeVal: number = 0.45) {
  if (!isSoundEffectsEnabled) return;
  try {
    const ctx = getSharedContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    const now = ctx.currentTime;
    
    // 水滴音：低周波から高周波へ指数急上昇し、消衰
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(840, now + 0.05);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.15);
    
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volumeVal, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.09, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    
    osc.start(now);
    osc.stop(now + 0.28);
  } catch (e) {
    console.error("Failed to play water drop sound:", e);
  }
}

// 🔊 1.5 気持ち高めのシュワッという水しぶき音（落書きスタンプ/ペンギンスタンプ等に）
export function playWaterSprinkleSound() {
  if (!isSoundEffectsEnabled) return;
  try {
    const ctx = getSharedContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'triangle';
    const now = ctx.currentTime;
    
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(1800, now + 0.06);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.28);
    
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    osc.start(now);
    osc.stop(now + 0.32);
  } catch (e) {
    console.error("Failed to play sprinkle sound:", e);
  }
}

// 🔊 1.8 LINEの「ピコーン♪」風通知音をWeb Audio APIで合成
export function playLineNotificationSound() {
  if (!isSoundEffectsEnabled) return;
  try {
    const ctx = getSharedContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // LINEに非常によく似た心地よい「ピこん」
    // G5 (784Hz) から一瞬で C6 (1047Hz) に変わる2重サイン波
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.type = 'sine';
    osc2.type = 'sine';

    // 1音目の設計 (G5)
    osc1.frequency.setValueAtTime(783.99, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.18, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    // 2音目の設計 (C6 - わずかに遅れて立ち上がり、長く響く)
    const delay = 0.06;
    osc2.frequency.setValueAtTime(1046.50, now + delay);
    gain2.gain.setValueAtTime(0, now + delay);
    gain2.gain.linearRampToValueAtTime(0.22, now + delay + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.05, now + delay + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.45);

    osc1.start(now);
    osc1.stop(now + 0.15);

    osc2.start(now + delay);
    osc2.stop(now + delay + 0.5);
  } catch (e) {
    console.error("Failed to play LINE notification sound:", e);
  }
}

// 🎵 2. アンビエント水のさざ波BGMのコントロール
export function startAmbientWaterBGM(volumeVal: number = 0.28) {
  try {
    if (bgmInterval) return;
    const ctx = getSharedContext();
    if (!ctx) return;

    bgmCtx = ctx;
    bgmGain = bgmCtx.createGain();
    // 全体的なBGM音量をもう少し聞き取りやすく設定 (0.28)
    bgmGain.gain.setValueAtTime(volumeVal, bgmCtx.currentTime);
    bgmGain.connect(bgmCtx.destination);
    
    const playTick = () => {
      if (!bgmCtx) return;
      if (bgmCtx.state === 'suspended') {
        bgmCtx.resume();
      }
      const now = bgmCtx.currentTime;
      
      // 心地よい水の和音（五度やオクターブ音）を重ねて豊かなレイヤーを作成
      const freqs = [
        [261.63, 523.25, 392.00], // C4 (基音), C5 (倍音), G4 (5度)
        [329.63, 659.25, 493.88], // E4, E5, B4
        [392.00, 783.99, 587.33], // G4, G5, D5
        [349.23, 698.46, 523.25], // F4, F5, C5
      ];
      
      const chosenSet = freqs[Math.floor(Math.random() * freqs.length)];
      
      // 3つのオシレーターを重ねてキラキラとした水の倍音パッドを表現
      chosenSet.forEach((freq, idx) => {
        if (!bgmCtx) return;
        const padOsc = bgmCtx.createOscillator();
        const padGain = bgmCtx.createGain();
        padOsc.connect(padGain);
        padGain.connect(bgmGain!);
        
        padOsc.type = 'sine';
        padOsc.frequency.setValueAtTime(freq, now);
        
        // オクターブ成分や5度は音量を抑えて透き通るような響きにする
        const individualVolume = idx === 0 ? 0.32 : idx === 1 ? 0.15 : 0.12;
        
        // とろけるようなゆったりとしたフェードイン、フェードアウト
        padGain.gain.setValueAtTime(0, now);
        padGain.gain.linearRampToValueAtTime(individualVolume, now + 1.8);
        padGain.gain.exponentialRampToValueAtTime(0.001, now + 4.2);
        
        padOsc.start(now);
        padOsc.stop(now + 4.5);
      });
      
      // ランダムタイミングで水滴の「ポチャン…」
      const delayOffset = 1200 + Math.random() * 1600;
      setTimeout(() => {
        if (!bgmCtx) return;
        try {
          const dropletOsc = bgmCtx.createOscillator();
          const dropletGain = bgmCtx.createGain();
          dropletOsc.connect(dropletGain);
          dropletGain.connect(bgmGain!);
          
          dropletOsc.type = 'sine';
          const startF = 210 + Math.random() * 50;
          const endF = 800 + Math.random() * 150;
          
          const nowSec = bgmCtx.currentTime;
          dropletOsc.frequency.setValueAtTime(startF, nowSec);
          dropletOsc.frequency.exponentialRampToValueAtTime(endF, nowSec + 0.05);
          dropletOsc.frequency.exponentialRampToValueAtTime(startF * 0.45, nowSec + 0.14);
          
          // ポチャン音もしっかり綺麗に響かせる
          dropletGain.gain.setValueAtTime(0.001, nowSec);
          dropletGain.gain.linearRampToValueAtTime(0.08, nowSec + 0.015);
          dropletGain.gain.exponentialRampToValueAtTime(0.001, nowSec + 0.18);
          
          dropletOsc.start(nowSec);
          dropletOsc.stop(nowSec + 0.24);
        } catch (innerErr) {}
      }, delayOffset);
    };
    
    playTick();
    bgmInterval = setInterval(playTick, 4500);
  } catch (e) {
    console.error("Failed to start Ambient BGM:", e);
  }
}

export function stopAmbientWaterBGM() {
  if (bgmInterval) {
    clearInterval(bgmInterval);
    bgmInterval = null;
  }
  bgmGain = null;
  bgmCtx = null;
}

// BGMの状態検知用
export function isBGMPlaying(): boolean {
  return bgmInterval !== null;
}

