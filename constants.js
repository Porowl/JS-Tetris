const canvas = document.getElementById("field");
const ctx = canvas.getContext("2d");
const canvas2 = document.getElementById("infos");
const ctx2 = canvas2.getContext("2d");

const BOARD_HEIGHT  = 40;
const BOARD_WIDTH   = 10;

const VISIBLE_HEIGHT = 20;

const BLOCK_SIZE = 20;
const NEXT_BLOCK_SIZE = 10;
const HOLD_BLOCK_SIZE = 15;

const BLOCK_SIZE_OUTLINE = BLOCK_SIZE+2;
const NEXT_BLOCK_SIZE_OUTLINE = NEXT_BLOCK_SIZE+1;
const HOLD_BLOCK_SIZE_OUTLINE = HOLD_BLOCK_SIZE+1;

const X_OFFSET = 120;
const Y_OFFSET = 20;

const BOARD_CENTER_X = X_OFFSET + BLOCK_SIZE_OUTLINE*5;
const BOARD_CENTER_Y = Y_OFFSET + BLOCK_SIZE_OUTLINE*10;
const BOARD_END_Y = Y_OFFSET + BLOCK_SIZE_OUTLINE*20;

const NEXT_X_OFFSET = X_OFFSET 
                    + BLOCK_SIZE_OUTLINE*BOARD_WIDTH
                    + 30;
const NEXT_Y_OFFSET = Y_OFFSET;
const DIST_BTW_NEXTS = 3*NEXT_BLOCK_SIZE_OUTLINE;

const HOLD_X_OFFSET = X_OFFSET - 95;
const HOLD_Y_OFFSET = Y_OFFSET;

const PLAYER_OFFSET = 500;


const DAS = 12;
const ARR = 2;
const ENTRY_DELAY = 6;

const LINE_CLEAR_FRAMES = 20;

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

const SCORE = {
    SINGLE: 1,
    DOUBLE: 2,
    TRIPLE: 3,
    TETRIS: 4,
    MTS: 5,
    MTSS: 6,
    TS: 7,
    TSS: 8,
    TSD: 9,
    TST: 10,
    PERFECT: 11
}


const COLOR_MAP =  [
                    "rgb(000,240,000)",     //S
                    "rgb(240,000,000)",     //Z
                    "rgb(160,000,241)",     //T
                    "rgb(239,160,000)",     //L
                    "rgb(000,000,240)",     //J
                    "rgb(000,224,187)",     //I
                    "rgb(240,240,000)"      //O
                ];

const P1_COLORS = [
                "rgb(000,161,224)",
                "rgb(004,107,148)"
            ];

const P2_COLORS = [
                "rgb(225,154,046)",
                "rgb(181,112,038)"
            ];

const COLOR_BLACK =         "rgb(000,000,000)";
const COLOR_GREY =          "rgb(040,040,040)";
const COLOR_WHITE =         "rgb(255,255,255)";
const COLOR_GHOST =         "rgb(080,080,080)";
const LINE_CLEAR_WHITE =    "rgba(255,255,255,0.15)";
const LINE_CLEAR_BLACK =    "rgba(000,000,000,0.15)";

const PIECE_MAP = [
    [ 0x6C00, 0x4620, 0x06C0, 0x8C40 ], // 'S' 
    [ 0xC600, 0x2640, 0x0C60, 0x4C80 ], // 'Z' 
    [ 0x4E00, 0x4640, 0x0E40, 0x4C40 ], // 'T' 
    [ 0x2E00, 0x4460, 0xE800, 0xC440 ], // 'L' 
    [ 0x8E00, 0x6440, 0xE200, 0x44C0 ], // 'J' 
    [ 0x0F00, 0x2222, 0x00F0, 0x4444 ], // 'I' 
    [ 0x6600, 0x6600, 0x6600, 0x6600 ]  // 'O'
];

const MOVES = {
    [KEY.LEFT]: p=>({...p,x:p.x-1}),
    [KEY.RIGHT]: p=>({...p,x:p.x+1}),
    [KEY.DOWN]: p=>({...p,y:p.y+1}),
}

const OFFSETS = [
    [[0,0],[-1,0],[-1, 1],[0,-2],[-1,-2]],  // 0 -> 1
    [[0,0],[ 1,0],[ 1,-1],[0, 2],[ 1, 2]],  // 1 -> 2
    [[0,0],[ 1,0],[ 1, 1],[0,-2],[ 1,-2]],  // 2 -> 3
    [[0,0],[-1,0],[-1,-1],[0, 2],[-1, 2]],  // 3 -> 0

    [[0,0],[ 1,0],[ 1,-1],[0, 2],[ 1, 2]],  // 1 -> 0
    [[0,0],[-1,0],[-1, 1],[0,-2],[-1,-2]],  // 2 -> 1
    [[0,0],[-1,0],[-1,-1],[0, 2],[-1, 2]],  // 3 -> 2
    [[0,0],[ 1,0],[ 1, 1],[0,-2],[ 1,-2]]  // 0 -> 3 
];

const I_PIECE_OFFSETS = [
    [[0,0],[-2,0],[ 1,0],[-2,-1],[ 1, 2]],  // 0 -> 1
    [[0,0],[-1,0],[ 2,0],[-1, 2],[ 2,-1]],  // 1 -> 2
    [[0,0],[ 2,0],[-1,0],[ 2, 1],[-1,-2]],  // 2 -> 3
    [[0,0],[ 1,0],[-2,0],[ 1,-2],[-2, 1]],  // 3 -> 0

    [[0,0],[ 2,0],[-1,0],[ 2, 1],[-1,-2]],  // 1 -> 0
    [[0,0],[ 1,0],[-2,0],[ 1,-2],[-2, 1]],  // 2 -> 1
    [[0,0],[-2,0],[ 1,0],[-2,-1],[ 1, 2]],  // 3 -> 2
    [[0,0],[-1,0],[ 2,0],[-1, 2],[ 2,-1]]  // 0 -> 3
];