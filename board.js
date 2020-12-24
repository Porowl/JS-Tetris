class Board{
    constructor(){
        this.field = this.initBoard();
        this.remaining = 0;
    }

    /**
     * 보드를 구현합니다. 용량을 줄이려면 2진수를 쓸 수 도 있었겠지만
     * 색을 담기 위해 이차 배열로 구현하였습니다.
     * @return 빈 2차 배열
     */
    initBoard = () =>{
        var array = [];
        for(var i = 0;i<BOARD_HEIGHT;i++){
            array.push([]);
            for(var j = 0;j<BOARD_WIDTH;j++){
                array[i].push(0);
            }
        }
        return array;
    }

    isEmpty = () => this.remaining===0;
    /**
     * 보드에 해당 피스를 '고정'시킵니다.
     * @param {Piece} p 
     * @return {Number[]} 채워진 행들의 배열
     */
    lock = p =>{
        for(var i = 0;i<4;i++){
            for(var j = 0; j<4;j++){
                if(p.shape & (0x8000 >> (i*4+j)))
                {
                    var tx = p.x + j;
                    var ty = p.y + i + 20;
                    this.field[ty][tx] = p.typeId+1;    
                }
            }
        }
        
        const data = {
            lines: [], 
            tSpin: T_SPIN_STATE.NONE,
            add: function(i) { this.lines.push(i); },
            get: function(i) { return this.lines[i]; },
            length: function() { return this.lines.length;}
        }
        
        var max = Math.min(p.y+24,BOARD_HEIGHT)
        for(var i = p.y+20; i<max; i++)
            if(this.checkLine(i)) data.add(i);

        this.remaining += 4;

        if(p.typeId===2 && p.lastMove === LAST_MOVE.SPIN)
            data.tSpin = this.checkTSpin(p.x, p.y, p.rotation,p.rotTest);
        
        return data;
    }

    /**
     * 해당 행이 채워졌는지 확인합니다.
     * @param {Number} y 번째 행
     * @return {boolean} 검사 값
     */
    checkLine = y =>
    {
        let filled = true;
        for(var x = 0; x<BOARD_WIDTH;x++)
        {
            if(this.field[y][x]===0)
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
    clearLine = i =>
    {
        for(var y = i;y>0;y--)
        {
            for(var x = 0; x<BOARD_WIDTH;x++)
            {
                this.field[y][x] = this.field[y-1][x];
            }
        }
        this.remaining -= 10;
    }

    /**
     * 해당 위치에 이미 블럭이 있는지 검사합니다.
     * @param {Number} x x번째 행
     * @param {Number} y y번째 열
     * @return {boolean} 검사 값
     */
    isNotBlocked = (x,y) =>
    {
        y = y+20;
        if(x<0||x>BOARD_WIDTH-1) return false;
        if(y>BOARD_HEIGHT-1) return false
        return this.field[y][x]===0;
    }

    /**
     * 해당 블럭이 필드 내에 존재할 수 있는지 여부를 확인합니다.
     * @param {Object} p - 확인할 블럭
     */
    valid = p =>
    {
        for(var i = 0;i<4;i++){
            for(var j = 0; j<4;j++){
                if(p.shape & (0x8000 >> (i*4+j)))
                {
                    var x = p.x + j;
                    var y = p.y + i;     
                    if(!this.isNotBlocked(x,y))
                    {
                        return false;
                    }
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
    canMoveDown = p =>
    {
        return this.valid({...p,y:p.y+1})
    }

    getRemaining = () =>
    {
        return this.remaining;
    }

    getGhostIndex = p =>
    {

        var temp = 0;
        while(this.canMoveDown(p))
        {
            p = {...p,y:p.y+1};
            temp++;
        }
        return temp;
    }
    
    checkTSpin = (x,y,r,l) =>
    {
        let corners = 0b0000;
        let tSpinCounter = 0;
        let tSpinMini = false;
        if(!this.isNotBlocked(x  ,y  )){        //LU
            corners = corners & 0b1000;
            tSpinCounter++;
        } 
        if(!this.isNotBlocked(x+2,y  ))       //RU
        {
            corners = corners & 0b0100;
            tSpinCounter++;
        }
        if(!this.isNotBlocked(x  ,y+2)) {     //LD
            corners = corners & 0b0010
            tSpinCounter++;
        }
        if(!this.isNotBlocked(x+2,y+2)){    //RD
            corners = corners & 0b0001
            tSpinCounter++;
        };

        if(tSpinCounter>2)
        {
            switch(r)
            {
                case 0:
                    tSpinMini = !(corners & 0b1100);
                    break;
                case 1:
                    tSpinMini = !(corners & 0b0101);
                    break;
                case 2:
                    tSpinMini = !(corners & 0b0011);
                    break;
                case 3:
                    tSpinMini = !(corners & 0b1010);
                    break;
            }
        }
        else return T_SPIN_STATE.NONE

        if(tSpinMini&&l<4) return T_SPIN_STATE.MINI;
        return T_SPIN_STATE.PROP
    }

    hardDrop = piece =>
    {
        let p = {...piece};
        let counter = 0;
        while(this.canMoveDown(p))
        {
            p.y++;
            counter++;
        }
        return {
            piece: p,
            score: counter
        }
    }
}