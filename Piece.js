class Piece{
    constructor(i){
        this.typeId = i;
        this.rotation = 0;
        this.create();
        this.lastMove = LAST_MOVE.NONE;
        this.rotTest = 0;
    }

    /**
     * 초기 설정 함수입니다.
     */
    create = () =>{
        this.shape = PIECE_MAP[this.typeId][this.rotation];
        this.color = COLOR_MAP[this.typeId];
        this.initialPos();
        this.hardDropped = false;
    }

    /**
     * 하드드롭 상태를 설정하는 함수입니다.
     */
    hardDrop = () =>{
        this.hardDropped = true;
    }

    /**
     * 해당 블록으로 대채합니다.
     * 하드드롭이 된 상태면 작동하지 않습니다.
     * @param {Piece} p 대체될 블록 개체 
     */
    move = (p) => {
        if(this.hardDropped) return;
        this.x = p.x;
        this.y = p.y;
        this.shape = p.shape;
        this.color = p.color;
        this.rotation = p.rotation;
        this.lastMove = p.lastMove;
        this.rotTest = p.rotTest;
    }

    /**
     * 초기 블럭 설정 값입니다.
     */
    initialPos = () =>{
        this.y  =   -1;
        this.x  =    3;
    }
}