class Piece{
    constructor(ctx, i){
        this.typeId = i;
        this.ctx = ctx;
        this.rotation = 0;
        this.create();
    }

    create(){
        this.shape = pieceMap[this.typeId][this.rotation];
        this.color = colorMap[this.typeId];
        this.initialPos();
        this.hardDropped = false;
        this.draw();
    }

    hardDrop(){
        this.hardDropped = true;
    }

    draw(){
        for(var i = 0;i<4;i++)
        {
            for(var j = 0;j<4;j++)
            {
                if(this.shape & (0x8000 >> (i*4+j)))
                {
                    if(this.y+i>=0){
                        this.ctx.fillStyle = this.color;
                        var x = xOffset+(this.x+j)*blockSizeOutline;
                        var y = yOffset+(this.y+i)*blockSizeOutline;
                        var w = blockSize; 
                        var h = blockSize;
                        this.ctx.fillRect(x,y,w,h);}
                }
            }
        }
    }

    hide(){
        for(var i = 0;i<4;i++)
        {
            for(var j = 0;j<4;j++)
            {
                if(this.shape & (0x8000 >> (i*4+j)))
                {
                    if(this.y+i>=0){
                        this.ctx.fillStyle = black;
                        var x = xOffset+(this.x+j)*blockSizeOutline;
                        var y = yOffset+(this.y+i)*blockSizeOutline;
                        var w = blockSize; 
                        var h = blockSize;
                        this.ctx.fillRect(x,y,w,h);
                    }
                }
            }
        }
    }

    move(p){
        this.hide();
        if(this.hardDropped) return;
        this.x = p.x;
        this.y = p.y;
        this.shape = p.shape;
        this.rotation = p.rotation;
        this.draw();
    }

    initialPos(){
        this.y=-1;
        this.x = this.typeId===6?4:3;
    }

    rotate(){
        this.rotation = (this.rotation+1)%4
    }
}