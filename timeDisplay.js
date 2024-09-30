//開いた時...
window.addEventListener('load', function () {
    nowLoad();
    colorChange();
    localStorageClear();
})

//デバック用
let debugCount = 1;
let isDebug = false;
//現在時刻取得(通常は空白)
let now = '';
function nowLoad() {
    if (isDebug == false) {
        now = new Date();
    } else {
        now = new Date(now);
        if (debugCount % 4 === 0) {
            now.setSeconds(now.getSeconds() + 1);
        }
    }
    //色変更(15分ごとに)
    if (now.getSeconds() == 0 && now.getMinutes() % 15 == 0 && debugCount % 4 === 0) {
        console.log(now + ' change');
        colorChange();
    }
    debugCount++;
}
setInterval("nowLoad()", 250);


//日付と時間表示
function updateDate() {
    const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

    //日付
    document.getElementById('date').innerText =
        now.toLocaleDateString() + '(' + weekDays[now.getDay()] + ')';

    //時間
    document.getElementById('time').innerText =
        now.toLocaleTimeString();

    //アラーム
    shouldTriggerAlarm()
}

setInterval(updateDate, 250);

/*
0→日誌なし
1→日誌あり
2→日誌なし、次回予告あり(例外扱い。個別で分岐を用意する)
 */
const timeTable = [
    ['startTime', '9:30', '9:40', 0],
    ['firstPeriod', '9:45', '10:35', 1],
    ['secondPeriod', '10:45', '11:35', 1],
    ['thirdPeriod', '11:45', '12:35', 1],
    ['lunchBreak', '12:35', '13:15', 2],
    ['fourthPeriod', '13:15', '14:05', 1],
    ['fifthPeriod', '14:15', '15:05', 1],
    ['sixthPeriod', '15:15', '16:05', 1],
    ['endTime', '16:05', '16:20', 0],
    ['afterSchool', '16:20', '17:00', 2],
];

function updateSubject() {

    const schedule = [
        //0.曜日        1.はじまりの会  2.1コマ目  3.2コマ目　4.3コマ目                   5.4コマ目   6.5コマ目       7.6コマ目   8.おわりの会
        ['Monday', 'はじまりの会', 'PBL', 'PBL', ['基礎学習', '上級英語'], '基礎学習', 'プログラミング', '自由選択', 'おわりの会'],
        ['Tuesday', 'はじまりの会', 'PBL', 'PBL', '基礎学習', '基礎学習', 'プログラミング', '自由選択', 'おわりの会'],
        ['Wednesday', 'はじまりの会', 'PBL', 'PBL', ['基礎学習', '初級英語'], '基礎学習', 'プログラミング', '自由選択', 'おわりの会'],
        ['Thursday', 'はじまりの会', 'PBL', 'PBL', '基礎学習', '基礎学習', 'プログラミング', '自由選択', 'おわりの会'],
        ['Friday', 'はじまりの会', 'PBL', 'PBL', ['基礎学習', '中級/実践英語'], '基礎学習', 'プログラミング', 'ミライ', 'おわりの会'],
        ['holiday', 'はじまりの会', '1コマ目', '2コマ目', '3コマ目', '4コマ目', '5コマ目', '6コマ目', 'おわりの会'],
    ];

    //曜日を取得
    const weekDays = ['holiday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'holiday'];
    let dayOfWeek = weekDays[now.getDay()];
    //現在時間の取得
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let second = now.getSeconds();

    //分単位
    const nowTime = hours * 60 + minutes;

    //今日の時間割を取得
    let currentSchedule;
    for (let weekdayCount = 0; weekdayCount < 6; weekdayCount++) {
        if (dayOfWeek == schedule[weekdayCount][0]) {
            currentSchedule = schedule[weekdayCount];
            break;
        }
    }

    //入力欄のplaceholderにデフォルト科目名を表示
    for (let n = 1; n <= 6; n++) {
        if (Array.isArray(currentSchedule[n + 1])) {
            let currentSchedule1 = currentSchedule[n + 1][0];
            let currentSchedule2 = currentSchedule[n + 1][1];
            document.getElementById('subject-' + n + '-1').placeholder = currentSchedule1;
            document.getElementById('subject-' + n + '-2').placeholder = currentSchedule2;
        } else {
            document.getElementById('subject-' + n + '-1').placeholder = currentSchedule[n + 1];
        }
    }

    //設定されている科目名に変更
    currentSchedule = getSubjectValues(currentSchedule);

    if (currentSchedule == '') {
        currentSchedule = schedule[5];
    }


    //現在時刻から今何コマ目か把握

    let currentSubject;
    let currentSubjectStart;
    let currentSubjectEnd;

    let start;
    for (let i = timeTable.length - 1; i >= 0; i--) {
        start = timeTable[i][1].split(':');
        let startMinutes = parseInt(start[0]) * 60 + parseInt(start[1]);
        if (nowTime >= startMinutes) {

            currentSubjectStart = timeTable[i][0];

            break;
        }
    }

    let end;
    let endMinutes;
    let endY = 0;
    for (let i = 0; i <= timeTable.length; i++) {
        endY = i;
        end = timeTable[i][2].split(':');
        endMinutes = parseInt(end[0]) * 60 + parseInt(end[1]);
        let afterSchool = timeTable[timeTable.length - 1][2].split(':');
        let afterSchoolMinutes = parseInt(afterSchool[0]) * 60 + parseInt(afterSchool[1]);


        if (nowTime == endMinutes && timeTable[i][2] == timeTable[i + 1][1]) {
            currentSubjectEnd = timeTable[i + 1][0];
            end = afterSchool;
            break;
        } else if (nowTime <= endMinutes) {
            currentSubjectEnd = timeTable[i][0];
            break;
        } else if (nowTime >= afterSchoolMinutes) {
            currentSubjectEnd = timeTable[timeTable.length - 1][0];
            break;
        }
    }


    start = start.join(':');
    end = end.join(':');

    //下のバー
    progressBarSet(start, end, timeTable);

    //開始時間からの検索結果と終了時間からの検索結果を比較
    //結果が同じ場合、そのコマの真っ最中。結果が違う場合、それぞれの結果の間が現在時刻。
    //違う場合に:beforeをつけて休憩時間と認識させる。
    if (currentSubjectStart == currentSubjectEnd) {
        currentSubject = currentSubjectStart + ':now';
    } else {
        currentSubject = currentSubjectEnd + ':before';
    }
    //出力
    //:beforeで休憩時間の分岐をする準備
    currentSubject = currentSubject.split(':');

    //曜日から科目名を取り出す。
    let periodNo;
    let periodName;
    switch (currentSubject[0]) {
        case 'startTime':
            periodNo = 1;
            break;
        case 'firstPeriod':
            periodNo = 2;
            break;
        case 'secondPeriod':
            periodNo = 3;
            break;
        case 'thirdPeriod':
            periodNo = 4;
            break;
        case 'lunchBreak':
            periodNo = 'lunchBreak';
            break;
        case 'fourthPeriod':
            periodNo = 5;
            break;
        case 'fifthPeriod':
            periodNo = 6;
            break;
        case 'sixthPeriod':
            periodNo = 7;
            break;
        case 'endTime':
            periodNo = 8;
            break;
        case 'afterSchool':
            periodNo = 'afterSchool';
            break;
    }

    if (periodNo == 'lunchBreak') {
        periodName = '昼休み';
    } else if (periodNo == 'afterSchool') {
        periodName = '放課後';
    } else {
        periodName = currentSchedule[periodNo];
    }
    for (let i = 0; i < timeTable.length; i++) {
        if (timeTable[i][0] == currentSubject[0]) {
            startSecond = timeTable[i][1].split(':');
        }
    }

    //nowかbeforeで出力内容が変わるので分岐
    let nowSecond = nowTime * 60 + second;
    if (currentSubject[1] == 'now' && Array.isArray(periodName)) {//授業中で科目名複数の場合
        document.getElementById('leftSubject').innerText =
            periodName[0];
        document.getElementById('rightSubject').innerText =
            periodName[1];
        document.getElementById('subject').innerText =
            '';

    } else if (currentSubject[1] == 'now') {//授業中で科目名単数
        document.getElementById('subject').innerText =
            periodName
        document.getElementById('leftSubject').innerText =
            '';
        document.getElementById('rightSubject').innerText =
            '';
    } else {//休憩時間
        let startSecond;
        let countdownMessage;
        for (let i = 0; i < timeTable.length; i++) {
            if (timeTable[i][0] == currentSubject[0]) {
                startSecond = timeTable[i][1].split(':');
            }
        }
        //分か秒か
        startSecond = startSecond[0] * 3600 + startSecond[1] * 60;
        if ((startSecond - nowSecond) / 60 > 1) {
            countdownMessage = Math.floor((startSecond - nowSecond) / 60) + '分';
        } else {
            countdownMessage = (startSecond - nowSecond) + '秒';
        }

        //複数ある場合に「〇〇と□□」に
        if (Array.isArray(periodName)) {
            periodName = periodName.join('と');
        }
        document.getElementById('subject').innerText =
            periodName + 'まで あと' + countdownMessage;
    }

    //メッセージを表示
    const diaryText = document.getElementById('diaryMessage');
    //日誌時間が必要か否か
    let needDiary = 0;
    //日誌開始時間を格納
    let diaryStartTime;

    let timeTableY = 0;
    for (let i = 0; i < timeTable.length; i++) {
        if (currentSubject[0] == timeTable[i][0]) {
            needDiary = timeTable[i][3];
            diaryStartTime = timeTable[i][2];
            timeTableY = i;
            break;
        }
    }

    diaryStartTime =
        parseInt(diaryStartTime.split(':')[0]) * 60 +
        parseInt(diaryStartTime.split(':')[1]);
    //日誌メッセージを表示
    let diaryMessage = '残り{n分}になりました。日誌を記入しましょう！';
    let countAlarm = 0;
    //変数にはそのコマの終了時刻を格納。現在時刻との差が5分になるとメッセージを表示
    if (diaryStartTime - nowTime <= 5 && needDiary == 1) {//メッセージ表示

        if (diaryStartTime - nowTime == 5 && second === 0) {//日誌アラーム用
            switch (timeTableY) {
                case 1:
                case 2:
                case 3:
                    timeTableY = timeTableY - 1;
                    break;
                case 5:
                case 6:
                case 7:
                    timeTableY = timeTableY - 2;
                    break;
                default:
                    timeTableY = -1
                    break;
            }

        }

        diaryMessage = diaryMessage.replace('{n分}', '5分');
        diaryText.innerText = diaryMessage;
    } else {//日誌時間外のメッセージ削除
        diaryText.innerText = '';
    }

    //昼休み 次のコマへのカウントダウン表示
    let countdownText = document.getElementById('countdown');
    let countdownEndTime;
    if (currentSubject[0] == 'lunchBreak') {
        for (let i = 0; i <= timeTable.length; i++) {
            if (timeTable[i][0] == currentSubject[0]) {
                countdownEndTime = timeTable[i + 1][1];
                break;
            }
        }

        countdownMessageOutput(countdownEndTime, nowTime, nowSecond, currentSchedule, countdownText, currentSubject);
    } else {
        countdownText.innerText = '';
    }
    //放課後のこり10分になったらカウントダウン（忘れてそう）<-忘れてた
    if (currentSubject[0] == 'afterSchool') {
        countdownEndTime = timeTable[timeTable.length - 1][2];
        countdownMessageOutput(countdownEndTime, nowTime, nowSecond, currentSchedule, countdownText, currentSubject)
    }
}

setInterval(updateSubject, 250);

let bgColor = "";
let textColor = "";

function countdownMessageOutput(countdownEndTime, nowTime, nowSecond, currentSchedule, countdownText, currentSubject) {
    let countdownMessage;
    let subjectName = currentSchedule[5];

    countdownEndTime = countdownEndTime.split(':');
    countdownEndTime = parseInt(countdownEndTime[0]) * 60 + parseInt(countdownEndTime[1]);
    if (currentSubject[0] == 'afterSchool' && countdownEndTime - nowTime > 10 || countdownEndTime <= nowTime) {
        return 0;
    } else if (currentSubject[0] == 'afterSchool') {
        subjectName = '放課後 終了';
    } else if (Array.isArray(currentSchedule[5])) {//複数の場合
        subjectName = currentSchedule[5].join('と');
    }
    if (countdownEndTime - nowTime > 1) {//通常
        //休憩時間のカウントダウンが切り捨てのため、辻褄合わせの-1
        countdownMessage = (countdownEndTime - nowTime - 1) + '分';
    } else {//1分未満
        countdownMessage = (countdownEndTime * 60 - nowSecond) + '秒';
    }

    countdownText.innerText = subjectName + 'まで あと' + countdownMessage;
}

//背景パターン
const backgroundColorCode = [
    ['weather', 'Clear', 'Cloudy', 'Rainy'],
    ['morning', '#87CEEB', '#ffffff', '#b4dbf5'],
    ['afternoon', '#00BFFF', '#ebf4fc', '#c4d8e9'],
    ['evening', '#FFA07A', '#ffffff', '#e0e0ff'],
    ['night', '#0B1364', '#c5c7c9', '#2c3e50'],
];

//文字色パターン
const textColorCode = [
    ['weather', 'Clear', 'Cloudy', 'Rainy'],
    ['morning', '#ffffff', '#4D4D4F', '#353535'],
    ['afternoon', '#ffffff', '#4D4D4F', '#353535'],
    ['evening', '#ffffff', '#e2a872', '#353535'],
    ['night', '#ffffff', '#002436', '#ffffff'],
];

let CITY = 'tokyo';

function colorChange() {//背景と文字の色を変える。インターバルはこっち。
    const API_KEY = 'df3ff73321f444bbb1e2f97a6bfaa639';

    CITY = getCityFromURL();

    let weather;

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            weather = data["weather"][0]["main"];
            const weatherId = data.weather[0].id;
            console.log(data);
            // 天気情報に応じた背景色を設定する

            if (weather == 'Thunderstorm' || weather == 'Drizzle' || weather == 'Rain' || weather == 'Snow') {
                console.log('weather -> Rainy');
                weather = 'Rainy';
            } else if (weatherId == 803 || weatherId == 804) {
                console.log('weather -> Cloudy');
                weather = 'Cloudy';
            } else {
                console.log('weather -> Clear');
                weather = 'Clear';
            }

            crossFadeColors(weather);
        });

}

// URLクエリパラメータから都市名を取得する関数
function getCityFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const city = urlParams.get('city');

    // クエリパラメータ 'city' が存在する場合、それを使用
    if (city) {
        return city;
    }
    // 存在しない場合はデフォルトの 'tokyo' を使用
    return CITY;
}

function crossFadeColors(pattern) {//背景と文字の色のクロスフェードを行う。デバックならこちら推奨
    //patter -> Clear-morning
    if (pattern.includes('-') == false) {
        pattern[0] = pattern;
        const hour = now.getHours();

        if (hour >= 5 && hour < 10) {//朝
            pattern = pattern + '-morning';
        } else if (hour >= 10 && hour < 16) {//昼
            pattern = pattern + '-afternoon';
        } else if (hour >= 16 && hour < 18) {//夕方
            pattern = pattern + '-evening';
        } else {//夜
            pattern = pattern + '-night';
        }
        console.log(pattern);
    }
    pattern = pattern.split('-');
    const body = document.body;
    const transitionTime = 2;

    let colorCodeNo = [];

    for (let y = 1; y < backgroundColorCode.length; y++) {
        for (let x = 1; x < backgroundColorCode[y].length; x++) {
            if (pattern[0] == backgroundColorCode[0][x] && pattern[1] == backgroundColorCode[y][0]) {
                colorCodeNo[0] = y;
                colorCodeNo[1] = x;
            }
        }
    }

    bgColor = backgroundColorCode[colorCodeNo[0]][colorCodeNo[1]];
    textColor = textColorCode[colorCodeNo[0]][colorCodeNo[1]];

    body.style.transition = `background-color ${transitionTime}s ease`;
    body.style.backgroundColor = bgColor;

    updateGradient(bgColor);


    const textElements = document.querySelectorAll("div, h1, h2, span, a");
    textElements.forEach((element) => {
        if (!element.classList.contains("overlay")) {
            element.style.transition = `color ${transitionTime}s ease`;
            element.style.color = textColor;
        }

        const spanElements = document.querySelectorAll("span");
        spanElements.forEach((span) => {
            span.style.transition = `background-color ${transitionTime}s ease`;
            span.style.backgroundColor = textColor;
        });
    });

    //バーの色設定
    const bgColorRGB = {
        R: parseInt(bgColor.slice(1, 3), 16),
        G: parseInt(bgColor.slice(3, 5), 16),
        B: parseInt(bgColor.slice(5, 7), 16)
    }

    const progressBar = document.querySelector('.progress-bar-inner');

    const max = Math.max(...Object.values(bgColorRGB));
    const min = Math.min(...Object.values(bgColorRGB));

    if ((max + min) / 2 <= 127.5) {//背景が暗い
        progressBar.style.backgroundColor = 'rgba(255, 255, 255, 80%)';
    } else {//背景が明るい
        progressBar.style.backgroundColor = 'rgba(30, 30, 30, 80%)';
    }
}

//ボタンの見た目切り替え
let isOpen = false;
$(".openbtn").click(function () {
    $(this).toggleClass('active');
    //ボタンを押された時の背景を暗く
    $(".overlay").toggleClass('active');

    if (isOpen) {
        saveInput();
    } else {
        loadInput();
    }
    isOpen = !isOpen;
});

let isFullScreenOpen = false;
//フルスクリーンボタン
function toggleFullScreen() {
    if (isFullScreenOpen) {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        console.log("フルスクリーンoff");
    } else {
        document.documentElement.requestFullscreen();
        enableWakeLock()
        console.log("フルスクリーンon");
    }
    isFullScreenOpen = !isFullScreenOpen;
}
//fullScreenbtnが押された時、activeを切り替え
$(".fullScreenbtn").click(function () {
    $(this).toggleClass('active');
    toggleFullScreen();
});

//フルスクリーンOFFになったら...
document.addEventListener('fullscreenchange', function () {
    if (!document.fullscreenElement) {
        // フルスクリーンがオフになったときに実行したい関数をここに呼び出す
        document.querySelector(".fullScreenbtn").classList.remove('active');
        isFullScreenOpen = false;
        disableWakeLock();
    }
});

//escロック
async function lockEscapeKey() {
    try {
        const keyboard = await navigator.keyboard.lock(['Escape']);

        keyboard.addEventListener('keydown', (event) => {
            // "esc" キーが押された場合のカスタムアクションをここに追加します
            console.log('esc キーがロックされました。');
        });

        keyboard.addEventListener('keyup', (event) => {
            // "esc" キーが離された場合のカスタムアクションをここに追加します
            console.log('esc キーがロック解除されました。');
        });
    } catch (error) {
    }
}

lockEscapeKey();


//科目名を入力するフォームを取得

function getSubjectValues(defaultSubject) {
    const subject1_1 = $('#subject-1-1').val();
    const subject1_2 = $('#subject-1-2').val();
    const subject2_1 = $('#subject-2-1').val();
    const subject2_2 = $('#subject-2-2').val();
    const subject3_1 = $('#subject-3-1').val();
    const subject3_2 = $('#subject-3-2').val();
    const subject4_1 = $('#subject-4-1').val();
    const subject4_2 = $('#subject-4-2').val();
    const subject5_1 = $('#subject-5-1').val();
    const subject5_2 = $('#subject-5-2').val();
    const subject6_1 = $('#subject-6-1').val();
    const subject6_2 = $('#subject-6-2').val();

    const subjectValues = [
        [subject1_1, subject1_2],
        [subject2_1, subject2_2],
        [subject3_1, subject3_2],
        [subject4_1, subject4_2],
        [subject5_1, subject5_2],
        [subject6_1, subject6_2],
    ];

    for (let i = 0; i < subjectValues.length; i++) {//+2してるのはdefaultSubjectのズレに合わせているため
        if (subjectValues[i][0] != '' && subjectValues[i][1] != '') {//両方空白ではない場合
            defaultSubject[i + 2] = subjectValues[i];
        } else if (subjectValues[i][0] != '' && subjectValues[i][1] == '') {//1つ目のみ空白ではない場合
            defaultSubject[i + 2] = subjectValues[i][0];
        } else if (subjectValues[i][0] == '' && subjectValues[i][1] != '') {//2つ目のみ空白ではない場合
            defaultSubject[i + 2] = subjectValues[i][1];
        }
    }

    return defaultSubject;
}

//入力欄を保存する
const inputs = document.querySelectorAll('input');
const inputsName = Array.from(inputs).map(input => input.id);

function loadInput() {
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].value = localStorage.getItem(inputsName[i]);
    }
}

function saveInput() {
    for (let i = 0; i < inputs.length; i++) {
        localStorage.setItem(inputsName[i], inputs[i].value);
    }
}

//リンクから開いた時、ローカルストレージを削除
function localStorageClear() {
    if (performance.navigation.type == 0) {
        window.localStorage.clear();
    }
}

//画面下のバー
function progressBarSet(startDate, endDate, timeTable) {
    const [startTimeHour, startTimeMinute] = timeTable[0][1].split(':');
    let startTime = new Date();
    const [startHour, startMinute, startSecond] = startDate.split(':');
    let endTime = new Date();
    const [endHour, endMinute, endSecond] = endDate.split(':');

    if (startTimeHour == startHour && startTimeMinute == startMinute) {
        startTime.setHours(9);
        startTime.setMinutes(0);
        startTime.setSeconds(0);

        endTime.setHours(startHour);
        endTime.setMinutes(startMinute);
        endTime.setSeconds(0);
    } else {
        startTime.setHours(startHour);
        startTime.setMinutes(startMinute);
        startTime.setSeconds(0);

        endTime.setHours(endHour);
        endTime.setMinutes(endMinute);
        endTime.setSeconds(0);
    }

    const progress = Math.max(0, Math.min(1, (now - startTime) / (endTime - startTime)));


    const progressBar = document.querySelector('.progress-bar-inner');
    progressBar.style.width = `${progress * 100}%`;
}


let wakeLock = null; // wakeLockオブジェクトを格納する変数
let timeoutId = 0; //タイムアウトID
//Wake Lock ON
async function enableWakeLock() {
    try {
        // Wake Lock APIをサポートしているか確認
        if ('wakeLock' in navigator) {
            // Wake Lockを要求し、Wake Lockオブジェクトを取得
            wakeLock = await navigator.wakeLock.request('screen');

            // Wake Lockが取得できたら、成功メッセージを表示
            console.log('Wake LockがONになりました。');
            //タイムアウト開始
            timeoutId = startTimeout();
            //console.log("ID->"+timeoutId);
        } else {
            console.log('Wake Lock APIはこのブラウザでサポートされていません。');
        }
    } catch (error) {
        console.error('Wake Lockを有効にできませんでした。', error);
    }
}

//Wake Lock OFF
async function disableWakeLock() {
    try {
        // wakeLockオブジェクトが存在するか確認
        if (wakeLock !== null) {
            //タイムアウトが続行中のみ
            if (checkTimeout()) {
                // Wake Lockを解放
                await wakeLock.release();

                // Wake Lockが解放されたら、成功メッセージを表示
                console.log('Wake LockがOFFになりました。');

                timeoutId = null;
                timeoutId = cancelTimeout(timeoutId);
            }
        } else {
            console.log('Wake LockがONにされていません。');
        }
    } catch (error) {
        console.error('Wake Lockを解放できませんでした。', error);
    }
}

//タイムアウトする時間（分単位）
const TimeoutMinutes = 0;//0の場合タイムアウトは無し
console.log("フルスクリーンボタンを押してから" + TimeoutMinutes + "分スリープ機能をブロックします。");
// setTimeoutを実行する関数

function startTimeout() {
    timeoutIdOutput = null;

    if (TimeoutMinutes > 0) {
        //「この時間までスリープ機能をブロックします。」メッセージ
        let timeoutTime = new Date(now.getTime() + TimeoutMinutes * 60 * 1000);
        console.log(timeoutTime.getHours() + ':' + timeoutTime.getMinutes() + ':' + timeoutTime.getSeconds() + 'までスリープ機能をブロックします。');

        // 後に実行する
        timeoutIdOutput = setTimeout(function () {
            disableWakeLock();
        }, TimeoutMinutes * 60 * 1000);
    }
    // setTimeoutのIDを返す（後でキャンセルするために必要）
    return timeoutIdOutput;
}

// setTimeoutをキャンセルする関数
function cancelTimeout(timeoutId) {
    if (checkTimeout()) {
        clearTimeout(timeoutId);
        console.log("setTimeoutがキャンセルされました。");
        return null;
    }
    return timeoutId;
}

// setTimeoutが動作中かどうかを確認する
// trueなら実行したい
function checkTimeout() {
    if (timeoutId) {
        return true;
    } else {
        return false;
    }
}

// 18個の画像の状態を格納する2次元配列(初期設定で3~6コマ目の日誌を記入するアラームはオンにする)
let initialAlarmStates = [
    [0, 0, 0], // alarm-1-1, alarm-1-2, alarm-1-3
    [0, 0, 0], // alarm-2-1, alarm-2-2, alarm-2-3
    [0, 1, 0], // alarm-3-1, alarm-3-2, alarm-3-3
    [0, 1, 0], // alarm-4-1, alarm-4-2, alarm-4-3
    [0, 1, 0], // alarm-5-1, alarm-5-2, alarm-5-3
    [0, 1, 0]  // alarm-6-1, alarm-6-2, alarm-6-3
];

// URLからクエリパラメータを取得する関数
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// alarmSelectの値を取得
const alarmSelect = getQueryParam('alarm');

// alarmSelectが指定されている場合、その値を配列に変換
if (alarmSelect) {
    const alarmValues = alarmSelect.split('').map(Number); // 文字列を数字の配列に変換
    // 初期の状態に基づいて、alarmStatesを更新
    for (let i = 0; i < initialAlarmStates.length; i++) {
        for (let j = 0; j < initialAlarmStates[i].length; j++) {
            initialAlarmStates[i][j] = alarmValues[i * 3 + j] || 0; // 値を設定
        }
    }
}

let alarmStates = initialAlarmStates; // デフォルトの状態
//アラーム関連はここから
$(document).ready(function () {

    // URLから直接アクセスしたか、再読み込みかを判断する
    const urlParams = new URLSearchParams(window.location.search);
    const useLocalStorage = !urlParams.has('new'); // URLに "new" パラメータがなければローカルストレージを使う

    if (useLocalStorage && localStorage.getItem('alarmStates')) {
        // ローカルストレージに保存されたデータがあれば使用
        alarmStates = JSON.parse(localStorage.getItem('alarmStates'));
    } else {
        // 新しいセッション、または "new" パラメータがある場合は初期状態を使用
        alarmStates = initialAlarmStates;
    }

    // ページ読み込み時に画像の初期状態を反映
    for (let i = 0; i < alarmStates.length; i++) {
        for (let j = 0; j < alarmStates[i].length; j++) {
            let imgId = `#alarm-${i + 1}-${j + 1}`; // 画像のIDを作成（alarm-1-1 など）
            if (alarmStates[i][j] === 1) {
                $(imgId).attr('src', 'alarm-on.png'); // 状態が1ならON画像に切り替え
            } else {
                $(imgId).attr('src', 'alarm-off.png'); // 状態が0ならOFF画像にする
            }
        }
    }

    // クリックイベントを全ての画像に適用
    $('.clickable-alarm').on('click', function () {
        const currentId = $(this).attr('id'); // クリックされた画像のIDを取得
        const parts = currentId.split('-'); // IDを分解
        const rowIndex = parseInt(parts[1]) - 1; // 行インデックスを取得（1から始まるので-1）
        const colIndex = parseInt(parts[2]) - 1; // 列インデックスを取得（1から始まるので-1）

        // 画像の状態を切り替える
        if (alarmStates[rowIndex][colIndex] === 0) {
            $(this).attr('src', 'alarm-on.png'); // ON画像に変更
            alarmStates[rowIndex][colIndex] = 1; // 状態をONに更新
        } else {
            $(this).attr('src', 'alarm-off.png'); // OFF画像に変更
            alarmStates[rowIndex][colIndex] = 0; // 状態をOFFに更新
        }

        // ローカルストレージに状態を保存
        localStorage.setItem('alarmStates', JSON.stringify(alarmStates));

        // 現在の状態をコンソールに表示（デバッグ用）
        console.log(alarmStates);
    });
});

//音量バー
const inputRange = document.getElementById('inputRange');

// 値に基づいてlinear-gradientの色を変更する関数
function updateGradient(color1) {
    const value = inputRange.value;

    // linear-gradientを更新
    inputRange.style.background = `linear-gradient(0deg, ${color1} ${value}%, transparent ${value}%)`;
}

inputRange.addEventListener("input", function () {
    const ratio = (this.value - this.min) / (this.max - this.min) * 100;
    this.style.background = `linear-gradient(0deg, ${bgColor} ${ratio}%, transparent ${ratio}%)`;
});


$(document).ready(function () {
    const inputRange = $('#inputRange');
    const volumeImage = $('#volumeImage');

    // 初期設定
    const initialValue = parseInt(inputRange.val(), 10);
    let imgSrc = 'volume-2.png'; // デフォルトの画像

    // 値に応じて画像を変更
    if (initialValue <= 0) {
        imgSrc = 'volume-0.png'; // 0%
    } else if (initialValue <= 49) {
        imgSrc = 'volume-1.png'; // 1% - 49%
    } else if (initialValue < 100) {
        imgSrc = 'volume-2.png'; // 50% - 99%
    } else {
        imgSrc = 'volume-3.png'; // 100%
    }

    volumeImage.attr('src', imgSrc); // 画像を更新

    inputRange.on('input', function () {
        const value = parseInt($(this).val(), 10); // スライダーの値を取得
        let imgSrc = 'volume-2.png'; // デフォルトの画像

        // 値に応じて画像を変更
        if (value == 0) {
            imgSrc = 'volume-0.png'; // 0%
        } else if (value <= 49) {
            imgSrc = 'volume-1.png'; // 1% - 49%
        } else if (value < 100) {
            imgSrc = 'volume-2.png'; // 50% - 99%
        } else {
            imgSrc = 'volume-3.png'; // 100%
        }

        volumeImage.attr('src', imgSrc); // 画像を更新
    });
});

//アラーム音
const audio = document.getElementById('audio');

// 音量を設定する関数
function setVolume() {
    const volume = inputRange.value / 100; // 0.0から1.0の範囲に変換
    audio.volume = volume; // 音量を設定
}

// 画像をクリックしたときのイベントリスナー
volumeImage.addEventListener('click', () => {
    audio.currentTime = 0; // 音声を最初から再生
    audio.play(); // 音声を再生
});

// スライダーの値が変わったときに音量を更新
inputRange.addEventListener('input', setVolume);

// 初期音量を設定
setVolume();

//時間を見て アラームを流すか
function shouldTriggerAlarm() {
    let alarmTimeTable = [
        [timeTable[1][1], , timeTable[1][2]],
        [timeTable[2][1], , timeTable[2][2]],
        [timeTable[3][1], , timeTable[3][2]],
        [timeTable[5][1], , timeTable[5][2]],
        [timeTable[6][1], , timeTable[6][2]],
        [timeTable[7][1], , timeTable[7][2]],
    ];

    let alarmList = [];

    for (let i = 0; i < alarmTimeTable.length; i++) {
        alarmTimeTable[i][0] = alarmTimeTable[i][0].split(':').map(Number);
        alarmTimeTable[i][2] = alarmTimeTable[i][2].split(':').map(Number);
        alarmTimeTable[i][1] = [alarmTimeTable[i][2][0], alarmTimeTable[i][2][1] - 5];

        for (let j = 0; j < alarmStates[i].length; j++) {
            if (alarmStates[i][j] === 1) {
                alarmList.push(alarmTimeTable[i][j]);
            }
        }


    }

    let hours = now.getHours();
    let minutes = now.getMinutes();
    let second = now.getSeconds();

    for (let i = 0; i < alarmList.length; i++) {
        if (alarmList[i][0] == hours && alarmList[i][1] == minutes && second == 0) {
            alarmPlay();
        }
    }
}

function alarmPlay() {
    audio.play();
}
