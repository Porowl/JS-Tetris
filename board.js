class Board{
    constructor(ctx){
        this.ctx = ctx;
        this.board = this.initBoard();
        this.draw();
    }

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
        var counter = 0;
        for(var index = p.y+20; index<Math.min(p.y+24,h); index++)
        {
            counter += this.checkLine(index);
        }
        return counter;
    }

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
        if(filled) this.clearLine(y);
        return filled?1:0;
    }

    clearLine(i)
    {
        for(var y = i;y>0;y--)
        {
            for(var x = 0; x<w;x++)
            {
                this.board[y][x] = this.board[y-1][x];
            }
        }
        this.clearAnimation(i);
    }

    drawPiece(piece){
        for(var i = 0;i<4;i++)
        {
            for(var j = 0;j<4;j++)
            {
                if(piece.shape & (0x8000 >> (i*4+j)))
                {
                    if(piece.y+i>=0){
                        this.ctx.fillStyle = piece.color;
                        var x = xOffset+(piece.x+j)*blockSizeOutline;
                        var y = yOffset+(piece.y+i)*blockSizeOutline;
                        var w = blockSize; 
                        var h = blockSize;
                        this.ctx.fillRect(x,y,w,h);}
                }
            }
        }
    }

    hidePiece(piece){
        for(var i = 0;i<4;i++)
        {
            for(var j = 0;j<4;j++)
            {
                if(piece.shape & (0x8000 >> (i*4+j)))
                {
                    if(piece.y+i>=0){
                        this.ctx.fillStyle = black;
                        var x = xOffset+(piece.x+j)*blockSizeOutline;
                        var y = yOffset+(piece.y+i)*blockSizeOutline;
                        var w = blockSize; 
                        var h = blockSize;
                        this.ctx.fillRect(x,y,w,h);
                    }
                }
            }
        }
    }

    drawGhost(piece){
        let p = {...piece};
        while(this.canMoveDown(p))
        {
            p.y++;
        }
        for(var i = 0;i<4;i++)
        {
            for(var j = 0;j<4;j++)
            {
                if(p.shape & (0x8000 >> (i*4+j)))
                {
                    if(p.y+i>=0){
                        this.ctx.fillStyle = ghost;
                        var x = xOffset+(p.x+j)*blockSizeOutline;
                        var y = yOffset+(p.y+i)*blockSizeOutline;
                        var w = blockSize; 
                        var h = blockSize;
                        this.ctx.fillRect(x,y,w,h);}
                }
            }
        }
    }

    hideGhost(piece){
        let p = {...piece};
        while(this.canMoveDown(p))
        {
            p.y++;
        }
        for(var i = 0;i<4;i++)
        {
            for(var j = 0;j<4;j++)
            {
                if(p.shape & (0x8000 >> (i*4+j)))
                {
                    if(p.y+i>=0){
                        this.ctx.fillStyle = black;
                        var x = xOffset+(p.x+j)*blockSizeOutline;
                        var y = yOffset+(p.y+i)*blockSizeOutline;
                        var w = blockSize; 
                        var h = blockSize;
                        this.ctx.fillRect(x,y,w,h);}
                }
            }
        }
    }

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

    isNotBlocked(x,y){
            y = y+20;
            if(x<0||x>w-1) return false;
            if(y>h-1) return false;
            return this.board[y][x]==0;
    }

    canMoveDown(p){
        return this.valid({...p,y:p.y+1})
    }

    drawNext(typeId,index)
    {
        for(var i = 0;i<4;i++)
        {
            for(var j = 0;j<4;j++)
            {
                if(pieceMap[typeId][0] & (0x8000 >> (i*4+j)))
                {
                    this.ctx.fillStyle = colorMap[typeId];
                    var x = nextXOffset+j*nextBlockSizeOutline;
                    var y = nextYOffset+i*nextBlockSizeOutline+distBtwNexts*index;
                    var w = nextBlockSize; 
                    var h = nextBlockSize;
                    this.ctx.fillRect(x,y,w,h);
                }
            }
        }
    }

    clearAnimation(l)
    {

        var x = xOffset
        var y = yOffset + (l-20) * blockSizeOutline;
        var w = blockSizeOutline*w-1
        var h = blockSize

        ctx.fillStyle = lineClearWhite;
        for(var i = 1; i<=10; i++)
            setTimeout(ctx.fillRect(x,y,w,h),17*i);

        ctx.fillStyle = lineClearBlack;
        for(var i = 11; i<=20; i++)
            setTimeout(ctx.fillRect(x,y,w,h),17*i);
    }
}