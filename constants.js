const canvas = document.getElementById("field");
const ctx = canvas.getContext("2d");

const h = 40;
const w = 10;

const visibleH = 20;

const blockSize = 20;
const nextBlockSize = 10;
const holdBlockSize = 15;

const blockSizeOutline = blockSize+1;
const nextBlockSizeOutline = nextBlockSize+1;
const holdBlockSizeOutline = holdBlockSize+1;

const xOffset = 100;
const yOffset = 20;

const nextXOffset = xOffset 
                    + blockSizeOutline*w 
                    + 20;
const nextYOffset = yOffset;
const distBtwNexts = 3*nextBlockSizeOutline;

const holdXOffset = xOffset - 80;
const holdYOffset = yOffset;

const DAS = 12;
const ARR = 2;
const entryDelay = 6;

const lineClearFrames = 20;

const GRAVITY = [
    1.0,
    0.93,
    0.6178,
    0.47273,
    0.3552,
    0.262,
    0.18968,
    0.13473,
    0.09388,
    0.06415,
    0.04298,
    0.02822,
    0.01815,
    0.01114,
    0.00706,
    0.00421,
    0.00252,
    0.00146,
    0.00082,
    0.00046
]

const KEY = {
    SHIFT:  16,     //hold
    CTRL:   17,     //rotate counterclockwise
    SPACE:  32,     //harddrop
    LEFT:   37,
    UP:     38,     //rotate clockwise
    RIGHT:  39,
    DOWN:   40,     //softdrop
    C:      67,     //hold
    G:      78,     //Toggle Ghost
    P:      80,     //Pause
    X:      88,     //rotate clockwise
    Z:      90      //rotate counterclockwise
};

const KEYSTATES = {
    LR: 0,
    L : 1,
    R : 2,
    UZ : 3,
    U : 4,
    Z : 5
};

const DRAWMODE = {
    DRAWPIECE: 0,
    HIDEPIECE: 1,
    DRAWGHOST: 2,
    HIDEGHOST: 3
}

const colorMap =  [
                    "rgb(000,240,000)",     //S
                    "rgb(240,000,000)",     //Z
                    "rgb(160,000,241)",     //T
                    "rgb(239,160,000)",     //L
                    "rgb(000,000,240)",     //J
                    "rgb(054,101,102)",     //I
                    "rgb(240,240,000)"      //O
                ];

const black =     "rgb(000,000,000)";
const guideline = "rgb(040,040,040)";
const ghost =     "rgb(080,080,080)";
const lineClearWhite = "rgba(255,255,255,0.15)";
const lineClearBlack = "rgba(000,000,000,0.15)";

const pieceMap = [
    [ 0x6C00, 0x4620, 0x06C0, 0x8C40 ], // 'S' 
    [ 0xC600, 0x2640, 0x0C60, 0x4C80 ], // 'Z' 
    [ 0x4E00, 0x4640, 0x0E40, 0x4C40 ], // 'T' 
    [ 0x2E00, 0x4460, 0xE800, 0xC440 ], // 'L' 
    [ 0x8E00, 0x6440, 0xE200, 0x44C0 ], // 'J' 
    [ 0x0F00, 0x2222, 0x00F0, 0x4444 ], // 'I' 
    [ 0x6600, 0x6600, 0x6600, 0x6600 ]  // 'O'
];

const moves = {
    [KEY.LEFT]: p=>({...p,x:p.x-1}),
    [KEY.RIGHT]: p=>({...p,x:p.x+1}),
    [KEY.DOWN]: p=>({...p,y:p.y+1}),
}

const Offsets = [
    [[0,0],[-1,0],[-1, 1],[0,-2],[-1,-2]],  // 0 -> 1
    [[0,0],[ 1,0],[ 1,-1],[0, 2],[ 1, 2]],  // 1 -> 0
    [[0,0],[ 1,0],[ 1,-1],[0, 2],[ 1, 2]],  // 1 -> 2
    [[0,0],[-1,0],[-1, 1],[0,-2],[-1,-2]],  // 2 -> 1
    [[0,0],[ 1,0],[ 1, 1],[0,-2],[ 1,-2]],  // 2 -> 3
    [[0,0],[-1,0],[-1,-1],[0, 2],[-1, 2]],  // 3 -> 2
    [[0,0],[-1,0],[-1,-1],[0, 2],[-1, 2]],  // 3 -> 0
    [[0,0],[ 1,0],[ 1, 1],[0,-2],[ 1,-2]],  // 0 -> 3 
];

const IOffsets = [
    [[0,0],[-2,0],[ 1,0],[-2,-1],[ 1, 2]],  // 0 -> 1
    [[0,0],[ 2,0],[-1,0],[ 2, 1],[-1,-2]],  // 1 -> 0
    [[0,0],[-1,0],[ 2,0],[-1, 2],[ 2,-1]],  // 1 -> 2
    [[0,0],[ 1,0],[-2,0],[ 1,-2],[-2, 1]],  // 2 -> 1
    [[0,0],[ 2,0],[-1,0],[ 2, 1],[-1,-2]],  // 2 -> 3
    [[0,0],[-2,0],[ 1,0],[-2,-1],[ 1, 2]],  // 3 -> 2
    [[0,0],[ 1,0],[-2,0],[ 1,-2],[-2, 1]],  // 3 -> 0
    [[0,0],[-1,0],[ 2,0],[-1, 2],[ 2,-1]],  // 0 -> 3
];