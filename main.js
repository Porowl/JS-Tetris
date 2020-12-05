var board;
var UserStorage;
var piece;
var playerControl;

var initDealy = 0;

var LRframeCount = 0;
var RotateFrameCount = 0;
var last, now;
var initDelay = 0;
var dropRate = 0;
var lockDelay = 0;
var gravity;
/**
 * 메인 페이지 로딩이 완료되면 실행되는 함수로써 
 * keydown 이벤트와 keyup 이벤트 생성 후
 * requestAnimationFrame 함수 호출을 위한 타임스탬프 기준을 찍은 후
 * 해당 함수를 불러옵니다.
 */
function init()
{
    board = new Board(ctx);   
    UserStorage = new storage(); 
    piece = new Piece(UserStorage.getPiece());

    document.addEventListener('keydown',event=>
    {
        UserStorage.keyMap[event.keyCode] = true;
    });

    document.addEventListener('keyup',event=>
    {
        if(event.keyCode == KEY.SPACE) return;
        UserStorage.keyMap[event.keyCode] = false;
    });

    now = last = timeStamp();

    gravity = UserStorage.getGravity();

    animate();
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
    //document.getElementById("UC").innerText = "RF : " + RotateFrameCount;
    //document.getElementById("LR").innerText = "LRF: " + LRframeCount;
    requestId = window.requestAnimationFrame(animate);
}

/**
 * 한 번 호출 될 때마다 게임을 진행시킵니다.
 * dt는 자동으로 계산되어 animate 함수로부터 넘어옵니다.
 * @param {number} dt 시간차
 */
function update(dt){
    initDelay -= dt;

    inputCycle();

    if((piece.hardDropped||lockDelay>0.5)&&!board.canMoveDown(piece))
    {
        lock();
    }

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

function inputCycle()
{
    hardDrop();
    moveLR();
    rotate();
}

function hardDrop()
{
    if(UserStorage.keyMap[KEY.SPACE])
    {
        let p = moves[KEY.DOWN](piece);
        while(board.canMoveDown(p))
        {
            p.y++;
        }
        updatePiece(p);
        piece.hardDropped = true;
        UserStorage.keyMap[KEY.SPACE] = false;
    }
}

function moveLR()
{
    let p;
    switch(UserStorage.checkLR())
    {
        case KEYSTATES.LR:
            LRframeCount++;
            break;
        case KEYSTATES.L:
            if(LRframeCount==0
                ||
                LRframeCount>=DAS
                    ?(LRframeCount-DAS)%ARR==0
                    :false)
            {
                p = moves[KEY.LEFT](piece);
            }
            LRframeCount++;
            break;
        case KEYSTATES.R:
            if(LRframeCount==0
                ||
                LRframeCount>=DAS
                    ?(LRframeCount-DAS)%ARR==0
                    :false)
            {
                p = moves[KEY.RIGHT](piece);
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

function moveDown()
{
    if(board.canMoveDown(piece))
    {
        let p = moves[KEY.DOWN](piece);
        updatePiece(p);
    }
}

function rotate()
{
    let state = UserStorage.checkRot();
    if(state == KEYSTATES.UC)
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
    else if (state == KEYSTATES.C)
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
 * Executes action of the rotation.
 * @param {number} a 0 means clockwise, 1 means anti-clockwise;
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
                x: piece.x + rotateOffsets[piece.rotation*2+a][test][0],
                y: piece.y - rotateOffsets[piece.rotation*2+a][test][1], 
                rotation: next,
                shape: pieceMap[piece.typeId][next]
            };
        console.log(test, p)
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

function lock()
{
    lockDelay = 0;
    dropRate = 0;
    board.lock(piece);
    piece = new Piece(UserStorage.getPiece());
    initDelay = 17*6/1000;
}

function updatePiece(p)
{
    board.hidePiece(piece);
    piece.move(p);
    board.drawPiece(piece);
}

function timeStamp()
{
    return new Date().getTime();
}