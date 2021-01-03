var now, last;
var requestId;
var keySettings = () =>{};
/**
 * 메인 페이지 로딩이 완료되면 실행되는 함수로써 
 * keydown 이벤트와 keyup 이벤트 생성 후
 * requestAnimationFrame 함수 호출을 위한 타임스탬프 기준을 찍은 후
 * 해당 함수를 불러옵니다.
 */
const init = () =>
{
    resize();

    document.querySelector("#keybinding").addEventListener("click", event=>{
        if(event.target && event.target.nodeName == "TD")
        {
            if(event.target.id)
            {
                clearClicked();
                event.target.className += " clicked"

                document.onkeydown = (e) =>
                {
                    if(e.keyCode == 27)
                    {
                        clearClicked();
                        document.onkeydown = null;
                        return;
                    }
                    let temp;
                    switch(e.keyCode)
                    {
                        case 17: temp = "CTRL";     break;
                        case 21: temp = "R ALT";    break;
                        case 25: temp = "HANJA";    break;
                        case 32: temp = "SPACE";    break;
                        case 37: temp = `←`;       break;
                        case 38: temp = `↑`;       break;
                        case 39: temp = `→`;       break;
                        case 40: temp = `↓`;       break;
                        default: temp = e.key;
                    }
                    event.target.innerText = temp;
                    keySettings[event.target.id] = e.keyCode;
                }
            }   
        }
    });  

    window.addEventListener('resize', resize, false);
}

const gameStart = () => {
    document.getElementById("main").hidden = true;

    changeKeyBindings();

    let players = [];
    let playerNum = settings[1]+1;
    let randomEngine = new random();
    for(let i = 0; i<playerNum;i++)
    {
        players.push(new player(i, randomEngine));
    }
    for(let i = 0; i<playerNum;i++)
    {
        players[i].countDown();
    }
    setTimeout(()=>{
        now = last = timeStamp();
        requestId = requestAnimationFrame(() => {animate(players)});
    }, 3000)
}
/**
 * requestAnimtationFrame 호출 간 시간 계산 및 재호출 함수입니다.
 * 산출된 계산 dt (기준 1s) 를 update 함수로 보내 후에
 * 계산될 게임 진행이 될 수 있도록 합니다.
 */
const animate = (players) =>
{
    let playerNum = settings[1]+1;

    now = timeStamp();
    var dt = (now-last)/1000.0;
    last = now;

    for(var i = 0; i<playerNum;i++)
    { 
        players[i].update(Math.min(1,dt));
        if(players[i].gameOver)
        {
            cancelAnimationFrame(requestId);
            requestId = undefined;
            alert(DEATH_MESSAGE(i));
        }
    }
    if(requestId) requestID = requestAnimationFrame(()=>{animate(players)});
}

const toggleSettings = () =>
{
    var a = document.getElementById("settings");
    a.hidden = !a.hidden
}

const settingsButton = (index, lr) =>
{
    settings[index] += (lr==1)?1:-1;
    let a = 0;
    switch(index)
    {
        case 0:
            a = 3;
            break;
        case 1:
            a = 2;
            break;
    }

    settings[index] = Math.abs(settings[index])%a;
    
    switch(index)
    {
        case 0:
            document.getElementById("GAMEMODE_GOALS").innerText = GAMEMODE_NAMES[settings[index]];
            break;
        case 1:
            document.getElementById("GAMEMODE_PLAYER").innerText = settings[1]+1;
            break;
    }
}

const timeStamp = () =>
{
    return new Date().getTime();
}

const resize = () =>{
    var ratio = canvas.width/ canvas.height;
    var ch = window.innerHeight;
    var cw = ch*ratio;
    if(cw>window.innerWidth)
    {
        cw = Math.floor(window.innerWidth);
        ch = Math.floor(cw/ratio);
    }
    if(window.innerWidth>1024)
    {
        cw = 1024;
        ch = 768;
    }
    canvas.style.width = cw;
    canvas.style.height = ch;
    canvas2.style.width = cw;
    canvas2.style.height = ch;
    canvas3.style.width = cw;
    canvas3.style.height = ch;
}

const clearClicked = () => 
{
    let nodes = document.querySelector("#keybinding").querySelectorAll(".keybinding.clicked");
    for(let node of nodes)
    {
        node.className = "keybinding";
    }
}

const changeKeyBindings = () =>
{
    for(const property in keySettings)
    {
        var temp = property.split('_')
        KEY[temp[0]][temp[1]] = keySettings[property]
    }
    
    MOVES[KEY.p1.LEFT] =  p=>({...p, x: p.x-1, lastMove: LAST_MOVE.MOVE}),
    MOVES[KEY.p1.RIGHT] = p=>({...p, x: p.x+1, lastMove: LAST_MOVE.MOVE}),
    MOVES[KEY.p1.DOWN] =  p=>({...p, y: p.y+1, lastMove: LAST_MOVE.DOWN}),
    MOVES[KEY.p2.LEFT] = p=>({...p, x: p.x-1, lastMove: LAST_MOVE.MOVE}),
    MOVES[KEY.p2.RIGHT] = p=>({...p, x: p.x+1, lastMove: LAST_MOVE.MOVE}),
    MOVES[KEY.p2.DOWN] =  p=>({...p, y: p.y+1, lastMove: LAST_MOVE.DOWN})
}