class control{

    constructor(piece, storage, board){
        this.piece = piece;
        this.LRFrameCount = 0;
        this.storage = storage;
        this.board = board;

        this.moves = {
            [KEY.LEFT]: p=>({...p,x:p.x-1}),
            [KEY.RIGHT]: p=>({...p,x:p.x+1}),
            [KEY.DOWN]: p=>({...p,y:p.y+1}),
        }
    }


    inputCycle(){
        this.moveLR();
        this.softDrop();
        this.rotate();
        this.hardDrop();
    }

    hardDrop(){
        if(initDelay>0) return;
        if(this.storage.keyMap[KEY.SPACE]){
            while(this.moveDown());
            this.piece.hardDrop();
            this.storage.keyMap[KEY.SPACE] = false;
        }
    }

    moveLR(){
        let p;
        if(this.storage.keyMap[KEY.RIGHT]&&this.storage.keyMap[KEY.LEFT]){
            this.LRFrameCount++;
        } else if(this.LRFrameCount==0||(this.LRFrameCount-DAS)%ARR==0){
            if(this.storage.keyMap[KEY.RIGHT])
            {
                p = this.moves[KEY.RIGHT](this.piece);
                this.LRFrameCount++;
            }
            else if(this.storage.keyMap[KEY.LEFT])
            {
                p = this.moves[KEY.LEFT](this.piece);
                this.LRFrameCount++;
            }
            if(p)
                if(this.board.valid(p, this.piece))
                    this.piece.move(p);
            
        } else 
            this.LRFrameCount = 0;
    }


    softDrop(){
        if(this.storage.keyMap[KEY.DOWN]){
            let p = this.moves[KEY.DOWN](this.piece);
                if(this.board.valid(p))
                    this.piece.move(p);
        }
    }


    moveDown(){
        let p = this.moves[KEY.DOWN](this.piece);
        var a = this.board.valid(p) 
        if(a)
            this.piece.move(p);
        return a
    }
    

    clRotate(p){
        var temp = 0;
        var valid = false;
        var tempShape = p.rotate();
        do{
            if(temp==5) break;
            let tempPiece = {...p, 
                x:      p.x + rotateOffsets[0*p.rotation][temp][0], 
                y:      p.y + rotateOffsets[0*p.rotation][temp][1], 
                shape:  tempShape,
                rotation: (p.rotation+1)%4
            }
            temp++;
        } while(valid = this.board.valid(tempPiece));
        if(valid) this.piece.move(tempPiece);
    }
    alRotate(p){

    }
}