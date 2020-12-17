class storage{
    constructor(){
        this.index = -1;
        this.score = 0;
        this.timer = 0;
        this.level = 0;
        this.clearedLines = 0;
        this.nexts = 6;
        this.hold;
        this.b2b = false;
        this.initKeyMap();

        this.bag = 0x00;
        this.pieces = this.initPieces();
    }

    /**
     * 현재 레벨을 반환합니다.
     */
    getLevel(){
        return this.level;
    }
    
    /**
     * 현재 중력을 반환합니다.
     */
    getGravity(){
        return GRAVITY[Math.min(this.getLevel(),GRAVITY.length-1)];
    }

    /**
     * 현재 몇 번째 블럭인지를 표시합니다.
     */
    getIndex(){
        return this.index;
    }

    /**
     * 현재 블럭을 가져옵니다.
     */
    newPiece(){
        this.index++;
        if(this.pieces.length<this.index+7) this.addPiece();
        return this.pieces[this.index];
    }

    /**
     * 다음 n 번째 블럭을 가져옵니다.
     * @param {int} n 
     */
    nextPieces(){
        return this.pieces.slice(this.index+1,this.index+8);
    }
    
    /**
     * 다중 키 입력을 받기 위한 일차 배열을 생성합니다.
     */
    initKeyMap(){
        this.keyMap = Array(101);
        for(var i = 0;i<this.keyMap.length;i++){
            this.keyMap[i] = false;
        }
    }

    /**
     * 첫 7개 블럭을 생성합니다.
     */
    initPieces(){
        var tempArr =[]
        for(var i = 0; i<7;i++){
            tempArr.push(this.pullTet());
        }
        return tempArr;
    }

    /**
     * 다음 블럭을 추가합니다.
     */
    addPiece(){
        this.pieces.push(this.pullTet());
    }

    /**
     * 다음 블럭을 난수로 가져옵니다.
     * 가이드라인에 따라 7개의 블럭이 다 나오고 난 뒤에
     * 난수가 초기화됩니다.
     */
    pullTet(){
        do{
            var temp = parseInt(Math.random()*7);
        } while ((0x40>>temp ) & this.bag)

        this.bag = (this.bag | (0x40>>temp));

        this.checkBagFull();
        return temp;
    }

    /**
     * 현재 7개의 블럭이 다 나왔는지 확인합니다.
     */
    checkBagFull(){
        if(this.bag == 0x7f) // 0111 1111
            this.bag = 0x00
    }

    /**
     * 왼쪽 키와 오른쪽 키 상태를 반환합니다.
     * @return {int} 
     * 0: 양쪽 키 다 눌림
     * 1: 왼쪽 키 눌림
     * 2: 오른쪽 키 눌림
     * -1: 안 눌림
     */
    checkLR(){
        if(this.keyMap[KEY.LEFT]&&this.keyMap[KEY.RIGHT])
            return 0;
        else if(this.keyMap[KEY.LEFT]) return 1;
        else if(this.keyMap[KEY.RIGHT]) return 2;
        return -1;
    }

    /**
     * 회전 키의 상태를 반환합니다.
     * @return {int} 
     * 0: 양쪽 키 다 눌림
     * 1: 시계방향 회전 키 눌림
     * 2: 반시계방향 회전 키 눌림
     * -1: 안 눌림
     */
    checkRot(){
        if((this.keyMap[KEY.UP]||this.keyMap[KEY.X])
            &&(this.keyMap[KEY.Z]||this.keyMap[KEY.CTRL]))
            return KEYSTATES.UZ;
        else if(this.keyMap[KEY.UP]||this.keyMap[KEY.X]) return KEYSTATES.U;
        else if(this.keyMap[KEY.Z]||this.keyMap[KEY.CTRL]) return KEYSTATES.Z;
        return -1;
    }
    
    /**
     * 홀드 키의 상태를 반환합니다.
     * @return {boolean} 검사 값
     */
    checkHold()
    {
        return this.keyMap[KEY.SHIFT]||this.keyMap[KEY.C]
    }

    addScore(mode)
    {
        let last = this.b2b;
        let mult = this.level+1
        let calc = 0;
        switch(mode)
        {
            case SCORE.SINGLE:
                calc = 100;
                this.b2b = false;
                break;
            case SCORE.DOUBLE:
                calc = 300;
                this.b2b = false;
                break;
            case SCORE.TRIPLE:
                calc = 500;
                this.b2b = false;
                break;
            case SCORE.TETRIS:
                calc = 800;
                this.b2b = true;
                break;
            case SCORE.MTS:
                calc = 100;
                break;
            case SCORE.MTSS:
                calc = 200;
                this.b2b = true;
                break;
            case SCORE.TS:
                calc = 400;
                break;
            case SCORE.TSS:
                calc = 800;
                this.b2b = true;
                break;
            case SCORE.TSD:
                calc = 1200;
                this.b2b = true;
                break;
            case SCORE.TST:
                calc = 1600;
                this.b2b = true;
                break;
            case SCORE.PERFECT:
                this.score += 30000;
                return;
        }
        if(last&&this.b2b) calc = calc*1.5
        calc = calc*mult;
        this.score += calc;
    }

    addDropScore(n)
    {
        this.score+=n;
    }
    scoreToText()
    {
        let temp = ""+ this.score;
        while(temp.length<7)
        {
            temp = "0" + temp;
        }
        return temp;
    }
}