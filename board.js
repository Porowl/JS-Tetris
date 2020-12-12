class Board{
    constructor(ctx, player){
        this.ctx = ctx;
        this.board = this.initBoard();
        this.player = player;
        this.offset = player==1?0:playerOffset; 
        this.initGraphics();
        this.draw();
    }

    /**
     * 무대를 그립니다.
     */
    initGraphics()
    {
        scorebox.style.position = "absolute";
        scorebox.style.top = Y_OFFSET+BLOCK_SIZE_OUTLINE*20.3;
        scorebox.style.left = X_OFFSET;

        ctx.font = "16px 'Press Start 2P'";
        ctx.textBaseline = 'top';
        ctx.fillText('HOLD', HOLD_X_OFFSET + this.offset, HOLD_Y_OFFSET);
        ctx.fillText('NEXT', NEXT_X_OFFSET + this.offset, NEXT_Y_OFFSET)
        ctx.fillRect(HOLD_X_OFFSET + this.offset ,HOLD_Y_OFFSET+30,HOLD_BLOCK_SIZE_OUTLINE*4,HOLD_BLOCK_SIZE_OUTLINE*4)
        this.refreshNexts();

        let L = X_OFFSET;
        let U = Y_OFFSET;
        let R = X_OFFSET+BOARD_WIDTH*BLOCK_SIZE_OUTLINE;
        let D = Y_OFFSET+VISIBLE_HEIGHT*BLOCK_SIZE_OUTLINE;

        this.callDrawOutline(L,U,R,D);

        L = NEXT_X_OFFSET;
        U = NEXT_Y_OFFSET;
        R = NEXT_X_OFFSET+NEXT_BLOCK_SIZE_OUTLINE*6;
        D = NEXT_Y_OFFSET + DIST_BTW_NEXTS*6+NEXT_BLOCK_SIZE_OUTLINE+30

        this.callDrawOutline(L,U,R,D);

        L = HOLD_X_OFFSET;
        U = HOLD_Y_OFFSET;
        R = HOLD_X_OFFSET+HOLD_BLOCK_SIZE_OUTLINE*4;
        D = NEXT_Y_OFFSET + HOLD_BLOCK_SIZE_OUTLINE*4+30

        this.callDrawOutline(L,U,R,D);
    }

    callDrawOutline(L,U,R,D)
    {
        let color = (this.player==1?P1_COLORS:P2_COLORS)
        this.drawOutline(L+ this.offset,U,R+ this.offset,D,5, 7, color[1]);
        this.drawOutline(L+ this.offset,U,R+ this.offset,D,2, 4, color[0]);
        this.drawOutline(L+ this.offset,U,R+ this.offset,D,10, 5, color[0]);
    }

    drawOutline(L, U, R, D, rad, size, color)
    {
        let ctx = this.ctx;
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
    /**
     * 필드를 그립니다.
     */
    draw(){
        this.ctx.fillStyle = COLOR_GREY;
        this.ctx.fillRect(X_OFFSET + this.offset,Y_OFFSET,BOARD_WIDTH*BLOCK_SIZE_OUTLINE,VISIBLE_HEIGHT*BLOCK_SIZE_OUTLINE);

        for(var i = 0;i<VISIBLE_HEIGHT;i++){
            for(var j = 0; j<BOARD_WIDTH; j++){
                var x = X_OFFSET + j * BLOCK_SIZE_OUTLINE + 1 + this.offset;
                var y = Y_OFFSET + i * BLOCK_SIZE_OUTLINE + 1;
                let color = this.board[i+20][j] - 1;
                this.ctx.fillStyle = color<0?COLOR_BLACK:COLOR_MAP[color];
                this.ctx.fillRect(x,y,BLOCK_SIZE,BLOCK_SIZE);
            }
        }
    }

    /**
     * 보드를 구현합니다. 용량을 줄이려면 2진수를 쓸 수 도 있었겠지만
     * 색을 담기 위해 이차 배열로 구현하였습니다.
     * @return 빈 2차 배열
     */
    initBoard(){
        var array = Array();
        for(var i = 0;i<BOARD_HEIGHT;i++){
            array.push(Array());
            for(var j = 0;j<BOARD_WIDTH;j++){
                array[i].push(0);
            }
        }
        return array;
    }

    /**
     * 보드에 해당 피스를 '고정'시킵니다.
     * @param {Piece} p 
     * @return {Number[]} 채워진 행들의 배열
     */
    lock(p){
        for(var i = 0;i<4;i++){
            for(var j = 0; j<4;j++){
                if(p.shape & (0x8000 >> (i*4+j)))
                {
                    var x = p.x + j + this.offset;
                    var y = p.y + i + 20;
                    this.board[y][x] = p.typeId+1;    
                }
            }
        }

        let tSpinCounter = 0;
        let tSpinMini = false;
        if(p.typeId==2)
        {
            tSpinCounter == 0;
            let x = p.x;
            let y = p.y;
            if(!this.isNotBlocked(x,y)) tSpinCounter++;
            if(!this.isNotBlocked(x+2,y)) tSpinCounter++;
            if(!this.isNotBlocked(x,y+2)) {
                tSpinCounter++;
                tSpinMini = true;
            }
            if(!this.isNotBlocked(x+2,y+2)){
                tSpinCounter++;
                tSpinMini = true;
            };
        }

        var counter = {lines: Array()}
        counter.tSpinCounter = tSpinCounter;
        counter.tSpinMini = tSpinMini;

        var max = Math.min(p.y+24,BOARD_HEIGHT)
        for(var i = p.y+20; i<max; i++)
        {
            if(this.checkLine(i)) counter.lines.push(i);
        }
        return counter;
    }

    /**
     * 해당 행이 채워졌는지 확인합니다.
     * @param {Number} y 번째 행
     * @return {boolean} 검사 값
     */
    checkLine(y)
    {
        let filled = true;
        for(var x = 0; x<BOARD_WIDTH;x++)
        {
            if(this.board[y][x]==0)
            {
                filled = false;
                continue;
            }
        }
        return filled;
    }

    /**
     * 해당 행을 지우고 위 블럭들을 한 칸 아래로 내립니다.
     * @param {Number} i 번째 행 
     */
    clearLine(i)
    {
        for(var y = i;y>0;y--)
        {
            for(var x = 0; x<BOARD_WIDTH;x++)
            {
                this.board[y][x] = this.board[y-1][x];
            }
        }
    }

    /**
     * 블럭을 화면에 표시합니다.
     * DRAWMODE.DRAWPIECE 블럭을 화면에 표시합니다.
     * DRAWMODE.DRAWGHOST 고스트를 화면에 표시합니다.
     * DRAWMODE.HIDEPIECE 블럭을 화면에서 가립니다.
     * DRAWMODE.HIDECOLOR_GHOST 고스트를 화면에서 가립니다.
     * @param {Piece} piece 
     * @param {Number} MODE 
     */
    drawPiece(piece, MODE){
        let COLOR_GHOSTToggled = false;
        switch(MODE)
        {
            case DRAWMODE.DRAWPIECE:
                this.ctx.fillStyle = piece.color;
                break;
            case DRAWMODE.HIDEPIECE:
                this.ctx.fillStyle = COLOR_BLACK; 
                break;
            case DRAWMODE.DRAWGHOST:
                this.ctx.fillStyle = COLOR_GHOST;
                COLOR_GHOSTToggled = true;
                break;
            case DRAWMODE.HIDEGHOST:
                this.ctx.fillStyle = COLOR_BLACK;
                COLOR_GHOSTToggled = true;
                break;
        }
        if(COLOR_GHOSTToggled)
        {
            let p = {...piece};
            while(this.canMoveDown(p))
            {
                p.y++;
            }
            piece = p;
        }
        for(var i = 0;i<4;i++)
        {
            for(var j = 0;j<4;j++)
            {
                if(piece.shape & (0x8000 >> (i*4+j)))
                {
                    if(piece.y+i>=0){
                        var x = X_OFFSET+(piece.x+j)*BLOCK_SIZE_OUTLINE + 1 + this.offset;
                        var y = Y_OFFSET+(piece.y+i)*BLOCK_SIZE_OUTLINE + 1;
                        var w = BLOCK_SIZE; 
                        var h = BLOCK_SIZE;
                        this.ctx.fillRect(x,y,w,h);}
                }
            }
        }
    }

    /**
     * 해당 블럭이 필드 내에 존재할 수 있는지 여부를 확인합니다.
     * @param {Object} p - 확인할 블럭
     */
    valid(p){
        for(var i = 0;i<4;i++){
            for(var j = 0; j<4;j++){
                if(p.shape & (0x8000 >> (i*4+j)))
                {
                    var x = p.x + j + this.offset;
                    var y = p.y + i;     
                    if(!this.isNotBlocked(x,y)) return false;
                }
            }
        }
        return true;
    }

    /**
     * 해당 위치에 이미 블럭이 있는지 검사합니다.
     * @param {Number} x x번째 행
     * @param {Number} y y번째 열
     * @return {boolean} 검사 값
     */
    isNotBlocked(x,y){
            y = y+20;
            if(x<0||x>BOARD_WIDTH-1) return false;
            if(y>BOARD_HEIGHT-1) return false;
            return this.board[y][x]==0;
    }

    /**
     * 해당 블럭이 아래로 한 칸 내려갈 수 있는지 검사합니다.
     * @param {Piece} p 
     * @return {boolean} 검사 값
     */
    canMoveDown(p){
        return this.valid({...p,y:p.y+1})
    }

    /**
     * 다음 블럭들을 표시합니다. 
     * @param {Number} typeId 표시할 블럭
     * @param {Number} index 번째 블럭
     */
    drawNext(typeId,index)
    {
        for(var i = 0;i<4;i++)
        {
            for(var j = 0;j<4;j++)
            {
                if(PIECE_MAP[typeId][0] & (0x8000 >> (i*4+j)))
                {
                    this.ctx.fillStyle = COLOR_MAP[typeId];
                    var x = NEXT_X_OFFSET+(j+1)*NEXT_BLOCK_SIZE_OUTLINE + this.offset;
                    var y = NEXT_Y_OFFSET+(i+1)*NEXT_BLOCK_SIZE_OUTLINE + DIST_BTW_NEXTS * index + 30;
                    var w = NEXT_BLOCK_SIZE; 
                    var h = NEXT_BLOCK_SIZE;
                    this.ctx.fillRect(x,y,w,h);
                }
            }
        }
    }

    /**
     * 저장된 블럭을 표시합니다.
     * @param {Number} typeId 표시할 블럭
     * @param {Number} mode 표시 모드
     */
    drawHold(typeId, mode)
    {
        let color;
        switch(mode)
        {
            case DRAWMODE.DRAWPIECE:
                color = COLOR_MAP[typeId];
                break;
            case DRAWMODE.DRAWGHOST:
                color = COLOR_GHOST;
                break;
        }
        
        for(var i = 0;i<4;i++)
        {
            for(var j = 0;j<4;j++)
            {
                var x = HOLD_X_OFFSET+j*HOLD_BLOCK_SIZE_OUTLINE + this.offset;
                var y = HOLD_Y_OFFSET+i*HOLD_BLOCK_SIZE_OUTLINE+30;
                var w = HOLD_BLOCK_SIZE; 
                var h = HOLD_BLOCK_SIZE;
                this.ctx.fillStyle = COLOR_BLACK;
                if(PIECE_MAP[typeId][0] & (0x8000 >> (i*4+j)))
                {
                    this.ctx.fillStyle = color;
                }
                this.ctx.fillRect(x,y,w,h);
            }
        }
    }

    /**
     * 블럭이 지워지는 애니메이션을 출력합니다.
     * @param {Number} l 번째 행
     * @param {Number} i 번째 프레임
     */
    clearAnimation(l, i)
    {
        var x = X_OFFSET + this.offset;
        var y = Y_OFFSET + (l-20) * BLOCK_SIZE_OUTLINE;
        var width = BLOCK_SIZE_OUTLINE*BOARD_WIDTH-1;
        var height = BLOCK_SIZE_OUTLINE;

        if(i>LINE_CLEAR_FRAMES/2)
            ctx.fillStyle = LINE_CLEAR_WHITE;
        else 
            ctx.fillStyle = LINE_CLEAR_BLACK;

        this.ctx.fillRect(x,y,width,height);
    }

    /**
     * 다음 블럭들을 초기화합니다.
     */
    refreshNexts()
    {
        this.ctx.fillStyle = COLOR_BLACK;
        this.ctx.fillRect(
                        NEXT_X_OFFSET + this.offset,
                        Y_OFFSET+30,
                        NEXT_BLOCK_SIZE_OUTLINE*6,
                        DIST_BTW_NEXTS*6+NEXT_BLOCK_SIZE_OUTLINE
                        );
    }
}