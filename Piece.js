class Piece{
    constructor(i){
        this.typeId = i;
        this.rotation = 0;
        this.create();
    }

    create(){
        this.shape = pieceMap[this.typeId][this.rotation];
        this.color = colorMap[this.typeId];
        this.initialPos();
        this.hardDropped = false;
    }

    hardDrop(){
        this.hardDropped = true;
    }

    move(p){
        if(this.hardDropped) return;
        this.x = p.x;
        this.y = p.y;
        this.shape = p.shape;
        this.rotation = p.rotation;
    }

    initialPos(){
        this.y=-1;
        this.x = this.typeId===6?4:3;
    }
}