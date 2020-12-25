class random{
    constructor(){
        this.bag = 0x00;
        this.pieces = this.initPieces();
    }

    getPiece = (index) =>
    {
        while(this.pieces.length<index+8) this.addPiece();
        return this.pieces[index];
    }

    /**
     * 다음 n 번째 블럭을 가져옵니다.
     * @param {int} n 
     */
    nextPieces = (index) => this.pieces.slice(index,index+7);
    
    /**
     * 첫 7개 블럭을 생성합니다.
     */
    initPieces = () => {
        var tempArr =[]
        for(var i = 0; i<7;i++){
            tempArr.push(this.pullTet());
        }
        return tempArr;
    }

    /**
     * 다음 블럭을 추가합니다.
     */
    addPiece = () => {
        this.pieces.push(this.pullTet());
    }

    /**
     * 다음 블럭을 난수로 가져옵니다.
     * 가이드라인에 따라 7개의 블럭이 다 나오고 난 뒤에
     * 난수가 초기화됩니다.
     */
    pullTet = () =>
    {
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
    checkBagFull = () =>
    {
        if(this.bag == 0x7f) // 0111 1111
            this.bag = 0x00
    }
}