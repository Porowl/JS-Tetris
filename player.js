class player{
    constructor(i, random)
    {
        this.user = i;
        this.board = new Board();
        this.view = new view(ctx, ctx2, ctx3, i);
        this.view.draw(this.board.field);
        this.stg = new storage(i);
        this.random = random;
        this.gravity = this.stg.getGravity();
        this.piece;

        this.clearedLineArr;

        this.ghostSwitch = true;
        this.holdUsed = false;
        this.pieceHeld = false;

        this.initDelay = 0;
        this.lineClearDelay = -1;

        this.LRFrameCounter = 0;
        this.RotateTrameCounter = 0;
        this.dropRate = 0;

        this.gameOver = false;
            
        document.addEventListener('keydown',event=>
        {
            this.stg.keyMap[event.keyCode] = true;
        });

        document.addEventListener('keyup',event=>
        {
            if(event.keyCode == KEY[`p${this.user+1}`].SPACE) return;
            else if(event.KeyCode == KEY[`p${this.user+1}`].SHIFT) return;
            else if(event.KeyCode == KEY[`p${this.user+1}`].C) return;
            this.stg.keyMap[event.keyCode] = false;
        });

        document.addEventListener(`attackOnP${this.user+1}`,event=>
        {
            let n = event.detail.n;
            this.board.addGarbage(n);
            this.view.showGarbage(this.board.garbage); 
        });

        document.addEventListener(`garbCountP${this.user+1}`, event=>
        {
            let lines = this.board.deductGarbage(event.detail.n)

            if(lines>0)
            document.dispatchEvent(
                new CustomEvent(`attackOnP${2-this.user}`, 
                {
                    detail:
                    {
                        n:lines
                    }
                })
            );
        });
    }

    countDown = () =>{
        setTimeout(()=>{this.view.countDown(3)},0);
        setTimeout(()=>{this.view.countDown(2)},1000);
        setTimeout(()=>{this.view.countDown(1)},2000);
        setTimeout(()=>{this.view.countDown(0)},3000);
        setTimeout(()=>{this.gameStart()},3000);
    }

    gameStart = () => {
        this.piece = new Piece(this.random.getPiece(this.stg.getIndexInc()));
        this.updatePiece(this.piece);
        this.updateNexts();
        this.updateScore();
    }

    update = dt =>
    {
        //Animation Phase
        if(this.lineClearDelay>0)
        {
            this.lineClearDelay--;

            for(var i = 0; i<this.clearedLineArr.length();i++)
                this.view.clearAnimation(this.clearedLineArr.get(i), this.lineClearDelay);
            return; 
        }
        // At the end of animation, update board and create new shape
        else if(this.lineClearDelay===0) 
        {
            for(var i = 0; i<this.clearedLineArr.length();i++)
            {
                this.board.clearLine(this.clearedLineArr.get(i));
            }
            this.board.executeGarbage();

            this.view.draw(this.board.field);

            let scoreArr = this.stg.updateLines(this.clearedLineArr,this.board.isEmpty());
            this.view.displayScoreArr(scoreArr);


            this.updateScore();

            this.getNewPiece();
            this.checkTopOut();
        }

        //for 6f init delay
        this.initDelay--;

        //calculates input
        this.inputCycle();

        //Lock phase
        if((this.piece.hardDropped||this.lockDelay>0.5)&&!this.board.canMoveDown(this.piece))
        {
            this.lock(this.piece);
        }

        //fall phase
        if(this.lineClearDelay>0) return;
        if(this.initDelay>0) return;

        this.moveDownCycle(dt);

        if(!this.board.canMoveDown(this.piece))
        {
            this.lockDelay +=dt;
        }
        else
        {
            this.lockDelay = 0;
        }
    }

    moveDownCycle = dt =>
    {
        if(this.stg.keyMap[KEY[`p${this.user+1}`].DOWN]&&this.gravity>2/60)
        {
            if(this.moveDown()){
                this.stg.addDropScore(1)
                this.updateScore();
            } 
            return;
        }
        this.dropRate += dt;
        while(this.dropRate>this.gravity){
            this.dropRate -= this.gravity;
            this.moveDown();
        }
    }

    moveDown = () =>
    {
        if(this.board.canMoveDown(this.piece))
        {
            let p = MOVES[KEY[`p${this.user+1}`].DOWN](this.piece);
            this.updatePiece(p);
            return true;
        }
        return false;
    }

    inputCycle = () =>
    {
        this.moveLR();
        this.rotate();
        this.hold();
        this.hardDrop();
    }
    
    moveLR = () =>
    {
        let p;
        let state = this.stg.checkLR();
        
        if(state == KEYSTATES.LR || state == -1)
        {
            this.LRFrameCounter = 0;
        }
        else
        {
            if(this.LRFrameCounter==0)
            {
                let key = (state==KEYSTATES.L)?KEY[`p${this.user+1}`].LEFT:KEY[`p${this.user+1}`].RIGHT;
                p = MOVES[key](this.piece);
            }   
            else if (this.LRFrameCounter>=DAS)
            {
                if ((this.LRFrameCounter-DAS)%ARR==0)
                {
                    let key = (state==KEYSTATES.L)?KEY[`p${this.user+1}`].LEFT:KEY[`p${this.user+1}`].RIGHT;
                    p = MOVES[key](this.piece);
                }
            }
            this.LRFrameCounter++;
        }

        if(p){
            if(this.board.valid(p))
            {
                this.updatePiece(p);
            }    
        }
    }
    
    rotate = () =>
    {
        let state = this.stg.checkRot();

        if(state == KEYSTATES.UZ || state == -1)
        {
            this.RotateFrameCounter = 0;
        }
        else 
        {
            if(this.RotateFrameCounter==0)
            {
                state==KEYSTATES.U?this.rotateAc(0):this.rotateAc(1);
            }
            else if(this.RotateFrameCounter>=DAS)
            {
                if((this.RotateFrameCounter-DAS)%ARR==0)
                    state==KEYSTATES.U?this.rotateAc(0):this.rotateAc(1);
            }
            this.RotateFrameCounter++;
        }
    }

    rotateAc = mode =>
    {
        const piece = this.piece;
        let p;
        let test = 0;
        let next = (mode==0)?(this.piece.rotation+1)%4:(this.piece.rotation-1);

        if(next<0) next+=4;
        do
        {
            p = {...piece, 
                    x: piece.x + (piece.typeId==5?I_OFFSETS:OFFSETS)[piece.rotation+mode*4][test][0],
                    y: piece.y - (piece.typeId==5?I_OFFSETS:OFFSETS)[piece.rotation+mode*4][test][1], 
                    rotation: next,
                    shape: PIECE_MAP[piece.typeId][next],
                    lastMove: LAST_MOVE.SPIN,
                    rotTest: test
                };
            test++;
        } while(!this.board.valid(p)&&test<5)

        if(p)
            if(this.board.valid(p))
                this.updatePiece(p)
    }

    hold = () =>
    {
        const piece = this.piece;
        if(!this.stg.checkHold()) return;
        if(!this.holdUsed)
        {
            if(!this.pieceHeld)
            {
                this.pieceHeld = true;
                this.stg.hold = piece.typeId;
                this.view.drawPiece(piece, DRAWMODE.HIDEPIECE);
                this.view.drawPiece(piece, DRAWMODE.HIDEGHOST, this.board.getGhostIndex(piece));
                this.getNewPiece();
            }
            else
            {
                var temp = this.stg.hold;
                var a = piece.typeId;
                this.view.drawHold(a,DRAWMODE.DRAWGHOST);
                this.stg.hold = a;
                var p = new Piece(temp);
                this.updatePiece(p);
                this.piece = p;
            }
            this.holdUsed = true;
        }
        this.stg.keyMap[KEY[`p${this.user+1}`].SHIFT] = false;
        this.stg.keyMap[KEY[`p${this.user+1}`].C] = false;
    }

    hardDrop = () =>
    {
        if(this.stg.keyMap[KEY[`p${this.user+1}`].SPACE])
        {
            var result = this.board.hardDrop(this.piece);
            this.view.hardDropAnimation(result.piece,this.board.garbage);
            this.updatePiece(result.piece);
            this.stg.addDropScore(result.score*2)
            this.piece.hardDropped = true;
            this.stg.keyMap[KEY[`p${this.user+1}`].SPACE] = false;
            this.stg.keyMap[KEY[`p${this.user+1}`].H] = false;
        }
    }

    getNewPiece = () =>
    {
        this.piece = new Piece(this.random.getPiece(this.stg.getIndexInc()));
        this.view.drawHold(this.stg.hold,DRAWMODE.DRAWPIECE);
        this.updatePiece(this.piece);
        this.updateNexts();
        this.holdUsed = false;
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
        this.view.drawPiece(piece, DRAWMODE.DRAWPIECE);
    }
    
    updateNexts = () =>
    {
        this.view.refreshNexts();
        let arr = this.random.nextPieces(this.stg.getIndex());
        for(var i = 0; i<Math.max(this.stg.nexts,6); i++)
        {
            this.view.drawNext(arr[i],i)
        }
    }

    lock = (piece) =>
    {
        this.lockDelay = 0;
        this.dropRate = 0;
        this.clearedLineArr = this.board.lock(piece);
        this.lineClearDelay = this.clearedLineArr.length()==0?0:LINE_CLEAR_FRAMES;
        this.view.lockAnimation(piece, 0, this.board.garbage);
    }

    checkTopOut = () =>
    {
        if(!this.board.valid(this.piece))
        {
            this.gameOver = true;
        }
    }

    updateScore = () =>   
    {
        this.view.levelProgress(this.stg.clearedLines,this.stg.getLevel(),this.stg.getGoal());
        this.view.displayScore(this.stg.scoreToText());
    }
}