'use strict';

// 画面クラス
const Screen = class {
    #canvas = null;
    #context = null;

    constructor (canvas = null) {
        this.#canvas = canvas;
        this.#context = canvas.getContext('2d'); 
    }

    clear (color = '#FFF') {
        this.#context.fillStyle = color;
        this.#context.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 画像描画メソッド
    draw (image = null, sx, sy, sw, sh, dx, dy, xReverse, yReverse) {
        if(!image.isLoaded) return;

        // 反転の状態を保存
        this.#context.save();

        let dw = sw;
        let dh = sh;

        // 左右反転
        if(xReverse) {
            this.#context.scale(-1, 1);
            dx = -dx;
            dw = -dw;
        }
        // 上下反転
        if(yReverse) {
            this.#context.scale(1, -1);
            dy = -dy;
            dh = -dh;
        }

        this.#context.drawImage(
            image.element,
            sx,
            sy,
            sw,
            sh,
            dx,
            dy,
            dw,
            dh
        );
        
        this.#context.restore();
    }

    fill (color, x, y, w, h) {
        this.#context.fillStyle = color;
        this.#context.fillRect(x, y, w, h);
    }
}


// 画像クラス
const Image = class {
    #element = null;
    #isLoaded = false;
    #cw = 16; // キャラの幅
    #ch = 16;

    constructor (source = null, cw = 16, ch = 16) {
        this.#element = document.createElement('img');
        this.#element.addEventListener('load', (e) => {
            this.#isLoaded = true;
        });
        this.#element.src = source;
        this.#cw = cw;
        this.#ch = ch;
    }

    // ゲッター
    get cw () {
        return this.#cw;
    }
    get ch () {
        return this.#ch;
    }

    // 読み込み済みかどうかを得る
    get isLoaded () {
        return this.#isLoaded;
    }

    // 要素を得る
    get element () {
        return this.#element;
    }
}


// 音声クラス
const Sound = class {
    //Web Audioのオブジェクト
    #audioContext;
    #gainNode;
    #oscillatorNode;

    #isStarted = false; // 開始済みフラグ
    #frequency = []; // 音の高さから周波数への変換

    // 初期化
    constructor () {
        // 音声の周波数計算
        this.#frequency = [];
        let nextFreq = Math.pow(2, 1 / 12);
        let f;
        f = 440;
        for (let n = 49; n < 128; n++) {
            this.#frequency[n] = f;
            f *= nextFreq;
        }
        f = 440;
        for (let n = 49; n >= 0; n--) {
            this.#frequency[n] = f;
            f /= nextFreq;
        }
    }

    // 無音の音声開始
    start () {
        if(this.#isStarted) return;

        this.#audioContext = new AudioContext();

        this.#oscillatorNode = new OscillatorNode(this.#audioContext);
        this.#oscillatorNode.type = 'square';

        this.#gainNode = this.#audioContext.createGain();
        this.#gainNode.gain.setValueAtTime(0, this.#audioContext.currentTime);

        this.#oscillatorNode.connect(this.#gainNode).connect(this.#audioContext.destination);
        this.#oscillatorNode.start(0);
        this.#isStarted = true;
    }

    // 既に開始しているかを返す
    get isStarted () {
        return this.#isStarted;
    }

    // 開始前とする
    set isStarted (value) {
        this.#isStarted = value;
    }

    // 鳴らす
    play (note0 = 51, time = 0.5, note1 = 51) {
        if(!this.#isStarted) return;

        const currentTime = this.#audioContext.currentTime;
        this.#oscillatorNode.frequency.setValueAtTime(this.#frequency[note0], currentTime);
        this.#oscillatorNode.frequency.linearRampToValueAtTime(this.#frequency[note1], currentTime + time);
        this.#gainNode.gain.setValueAtTime(this.#gainNode.gain.value, currentTime);
        this.#gainNode.gain.linearRampToValueAtTime(0.2, currentTime + 0.02);
        this.#gainNode.gain.setValueAtTime(0.2, currentTime + time - 0.02);
        this.#gainNode.gain.linearRampToValueAtTime(0, currentTime + time);
    }

    // 止める
    stop () {
        if(!this.#isStarted) return;

        const currentTime = this.#audioContext.currentTime;
        this.#gainNode.gain.cancelAndHoldAtTime(currentTime);
        this.#gainNode.gain.setValueAtTime(this.#gainNode.gain.value, currentTime);
        this.#gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.02);
    }
}
