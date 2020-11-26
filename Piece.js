class Piece{
    constructor(ctx, i){
        this.typeId = i;
        this.ctx = ctx;
        this.create();
        this.rotation = 0;
    }

    create(){
        this.shape = pieceMap[this.typeId];
        this.color = colorMap[this.typeId];
        this.initialPos();
        this.hardDropped = false;
        this.draw();
    }

    hardDrop(){
        this.hardDropped = true;
    }

    draw(){
        for(var i = 0;i<this.shape.length;i++){
            for(var j = 0;j<this.shape[i].length;j++){
                if(this.shape[i][j]==0) continue;
                if(this.y+i<0) continue;
                this.ctx.fillStyle = this.color;
                var x = xOffset+(this.x+j)*blockSizeOutline;
                var y = yOffset+(this.y+i)*blockSizeOutline;
                var w = blockSize; 
                var h = blockSize;
                this.ctx.fillRect(x,y,w,h);
            }
        }
    }

    hide(){
        for(var i = 0;i<this.shape.length;i++){
            for(var j = 0;j<this.shape[i].length;j++){
                if(this.shape[i][j]==0) continue;
                if(this.y+i<0) continue;
                this.ctx.fillStyle = black;
                var x = xOffset+(this.x+j)*blockSizeOutline;
                var y = yOffset+(this.y+i)*blockSizeOutline;
                var w = blockSize; 
                var h = blockSize;
                this.ctx.fillRect(x,y,w,h);
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
        var temp = Array(this.shape.length);
        for(var i = 0; i<temp.length;i++){
            temp[i] = Array(this.shape[i].length);
        }
        
        for(var i = 0; i<temp.length; i++){
            for (var j = 0; j<temp.length; j++){
                temp[i][j] = this.shape[4-j][i];
            }
        }
    }
}