class view{
    constructor(ctx, ctx2, ctx3, player){
        this.boardCtx = ctx;
        this.infoCtx = ctx2;
        this.aniCtx = ctx3;
        this.player = player;
        this.offset = PLAYER_OFFSET * player; 
        this.initGraphics();
        this.scoreArr = [];

        this.clearLineInfo;
    }

    /**
     * 무대를 그립니다.
     */
    initGraphics = () =>
    {
        let ctx = this.boardCtx;
        ctx.font = "16px 'PressStart2P'";
        ctx.fillStyle = COLOR_WHITE;
        ctx.textBaseline = 'top';
        ctx.textAlign = 'center'
        ctx.fillText(NEXT, NEXT_X_OFFSET + NEXT_BLOCK_SIZE_OUTLINE*3 + this.offset, NEXT_Y_OFFSET+5);
        ctx.fillText(HOLD, HOLD_X_OFFSET + HOLD_BLOCK_SIZE_OUTLINE*3 + this.offset, HOLD_Y_OFFSET+5);
        ctx.fillText(LEVEL, HOLD_X_OFFSET + HOLD_BLOCK_SIZE_OUTLINE*3 + this.offset, Y_OFFSET+(VISIBLE_HEIGHT-6)*BLOCK_SIZE_OUTLINE+5);
        this.refreshHold();
        this.refreshNexts();

        // BOARD
        this.callDrawOutline(
            X_OFFSET,
            Y_OFFSET,
            X_OFFSET+BOARD_WIDTH*BLOCK_SIZE_OUTLINE,
            Y_OFFSET+VISIBLE_HEIGHT*BLOCK_SIZE_OUTLINE
        );

        // NEXTS
        this.callDrawOutline(
            NEXT_X_OFFSET,
            NEXT_Y_OFFSET,
            NEXT_X_OFFSET + NEXT_BLOCK_SIZE_OUTLINE * 6,
            NEXT_Y_OFFSET + DIST_BTW_NEXTS * 6 + NEXT_BLOCK_SIZE_OUTLINE+30
        );

        // HOLD
        this.callDrawOutline(
            HOLD_X_OFFSET,
            HOLD_Y_OFFSET,
            HOLD_X_OFFSET + HOLD_BLOCK_SIZE_OUTLINE * 6 ,
            NEXT_Y_OFFSET + HOLD_BLOCK_SIZE_OUTLINE * 5 + 30
        );

        // LEVEL
        this.callDrawOutline(
            HOLD_X_OFFSET,
            Y_OFFSET+(VISIBLE_HEIGHT-6)*BLOCK_SIZE_OUTLINE,
            HOLD_X_OFFSET + HOLD_BLOCK_SIZE_OUTLINE * 6,
            Y_OFFSET+VISIBLE_HEIGHT*BLOCK_SIZE_OUTLINE,
        );

    }

    callDrawOutline = (L,U,R,D) =>
    {
        let color = (this.player==0?P1_COLORS:P2_COLORS)
        this.drawOutline(L+ this.offset,U,R+ this.offset,D,5, 7, color[1]);
        this.drawOutline(L+ this.offset,U,R+ this.offset,D,2, 4, color[0]);
        this.drawOutline(L+ this.offset,U,R+ this.offset,D,10, 5, color[0]);
    }

    drawOutline = (L, U, R, D, rad, size, color) =>
    {
        let ctx = this.boardCtx;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.arc(L,U,rad,Math.PI,Math.PI*3/2,false);
        ctx.lineTo(R,U-rad);
        ctx.arc(R,U,rad,Math.PI*3/2,0,false);
        ctx.lineTo(R+rad,D);
        ctx.arc(R,D,rad,0,Math.PI/2,false);
        ctx.lineTo(L,D+rad)
        ctx.arc(L,D,rad,Math.PI/2,Math.PI,false);
        ctx.lineTo(L-rad,U)
        ctx.lineWidth = size;
        ctx.stroke();
    }

    /* BOARD & PIECE GRAPHICS */

    draw = table =>{
        this.boardCtx.fillStyle = COLOR_GREY;
        this.boardCtx.fillRect(X_OFFSET + this.offset,Y_OFFSET,BOARD_WIDTH*BLOCK_SIZE_OUTLINE,VISIBLE_HEIGHT*BLOCK_SIZE_OUTLINE);

        for(let i = 0;i<VISIBLE_HEIGHT;i++)
            for(let j = 0; j<BOARD_WIDTH; j++)
            {
                let x = X_OFFSET + j * BLOCK_SIZE_OUTLINE + 1 + this.offset;
                let y = Y_OFFSET + i * BLOCK_SIZE_OUTLINE + 1;
                let color = table[i+20][j] - 1;
                this.boardCtx.fillStyle = color<0?COLOR_BLACK:COLOR_MAP[color];
                this.boardCtx.fillRect(x,y,BLOCK_SIZE,BLOCK_SIZE);
                if(table[i+20][j]!=0)
                {
                    ctx.fillStyle = PIECE_3D_ADD;
                    const offset = 3;
                    ctx.fillRect(x+offset,y+offset,BLOCK_SIZE-offset*2,BLOCK_SIZE-offset*2);
                }
            }
    }

    drawPiece = (piece, MODE, index = 0) => 
    {
        let ghost = false;
        let piece3d = true;
        let ctx = this.boardCtx;
        let color;
        switch(MODE)
        {
            case DRAWMODE.DRAWPIECE:
                color = piece.color;
                piece3d = true;
                break;
            case DRAWMODE.DRAWGHOST:
                color = GHOST_COLOR_MAP[piece.typeId];
                ghost = true;
                break;
            case DRAWMODE.HIDEPIECE:
            case DRAWMODE.HIDEGHOST:
                color = COLOR_BLACK;
                break;
        }
        for(let i = 0;i<4;i++)
            for(let j = 0;j<4;j++)
                if(piece.shape & (0x8000 >> (i*4+j)))
                {
                    ctx.fillStyle = color;
                    let x = X_OFFSET+(piece.x+j)*BLOCK_SIZE_OUTLINE + 1 + this.offset;
                    let y = Y_OFFSET+(piece.y+i+index)*BLOCK_SIZE_OUTLINE + 1;
                    let w = BLOCK_SIZE; 
                    let h = BLOCK_SIZE;
                    if(y>Y_OFFSET)
                    {
                        ctx.fillRect(x,y,w,h);
                        if(ghost)
                        {
                            ctx.fillStyle = COLOR_BLACK;
                            const offset = 2;
                            ctx.fillRect(x+offset,y+offset,w-offset*2,h-offset*2);
                        }
                        if(piece3d)
                        {
                            ctx.fillStyle = PIECE_3D_ADD;
                            const offset = 3;
                            ctx.fillRect(x+offset,y+offset,w-offset*2,h-offset*2);
                        }
                    }
                }
    }

    drawNext = (typeId,index) =>
    {
        for(let i = 0;i<4;i++)
            for(let j = 0;j<4;j++)
                if(PIECE_MAP[typeId][0] & (0x8000 >> (i*4+j)))
                {
                    this.boardCtx.fillStyle = COLOR_MAP[typeId];
                    var x = NEXT_X_OFFSET+(j+1)*NEXT_BLOCK_SIZE_OUTLINE + this.offset;
                    var y = NEXT_Y_OFFSET+(i+1)*NEXT_BLOCK_SIZE_OUTLINE + DIST_BTW_NEXTS * index + 30;
                    var w = NEXT_BLOCK_SIZE; 
                    var h = NEXT_BLOCK_SIZE;
                    this.boardCtx.fillRect(x,y,w,h);
                }
    }

    refreshNexts = () =>
    {
        const ctx = this.boardCtx;
        ctx.fillStyle = COLOR_BLACK;
        ctx.fillRect(
            NEXT_X_OFFSET + this.offset,                // x
            Y_OFFSET+30,                                // y
            NEXT_BLOCK_SIZE_OUTLINE*6,                  // w
            DIST_BTW_NEXTS*6+NEXT_BLOCK_SIZE_OUTLINE    // h
        );
    }

    drawHold = (typeId=-1, mode) =>
    {
        if(typeId==-1) return;
        let color;
        let ctx = this.boardCtx;
        switch(mode)
        {
            case DRAWMODE.DRAWPIECE:
                color = COLOR_MAP[typeId];
                break;
            case DRAWMODE.DRAWGHOST:
                color = COLOR_GHOST;
                break;
        }
        
        this.refreshHold();
        ctx.fillStyle = color;
        for(var i = 0;i<4;i++)
        {
            for(var j = 0;j<4;j++)
            {
                if(PIECE_MAP[typeId][0] & (0x8000 >> (i*4+j)))
                {
                    var x = HOLD_X_OFFSET + (j+1) * HOLD_BLOCK_SIZE_OUTLINE + this.offset;
                    var y = HOLD_Y_OFFSET + (i+1) * HOLD_BLOCK_SIZE_OUTLINE + 30;
                    var w = HOLD_BLOCK_SIZE; 
                    var h = HOLD_BLOCK_SIZE;
                    ctx.fillRect(x,y,w,h);
                }
            }
        }
    }

    refreshHold = () =>
    {
        const ctx = this.boardCtx;
        ctx.fillStyle = COLOR_BLACK;
        ctx.fillRect(
            HOLD_X_OFFSET + this.offset,                // x
            HOLD_Y_OFFSET+30,                           // y
            HOLD_BLOCK_SIZE_OUTLINE*6,                  // w
            HOLD_BLOCK_SIZE_OUTLINE*5                   // h
        );
    }

    clearAnimation = (l, i) =>
    {
        var y = Y_OFFSET + (l-20) * BLOCK_SIZE_OUTLINE+1;
        var w = BLOCK_SIZE;
        var h = BLOCK_SIZE;

        if(i>LINE_CLEAR_FRAMES/2)
            ctx.fillStyle = LINE_CLEAR_WHITE;
        else 
            ctx.fillStyle = LINE_CLEAR_BLACK;

        for(var i = 0; i<BOARD_WIDTH;i++)
        {
            var x = X_OFFSET + BLOCK_SIZE_OUTLINE*i + 1 + this.offset;
            this.boardCtx.fillRect(x,y,w,h);
        }
    }

    /* UI GRAPHICS*/

    countDown = i =>
    {
        let ctx = this.infoCtx;
        ctx.font = "100px 'PressStart2P'";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        switch(i)
        {
            case 1:
                ctx.fillStyle = COLOR_MAP[1];
                break;
            case 2:
                ctx.fillStyle = COLOR_MAP[6];
                break;
            case 3:
                ctx.fillStyle = COLOR_MAP[0];
                break;
        }
        ctx.clearRect(BOARD_CENTER_X+this.offset-100,BOARD_CENTER_Y-100,300,300);
        if(i==0) return;
        ctx.fillText(i,BOARD_CENTER_X+this.offset,BOARD_CENTER_Y,BLOCK_SIZE_OUTLINE*10);
    }

    displayScore = score =>
    {
        let ctx = this.infoCtx;
        ctx.clearRect(X_OFFSET+this.offset-5,BOARD_END_Y-5,BLOCK_SIZE_OUTLINE*20+5,35);
        ctx.textBaseline = "middle";
        ctx.textAlign = "center"
        ctx.font = "24px 'PressStart2P'"; 
        ctx.strokeStyle = COLOR_GREY;
        ctx.lineWidth = 5;
        ctx.fillStyle = COLOR_WHITE;
        
        ctx.strokeText(score,BOARD_CENTER_X+this.offset,BOARD_END_Y+12);
        ctx.fillText(score,BOARD_CENTER_X+this.offset,BOARD_END_Y+12);
    }

    levelProgress = (lines, level, goal) =>
    {
        let x = HOLD_X_OFFSET + HOLD_BLOCK_SIZE_OUTLINE * 3+this.offset;
        let y = Y_OFFSET+(VISIBLE_HEIGHT-3)*BLOCK_SIZE_OUTLINE;

        let ctx = this.infoCtx;

        ctx.clearRect(
            HOLD_X_OFFSET+this.offset,
            Y_OFFSET+(VISIBLE_HEIGHT-4)*BLOCK_SIZE_OUTLINE,
            HOLD_X_OFFSET + HOLD_BLOCK_SIZE_OUTLINE*6,
            Y_OFFSET+VISIBLE_HEIGHT*BLOCK_SIZE_OUTLINE
        )

        ctx.textBaseline = "middle";
        ctx.textAlign = "center"
        ctx.fillStyle = COLOR_WHITE;
        ctx.font = "24px 'PressStart2P'"; 
        ctx.fillText(level+1,x,y);
        ctx.font = "12px 'PressStart2P'"; 
        ctx.fillText(`${lines}/${goal}`,x,y+BLOCK_SIZE_OUTLINE*2.25);

        ctx.lineWidth = 5;

        ctx.beginPath();
        ctx.arc(x,y,30,0,2*Math.PI,false);
        ctx.strokeStyle = COLOR_GHOST;
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();

        let start = 3/4*2*Math.PI;
        let end = lines/goal;
        end = start + 2*Math.PI*end;
        ctx.arc(x,y,30,start,end,false);
        ctx.strokeStyle = COLOR_MAP[(level+1)%7];
        ctx.stroke();
        ctx.closePath();
    }

    displayScoreArr = scoreArr =>
    {
        if(scoreArr.length==0) return;
        let ctx = this.infoCtx;
        
        clearTimeout(this.clearLineInfo);
        ctx.clearRect(0,BOARD_END_Y+25+this.offset,BLOCK_SIZE_OUTLINE*40+5,100);

        ctx.textBaseline = "middle";
        ctx.textAlign = "center"
        ctx.font = "15px 'PressStart2P'"; 
        ctx.strokeStyle = COLOR_GREY;
        ctx.lineWidth = 4;
        ctx.fillStyle = COLOR_WHITE;
        
        for(var i = 0; i<scoreArr.length;i++)
        {
            let text = `${scoreArr[i][0]}  +${scoreArr[i][1]}`;
            ctx.strokeText(text,BOARD_CENTER_X+this.offset,BOARD_END_Y+12+35*(i+1));
            ctx.fillText(text,BOARD_CENTER_X+this.offset,BOARD_END_Y+12+35*(i+1));    
        }
        this.clearLineInfo = setTimeout(()=>ctx.clearRect(0+this.offset,BOARD_END_Y+25,BLOCK_SIZE_OUTLINE*40+5,100),750);
    }

    lockAnimation = (piece, frame=0) =>
    {
        let ctx = this.aniCtx;
        for(let i = 0;i<4;i++) for(let j = 0;j<4;j++)
            if(piece.shape & (0x8000 >> (i*4+j)))
            {
                ctx.fillStyle = LOCK_WHITE;
                let x = X_OFFSET+(piece.x+j)*BLOCK_SIZE_OUTLINE + 1 + this.offset;
                let y = Y_OFFSET+(piece.y+i)*BLOCK_SIZE_OUTLINE + 1;
                let w = BLOCK_SIZE; 
                let h = BLOCK_SIZE;
                if(y>Y_OFFSET)
                {
                    ctx.clearRect(x,y,w,h);
                    for(let f = 0; f<Math.min(LOCK_ANIMATION_FRAMES-frame,frame);f++)
                    {
                        ctx.fillRect(x,y,w,h);
                    }
                }
            }
        if(frame==LOCK_ANIMATION_FRAMES)return;
        setTimeout(()=>this.lockAnimation(piece,frame+1),1000/60);
    }

    hardDropAnimation = (piece, frame=0) =>
    {
        let ctx = this.aniCtx;
        for(let i = 0;i<4;i++) for(let j = 0;j<4;j++)
            if(piece.shape & (0x8000 >> (i*4+j)))
            {
                ctx.strokeStyle = GHOST_COLOR_MAP[piece.typeId];
                console.log(ctx.strokeStyle);
                ctx.lineWidth = 1;
                for(let z = 0; z<BLOCK_SIZE;z++)
                {
                    let x = X_OFFSET+(piece.x+j)*BLOCK_SIZE_OUTLINE + 1 + z + this.offset;
                    let y = Y_OFFSET+(piece.y+i)*BLOCK_SIZE_OUTLINE;
                    let height = parseInt(Math.random()*(y-Y_OFFSET));
                        ctx.beginPath();
                        ctx.moveTo(x,y);
                        ctx.lineTo(x,y-height);
                    ctx.stroke();
                    ctx.closePath();
                }
            }
        setTimeout(()=>ctx.clearRect(0,0,768,1024),HARDDROP_ANIMATION_FRAMES*1000/60);
    }
}