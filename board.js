class Board{
    constructor(player){
        this.field = this.initBoard();
        this.player = player;
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
    lock({shape: SHAPE, typeId: TYPE, x:PX, y:PY}){
        for(var i = 0;i<4;i++){
            for(var j = 0; j<4;j++){
                if(SHAPE & (0x8000 >> (i*4+j)))
                {
                    var tx = PX + j;
                    var ty = PY + i + 20;
                    this.field[ty][tx] = TYPE+1;    
                }
            }
        }

        var tSpinCounter = 0;
        var tSpinMini = false;
        
        if(TYPE==2)
        {
            tSpinCounter = 0;
            let x = PX;
            let y = PY;
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

        const counter = {
            lines: Array(), 
            add(i){
                this.lines.push(i);
            },
        }
        counter.tSpinMini = tSpinMini;
        counter.tspinCounter = tSpinCounter;

        var max = Math.min(PY+24,BOARD_HEIGHT)
        for(var i = PY+20; i<max; i++)
        {
            if(this.checkLine(i)) counter.add(i);
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
            if(this.field[y][x]==0)
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
                this.field[y][x] = this.field[y-1][x];
            }
        }
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
        return this.field[y][x]==0;
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
                    var x = p.x + j;
                    var y = p.y + i;     
                    if(!this.isNotBlocked(x,y)) return false;
                }
            }
        }
        return true;
    }

    /**
     * 해당 블럭이 아래로 한 칸 내려갈 수 있는지 검사합니다.
     * @param {Piece} p 
     * @return {boolean} 검사 값
     */
    canMoveDown(p){
        return this.valid({...p,y:p.y+1})
    }
}