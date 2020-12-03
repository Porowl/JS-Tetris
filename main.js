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

function init(){
    board = new Board(ctx);   
    UserStorage = new storage(); 
    piece = new Piece(ctx, UserStorage.getPiece());

    document.addEventListener('keydown',event=>{
        UserStorage.keyMap[event.keyCode] = true;
    });

    document.addEventListener('keyup',event=>{
        if(event.keyCode == KEY.SPACE) return;
        UserStorage.keyMap[event.keyCode] = false;
    });

    now = last = timeStamp();

    moves = {
        [KEY.LEFT]: p=>({...p,x:p.x-1}),
        [KEY.RIGHT]: p=>({...p,x:p.x+1}),
        [KEY.DOWN]: p=>({...p,y:p.y+1}),
    }

    animate();
}

function animate(){
    now = timeStamp();
    var dt = (now-last)/1000.0;
    last = now;

    update(Math.min(1,dt));
    requestId = window.requestAnimationFrame(animate);
}

function update(dt){
    initDelay -= dt;

    inputCycle();

    if(initDelay>0) return;

    if((piece.hardDropped||lockDelay>0.5)&&!board.canMoveDown(piece))
        lock();

    dropRate += dt;
    moveDownCycle();
    
    if(!board.canMoveDown(piece)){
        lockDelay += dt;
    } else {
        lockDelay = 0;
    }
}

function inputCycle()
{
    moveLR();
    rotate();
}

function moveLR()
{
    let p;
    let state = UserStorage.checkLR();
    if(state == KEYSTATES.LR)
    {
        LRframeCount++;
    }

    switch(UserStorage.checkLR())
    {
        case KEYSTATES.LR:
            LRframeCount++;
            break;
        case KEYSTATES.L:
            if(LRframeCount==0)
            {
                p = 
            } else if((LRframeCount-DAS)%ARR==0)
            {

            }
            LRframeCount++;
            break;
        case KEYSTATES.R:
            break;
        default:
            LRframeCount = 0;
    }
}
function moveDownCycle()
{
    var gravity = UserStorage.getGravity();
    while(dropRate>gravity){
        dropRate -= gravity;
        moveDown();
    }
}

function moveDown()
{
    if(board.canMoveDown(piece))
    {
        let p = moves[KEY.DOWN](this.piece);
        this.piece.move(p);
    }
}
function rotate()
{

}

function lock()
{
    lockDelay = 0;
    dropRate = 0;
    board.lock(piece);
    piece = new Piece(ctx, UserStorage.getPiece());
    initDelay = 17*6/1000;
}

function timeStamp()
{
    return new Date().getTime();
}