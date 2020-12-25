class storage{
    constructor(){
        this.level = 0;
        this.clearedLines = 0;
        this.score = 0;
        this.combo = 0;

        this.b2b = false;

        /* Settings */

        this.gameMode = settings[0]==0?GAMEMODE.STATIC:GAMEMODE.VARIABLE;
        this.nexts = 6;
        this.initKeyMap();

        /* Pieces */
        this.bag = 0x00;
        this.index = 0;
        this.hold;
    }

    /**
     * 현재 레벨을 반환합니다.
     */
    getLevel = () => this.level;
    
    updateLines = (data,perfect) =>
    {
        let lines = data.length();
        let tspin = data.tSpin;
        let mini = tspin===T_SPIN_STATE.MINI;
        let scoreArr = [];

        let mode;
        if(tspin!==T_SPIN_STATE.NONE)
        {
            switch(lines)
            {
                case 0:
                    mode = mini?SCORE.MTS:SCORE.TS;
                    break;
                case 1:
                    mode = mini?SCORE.MTSS:SCORE.TSS;
                    break;
                case 2:
                    mode = SCORE.TSD;
                    break;
                case 3:
                    mode = SCORE.TST;
                    break;
            }
        }
        else 
        {
            switch(lines)
            {
                case 0:
                    break;
                case 1:
                    mode = SCORE.SINGLE;
                    break;
                case 2:
                    mode = SCORE.DOUBLE;
                    break;
                case 3:
                    mode = SCORE.TRIPLE;
                    break;
                case 4:
                    mode = SCORE.TETRIS;
                    break;
            }
        }
        if(mode)
        {
            scoreArr.push(this.addScore(mode));
        }
        if(perfect) scoreArr.push(this.addScore(SCORE.PERFECT));

        if(this.gameMode == GAMEMODE.VARIABLE)
        {
            switch(mode)
            {
                case SCORE.SINGLE:
                    lines = 1;
                    break;
                case SCORE.DOUBLE:
                    lines = 3;
                    break;
                case SCORE.TRIPLE:
                    lines = 5;
                    break;
                case SCORE.TETRIS:
                    lines = 8;
                    break;
                case SCORE.MTS:
                    lines = 1;
                    break;
                case SCORE.MTSS:
                    lines = 1;
                    break;
                case SCORE.TS:
                    lines = 4;
                    break;
                case SCORE.TSS:
                    lines = 8;
                    break;
                case SCORE.TSD:
                    lines = 12;
                    break;
                case SCORE.TST:
                    lines = 16;
                    break;
            }
        } 
        this.clearedLines += lines;
        
        let goal = this.getGoal();
        if(this.clearedLines>=goal)
        {
            this.clearedLines -=goal;
            this.level++;
        }

        (lines>0)?this.combo++:this.combo=0;
    
        return scoreArr;
    }
    /**
     * 현재 중력을 반환합니다.
     */
    getGravity = () => GRAVITY[Math.min(this.getLevel(),GRAVITY.length-1)];

    /**
     * 현재 몇 번째 블럭인지를 표시합니다.
     */
    getIndexInc = () => this.index++;

    getIndex = () => this.index;

    /**
     * 다중 키 입력을 받기 위한 일차 배열을 생성합니다.
     */
    initKeyMap = () =>{
        this.keyMap = [];
        for(var i = 0;i<101;i++){
            this.keyMap.push(false);
        }
    }

    /**
     * 왼쪽 키와 오른쪽 키 상태를 반환합니다.
     * @return {int} 
     * 0: 양쪽 키 다 눌림
     * 1: 왼쪽 키 눌림
     * 2: 오른쪽 키 눌림
     * -1: 안 눌림
     */
    checkLR = () =>
    {
        if(this.keyMap[KEY.LEFT]&&this.keyMap[KEY.RIGHT])
            return 0;
        else if(this.keyMap[KEY.LEFT]) return KEYSTATES.L;
        else if(this.keyMap[KEY.RIGHT]) return KEYSTATES.R;
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
    checkRot = () =>
    {
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
    checkHold = () => this.keyMap[KEY.SHIFT]||this.keyMap[KEY.C];

    addScore = mode => 
    {
        let last = this.b2b;
        let mult = this.level+1
        let calc = 0;
        let text;
        switch(mode)
        {
            case SCORE.SINGLE:
                calc = 100;
                this.b2b = false;
                text = CLEAR_STRINGS.SINGLE;
                break;
            case SCORE.DOUBLE:
                calc = 300;
                this.b2b = false;
                text = CLEAR_STRINGS.DOUBLE;
                break;
            case SCORE.TRIPLE:
                calc = 500;
                this.b2b = false;
                text = CLEAR_STRINGS.TRIPLE;
                break;
            case SCORE.TETRIS:
                calc = 800;
                this.b2b = true;
                text = CLEAR_STRINGS.TETRIS;
                break;
            case SCORE.MTS:
                calc = 100;
                text = CLEAR_STRINGS.T_SPIN + CLEAR_STRINGS.MINI;
                break;
            case SCORE.MTSS:
                calc = 200;
                this.b2b = true;
                text = CLEAR_STRINGS.T_SPIN + CLEAR_STRINGS.MINI + CLEAR_STRINGS.SINGLE;
                break;
            case SCORE.TS:
                calc = 400;
                text = CLEAR_STRINGS.T_SPIN;
                break;
            case SCORE.TSS:
                calc = 800;
                this.b2b = true;
                text = CLEAR_STRINGS.T_SPIN + CLEAR_STRINGS.SINGLE;
                break;
            case SCORE.TSD:
                calc = 1200;
                this.b2b = true;
                text = CLEAR_STRINGS.T_SPIN + CLEAR_STRINGS.DOUBLE;
                break;
            case SCORE.TST:
                calc = 1600;
                this.b2b = true;
                text = CLEAR_STRINGS.T_SPIN + CLEAR_STRINGS.TRIPLE;
                break;
            case SCORE.PERFECT:
                this.score += 30000;
                text = CLEAR_STRINGS.PERFECT;
                return [text, 30000];
        }
        if(last&&this.b2b) calc = calc*1.5
        calc = calc*mult;
        this.score += calc;

        return [text,calc];
    }

    addDropScore = n => this.score+=n;
    
    scoreToText = () =>
    {
        let temp = ""+ this.score;
        while(temp.length<7)
        {
            temp = "0" + temp;
        }
        return temp;
    }

    getGoal = () => (this.gameMode == GAMEMODE.STATIC)?10:(this.level+1)*5;
}