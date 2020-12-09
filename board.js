class Board{
    constructor(ctx, player){
        this.ctx = ctx;
        this.board = this.initBoard();
        this.initGraphics();
        this.draw();
        this.player = player;
    }

    /**
     * 무대를 그립니다.
     */
    initGraphics()
    {
        this.ctx.font = "18px 'Press Start 2P'";
        this.ctx.textBaseline = 'top';
        this.ctx.fillText('HOLD', holdXOffset, holdYOffset);
        this.ctx.fillText('NEXT', nextXOffset, nextYOffset)
        this.refreshNexts();

    }
    /**
     * 필드를 그립니다.
     */
    draw(){
        this.ctx.fillStyle = guideline;
        this.ctx.fillRect(xOffset,yOffset,w*blockSizeOutline-1,visibleH*blockSizeOutline);

        for(var i = 0;i<visibleH;i++){
            for(var j = 0; j<w; j++){
                var x = xOffset + j * blockSizeOutline;
                var y = yOffset + i * blockSizeOutline;
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
     * @return {int[]} 채워진 행들의 배열
     */
    lock(p){
        for(var i = 0;i<4;i++){
            for(var j = 0; j<4;j++){
                if(p.shape & (0x8000 >> (i*4+j)))
                {
                    var x = p.x + j;
                    var y = p.y + i + 20;
                    this.board[y][x] = p.typeId+1;    
                }
            }
        }
        var counter = Array();
        var max = Math.min(p.y+24,h)
        for(var i = p.y+20; i<max; i++)
        {
            if(this.checkLine(i)) counter.push(i);
        }
        return counter;
    }

    /**
     * 해당 행이 채워졌는지 확인합니다.
     * @param {int} y 번째 행
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
     * @param {int} i 번째 행 
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
     * @param {int} MODE 
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
                        var x = xOffset+(piece.x+j)*blockSizeOutline;
                        var y = yOffset+(piece.y+i)*blockSizeOutline;
                        var w = blockSize; 
                        var h = blockSize;
                        this.ctx.fillRect(x,y,w,h);}
                }
            }
        }
    }

    /**
     * 해당 블럭이 필드 내에 존재할 수 있는지 여부를 확인합니다.
     * @param {Piece} p 확인할 블럭
     */
    valid(p){
        for(var i = 0;i<4;i++){
            for(var j = 0; j<4;j++){
                if(p.shape & (0x8000 >> (i*4+j)))
                {
                    var x = p.x + j;
                    var y = p.y + i;     
                    if(!this.isNotBlocked(x,y)) return false;
                }
            }
        }
        return true;
    }

    /**
     * 해당 위치에 이미 블럭이 있는지 검사합니다.
     * @param {int} x 번째 행
     * @param {int} y 번째 열
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
     * @param {int} typeId 표시할 블럭
     * @param {int} index 번째 블럭
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
                    var x = nextXOffset+(j+1)*nextBlockSizeOutline;
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
     * @param {int} typeId 표시할 블럭
     * @param {int} mode 표시 모드
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
                var x = holdXOffset+j*holdBlockSizeOutline;
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
     * @param {int} l 번째 행
     * @param {int} i 번째 프레임
     */
    clearAnimation(l, i)
    {
        var x = xOffset
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
                        nextXOffset,
                        yOffset+30,
                        nextBlockSizeOutline*6,
                        distBtwNexts*6+nextBlockSizeOutline
                        );
    }
}