class player{
    constructor(i)
    {
        this.user = i;
        this.board = new Board();
        this.view = new BoardView(ctx, ctx2, i);
        this.stg = new Storage();
        this.gravity = stg.getGravity();
        this.piece;

        this.clearedLineArr = [];

        this.ghostSwitch = true;
        this.repeated = false;
        this.held = false;

        this.initDelay = 0;
        this.lineClearDelay = -1;
    }

    countDown = () =>{
        setTimeout(()=>{view.countDown(3)},0);
        setTimeout(()=>{view.countDown(2)},1000);
        setTimeout(()=>{view.countDown(1)},2000);
        setTimeout(()=>{view.countDown(0)},3000);
        setTimeout(()=>{this.gameStart()},3000);
    }

    gameStart = () => {
        this.piece = new Piece(UserStorage.newPiece());
    }

    update = dt =>
    {
        if(this.LineClearAnimation()) return;
        else 
        {
            for(var i = 0; i<clearedLineArr.length();i++)
            {
                this.board.clearLine(clearedLineArr.get(i));
            }
            this.view.draw(this.board.field);

            this.stg.updateLines(this.clearedLineArr);
            
            this.view.updateScore(this.stg.scoreToText());
            this.view.levelProgress(this.stg.clearedLines,this.stg.level,this.stg.getGoal());

            this.getNewPiece();
            this.checkTopOut();
        }
        
        this.initDelay--;
        this.inputCycle();

        if((this.piece.hardDropped||lockDelay>0.5)&&!this.board.canMoveDown(this.piece))
        {
            this.lock();
        }

        if(this.initDelay>0) return;

        this.moveDownCycle(dt);

        if(!this.board.canMoveDown(this.piece))
        {
            this.lockDelay +=dt;
        }
        else
        {
            lockDelay = 0;
        }
    }

    LineclearAnimation = () =>
    {
        if(this.lineClearDelay<=0) return;
        lineClearDelay--;
        
        for(var i = 0; i<LineArr.lines.length;i++)
            this.board.clearAnimation(clearedLineArr.get(i), lineClearDelay);
    }

    getNewPiece = () =>
    {
        this.piece = new Piece(this.stg.newPiece());
        this.view.drawHold(this.stg.hold,DRAWMODE.DRAWPIECE);
        this.updatePiece(piece);
        this.updateNexts();
        this.repeated = false;
        this.initDelay = ENTRY_DELAY;
        this.lineClearDelay = -1;
    }

    updatePiece = p =>
    {
        let piece = this.piece;
        if(this.ghostSwitch) this.view.drawPiece(piece, DRAWMODE.HIDEGHOST, this.board.getGhostIndex(piece));
        this.view.drawPiece(piece, DRAWMODE.HIDEPIECE);

        this.piece.move(p);

        if(this.ghostSwitch) this.view.drawPiece(p, DRAWMODE.DRAWGHOST, this.board.getGhostIndex(p));
        boardView.drawPiece(piece, DRAWMODE.DRAWPIECE);
    }
    
    updateNexts = () =>
    {
        this.view.refreshNexts();
        let arr = this.stg.nextPieces()
        for(var i = 0; i<Math.max(this.stg.nexts,6); i++)
        {
            this.view.drawNext(arr[i],i)
        }
    }

}