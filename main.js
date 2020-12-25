var now, last;
var requestId;
/**
 * 메인 페이지 로딩이 완료되면 실행되는 함수로써 
 * keydown 이벤트와 keyup 이벤트 생성 후
 * requestAnimationFrame 함수 호출을 위한 타임스탬프 기준을 찍은 후
 * 해당 함수를 불러옵니다.
 */
const init = () =>
{
    resize();
    window.addEventListener('load', resize, false);
    window.addEventListener('resize', resize, false);
}

const gameStart = () => {
    document.getElementById("main").hidden = true;
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
            alert(`Player ${i} topped out.`) ;
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
    switch(index)
    {
        case 0:
        {
            settings[0] = (settings[0]+1)%2;
            document.getElementById("GAMEMODE_GOALS").innerText = settings[0]==0?"NORMAL":"VARIABLE";
        }
        break;
        case 1:
        {
            settings[1] = (settings[1]+1)%2;
            document.getElementById("GAMEMODE_PLAYER").innerText = settings[1]==0?"1":"2";
        }
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
}

