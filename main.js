var board;
var UserStorage;
var piece;
var playerControl;
function init(){
    board = new Board(ctx);   
    UserStorage = new storage(); 
    piece = new Piece(ctx, UserStorage.getPiece());
    playerControl = new control(piece, UserStorage, board);

    document.addEventListener('keydown',event=>{
        UserStorage.keyMap[event.keyCode] = true;
    });

    document.addEventListener('keyup',event=>{
        if(event.keyCode == KEY.SPACE) return;
        UserStorage.keyMap[event.keyCode] = false;
    });

    animate();
}



var last = now = timeStamp();
var dropRate = 0;
var lockDelay = 0;
var initDelay = 0;

function animate(now = 0){
    now = timeStamp();
    update(Math.min(1,(now-last)/1000.0));
    last = now;
    requestId = window.requestAnimationFrame(animate);
}

function update(idt){
    initDelay -= idt;

    playerControl.inputCycle();
    
    if(initDelay>0) return; 
    dropRate += idt;
    var gravity = GRAVITY[UserStorage.getLevel()]
    while(dropRate>gravity){
        dropRate -= gravity;
        temp = playerControl.moveDown()
    }
    if(!board.canMoveDown(piece)){
        lockDelay += idt;
    } else {
        lockDelay = 0;
    }
    if((piece.hardDropped||lockDelay>0.5)&&!board.canMoveDown(piece)){
        lockDelay = 0;
        dropRate = 0;
        board.lock(piece);
        piece = new Piece(ctx, UserStorage.getPiece());
        playerControl.piece = piece;
        initDelay = 17*6/1000;
    }
}

function timeStamp(){
    return new Date().getTime();
}