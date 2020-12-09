var board;
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

var repeated, held;
repeated = held = false;

/**
 * 메인 페이지 로딩이 완료되면 실행되는 함수로써 
 * keydown 이벤트와 keyup 이벤트 생성 후
 * requestAnimationFrame 함수 호출을 위한 타임스탬프 기준을 찍은 후
 * 해당 함수를 불러옵니다.
 */
function init()
{
    board = new Board(ctx, 1);   
    UserStorage = new storage(); 
    piece = new Piece(UserStorage.getPiece());
    updatePiece(piece);
    updateNexts();

    document.addEventListener('keydown',event=>
    {
        UserStorage.keyMap[event.keyCode] = true;
    });

    document.addEventListener('keyup',event=>
    {
        if(event.keyCode == KEY.SPACE) return;
        else if(event.KeyCode == KEY.SHIFT) return;
        else if(event.KeyCode == KEY.C) return;
        UserStorage.keyMap[event.keyCode] = false;
    });

    now = last = timeStamp();

    gravity = UserStorage.getGravity();

    requestId = requestAnimationFrame(animate);
}

/**
 * requestAnimtationFrame 호출 간 시간 계산 및 재호출 함수입니다.
 * 산출된 계산 dt (기준 1s) 를 update 함수로 보내 후에
 * 계산될 게임 진행이 될 수 있도록 합니다.
 */
function animate()
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
function update(dt){
    initDelay--;

    inputCycle();

    if(lineClearDelay>0)
    {
        lineClearDelay--;
        for(var i = 0; i<LineArr.length;i++)
            board.clearAnimation(LineArr[i], lineClearDelay);
        return;
    }
        else if(lineClearDelay==0)
    {
        for(var i = 0; i<LineArr.length;i++)
            board.clearLine(LineArr[i]);
        board.draw();
        getNewPiece();

        checkTopOut();
        UserStorage.clearedLines += LineArr.length;
        updateClearedLines();
    }

    if((piece.hardDropped||lockDelay>0.5)&&!board.canMoveDown(piece))
    {
        lock(); 
    }

    if(lineClearDelay>0) return;
    if(initDelay>0) return;

    dropRate += dt;
    moveDownCycle();
    
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
function inputCycle()
{
    moveLR();
    rotate();
    hardDrop();
    hold();
}

/**
 * 하드 드롭을 실행합니다.
 */
function hardDrop()
{
    if(UserStorage.keyMap[KEY.SPACE])
    {
        let p = {...piece};
        while(board.canMoveDown(p))
        {
            p.y++;
        }
        updatePiece(p);
        piece.hardDropped = true;
        UserStorage.keyMap[KEY.SPACE] = false;
        UserStorage.keyMap[KEY.H] = false;
    }
}

/**
 * 자동으로 블럭이 내려가는 논리 함수입니다.
 */
function moveDownCycle()
{
    if(UserStorage.keyMap[KEY.DOWN]&&gravity>2/60)
    {
        moveDown()
        return;
    }
    while(dropRate>gravity){
        dropRate -= gravity;
        moveDown();
    }

}

/**
 * 블럭을 내리는 함수입니다.
 */
function moveDown()
{
    if(board.canMoveDown(piece))
    {
        let p = moves[KEY.DOWN](piece);
        updatePiece(p);
    }
}

/**
 * 블럭을 양 옆으로 움직이는 논리 함수입니다.
 */
function moveLR()
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
                p = moves[key](piece);
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
function rotate()
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
function rotateAc(a)
{
    let p;
    let test = 0;
    let next = (a==0)?(piece.rotation+1)%4:(piece.rotation-1);
    if(next<0) next+=4;
    do
    {
        p = {...piece, 
                x: piece.x + (piece.typeId==5?IOffsets:Offsets)[piece.rotation*2+a][test][0],
                y: piece.y - (piece.typeId==5?IOffsets:Offsets)[piece.rotation*2+a][test][1], 
                rotation: next,
                shape: pieceMap[piece.typeId][next]
            };
        test++;
    } while(!board.valid(p)&&test<5)

    if(p)
    {
        if(board.valid(p))
        {
            updatePiece(p)
        };
    }
}

/**
 * 블럭을 '저장'하는 함수입니다.
 */
function hold()
{
    if(!UserStorage.checkHold()) return;
    if(!repeated)
    {
        if(!held)
        {
            held = true;
            UserStorage.hold = piece.typeId;
            board.drawHold(UserStorage.hold,DRAWMODE.DRAWGHOST);
            board.drawPiece(piece, DRAWMODE.HIDEPIECE);
            board.drawPiece(piece, DRAWMODE.HIDEGHOST);
            getNewPiece();
        }
        else
        {
            var temp = UserStorage.hold;
            UserStorage.hold = piece.typeId;
            var p = new Piece(temp)
            updatePiece(p);
            piece = p;
            board.drawHold(UserStorage.hold,DRAWMODE.DRAWGHOST);
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
function lock()
{
    lockDelay = 0;
    dropRate = 0;
    LineArr = board.lock(piece);
    if(LineArr.length==0){
        lineClearDelay = 0;
        return;
    }
    lineClearDelay = lineClearFrames;
}

/**
 * 게임 오버를 확정짓는 함수입니다.
 */
function checkTopOut()
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
function getNewPiece()
{
    piece = new Piece(UserStorage.getPiece());
    updatePiece(piece);
    updateNexts();
    if(UserStorage.hold)board.drawHold(UserStorage.hold,DRAWMODE.DRAWPIECE);
    repeated = false;
    initDelay = entryDelay;
    lineClearDelay = -1;
}

function timeStamp()
{
    return new Date().getTime();
}

/* ~~~~~~~~~~~~~~~~~~~~ GRAPHICS & INFOS ~~~~~~~~~~~~~~~~~~~~ */

/**
 * 블럭 이동을 그래픽적으로 표시합니다.
 * @param {Piece} p 이동 목표인 블럭 p 입니다.
 */
function updatePiece(p)
{
    if(ghostSwitch) board.drawPiece(piece, DRAWMODE.HIDEGHOST);
    board.drawPiece(piece, DRAWMODE.HIDEPIECE);

    piece.move(p);

    if(ghostSwitch) board.drawPiece(piece, DRAWMODE.DRAWGHOST);
    board.drawPiece(piece, DRAWMODE.DRAWPIECE);
}

/**
 * 다음 블럭 n 개를 표시합니다. n은 설정을 통해 최대 6개까지 표시할 수 있습니다.
 */
function updateNexts()
{
    board.refreshNexts();
    for(var i = 0; i<Math.max(UserStorage.nexts,6); i++)
    {
        board.drawNext(UserStorage.getNext(i+1),i)
    }
}

/**
 * 라인 몇 개를 지웠는지 표시합니다.
 */
function updateClearedLines()
{
    document.getElementById("lines").innerText = UserStorage.clearedLines;
}