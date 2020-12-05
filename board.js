class Board{
    constructor(ctx){
        this.ctx = ctx;
        this.draw();
        this.board = this.initBoard();
    }

    draw(){
        this.ctx.fillStyle = guideline;
        this.ctx.fillRect(xOffset,yOffset,w*blockSizeOutline-1,visibleH*blockSizeOutline);

        this.ctx.fillStyle = black;
        for(var i = 0;i<visibleH;i++){
            for(var j = 0; j<w; j++){
                var x = xOffset + j *blockSizeOutline;
                var y = yOffset + i*blockSizeOutline;
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
        var cleared = false;
        for(var i = p.y;i<Math.min(h,p.y+4);i++)
        {
            cleared = cleared || this.checkLine(i);
        }
        if(cleared)
        {
            this.draw()
        }
    }

    checkLine(y)
    {
        let filled = true;
        for(var x = 0; x<w;x++)
        {
            if(this.board[y][x]==0)
            {
                filled = false;
                break;
            }
        }
        if(filled) this.clearLine(y);
        return filled;
    }

    clearLine(i)
    {
        for(var y = i;i>0;i--)
        {
            for(var x = 0; x<w;x++)
            {
                this.board[y][x] = this.board[y-1][x];
            }
        }
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
}