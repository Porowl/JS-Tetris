class storage{
    constructor(){
        this.index = -1;
        this.score = 0;
        this.timer = 0;
        this.level = 5;
        this.initKeyMap();

        this.bag = [0,0,0,0,0,0,0];
        this.pieces = this.initPieces();
    }

    getLevel(){
        return Math.min(this.level,20);
    }

    getGravity(){
        return GRAVITY[this.getLevel()];
    }

    getIndex(){
        return this.index;
    }
    getPiece(){
        this.index++;
        if(this.pieces.length<this.index+7) this.addPiece();
        return this.pieces[this.index];
    }

    getNext(n){
        return this.pieces[this.index+n];
    }
    
    initKeyMap(){
        this.keyMap = Array(101);
        for(var i = 0;i<this.keyMap.length;i++){
            this.keyMap[i] = false;
        }
    }

    initPieces(){
        var tempArr =[]
        for(var i = 0; i<7;i++){
            tempArr.push(this.pullTet());
        }
        return tempArr;
    }

    addPiece(){
        this.pieces.push(this.pullTet());
    }

    pullTet(){
        do{
            var temp = parseInt(Math.random()*7);
        } while (this.bag[temp]==1)
        this.bag[temp] = 1;
        this.checkBagFull();
        return temp;
    }

    checkBagFull(){
        for(var i = 0; i<this.bag.length;i++)
            if(this.bag[i]==0) return;
        for(var i = 0; i<this.bag.length;i++)
            this.bag[i]=0;
    }

    checkLR(){
        if(this.keyMap[KEY.LEFT]&&this.keyMap[KEY.RIGHT])
            return 0;
        else if(this.keyMap[KEY.LEFT]) return 1;
        else if(this.keyMap[KEY.RIGHT]) return 2;
    }
}