const canvas = document.getElementById("field");
const ctx = canvas.getContext("2d");

const h = 40;
const visibleH = 20;
const w = 10;
const blockSize = 20;
const blockSizeOutline = 21;
const xOffset = 100;
const yOffset = 20;

const DAS = 24;
const ARR = 4;
const entryDelay = 12;

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
    SPACE: 32,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    G: 78,
    P: 80
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

const pieceMap = [

//S
[
    [0,1,1],
    [1,1,0],
    [0,0,0],
],

//Z
[
    [2,2,0],
    [0,2,2],
    [0,0,0],
],

//T
[
    [0,2,0],
    [2,2,2],
    [0,0,0],
],

//L
[
    [0,0,3],
    [3,3,3],
    [0,0,0],
],
//J
[
    [4,0,0],
    [4,4,4],
    [0,0,0],
],

//I
[
    [0,0,0,0],
    [5,5,5,5],
    [0,0,0,0],
    [0,0,0,0]
],
//O
[
    [6,6],
    [6,6]
],

]

const rotateOffsets = [
    [[0,0],[-1,0],[-1, 1],[0,-2],[-1,-2]],
    [[0,0],[ 1,0],[ 1,-1],[0, 2],[ 1, 2]],
    [[0,0],[ 1,0],[ 1,-1],[0, 2],[ 1, 2]],
    [[0,0],[-1,0],[-1, 1],[0,-2],[-1,-2]],
    [[0,0],[ 1,0],[ 1, 1],[0,-2],[ 1,-2]],
    [[0,0],[-1,0],[-1,-1],[0, 2],[-1, 2]],
    [[0,0],[-1,0],[-1,-1],[0, 2],[-1, 2]],
    [[0,0],[ 1,0],[ 1, 1],[0,-2],[ 1,-2]],
];

const rotateIOffsets = [
    [[0,0],[-2,0],[ 1,0],[-2,-1],[ 1, 2]],
    [[0,0],[ 2,0],[-1,0],[ 2, 1],[-1,-2]],
    [[0,0],[-1,0],[ 2,0],[-1, 2],[ 2,-1]],
    [[0,0],[ 1,0],[-2,0],[ 1,-2],[-2, 1]],
    [[0,0],[ 2,0],[-1,0],[ 2, 1],[-1,-2]],
    [[0,0],[-2,0],[ 1,0],[-2,-1],[ 1, 2]],
    [[0,0],[ 1,0],[-2,0],[ 1,-2],[-2, 1]],
    [[0,0],[-1,0],[ 2,0],[-1, 2],[ 2,-1]],
];