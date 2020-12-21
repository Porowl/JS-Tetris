var board;
var boardView;
var UserStorage;
var piece;
var LineArr;

var initDelay = 0;
var LRframeCount = 0;
var RotateFrameCount = 0;
var last, now;

var dropRate = 0;
var lockDelay = 0;
var lineClearDelay = -1;

var gravity;
var ghostSwitch = true;
var requestId;
var lastTSpinTest = 0;


var farmeCount = 0;


var repeated, held, gameStarted;
gameStarted = repeated = held = false;

/**
 * 메인 페이지 로딩이 완료되면 실행되는 함수로써 
 * keydown 이벤트와 keyup 이벤트 생성 후
 * requestAnimationFrame 함수 호출을 위한 타임스탬프 기준을 찍은 후
 * 해당 함수를 불러옵니다.
 */
const init = () =>
{
    resize();
    window.addEventListener('load', resize, false);
    window.addEventListener('resize', resize, false);
    document.addEventListener('keydown',event=>
    {
        if(!gameStarted) return;
        UserStorage.keyMap[event.keyCode] = true;
    });

    document.addEventListener('keyup',event=>
    {
        if(!gameStarted) return;
        if(event.keyCode == KEY.SPACE) return;
        else if(event.KeyCode == KEY.SHIFT) return;
        else if(event.KeyCode == KEY.C) return;
        UserStorage.keyMap[event.keyCode] = false;
    });

    board = new Board(0);
    boardView = new BoardView(ctx, ctx2, 0);
    boardView.draw(board.field);
}
const countDown = () => {
    UserStorage = new storage(); 
    updateScore()
    document.getElementById("main").hidden = true;
    setTimeout(()=>{boardView.countDown(3)},0);
    setTimeout(()=>{boardView.countDown(2)},1000);
    setTimeout(()=>{boardView.countDown(1)},2000);
    setTimeout(()=>{boardView.countDown(0)},3000);
    setTimeout(gameStart,3000);
}
const gameStart = () => {
    gameStarted = true;
    piece = new Piece(UserStorage.newPiece());
    updatePiece(piece);
    updateNexts();

    now = last = timeStamp();

    gravity = UserStorage.getGravity();

    requestId = requestAnimationFrame(animate);
}
const resize = () =>{
    var ratio = canvas.width/ canvas.height;
    var ch = window.innerHeight;
    var cw = ch*ratio;
    if(cw>window.innerWidth)
    {
        cw = Math.floor(window.innerWidth);
        ch = Math.floor(cw/ratio);
    }
    if(window.innerWidth>1024)
    {
        cw = 1024;
        ch = 768;
    }
    canvas.style.width = cw;
    canvas.style.height = ch;
    canvas2.style.width = cw;
    canvas2.style.height = ch;
}
/**
 * requestAnimtationFrame 호출 간 시간 계산 및 재호출 함수입니다.
 * 산출된 계산 dt (기준 1s) 를 update 함수로 보내 후에
 * 계산될 게임 진행이 될 수 있도록 합니다.
 */
const animate = () =>
{
    now = timeStamp();
    var dt = (now-last)/1000.0;
    last = now;

    update(Math.min(1,dt));
    if(requestId) requestID = requestAnimationFrame(animate);
}

/**
 * 한 번 호출 될 때마다 게임을 진행시킵니다.
 * dt는 자동으로 계산되어 animate 함수로부터 넘어옵니다.
 * @param {number} dt 시간차
 */
const update = dt =>{
    if(lineClearDelay>0)
    {
        lineClearDelay--;
        for(var i = 0; i<LineArr.lines.length;i++)
            boardView.clearAnimation(LineArr.lines[i], lineClearDelay);
        return;
    }
    else if(lineClearDelay==0)
    {
        for(var i = 0; i<LineArr.lines.length;i++)
            board.clearLine(LineArr.lines[i]);
        boardView.draw(board.field);

        updateClearedLines(LineArr.lines.length);
        calcScore();
        updateScore();

        getNewPiece();
        checkTopOut();
    }

    initDelay--;
    inputCycle();

    if((piece.hardDropped||lockDelay>0.5)&&!board.canMoveDown(piece))
    {   
        lock(); 
    }

    if(lineClearDelay>0) return;
    if(initDelay>0) return;

    moveDownCycle(dt);
    
    if(!board.canMoveDown(piece))
    {
        lockDelay += dt;
    } 
    else 
    {
        lockDelay = 0;
    }
    
}
/* ~~~~~~~~~~~~~~~~~~~~MOVEMENTS~~~~~~~~~~~~~~~~~~~~ */

/**
 * 각 프레임마다 유저의 키 입력을 읽습니다.
 */
const inputCycle = () =>
{
    moveLR();
    rotate();
    hold();
    hardDrop();
}

/**
 * 하드 드롭을 실행합니다.
 */
const hardDrop = () =>
{
    if(UserStorage.keyMap[KEY.SPACE])
    {
        let p = {...piece};
        let counter = 0;
        while(board.canMoveDown(p))
        {
            p.y++;
            counter++;
        }
        updatePiece(p);
        UserStorage.addDropScore(counter*2)

        piece.hardDropped = true;
        UserStorage.keyMap[KEY.SPACE] = false;
        UserStorage.keyMap[KEY.H] = false;
    }
}

/**
 * 자동으로 블럭이 내려가는 논리 함수입니다.
 */
const moveDownCycle = dt =>
{
    if(UserStorage.keyMap[KEY.DOWN]&&gravity>2/60)
    {
        if(moveDown()){
            UserStorage.addDropScore(1)
            updateScore();
        } 
        return;
    }
    dropRate += dt;
    while(dropRate>gravity){
        dropRate -= gravity;
        moveDown();
    }
}

/**
 * 블럭을 내리는 함수입니다.
 */
const moveDown = () =>
{
    if(board.canMoveDown(piece))
    {

        let p = MOVES[KEY.DOWN](piece);
        updatePiece(p);
        return true;
    }
    return false;
}

/**
 * 블럭을 양 옆으로 움직이는 논리 함수입니다.
 */
const moveLR = () =>
{
    let p;
    let key;
    switch(UserStorage.checkLR())
    {
        case KEYSTATES.LR:
            LRframeCount++;
            break;
        case KEYSTATES.L:
            if(!key) key = KEY.LEFT;            
        case KEYSTATES.R:
            if(!key) key = KEY.RIGHT;
            if(LRframeCount==0
                ||
                LRframeCount>=DAS
                    ?(LRframeCount-DAS)%ARR==0
                    :false)
            {
                p = MOVES[key](piece);
            }
            LRframeCount++;
            break;
        default:
            LRframeCount = 0;
    }
    if(p){
        if(board.valid(p))
        {
            updatePiece(p);
        }    
    }
}

/**
 * 블럭을 회전시키는 논리 함수입니다.
 */
const rotate = () =>
{
    let state = UserStorage.checkRot();
    if(state == KEYSTATES.UZ)
    {
        RotateFrameCount++;
    }
    else if (state == KEYSTATES.U)
    {
        if(RotateFrameCount==0
            ||
            RotateFrameCount>=DAS
                ?(RotateFrameCount-DAS)%ARR==0
                :false)
        {
           rotateAc(0);
        }
        RotateFrameCount++;
    }
    else if (state == KEYSTATES.Z)
    {
        if(RotateFrameCount==0
            ||
            RotateFrameCount>=DAS
                ?(RotateFrameCount-DAS)%ARR==0
                :false)
        {
           rotateAc(1);
        }
        RotateFrameCount++;
    } 
    else 
    {
        RotateFrameCount = 0;
    }
}

/**
 * 블럭을 회전하는 함수입니다.
 * @param {number} a 0 은 시계방향, 1은 반시계방향을 의미합니다.
 */
const rotateAc = a =>
{
    let p;
    let test = 0;
    let next = (a==0)?(piece.rotation+1)%4:(piece.rotation-1);
    if(next<0) next+=4;
    do
    {
        p = {...piece, 
                x: piece.x + (piece.typeId===5?I_OFFSETS:OFFSETS)[piece.rotation+a*4][test][0],
                y: piece.y - (piece.typeId===5?I_OFFSETS:OFFSETS)[piece.rotation+a*4][test][1], 
                rotation: next,
                shape: PIECE_MAP[piece.typeId][next],
                lastMove: LAST_MOVE.SPIN,
                rotTest: test
            };
        test++;
    } while(!board.valid(p)&&test<5)

    if(p)
    {
        if(board.valid(p))
        {
            updatePiece(p)
            lastTSpinTest = test;
        };
    }
}

/**
 * 블럭을 '저장'하는 함수입니다.
 */
const hold = () =>
{
    if(!UserStorage.checkHold()) return;
    if(!repeated)
    {
        if(!held)
        {
            held = true;
            UserStorage.hold = piece.typeId;
            boardView.drawPiece(piece, DRAWMODE.HIDEPIECE);
            boardView.drawPiece(piece, DRAWMODE.HIDEGHOST, board.getGhostIndex(piece));
            getNewPiece();
        }
        else
        {
            var temp = UserStorage.hold;
            var a = piece.typeId;
            boardView.drawHold(a,DRAWMODE.DRAWGHOST);
            UserStorage.hold = a;
            var p = new Piece(temp);
            updatePiece(p);
            piece = p;
        }
        repeated = true;
    }
    UserStorage.keyMap[KEY.SHIFT] = false;
    UserStorage.keyMap[KEY.C] = false;
}

/* ~~~~~~~~~~~~~~~~~~~~ LOGICS ~~~~~~~~~~~~~~~~~~~~ */

/**
 * 블럭을 필드에 고정시키는 함수입니다.
 */
const lock = () => 
{
    lockDelay = 0;
    dropRate = 0;
    LineArr = board.lock(piece);
    if(LineArr.lines.length==0){
        lineClearDelay = 0;
        return;
    }
    lineClearDelay = LINE_CLEAR_FRAMES;
}

/**
 * 게임 오버를 확정짓는 함수입니다.
 */
const checkTopOut = () =>
{
    if(!board.valid(piece))
    {
        cancelAnimationFrame(requestId);
        requestId = undefined;
    }
}

/**
 * 새로운 블럭을 가져오는 함수입니다.
 */
const getNewPiece = () =>
{
    piece = new Piece(UserStorage.newPiece());
    boardView.drawHold(UserStorage.hold,DRAWMODE.DRAWPIECE);
    updatePiece(piece);
    updateNexts();
    repeated = false;
    initDelay = ENTRY_DELAY;
    lineClearDelay = -1;
}

const timeStamp = () =>
{
    return new Date().getTime();
}

/* ~~~~~~~~~~~~~~~~~~~~ GRAPHICS & INFOS ~~~~~~~~~~~~~~~~~~~~ */

/**
 * 블럭 이동을 그래픽적으로 표시합니다.
 * @param {Piece} p 이동 목표인 블럭 p 입니다.
 */
const updatePiece = p =>
{
    if(ghostSwitch) boardView.drawPiece(piece, DRAWMODE.HIDEGHOST, board.getGhostIndex(piece));
    boardView.drawPiece(piece, DRAWMODE.HIDEPIECE);
    
    piece.move(p);

    if(ghostSwitch) boardView.drawPiece(p, DRAWMODE.DRAWGHOST, board.getGhostIndex(p));
    boardView.drawPiece(piece, DRAWMODE.DRAWPIECE);
}

/**
 * 다음 블럭 n 개를 표시합니다. n은 설정을 통해 최대 6개까지 표시할 수 있습니다.
 */
const updateNexts = () =>
{
boardView.refreshNexts();
    let arr = UserStorage.nextPieces()
    for(var i = 0; i<Math.max(UserStorage.nexts,6); i++)
    {
        boardView.drawNext(arr[i],i)
    }
}

/**
 * 라인 몇 개를 지웠는지 표시합니다.
 */
const updateClearedLines = (lines) =>
{
    UserStorage.clearedLines += lines;
    UserStorage.levelUp();
    //lineArr.innerText = UserStorage.clearedLines;
}
const calcScore = () =>
{
    let lines = LineArr.lines.length;
    let tspin = LineArr.tSpin;
    let mini = tspin===T_SPIN_STATE.MINI

    let result;
    switch(lines)
    {
        case 0:
            if(tspin)
                result = mini?SCORE.MTS:SCORE.TS;
            break;
        case 1:
            if(tspin)
                result = mini?SCORE.MTSS:SCORE.TSS;
            else 
                result = SCORE.SINGLE;
            break;
        case 2:
            if(tspin)
                result = SCORE.TSD;
            else
                result = SCORE.DOUBLE;
            break;
        case 3:
            if(tspin)
                result = SCORE.TST;
            else
                result = SCORE.TRIPLE;
            break;
        case 4:
            result = SCORE.TETRIS
    }
    if(result)
    {
        UserStorage.addScore(result);
        if(board.getRemaining()==0)
        {
            UserStorage.addScore(SCORE.PERFECT);
        }
        updateScore()
    }
}

const updateScore = () =>   
{
    boardView.updateScore(UserStorage.scoreToText());
    boardView.levelProgress(UserStorage.clearedLines,UserStorage.level);
}