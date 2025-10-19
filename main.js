'use strict';

// 要素
const body = document.body;
const title = document.querySelector('#title');
const titleButton = document.querySelector('#title button');
const main = document.querySelector('main');
const canvas = document.querySelector('#canvas');
const leftButton = document.querySelector('#left');
const rightButton = document.querySelector('#right');
const achieverButton = document.querySelector('#start');
const sprite = new Image('./sprite.png', 16, 16); // ブロックの画像
const screen = new Screen(canvas); // 画面

// ステージをプログラムに手入力
const stageData = [
    [
        '               ',
        ' BLLLLLLLLLLLL ',
        ' B             ',
        ' B             ',
        ' B           G ',
        ' B  FLLBBBBBBB ',
        ' B  L        B ',
        ' B  L        B ',
        ' B  L        B ',
        ' BBBBBBBBB   B ',
        '             B ',
        '             B ',
        '   A         B ',
        ' BBBBBBBBBBBBB ',
        '               ',
    ],
    [
        '               ',
        ' GLL           ',
        '   L           ',
        '   B           ',
        '   BBBB        ',
        '      L        ',
        '      L  BLBBB ',
        '      L  B   B ',
        '      L  B   B ',
        '      LLLBBF B ',
        '             B ',
        '             B ',
        '  A BFFFF    B ',
        ' BBBBBBBBBBBBB ',
        '               ',
    ],
    [
        '              G',
        '    LFLL    LLL',
        ' F  L  L  BBB  ',
        ' L  L  LLLB BLF',
        ' L  L  L  BBB L',
        ' LBBB  F      B',
        '  B B         L',
        '  BBB   BBBLLLF',
        '   L    B B    ',
        '   F    BBB    ',
        '        L      ',
        '  A   BBB      ',
        ' BBBLLB B      ',
        ' B B  BBBLLLLF ',
        ' BBB           ',
    ],
    [
        '               ',
        '               ',
        'B BFLLFLLLFLLF ',
        'B F            ',
        'B F            ',
        'B FLLFLLFLLLF  ',
        'F B            ',
        'F B            ',
        'F BFLLFLLLFLLF ',
        'B F            ',
        'B F            ',
        'B FLLFLLFLFLLLF',
        'BAB            ',
        'BBB            ',
        '         G     ',
    ],
    [
        ' BBBBBBB       ',
        ' B     L       ',
        ' B     L       ',
        ' BLLLFBB  BBBB ',
        ' B     BF    B ',
        ' B     B   G B ',
        ' BBFLLLB  BBBB ',
        ' B     B       ',
        ' B     BF      ',
        ' BLLLFBB  BBBB ',
        ' B     L     B ',
        ' B     L   A B ',
        ' BBBBBBB  BBBB ',
        '               ',
        '               ',
    ],
    [
        'G              ',
        'L              ',
        'L              ',
        'L     F        ',
        'L     L        ',
        'L     F        ',
        'L     BBB     L',
        'L     B B     F',
        'L       B     L',
        'L     F     BBB',
        'L     F     B B',
        'L     FA    B  ',
        'L     BBB      ',
        'L     B B      ',
        'LLLLLLL B      ',
    ],
    [
        '               ',
        ' A             ',
        'BBB      BBB   ',
        '          L    ',
        '   BBB    L    ',
        '    L     L BBB',
        '    L     L  L ',
        '    L BBB L  L ',
        '    L  L  L  L ',
        '    LLLLLLLLLL ',
        '     L  L   L  ',
        '     L BBB BBB ',
        '     L     B B ',
        '    BBB     G  ',
        '          BBBBB',
    ],
    [
        '             F ',
        '             F ',
        '         B   F ',
        '             F ',
        'B     B      F ',
        'B            F ',
        'B  B         F ',
        'B            LG',
        'B  FFFF      F ',
        'BBBBBBBB B   F ',
        '       B     F ',
        '             F ',
        '         B   F ',
        'BA FFFF  B   F ',
        'BBBBBBBBBBLLLF ',
    ],
    [
        '       F     G ',
        ' BLFFFLBLFFFLL ',
        ' B     F       ',
        ' B             ',
        ' B           F ',
        ' B  FLLLBBBBBB ',
        ' B  F       FB ',
        ' B  F B      B ',
        ' B  F F FFF  B ',
        ' BBBBBBBBBF  B ',
        '             B ',
        '             B ',
        '   A         B ',
        ' BBBBBBBBBBBBB ',
        '               ',
    ],
    [
        '     BBB      G',
        '     B BLFFFLLL',
        '  BLLB     L B ',
        '  L        L   ',
        'BLL  FLFLBBBBB ',
        'L    L   L   B ',
        'LLB  L   L   B ',
        '  L  L   BLF B ',
        '  LLBBB  L   B ',
        '         L   B ',
        '   FLLLLBBBBBB ',
        '   L    B B    ',
        ' A L BFFBBB    ',
        'BBBBBBBBB      ',
        '               ',
    ],
];

let started = false; // ゲーム開始済みフラグ

// タイルの個数
const tileNum = {
    x: 15,
    y: 15,
}

// 現在のステージの配列
let current = {
    stage: null, // ステージ
    drop: null, // 落下したピクセル数
    speed: null, // 落下する速さ
    updated: null, // 更新済みフラグ
    id: 0, // ステージID
    playing: false,
};

// プレイヤー
const player = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    g: 48,
    maxVy: 256,
    left: false,
    floor: false, // 接地中
    climb: false, // 登り中
    ceil: false,
    sx: 0, // 描画キャラ
    sy: 0,
    anim: 0,
    ftx: 0, // 接地しているタイル
    fty: 0,
    miss: 0,
    goal: 0,
};

// ステージ選択
const selectStage = (number) => {
    const s = stageData[number];

    current.stage = new Array(s.length);
    current.speed = new Array(s.length);
    current.drop = new Array(s.length);
    current.updated = new Array(s.length);
    for (let y = 0; y < s.length; y++) {
        current.stage[y] = new Array(s[y].length);
        current.speed[y] = new Array(s[y].length);
        current.drop[y] = new Array(s[y].length);
        current.updated[y] = new Array(s[y].length);
        for (let x = 0; x < s[y].length; x++) {
            const c = s[y].charAt(x); // そのブロックの文字

            // 上下左右にブロックがつながっているか
            const l = 0 < x  && s[y].charAt(x - 1) !== ' ' && s[y].charAt(x - 1) !== 'A' ? true : false;
            const r = x < 14 && s[y].charAt(x + 1) !== ' ' && s[y].charAt(x + 1) !== 'A' ? true : false;
            const u = 0 < y  && s[y - 1].charAt(x) !== ' ' && s[y - 1].charAt(x) !== 'A' ? true : false;
            const d = y < 14 && s[y + 1].charAt(x) !== ' ' && s[y + 1].charAt(x) !== 'A' ? true : false;
            const lr = l && r;
            const ud = u && d;
            const lr1 = !l && r || l && !r;
            const ud1 = !u && d || u && !d;

            if(c === ' ') { // 空白
                current.stage[y][x] = -1;
            } else if (c === 'A') { // スタート地点
                current.stage[y][x] = -1;
                player.x = x * sprite.cw;
                player.y = y * sprite.ch;
            }
            else if (c === 'B') current.stage[y][x] = 0;
            else if (c === 'L') current.stage[y][x] = 3;
            else if (c === 'F') current.stage[y][x] = 6;
            else if (c === 'G') current.stage[y][x] = 9;

            if(c !== ' ' && lr && !ud && !ud1) current.stage[y][x] += 1;
            if(c !== ' ' && !lr && ud && !lr1) current.stage[y][x] += 2;

            current.speed[y][x] = 0;
            current.drop[y][x] = 0;
            current.updated[y][x] = false;
        }
    }
};

// 触れているタイルを返す
const touchedTile = (y, x, selfY = null) => {

    const cw = sprite.cw;
    const ch = sprite.ch;

    if(
        x < 0 || canvas.width <= x ||
        y < 0 || canvas.height <= y
    )
    return {
        tile: -1,
        ty: Math.max(0, Math.min(Math.floor(y / ch), 14)),
        tx: Math.max(0, Math.min(Math.floor(x / cw), 14))
    };

    let tile = -1;
    let tx = Math.floor(x / cw);
    let ty = tileNum.y - 1;
    while(0 <= ty) {
        if(selfY !== null && selfY === ty) { // 自分自身なら上へパス
            if(0 < ty) ty--; else break;
            continue;
        }
        const s = current.stage[ty][tx];
        const d = current.drop[ty][tx];
        const fy = Math.floor((y - (ty * ch + d)) / ch); // 落ちてきているブロックのプレイヤーから見た相対的な縦位置

        if(fy === 0 && s > -1) { // 白以外なら終わり
            tile = s;
            break;
        }
        if(0 < ty) ty--; else break;
    }

    const py = ty * sprite.ch + current.drop[ty][tx];

    return {tile: tile, ty: ty, tx: tx, py: py};
};

// 赤くする、上下にも一瞬で伝染
const turnRed = (y, x) => {
    if (
        0 > current.stage[y][x] ||
        current.stage[y][x] >= 12
    ) return; // 空白などなら返す

    current.stage[y][x] += 12;
    current.updated[y][x] = true;
    let i;
    i = 1;
    while(0 <= y - i) { // 上方向に全部赤くする
        if(current.stage[y - i][x] < 0) break;
        if(current.stage[y - i][x] >= 12) break;
        current.stage[y - i][x] += 12;
        current.updated[y - i][x] = true;
        i++;
    }
    i = 1;
    while(y + i < tileNum.y - 1) { // 下方向に全部赤くする
        if(current.stage[y + i][x] < 0) break;
        if(current.stage[y + i][x] >= 12) break;
        current.stage[y + i][x] += 12;
        current.updated[y + i][x] = true;
        i++;
    }
}

// ステージの状態更新
const updateStage = (deltaTime, infection) => {
    if(player.goal) return;

    // 更新済みフラグをおろす、ブロックを落下させる
    for (let y = current.stage.length - 1; y >= 0; y--) {
        for (let x = 0; x < current.stage[y].length; x++) {
            current.updated[y][x] = false;
            if(current.speed[y][x] > 0) current.speed[y][x] += 1 / 128;
            if(current.speed[y][x] > 8) current.speed[y][x] = 8;
            const s = current.speed[y][x]; // スピード
            current.drop[y][x] += s * deltaTime; // 落下ピクセル
            if(player.floor && player.ftx === x && player.fty === y) player.y += s * deltaTime; // 乗っているプレイヤーも落下
        }
    }
    // ブロックがブロックに乗る
    for (let y = current.stage.length - 1; y >= 0; y--) {
        for (let x = 0; x < current.stage[y].length; x++) {
            const s = current.speed[y][x]; // スピード
            
            if(current.stage[y][x] >= 12) { // ブロックが乗ったブロックも落とす
                const t = touchedTile((y + 1) * sprite.ch + current.drop[y][x], x * sprite.cw, y); // 下端が触れているタイル
                const td = current.drop[t.ty][t.tx]; // 下端が触れているタイルの落ちたピクセル数
                const ts = current.speed[t.ty][t.tx]; // 下端が触れているタイルの落ちる速さ
                if(t.tile !== -1 && ts < s) {
                    current.speed[y][x] = ts; // 落ちる速度を下のものと同じにする
                    current.drop[y][x] = td + (t.ty - y - 1) * sprite.ch; // 位置を下のタイルの1つ上にする
                }
                if(t.tile !== -1 && t.tile < 12) { // 下端が触れたタイルが落ち始めていなかった場合は落とす
                    turnRed(t.ty, t.tx);
                }
            }
        }
    }

    if(!infection) return; // 伝染するタイミング
    for (let y = current.stage.length - 1; y >= 0; y--) {
        for (let x = 0; x < current.stage[y].length; x++) {
            if(current.updated[y][x]) continue;
            const n = current.stage[y][x];
            // 崩れているタイルだったら伝染
            if(12 <= n) {
                if(current.speed[y][x] === 0) current.speed[y][x] += 1 / 64; // 落下開始
                if(0 < x) turnRed(y, x - 1);
                if(x < tileNum.x - 1) turnRed(y, x + 1);
            }
        }
    }
}

// 物に当たった時の処理
const hit = () => {
    if(player.miss) return;
    if(player.goal) return;

    // ブロックのピクセル幅
    const cw = sprite.cw;
    const ch = sprite.ch;
    // 関数
    const f = Math.floor;
    const max = Math.max;
    const min = Math.min;
    const w = canvas.width - 1
    const h = canvas.height - 1
    // 全てのブロックの種類の数
    const dn = 3;
    const tn = 4;
    const bn = dn * tn;
    // タイル番号
    const block = 0;
    const line = 1;
    const flipper = 2;
    const goal = 3;

    player.floor = false; // 着地フラグをおろす

    let climb = false;

    let r0, r1;
    // 左の壁を登る
    r0 = touchedTile(player.y + ch * 3 / 4, player.x - 1);
    r1 = touchedTile(player.y + ch * 1 / 4, player.x - 1);
    if(
        player.vx < 0 &&
        (
            f(r0.tile / dn % tn) === block ||
            f(r1.tile / dn % tn) === block
        )
    ) {
        if(r0.tile !== -1) turnRed(r0.ty, r0.tx);
        if(r1.tile !== -1) turnRed(r1.ty, r1.tx);
        player.vx = 0;
        player.x = (r0.tx + 1) * cw;
        player.vy = -48;
        climb = true;
        if(player.climb === false) {
            sound.play(62, 0.05, 57);
            player.anim = 0;
        }
    }
    // 右の壁を登る
    r0 = touchedTile(player.y + ch * 3 / 4, player.x + cw);
    r1 = touchedTile(player.y + ch * 1 / 4, player.x + cw);
    if(
        0 < player.vx &&
        (
            f(r0.tile / dn % tn) === block ||
            f(r1.tile / dn % tn) === block
        )
    ) {
        if(r0.tile !== -1) turnRed(r0.ty, r0.tx);
        if(r1.tile !== -1) turnRed(r1.ty, r1.tx);
        player.vx = 0;
        player.x = (r0.tx - 1) * cw;
        player.vy = -48;
        climb = true;
        if(player.climb === false) {
            sound.play(62, 0.05, 57);
            player.anim = 0;
        }
    }

    player.climb = climb; // 壁登りフラグをおろす

    // 足元に接地
    r0 = touchedTile(player.y + ch, player.x + 4);
    r1 = touchedTile(player.y + ch, player.x + cw - 1 - 4);
    if(
        !player.climb &&
        player.vy > 0 &&
        (
            f(r0.tile / dn % tn) === block ||
            f(r1.tile / dn % tn) === block
        )
    ) {
        const t0 = f(r0.tile / dn % tn);
        const t1 = f(r1.tile / dn % tn);

        // 左右の足どちらが乗っているか
        let t = -1;
        if(t0 === block && t1 !== block) t = 0;
        if(t0 !== block && t1 === block) t = 1;
        if(t0 === block && t1 === block && r0.py < r1.py) t = 0;
        if(t0 === block && t1 === block && r0.py >= r1.py) t = 1;

        let y = (t === 0 ?
            r0.py - ch:
            r1.py - ch);

        if(t === 0) turnRed(r0.ty, r0.tx);
        if(t === 1) turnRed(r1.ty, r1.tx);

        player.vy = 0;
        player.y = y;

        if(player.fty === -1) sound.play(55, 0.05, 50); // 接地時の音

        player.ftx = t === 0 ? r0.tx : r1.tx ;
        player.fty = t === 0 ? r0.ty : r1.ty ;
        player.floor = true;
    } else {
        // 接地してない
        player.ftx = -1;
        player.fty = -1;
    }

    player.ceil = false;

    // 天井に当たる
    r0 = touchedTile(player.y, player.x + cw / 2);
    if(
        player.vy < 0 &&
        f(r0.tile / dn % tn) === block
    ) {
        turnRed(r0.ty, r0.tx);
        player.vy = 0;
        const y = r0.py + ch;
        player.y = y;
        player.ceil = true;
    }

    // 上下から挟まれたらミス
    if(player.floor && f(r0.tile / dn % tn) === block) {
        player.miss = 120;
        player.vy = -32;
        sound.play(39, 0.4, 27);
    }

    r0 = touchedTile(player.y + ch / 2, player.x + cw / 2); // プレイヤーの中央

    // フリッパー
    if(
        f(r0.tile / dn % tn) === flipper
    ) {
        player.miss = 120;
        player.vy = -32;
        sound.play(39, 0.4, 27);
    }

    // ゴール
    if(
        f(r0.tile / dn % tn) === goal &&
        !player.miss
    ) {
        player.goal = 180;
        player.vy = 0;
        sound.play(63, 0.2, 75);
    }
};

// アニメーション
const anim = (deltaTime) => {
    const climbAnimSpeed = 12 * deltaTime;
    const floorAnimSpeed = 12 * deltaTime;

    if(player.climb) player.anim += climbAnimSpeed;
    else if(player.vx !== 0 && player.floor) player.anim += floorAnimSpeed;
    if(!player.floor && !player.climb) player.anim = 0;

    // 描画キャラ
    if(player.miss) {
        player.sx = 1;
        player.sy = 2;
    }else
    if(player.goal) {
        player.sx = 3;
        player.sy = 2;
    }else
    if(player.climb) {
        player.sx = 1 + Math.floor(player.anim % 3);
        player.sy = 1;
        if(player.anim % 3 - climbAnimSpeed < 0) sound.play(62, 0.05, 57);
    } else
    if(player.floor) {
        player.sx = player.vx === 0 ? 0 : 1 + Math.floor(player.anim % 3);
        player.sy = 0;
        if(player.vx !== 0 && player.anim % 3 - floorAnimSpeed < 0) sound.play(55, 0.05, 50);
    } else {
        player.sx = 0;
        player.sy = 2;
    }
};

// プレイヤー更新
const updatePlayer = (deltaTime) => {
    if(player.goal) return;

    // 重力によって下に加速
    player.vy += player.g * deltaTime;

    // 縦の最高速度
    if(player.maxVy < player.vy) player.vy = player.maxVy;
    if(player.vy < -player.maxVy) player.vy = -player.maxVy;

    // 左右移動
    const walkSpeed = 48;
    player.vx = 0;
    if(input.left && !input.right) {
        player.vx = -walkSpeed;
        player.left = true;
    }
    if(!input.left && input.right) {
        player.vx = walkSpeed;
        player.left = false;
    }

    // 位置に速度を加算
    player.y += player.vy * deltaTime;
    player.x += player.vx * deltaTime;

    // 下に落下した
    if(canvas.height <= player.y && !player.miss) {
        player.miss = true;
        sound.play(39, 0.4, 27);
    }
}

// 描画
const draw = () => {
    screen.clear('#FFF');

    // ステージ
    for (let y = 0; y < current.stage.length; y++) {
        for (let x = 0; x < current.stage[y].length; x++) {
            const i = current.stage[y][x];
            const d = current.drop[y][x];
            let sx = i % 3;
            let sy = Math.floor(i / 3);
            screen.draw(sprite,
                sx * sprite.cw, sy * sprite.ch,
                sprite.cw, sprite.ch,
                x * sprite.cw,
                y * sprite.ch + Math.floor(d),
                false, false
            );
        }
    }

    // プレイヤー
    screen.draw(sprite,
        (4 + player.sx) * sprite.cw,
        (0 + player.sy) * sprite.ch,
        sprite.cw,
        sprite.ch,
        Math.floor(player.x),
        Math.floor(player.y),
        player.left,
        false
    );
};


// ステージセレクト中
const select = (deltaTime) => {
    if(input.left === 1) current.id--;
    if(input.right === 1) current.id++;

    // ステージの最大数を超えたら動かなくする
    if(current.id < 0) current.id = 0;
    if(stageData.length <= current.id) current.id = stageData.length - 1;

    if(input.left === 1 || input.right === 1) {
        sound.play(46, 0.05, 46);
        achieverButton.textContent = current.id;
        selectStage(current.id);
    }
};


// プレイ中ずっと呼ばれる関数
const play = (deltaTime) => {
    // ステージ更新
    const speed = 4;
    let infection = false
    if(Math.floor(time * speed) !== Math.floor(prevTime * speed)) infection = true;
    updateStage(deltaTime, infection);

    updatePlayer(deltaTime); // プレイヤー更新
    hit(); // あたり判定
    anim(deltaTime); // アニメーション
};

selectStage(current.id);

let prevTimestamp = 0; // 前回フレームのタイムスタンプ
let time = 0;
let prevTime = 0;

// アニメーションフレーム
const frame = (timestamp) => {
    requestAnimationFrame(frame);
    const deltaTime = (timestamp - prevTimestamp) / 1000;
    prevTime = time;
    time += deltaTime;

    if(current.playing) play(deltaTime);
    else select(deltaTime);

    draw();

    // フレームごとに増えるボタンを押しているかのメンバー
    if(input.left) input.left++;
    if(input.right) input.right++;

    prevTimestamp = timestamp;
}
requestAnimationFrame(frame);

const input = {
    left: 0,
    right: 0,
}

const sound = new Sound();

// イベントのメソッド
const eventFunction = {
    down: {
        left : () => {
            if(!started) return;
            input.left = 1;
            leftButton.className = 'down';
        },
        right : () => {
            if(!started) return;
            input.right = 1;
            rightButton.className = 'down';
        },
        // スタートストップボタン
        achiever : () => {
            if(!started) return;

            // 開始した時
            if(achieverButton.className === 'select') {
                achieverButton.className = '';
                current.playing = true;
                sound.play(51, 0.1, 51);
            } else { // やりなおした時
                achieverButton.className = 'select';
                current.playing = false;
                player.sx = 0;
                player.sy = 0;
                player.anim = 0;
                player.vx = 0;
                player.vy = 0;
                player.ftx = 0;
                player.fty = 0;
                player.floor = false;
                player.climb = false;
                player.ceil = false;
                player.left = false;
                player.miss = false;
                player.goal = false;
                selectStage(current.id);
                sound.play(39, 0.1, 39);
            }
        },
    },
    up: {
        left : () => {
            if(!started) return;
            input.left = 0;
            leftButton.className = '';
        },
        right : () => {
            if(!started) return;
            input.right = 0;
            rightButton.className = '';
        },
    },
}

// キーボード
addEventListener('keydown', (e) => {
    if(e.key === 'a') eventFunction.down.left();
    if(e.key === 'd') eventFunction.down.right();
    if(e.key === 'ArrowLeft') eventFunction.down.left();
    if(e.key === 'ArrowRight') eventFunction.down.right();
    if(e.key === ' ') eventFunction.down.achiever();
    if(e.key === 'Enter') eventFunction.down.achiever();
});
addEventListener('keyup', (e) => {
    if(e.key === 'a') eventFunction.up.left();
    if(e.key === 'd') eventFunction.up.right();
    if(e.key === 'ArrowLeft') eventFunction.up.left();
    if(e.key === 'ArrowRight') eventFunction.up.right();
});

// マウス
leftButton.addEventListener('mousedown', eventFunction.down.left);
leftButton.addEventListener('mouseup', eventFunction.up.left);
leftButton.addEventListener('mouseleave', eventFunction.up.left);
rightButton.addEventListener('mousedown', eventFunction.down.right);
rightButton.addEventListener('mouseup', eventFunction.up.right);
rightButton.addEventListener('mouseleave', eventFunction.up.right);
achieverButton.addEventListener('mousedown', eventFunction.down.achiever);

// タッチ
leftButton.addEventListener('touchstart', eventFunction.down.left);
leftButton.addEventListener('touchend', eventFunction.up.left);
rightButton.addEventListener('touchstart', eventFunction.down.right);
rightButton.addEventListener('touchend', eventFunction.up.right);

// タイトルを押した
titleButton.addEventListener('click', () => {
    sound.start();
    title.classList.add('none');
    main.classList.remove('none');
    started = true;
});

// 右クリック・長押し禁止
document.addEventListener('contextmenu', () => {
    return false;
});

// 画面が離れた時の処理
document.addEventListener('visibilitychange', (e) => {
    if (document.hidden) {
        achieverButton.className = 'select';
        current.playing = false;
        player.sx = 0;
        player.sy = 0;
        player.anim = 0;
        player.vx = 0;
        player.vy = 0;
        player.left = false;
        player.miss = false;
        player.goal = false;
        selectStage(current.id);
        title.classList.remove('none');
        main.classList.add('none');
        sound.isStarted = false; // 音声を再設定しないと止まる
    }
});