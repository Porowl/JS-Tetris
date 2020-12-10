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
        ctx.font = "16px 'Press Start 2P'";
        ctx.textBaseline = 'top';
        ctx.fillText('HOLD', holdXOffset + this.offset, holdYOffset);
        ctx.fillText('NEXT', nextXOffset + this.offset, nextYOffset)
        ctx.fillRect(holdXOffset + this.offset ,holdYOffset+30,holdBlockSizeOutline*4,holdBlockSizeOutline*4)
        this.refreshNexts();

        let color = (this.player==1?p1:p2)

        this.drawOutline(5, 7, color[1]);
        this.drawOutline(2, 4, color[0]);
        this.drawOutline(10, 5, color[0]);
    }

    drawOutline(rad, size, color)
    {
        let L = xOffset + this.offset;
        let U = yOffset;
        let R = xOffset+w*blockSizeOutline + this.offset;
        let D = yOffset+visibleH*blockSizeOutline;

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
        this.ctx.fillStyle = guideline;
        this.ctx.fillRect(xOffset + this.offset,yOffset,w*blockSizeOutline,visibleH*blockSizeOutline);

        for(var i = 0;i<visibleH;i++){
            for(var j = 0; j<w; j++){
                var x = xOffset + j * blockSizeOutline + 1 + this.offset;
                var y = yOffset + i * blockSizeOutline + 1;
                let color = this.board[i+20][j] - 1;
                this.ctx.fillStyle = color<0?black:colorMap[color];
                this.ctx.fillRect(x,y,blockSize,blockSize);
            }
        }
    }

    /**
     * 보드를 구현합니다. 용량을 줄이려면 2진수를 쓸 수 도 있었겠지만
     * 색을 담기 위해 이차 배열로 구현하였습니다.
     * @return 빈 2차 배열
     */
    initBoard(){
        var array = Array(h);
        for(var i = 0;i<h;i++){
            array[i] = Array(w);
            for(var j = 0;j<w;j++){
                array[i][j] = 0;
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

        var max = Math.min(p.y+24,h)
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
        for(var x = 0; x<w;x++)
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
            for(var x = 0; x<w;x++)
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
     * DRAWMODE.HIDEGHOST 고스트를 화면에서 가립니다.
     * @param {Piece} piece 
     * @param {Number} MODE 
     */
    drawPiece(piece, MODE){
        let ghostToggled = false;
        switch(MODE)
        {
            case DRAWMODE.DRAWPIECE:
                this.ctx.fillStyle = piece.color;
                break;
            case DRAWMODE.HIDEPIECE:
                this.ctx.fillStyle = black; 
                break;
            case DRAWMODE.DRAWGHOST:
                this.ctx.fillStyle = ghost;
                ghostToggled = true;
                break;
            case DRAWMODE.HIDEGHOST:
                this.ctx.fillStyle = black;
                ghostToggled = true;
                break;
        }
        if(ghostToggled)
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
                        var x = xOffset+(piece.x+j)*blockSizeOutline + 1 + this.offset;
                        var y = yOffset+(piece.y+i)*blockSizeOutline + 1;
                        var w = blockSize; 
                        var h = blockSize;
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
            if(x<0||x>w-1) return false;
            if(y>h-1) return false;
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
                if(pieceMap[typeId][0] & (0x8000 >> (i*4+j)))
                {
                    this.ctx.fillStyle = colorMap[typeId];
                    var x = nextXOffset+(j+1)*nextBlockSizeOutline + this.offset;
                    var y = nextYOffset+(i+1)*nextBlockSizeOutline+distBtwNexts*index+30;
                    var w = nextBlockSize; 
                    var h = nextBlockSize;
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
                color = colorMap[typeId];
                break;
            case DRAWMODE.DRAWGHOST:
                color = ghost;
                break;
        }
        
        for(var i = 0;i<4;i++)
        {
            for(var j = 0;j<4;j++)
            {
                var x = holdXOffset+j*holdBlockSizeOutline + this.offset;
                var y = holdYOffset+i*holdBlockSizeOutline+30;
                var w = holdBlockSize; 
                var h = holdBlockSize;
                this.ctx.fillStyle = black;
                if(pieceMap[typeId][0] & (0x8000 >> (i*4+j)))
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
        var x = xOffset + this.offset;
        var y = yOffset + (l-20) * blockSizeOutline;
        var width = blockSizeOutline*w-1;
        var height = blockSize;

        if(i>lineClearFrames/2)
            ctx.fillStyle = lineClearWhite;
        else 
            ctx.fillStyle = lineClearBlack;

        this.ctx.fillRect(x,y,width,height);
    }

    /**
     * 다음 블럭들을 초기화합니다.
     */
    refreshNexts()
    {
        this.ctx.fillStyle = black;
        this.ctx.fillRect(
                        nextXOffset + this.offset,
                        yOffset+30,
                        nextBlockSizeOutline*6,
                        distBtwNexts*6+nextBlockSizeOutline
                        );
    }
}