import React, { useState, useEffect, useRef } from 'react';

// 資料儲存工具
const Storage = {
  getUsers: () => {
    try {
      const users = localStorage.getItem('kaohsiung_explorer_users');
      return users ? JSON.parse(users) : [];
    } catch { return []; }
  },
  saveUsers: (users) => {
    localStorage.setItem('kaohsiung_explorer_users', JSON.stringify(users));
  },
  getUser: (username) => Storage.getUsers().find(u => u.name === username),
  createUser: (username, avatar) => {
    const users = Storage.getUsers();
    const newUser = {
      name: username, avatar: avatar || '🧒', level: 1, xp: 0, badges: 0,
      plants: 0, animals: 0, photos: 0, streak: 1, lastPlayDate: new Date().toDateString(),
      createdAt: new Date().toISOString(),
      completed: { metropolitan: 0, sugar: 0, pier2: 0, ruifeng: 0, edatheme: 0 }, 
      completedMissions: [],
      missionPhotos: {},
    };
    users.push(newUser);
    Storage.saveUsers(users);
    return newUser;
  },
  updateUser: (username, updates) => {
    const users = Storage.getUsers();
    const index = users.findIndex(u => u.name === username);
    if (index !== -1) { users[index] = { ...users[index], ...updates }; Storage.saveUsers(users); return users[index]; }
    return null;
  },
  deleteUser: (username) => {
    Storage.saveUsers(Storage.getUsers().filter(u => u.name !== username));
  },
  getCurrentUser: () => localStorage.getItem('kaohsiung_explorer_current'),
  setCurrentUser: (username) => {
    if (username) localStorage.setItem('kaohsiung_explorer_current', username);
    else localStorage.removeItem('kaohsiung_explorer_current');
  },
};

// 任務資料
const areasData = [
  { id: 'metropolitan', name: '高雄都會公園', icon: '🌳', color: '#22c55e', colorDark: '#16a34a', description: '探索自然生態的綠色寶庫', location: '楠梓區', totalMissions: 5 },
  { id: 'sugar', name: '橋頭糖廠', icon: '🏭', color: '#f59e0b', colorDark: '#d97706', description: '穿越百年糖業歷史', location: '橋頭區', totalMissions: 5 },
  { id: 'pier2', name: '駁二藝術特區', icon: '🎨', color: '#8b5cf6', colorDark: '#7c3aed', description: '創意與藝術的海港倉庫', location: '鹽埕區', totalMissions: 5 },
  { id: 'ruifeng', name: '瑞豐夜市', icon: '🏮', color: '#ef4444', colorDark: '#dc2626', description: '品嚐道地台灣美食文化', location: '左營區', totalMissions: 5 },
  { id: 'edatheme', name: '義大遊樂世界', icon: '🎢', color: '#06b6d4', colorDark: '#0891b2', description: '希臘風情的歡樂王國', location: '大樹區', totalMissions: 5 },
];

const missionsData = {
  metropolitan: [
    { 
      id: 'metro_m1', name: '落羽松偵探', icon: '🌲', type: 'plant', xp: 50, difficulty: 1, time: 15, 
      description: '找到園區內美麗的落羽松林，了解這種特別的樹木。', 
      location: '落羽松林區', 
      coordinates: { lat: 22.7256, lng: 120.3034 }, 
      hints: ['從主入口往東走約5分鐘', '靠近生態湖區北側'], 
      photoTask: {
        title: '📸 拍照任務',
        mission: '拍一張落羽松的照片',
        tips: ['可以拍整棵樹或特寫樹葉', '如果是秋冬季，記錄紅褐色的葉子', '可以站在樹下往上拍，效果更壯觀'],
        example: '🌲 落羽松與你的合照'
      },
      quiz: { question: '落羽松的葉子在秋天會變成什麼顏色？', options: ['綠色', '紅褐色', '藍色', '白色'], correct: 1, explanation: '落羽松秋冬時葉子會從綠色轉為美麗的紅褐色。' }, 
      knowledge: { title: '落羽松', scientificName: 'Taxodium distichum', facts: ['可以長到30-40公尺高', '壽命超過1000年', '原產於北美洲'] } 
    },
    { 
      id: 'metro_m2', name: '蝴蝶追蹤者', icon: '🦋', type: 'animal', xp: 60, difficulty: 2, time: 20, 
      description: '在花叢中尋找美麗的蝴蝶，記錄牠們的特徵。', 
      location: '蝴蝶花園區', 
      coordinates: { lat: 22.7245, lng: 120.3028 }, 
      hints: ['在陽光充足的花圃區域', '上午9-11點蝴蝶最活躍'], 
      photoTask: {
        title: '📸 拍照任務',
        mission: '拍一張蝴蝶的照片',
        tips: ['動作要輕、要慢，不要嚇到蝴蝶', '蝴蝶停在花上時是最佳拍照時機', '可以拍蝴蝶翅膀的花紋'],
        example: '🦋 蝴蝶停在花朵上'
      },
      quiz: { question: '蝴蝶用身體的哪個部位來品嚐食物？', options: ['嘴巴', '觸角', '腳', '翅膀'], correct: 2, explanation: '蝴蝶的腳上有味覺感受器！' }, 
      knowledge: { title: '蝴蝶', scientificName: 'Lepidoptera', facts: ['全世界有超過2萬種蝴蝶', '翅膀上有數萬片微小鱗片'] } 
    },
    { 
      id: 'metro_m3', name: '大葉欖仁尋蹤', icon: '🍂', type: 'plant', xp: 40, difficulty: 1, time: 12, 
      description: '尋找高大的大葉欖仁樹，觀察它獨特的大葉子。', 
      location: '主步道旁', 
      coordinates: { lat: 22.7240, lng: 120.3020 }, 
      hints: ['沿著主步道兩旁尋找', '葉子非常大，像一個大扇子'], 
      photoTask: {
        title: '📸 拍照任務',
        mission: '拍一張大葉欖仁的葉子，用手掌比大小',
        tips: ['把手放在葉子旁邊當比例尺', '拍攝葉子的紋路細節', '如果是秋天，找紅色的葉子更漂亮'],
        example: '🖐️ 手掌與大葉子的對比照'
      },
      quiz: { question: '大葉欖仁的葉子在秋天會變成什麼顏色？', options: ['黃色', '紅色', '紫色', '保持綠色'], correct: 1, explanation: '大葉欖仁秋天時葉子會轉為鮮豔的紅色！' }, 
      knowledge: { title: '大葉欖仁', scientificName: 'Terminalia catappa', facts: ['葉子長達20-30公分', '又叫做「印度杏仁樹」'] } 
    },
    { 
      id: 'metro_m4', name: '白鷺鷥觀察站', icon: '🦢', type: 'animal', xp: 55, difficulty: 2, time: 20, 
      description: '在生態湖區觀察優雅的白鷺鷥。', 
      location: '生態湖區', 
      coordinates: { lat: 22.7250, lng: 120.3040 }, 
      hints: ['湖邊或淺水區最常出現', '保持安靜，不要驚擾牠們'], 
      photoTask: {
        title: '📸 拍照任務',
        mission: '拍一張白鷺鷥的照片',
        tips: ['保持距離，用手機放大拍攝', '白鷺鷥站著或飛行時都很美', '耐心等待，牠們會出現的！'],
        example: '🦢 白鷺鷥在湖邊的優雅身影'
      },
      quiz: { question: '白鷺鷥飛行時脖子是什麼形狀？', options: ['伸直的', 'S形彎曲', 'L形', '圓形'], correct: 1, explanation: '白鷺鷥飛行時會把脖子縮成S形！' }, 
      knowledge: { title: '小白鷺', scientificName: 'Egretta garzetta', facts: ['身長約55-65公分', '主要吃魚、蝦、昆蟲'] } 
    },
    { 
      id: 'metro_m5', name: '影子實驗室', icon: '☀️', type: 'science', xp: 65, difficulty: 2, time: 30, 
      description: '觀察影子在不同時間的變化。', 
      location: '大草原區', 
      coordinates: { lat: 22.7235, lng: 120.3025 }, 
      hints: ['選擇一棵獨立的樹', '比較上午和中午的影子'], 
      photoTask: {
        title: '📸 拍照任務',
        mission: '拍一張你和影子的創意合照',
        tips: ['試著擺出有趣的姿勢，讓影子看起來很酷', '可以和朋友一起拍影子合照', '觀察影子的長度和方向'],
        example: '👤 你和你的影子'
      },
      quiz: { question: '為什麼中午的影子比早上短？', options: ['太陽變小了', '太陽在頭頂正上方', '樹變矮了', '眼睛的錯覺'], correct: 1, explanation: '中午時太陽升到最高點，所以影子最短！' }, 
      knowledge: { title: '影子與日晷', facts: ['影子的長度和太陽高度有關', '日晷是人類最早的計時工具之一'] } 
    },
  ],
  sugar: [
    { 
      id: 'sugar_m1', name: '百年廠長宿舍', icon: '🏛️', type: 'history', xp: 45, difficulty: 1, time: 15, 
      description: '探訪建於1901年的日式廠長宿舍。', 
      location: '廠長宿舍區', 
      coordinates: { lat: 22.7580, lng: 120.3050 }, 
      hints: ['位於糖廠入口附近', '是一棟日式木造建築'], 
      photoTask: {
        title: '📸 拍照任務',
        mission: '拍一張日式建築的外觀照片',
        tips: ['拍攝整棟建築的全景', '注意日式建築的屋頂和木造結構', '可以拍攝窗戶或門的細節'],
        example: '🏛️ 百年日式建築外觀'
      },
      quiz: { question: '橋頭糖廠是在哪一年創建的？', options: ['1895年', '1901年', '1920年', '1945年'], correct: 1, explanation: '橋頭糖廠創建於1901年，是台灣第一座現代化糖廠！' }, 
      knowledge: { title: '橋頭糖廠歷史', facts: ['1901年創建', '1999年停止製糖', '2006年轉型為觀光園區'] } 
    },
    { 
      id: 'sugar_m2', name: '甘蔗小學堂', icon: '🎋', type: 'plant', xp: 50, difficulty: 1, time: 15, 
      description: '認識甘蔗這種神奇的植物。', 
      location: '甘蔗田區', 
      coordinates: { lat: 22.7575, lng: 120.3060 }, 
      hints: ['尋找高高的綠色植物', '莖部有一節一節的'], 
      photoTask: {
        title: '📸 拍照任務',
        mission: '拍一張甘蔗的照片',
        tips: ['拍攝甘蔗一節一節的莖部', '如果可以，拍攝甘蔗田的壯觀景象', '可以和高高的甘蔗比身高'],
        example: '🎋 甘蔗特寫或甘蔗田'
      },
      quiz: { question: '甘蔗的糖分主要儲存在哪裡？', options: ['葉子', '根部', '莖部', '花朵'], correct: 2, explanation: '甘蔗的糖分主要儲存在莖部！' }, 
      knowledge: { title: '甘蔗', scientificName: 'Saccharum officinarum', facts: ['可以長到3-6公尺高', '世界上80%的糖來自甘蔗'] } 
    },
    { 
      id: 'sugar_m3', name: '五分車的秘密', icon: '🚂', type: 'history', xp: 55, difficulty: 2, time: 20, 
      description: '發現糖廠特有的窄軌火車「五分車」。', 
      location: '五分車站', 
      coordinates: { lat: 22.7585, lng: 120.3045 }, 
      hints: ['在糖廠內尋找鐵軌', '軌道比一般火車窄'], 
      photoTask: {
        title: '📸 拍照任務',
        mission: '拍一張五分車或鐵軌的照片',
        tips: ['可以拍攝可愛的小火車頭', '蹲下來拍鐵軌延伸的感覺很棒', '如果有搭乘五分車，記得拍紀念照'],
        example: '🚂 五分車或窄軌鐵道'
      },
      quiz: { question: '「五分車」名字的由來是什麼？', options: ['只有五節車廂', '每五分鐘一班', '軌道寬度是標準的一半', '票價五分錢'], correct: 2, explanation: '五分車的軌道寬度大約是標準軌道的一半！' }, 
      knowledge: { title: '五分車', facts: ['軌道寬度762mm', '全盛時期全台有3000公里糖鐵'] } 
    },
    { 
      id: 'sugar_m4', name: '糖廠冰品任務', icon: '🍦', type: 'culture', xp: 35, difficulty: 1, time: 10, 
      description: '品嚐糖廠最有名的古早味冰品。', 
      location: '冰品販賣部', 
      coordinates: { lat: 22.7578, lng: 120.3055 }, 
      hints: ['跟著人潮走準沒錯', '紅豆酵母冰最有名'], 
      photoTask: {
        title: '📸 拍照任務',
        mission: '買一支冰，拍下你的美味冰品！',
        tips: ['趁冰還沒融化之前趕快拍', '可以拍冰品的特寫或你吃冰的樣子', '推薦試試紅豆酵母冰'],
        example: '🍦 手拿糖廠冰品的照片'
      },
      quiz: { question: '糖廠最有名的冰品口味是什麼？', options: ['巧克力', '草莓', '紅豆酵母', '芒果'], correct: 2, explanation: '紅豆酵母冰是糖廠最經典的口味！' }, 
      knowledge: { title: '糖廠冰品', facts: ['使用糖廠自產的糖', '保持傳統製作方法'] } 
    },
    { 
      id: 'sugar_m5', name: '百年老榕樹', icon: '🌴', type: 'plant', xp: 45, difficulty: 1, time: 15, 
      description: '探訪糖廠內的百年老榕樹。', 
      location: '榕樹廣場', 
      coordinates: { lat: 22.7582, lng: 120.3048 }, 
      hints: ['是一棵非常大的樹', '有很多垂下來的根'], 
      photoTask: {
        title: '📸 拍照任務',
        mission: '拍一張老榕樹的氣根照片',
        tips: ['拍攝從樹枝垂下來的氣根', '可以站在大樹下拍攝樹冠', '和百年老樹合照很有紀念價值'],
        example: '🌴 榕樹的壯觀氣根'
      },
      quiz: { question: '榕樹垂下來的根叫什麼？', options: ['主根', '側根', '氣根', '鬚根'], correct: 2, explanation: '榕樹從枝幹垂下來的根叫做「氣根」！' }, 
      knowledge: { title: '榕樹', scientificName: 'Ficus microcarpa', facts: ['可以長到30公尺高', '壽命可達數百年'] } 
    },
  ],
  pier2: [
    { 
      id: 'pier2_m1', name: '大黃蜂出沒', icon: '🤖', type: 'art', xp: 40, difficulty: 1, time: 10, 
      description: '尋找用回收金屬製作的大型機器人雕塑。', 
      location: '大義倉庫群', 
      coordinates: { lat: 22.6195, lng: 120.2815 }, 
      hints: ['是一個很大的金屬機器人', '使用汽車零件製作'], 
      photoTask: {
        title: '📸 拍照任務',
        mission: '和機器人雕塑合照！',
        tips: ['可以模仿機器人的姿勢合照', '拍攝機器人的細節，看看有哪些汽車零件', '從不同角度拍攝會有不同感覺'],
        example: '🤖 你和變形金剛的帥氣合照'
      },
      quiz: { question: '駁二的大型機器人雕塑是用什麼材料製作的？', options: ['全新金屬', '塑膠', '回收金屬和汽車零件', '木頭'], correct: 2, explanation: '這些機器人雕塑是用回收的汽車零件製作的！' }, 
      knowledge: { title: '金屬雕塑藝術', facts: ['使用廢棄汽車零件', '展現環保與藝術結合'] } 
    },
    { 
      id: 'pier2_m2', name: '彩繪倉庫大挑戰', icon: '🖼️', type: 'art', xp: 70, difficulty: 2, time: 30, 
      description: '收集倉庫外牆上的精彩壁畫照片。', 
      location: '倉庫區', 
      coordinates: { lat: 22.6200, lng: 120.2820 }, 
      hints: ['在倉庫的外牆上尋找', '有各種風格的壁畫'], 
      photoTask: {
        title: '📸 拍照任務',
        mission: '拍下你最喜歡的一幅壁畫',
        tips: ['找一幅你覺得最有趣的壁畫', '可以和壁畫互動拍出創意照片', '記錄壁畫的顏色和主題'],
        example: '🖼️ 最喜歡的壁畫作品'
      },
      quiz: { question: '壁畫和塗鴉的主要區別是什麼？', options: ['大小不同', '壁畫通常有授權', '顏色不同', '沒有區別'], correct: 1, explanation: '壁畫通常是經過授權的大型畫作。' }, 
      knowledge: { title: '壁畫藝術', facts: ['壁畫歷史可追溯到史前時代', '駁二有數十幅大型壁畫'] } 
    },
    { 
      id: 'pier2_m3', name: '港口的故事', icon: '⚓', type: 'history', xp: 55, difficulty: 2, time: 20, 
      description: '了解駁二從碼頭倉庫變成藝術特區的故事。', 
      location: '碼頭區', 
      coordinates: { lat: 22.6188, lng: 120.2825 }, 
      hints: ['「駁二」名字的由來就藏在這裡', '靠近水邊的區域'], 
      photoTask: {
        title: '📸 拍照任務',
        mission: '拍一張碼頭或港口的風景照',
        tips: ['拍攝海水和倉庫的組合', '如果有船經過，記得捕捉', '碼頭邊的風景很適合拍全景'],
        example: '⚓ 碼頭港口風景'
      },
      quiz: { question: '「駁二」的名字是什麼意思？', options: ['第二個博物館', '第二號接駁碼頭', '兩個倉庫', '二號公路'], correct: 1, explanation: '「駁二」是「第二號接駁碼頭」的簡稱！' }, 
      knowledge: { title: '駁二藝術特區歷史', facts: ['1914年高雄港開港', '2002年轉型為藝術特區'] } 
    },
    { 
      id: 'pier2_m4', name: '輕軌初體驗', icon: '🚃', type: 'culture', xp: 50, difficulty: 1, time: 15, 
      description: '認識台灣第一條輕軌系統。', 
      location: '輕軌站', 
      coordinates: { lat: 22.6192, lng: 120.2805 }, 
      hints: ['尋找輕軌車站', '注意看它沒有架空電線'], 
      photoTask: {
        title: '📸 拍照任務',
        mission: '拍一張輕軌列車的照片',
        tips: ['可以在月台等列車進站時拍攝', '注意觀察輕軌沒有架空電線的特色', '如果有搭乘，可以拍車內的樣子'],
        example: '🚃 高雄輕軌列車'
      },
      quiz: { question: '高雄輕軌是台灣第幾條輕軌系統？', options: ['第一條', '第二條', '第三條', '第四條'], correct: 0, explanation: '高雄輕軌是台灣第一條輕軌系統！' }, 
      knowledge: { title: '高雄輕軌', facts: ['2015年通車', '使用超級電容供電'] } 
    },
    { 
      id: 'pier2_m5', name: '碼頭夕陽', icon: '🌅', type: 'science', xp: 80, difficulty: 2, time: 30, 
      description: '在碼頭欣賞美麗的夕陽。', 
      location: '觀景碼頭', 
      coordinates: { lat: 22.6185, lng: 120.2830 }, 
      hints: ['傍晚5點到6點半最適合', '面向西方'], 
      photoTask: {
        title: '📸 拍照任務',
        mission: '拍下美麗的夕陽！',
        tips: ['傍晚時分天空顏色最美', '可以拍夕陽倒映在海面上的樣子', '加入人物剪影會更有感覺'],
        example: '🌅 碼頭夕陽美景'
      },
      quiz: { question: '為什麼夕陽看起來是橘紅色的？', options: ['太陽變色了', '海水反射', '藍光被散射掉了', '眼睛的錯覺'], correct: 2, explanation: '夕陽時藍光被散射掉，剩下紅橘色的光！' }, 
      knowledge: { title: '夕陽的科學', facts: ['這種現象叫做「瑞利散射」', '黃金時刻是攝影的最佳時機'] } 
    },
  ],
  ruifeng: [
    { 
      id: 'ruifeng_m1', name: '臭豆腐大挑戰', icon: '🫕', type: 'food', xp: 45, difficulty: 1, time: 15, 
      description: '品嚐台灣經典小吃臭豆腐，了解這道特別的美食是怎麼製作的。', 
      location: '小吃攤位區', 
      coordinates: { lat: 22.6697, lng: 120.3025 }, 
      hints: ['聞到特殊的味道就對了', '通常會配泡菜一起吃', '外酥內嫩是好吃的關鍵'], 
      photoTask: {
        title: '📸 拍照任務',
        mission: '買一份臭豆腐，拍下這道經典美食！',
        tips: ['拍攝剛起鍋的酥脆臭豆腐', '記得拍到配菜泡菜', '可以拍你大口吃的樣子'],
        example: '🫕 酥脆的臭豆腐配泡菜'
      },
      quiz: { question: '臭豆腐的特殊味道是怎麼來的？', options: ['加了臭雞蛋', '發酵產生的', '加了特殊香料', '用臭水煮的'], correct: 1, explanation: '臭豆腐是將豆腐放在發酵液中浸泡，讓微生物發酵產生特殊風味！' }, 
      knowledge: { title: '臭豆腐', facts: ['起源於中國清朝', '台灣臭豆腐以酥炸為主', '發酵過程約需3-6個月', '富含蛋白質和維生素B12'] } 
    },
    { 
      id: 'ruifeng_m2', name: '珍珠奶茶探險', icon: '🧋', type: 'food', xp: 50, difficulty: 1, time: 10, 
      description: '找到珍珠奶茶攤位，了解這個台灣發明的世界級飲料！', 
      location: '飲料攤位區', 
      coordinates: { lat: 22.6695, lng: 120.3030 }, 
      hints: ['珍珠是用什麼做的呢？', '台灣人的驕傲飲料', '可以選擇甜度和冰塊'], 
      photoTask: {
        title: '📸 拍照任務',
        mission: '買一杯珍珠奶茶，拍下台灣之光！',
        tips: ['拍攝杯子裡Q彈的珍珠', '可以用吸管攪一攪再拍', '記錄你選的甜度和冰塊'],
        example: '🧋 Q彈珍珠奶茶'
      },
      quiz: { question: '珍珠奶茶的「珍珠」主要是用什麼做的？', options: ['米粉', '麵粉', '樹薯粉（木薯）', '馬鈴薯粉'], correct: 2, explanation: '珍珠是用樹薯粉（木薯粉）製作的，加水煮熟後會變得Q彈有嚼勁！' }, 
      knowledge: { title: '珍珠奶茶', facts: ['1980年代在台灣發明', '又叫做「波霸奶茶」', '已經風靡全世界', '珍珠煮好後要泡糖水增加甜味'] } 
    },
    { 
      id: 'ruifeng_m3', name: '蚵仔煎偵探', icon: '🥘', type: 'food', xp: 55, difficulty: 2, time: 20, 
      description: '觀察蚵仔煎的製作過程，這是台灣夜市最有代表性的小吃之一！', 
      location: '熱炒攤位區', 
      coordinates: { lat: 22.6700, lng: 120.3028 }, 
      hints: ['會聽到煎台上滋滋作響', '淋上特製甜辣醬', '新鮮蚵仔是關鍵'], 
      photoTask: {
        title: '📸 拍照任務',
        mission: '拍下蚵仔煎製作過程或成品！',
        tips: ['可以拍攝老闆在煎台上製作的過程', '拍攝淋上醬汁的蚵仔煎', '近拍可以看到蚵仔和蛋'],
        example: '🥘 熱騰騰的蚵仔煎'
      },
      quiz: { question: '蚵仔煎裡面除了蚵仔，還有什麼重要材料讓它變得軟Q？', options: ['麵粉', '太白粉（番薯粉）', '糯米粉', '玉米粉'], correct: 1, explanation: '蚵仔煎使用太白粉（番薯粉）加水調成粉漿，這讓蚵仔煎有獨特的軟Q口感！' }, 
      knowledge: { title: '蚵仔煎', facts: ['源自福建閩南地區', '台灣西南沿海盛產蚵仔', '醬料是靈魂，各家配方不同', '已有數百年歷史'] } 
    },
    { 
      id: 'ruifeng_m4', name: '夜市遊戲王', icon: '🎯', type: 'culture', xp: 40, difficulty: 1, time: 15, 
      description: '體驗夜市的傳統遊戲攤位，了解這些遊戲的歷史。', 
      location: '遊戲攤位區', 
      coordinates: { lat: 22.6698, lng: 120.3022 }, 
      hints: ['射氣球、撈金魚、套圈圈', '這些遊戲陪伴了好幾代台灣人', '試試你的手氣和技巧'], 
      photoTask: {
        title: '📸 拍照任務',
        mission: '拍一張你在玩夜市遊戲的照片！',
        tips: ['可以拍攝射氣球、撈金魚、套圈圈的過程', '拍下你贏得的獎品', '記錄遊戲攤位的熱鬧氣氛'],
        example: '🎯 夜市遊戲挑戰中'
      },
      quiz: { question: '夜市撈金魚遊戲用的紙網叫什麼？', options: ['魚網', '撈網', 'ポイ（Poi）', '紙兜'], correct: 2, explanation: '撈金魚用的紙網源自日本，日文叫做「ポイ」（Poi），這個遊戲是從日本傳到台灣的！' }, 
      knowledge: { title: '夜市遊戲文化', facts: ['許多遊戲源自日治時期', '射擊遊戲最受歡迎', '套圈圈考驗眼力和技巧', '是台灣獨特的庶民娛樂'] } 
    },
    { 
      id: 'ruifeng_m5', name: '夜市經濟學', icon: '💰', type: 'culture', xp: 60, difficulty: 2, time: 25, 
      description: '觀察夜市的運作方式，了解夜市文化如何影響台灣經濟。', 
      location: '夜市入口區', 
      coordinates: { lat: 22.6693, lng: 120.3020 }, 
      hints: ['數數看有多少攤位', '觀察人潮最多的時間', '想想看為什麼夜市這麼受歡迎'], 
      photoTask: {
        title: '📸 拍照任務',
        mission: '拍一張夜市人潮的照片！',
        tips: ['站在高處或入口拍攝人潮', '拍攝攤位林立的熱鬧景象', '可以拍夜市的招牌和燈光'],
        example: '💰 熱鬧的夜市人潮'
      },
      quiz: { question: '瑞豐夜市大約有多少個攤位？', options: ['約100個', '約500個', '約1000個', '約2000個'], correct: 2, explanation: '瑞豐夜市是高雄最大的夜市之一，大約有超過1000個攤位！每週二、四、五、六、日營業。' }, 
      knowledge: { title: '台灣夜市文化', facts: ['全台灣有超過300個夜市', '夜市年產值超過500億台幣', '是觀光客必訪景點', '展現台灣庶民生活文化'] } 
    },
  ],
  edatheme: [
    { 
      id: 'eda_m1', name: '希臘神殿探索', icon: '🏛️', type: 'architecture', xp: 50, difficulty: 1, time: 20, 
      description: '欣賞義大世界的希臘風格建築，了解古希臘建築的特色。', 
      location: '希臘主題區', 
      coordinates: { lat: 22.7285, lng: 120.4195 }, 
      hints: ['尋找白色圓柱建築', '藍白色調是希臘的特色', '注意觀察柱子的樣式'], 
      photoTask: {
        title: '📸 拍照任務',
        mission: '和希臘風格建築合照！',
        tips: ['找到白色圓柱建築', '可以模仿希臘雕像的姿勢', '藍白色的建築拍起來很美'],
        example: '🏛️ 希臘風情建築合照'
      },
      quiz: { question: '希臘建築中最常見的柱子樣式有三種，下列何者不是？', options: ['多立克柱式', '愛奧尼亞柱式', '科林斯柱式', '羅馬柱式'], correct: 3, explanation: '古希臘三大柱式是：多立克（簡潔）、愛奧尼亞（渦卷裝飾）、科林斯（葉片裝飾）。羅馬柱式是後來的發展！' }, 
      knowledge: { title: '希臘建築', facts: ['源自西元前7世紀', '白色大理石是主要建材', '強調對稱與比例', '帕德嫩神廟是最著名代表'] } 
    },
    { 
      id: 'eda_m2', name: '摩天輪科學家', icon: '🎡', type: 'science', xp: 65, difficulty: 2, time: 30, 
      description: '搭乘摩天輪，了解這個巨大機械是如何運作的！', 
      location: '摩天輪區', 
      coordinates: { lat: 22.7290, lng: 120.4200 }, 
      hints: ['義大摩天輪高度約80公尺', '觀察車廂如何保持平衡', '想想看為什麼轉動時不會掉下來'], 
      photoTask: {
        title: '📸 拍照任務',
        mission: '拍一張摩天輪的壯觀照片！',
        tips: ['從下往上拍可以拍出摩天輪的高大', '如果有搭乘，在車廂內拍窗外風景', '夜晚的摩天輪燈光很美'],
        example: '🎡 壯觀的摩天輪'
      },
      quiz: { question: '摩天輪的車廂為什麼不管轉到哪裡都能保持水平？', options: ['有電腦控制', '重力讓底部永遠朝下', '車廂會自己轉動', '工作人員在調整'], correct: 1, explanation: '摩天輪車廂的底部比較重，加上重力作用，不管輪子轉到哪裡，重的那一端永遠朝下，所以車廂能保持水平！' }, 
      knowledge: { title: '摩天輪原理', facts: ['第一座摩天輪建於1893年芝加哥', '利用重力保持車廂平衡', '義大摩天輪可容納約400人', '世界最高摩天輪在杜拜（250公尺）'] } 
    },
    { 
      id: 'eda_m3', name: '雲霄飛車物理學', icon: '🎢', type: 'science', xp: 70, difficulty: 2, time: 25, 
      description: '體驗刺激的雲霄飛車，了解背後的物理原理！', 
      location: '刺激設施區', 
      coordinates: { lat: 22.7280, lng: 120.4190 }, 
      hints: ['為什麼上坡時會變慢？', '下坡時為什麼感覺失重？', '過彎時為什麼會被往外推？'], 
      photoTask: {
        title: '📸 拍照任務',
        mission: '拍一張雲霄飛車軌道的照片！',
        tips: ['拍攝軌道彎曲和翻轉的部分', '可以拍列車經過時的刺激畫面', '排隊時可以先拍軌道'],
        example: '🎢 刺激的雲霄飛車軌道'
      },
      quiz: { question: '雲霄飛車在最高點之後不需要引擎動力就能跑完全程，這是利用什麼原理？', options: ['電力驅動', '磁力推進', '位能轉換成動能', '風力推動'], correct: 2, explanation: '雲霄飛車利用「能量守恆」原理：在最高點時有最大的位能，下降時位能轉換成動能（速度），所以不需要額外動力！' }, 
      knowledge: { title: '雲霄飛車物理', facts: ['利用位能與動能轉換', '離心力讓你貼在座位上', '最高時速可達200公里', '1884年發明第一座雲霄飛車'] } 
    },
    { 
      id: 'eda_m4', name: '旋轉木馬的秘密', icon: '🎠', type: 'history', xp: 40, difficulty: 1, time: 15, 
      description: '欣賞華麗的旋轉木馬，了解它數百年的歷史故事。', 
      location: '旋轉木馬區', 
      coordinates: { lat: 22.7288, lng: 120.4185 }, 
      hints: ['觀察木馬的精緻裝飾', '聽聽看播放的音樂', '旋轉木馬有很長的歷史喔'], 
      photoTask: {
        title: '📸 拍照任務',
        mission: '和華麗的旋轉木馬合照！',
        tips: ['可以坐在木馬上拍照', '拍攝木馬精緻的裝飾細節', '旋轉時拍有動態感的照片'],
        example: '🎠 夢幻旋轉木馬'
      },
      quiz: { question: '旋轉木馬最早是用來做什麼的？', options: ['兒童遊樂', '騎士訓練', '馬戲表演', '宗教儀式'], correct: 1, explanation: '旋轉木馬起源於12世紀，最早是阿拉伯和土耳其騎士用來練習騎馬技術的訓練器具！後來才變成遊樂設施。' }, 
      knowledge: { title: '旋轉木馬歷史', facts: ['起源於12世紀的騎士訓練', '17世紀變成遊樂設施', 'Carousel這個字來自義大利文', '每匹馬都有獨特的設計'] } 
    },
    { 
      id: 'eda_m5', name: '樂園設計師', icon: '🗺️', type: 'culture', xp: 55, difficulty: 2, time: 30, 
      description: '觀察遊樂園的整體設計，了解如何打造一個讓遊客開心的空間。', 
      location: '園區入口', 
      coordinates: { lat: 22.7275, lng: 120.4180 }, 
      hints: ['注意指標和動線設計', '觀察不同區域的主題', '想想看為什麼這樣安排'], 
      photoTask: {
        title: '📸 拍照任務',
        mission: '在園區入口拍一張紀念照！',
        tips: ['找到園區的地標或招牌', '可以拍攝園區的全景', '記錄你今天的遊樂園冒險'],
        example: '🗺️ 遊樂園入口紀念照'
      },
      quiz: { question: '遊樂園設計時，為什麼通常把城堡或地標放在入口正前方？', options: ['因為比較好看', '讓遊客一進來就有目標和期待感', '方便建造', '節省空間'], correct: 1, explanation: '這是「視覺磁鐵」設計原則：讓遊客一進門就看到美麗的地標，產生期待感並引導人潮流動！迪士尼樂園就是這樣設計的。' }, 
      knowledge: { title: '遊樂園設計學', facts: ['動線設計是最重要的學問', '會利用「視覺磁鐵」引導遊客', '不同區域有不同主題氛圍', '連垃圾桶的間距都有講究'] } 
    },
  ],
};

const avatarOptions = ['🧒', '👦', '👧', '🧒🏻', '👦🏻', '👧🏻', '🐻', '🦊', '🐰', '🐼', '🦁', '🐯'];

// 照片上傳元件 - 新增拍照任務顯示
const PhotoUploader = ({ mission, photos, onUpload, onDelete }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('請選擇圖片檔案！');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('圖片太大了！請選擇小於 2MB 的圖片。');
      return;
    }

    setUploading(true);

    try {
      const compressedBase64 = await compressImage(file);
      onUpload(compressedBase64);
    } catch (error) {
      alert('上傳失敗，請再試一次！');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxSize = 800;
          let { width, height } = img;

          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const photoTask = mission.photoTask;

  return (
    <div style={{ marginBottom: 16 }}>
      {/* 拍照任務卡片 */}
      <div style={{ 
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
        borderRadius: 14, 
        padding: 14, 
        marginBottom: 12,
        border: '2px solid #f59e0b'
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#92400e', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          {photoTask.title}
        </h3>
        <p style={{ fontSize: 15, fontWeight: 600, color: '#78350f', marginBottom: 10 }}>
          🎯 {photoTask.mission}
        </p>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 10, padding: 10 }}>
          <p style={{ fontSize: 11, color: '#92400e', fontWeight: 600, marginBottom: 6 }}>💡 拍照小技巧：</p>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {photoTask.tips.map((tip, i) => (
              <li key={i} style={{ fontSize: 11, color: '#78350f', marginBottom: 3 }}>{tip}</li>
            ))}
          </ul>
        </div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: '#92400e' }}>📷 範例：</span>
          <span style={{ fontSize: 12, color: '#78350f', fontWeight: 500 }}>{photoTask.example}</span>
        </div>
      </div>

      {/* 已上傳照片 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h3 style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
          📸 我的探險照片
          <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400 }}>
            ({photos?.length || 0}/3)
          </span>
        </h3>
        {photos && photos.length > 0 && (
          <span style={{ fontSize: 10, color: '#22c55e', fontWeight: 600 }}>✓ 已完成拍照任務</span>
        )}
      </div>

      {photos && photos.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          {photos.map((photo, index) => (
            <div key={index} style={{ position: 'relative' }}>
              <img
                src={photo}
                alt={`照片 ${index + 1}`}
                style={{
                  width: 80,
                  height: 80,
                  objectFit: 'cover',
                  borderRadius: 10,
                  border: '2px solid #22c55e',
                }}
              />
              <button
                onClick={() => onDelete(index)}
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  fontSize: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 上傳按鈕 */}
      {(!photos || photos.length < 3) && (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            padding: '14px 16px',
            backgroundColor: uploading ? '#e5e7eb' : (photos && photos.length > 0) ? '#f0fdf4' : '#fef3c7',
            border: `2px dashed ${(photos && photos.length > 0) ? '#22c55e' : '#f59e0b'}`,
            borderRadius: 12,
            color: (photos && photos.length > 0) ? '#22c55e' : '#f59e0b',
            fontSize: 14,
            fontWeight: 600,
            cursor: uploading ? 'default' : 'pointer',
          }}
        >
          {uploading ? (
            <>⏳ 上傳中...</>
          ) : (
            <>
              <span style={{ fontSize: 20 }}>📷</span>
              {photos && photos.length > 0 ? '新增更多照片' : '完成拍照任務'}
            </>
          )}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
};

// 照片檢視器
const PhotoViewer = ({ photos, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!photos || photos.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.9)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: 20,
      }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          backgroundColor: 'rgba(255,255,255,0.2)',
          border: 'none',
          color: '#fff',
          width: 40,
          height: 40,
          borderRadius: '50%',
          fontSize: 20,
          cursor: 'pointer',
        }}
      >
        ×
      </button>

      <img
        src={photos[currentIndex]}
        alt={`照片 ${currentIndex + 1}`}
        style={{
          maxWidth: '100%',
          maxHeight: '70vh',
          objectFit: 'contain',
          borderRadius: 12,
        }}
        onClick={(e) => e.stopPropagation()}
      />

      {photos.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: index === currentIndex ? '#fff' : 'rgba(255,255,255,0.3)',
                border: 'none',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      )}

      <p style={{ color: '#fff', marginTop: 12, fontSize: 14 }}>
        {currentIndex + 1} / {photos.length}
      </p>
    </div>
  );
};

// 歡迎頁面
const WelcomePage = ({ onLogin, onRegister }) => {
  const [users, setUsers] = useState([]);
  useEffect(() => { setUsers(Storage.getUsers()); }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 50%, #15803d 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ textAlign: 'center', color: '#fff', marginBottom: 40 }}>
        <div style={{ fontSize: 80, marginBottom: 20 }}>🌳</div>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>高雄探險家</h1>
        <p style={{ fontSize: 16, opacity: 0.9 }}>探索城市，發現知識</p>
      </div>
      {users.length > 0 && (
        <div style={{ width: '100%', maxWidth: 340, marginBottom: 24 }}>
          <p style={{ color: '#fff', fontSize: 13, marginBottom: 10, opacity: 0.8 }}>👋 歡迎回來！選擇帳號</p>
          {users.map(user => (
            <button key={user.name} onClick={() => onLogin(user.name)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 16px', marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: 14, cursor: 'pointer' }}>
              <span style={{ fontSize: 28 }}>{user.avatar}</span>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#1f2937', display: 'block' }}>{user.name}</span>
                <span style={{ fontSize: 11, color: '#6b7280' }}>Lv.{user.level} · {user.completedMissions?.length || 0} 任務 · 📷 {user.photos || 0}</span>
              </div>
              <span style={{ color: '#22c55e', fontSize: 18 }}>→</span>
            </button>
          ))}
        </div>
      )}
      <button onClick={onRegister} style={{ width: '100%', maxWidth: 340, padding: '16px 24px', background: users.length > 0 ? 'rgba(255,255,255,0.2)' : '#fff', color: users.length > 0 ? '#fff' : '#22c55e', border: users.length > 0 ? '2px solid rgba(255,255,255,0.5)' : 'none', borderRadius: 14, fontSize: 17, fontWeight: 700, cursor: 'pointer' }}>
        {users.length > 0 ? '➕ 建立新探險家' : '🚀 開始探險'}
      </button>
    </div>
  );
};

// 註冊頁面
const RegisterPage = ({ onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('🧒');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!username.trim()) { setError('請輸入你的名字'); return; }
    if (username.trim().length < 2) { setError('名字至少要2個字'); return; }
    if (Storage.getUser(username.trim())) { setError('這個名字已經有人使用了'); return; }
    setError(''); setStep(2);
  };

  const handleComplete = () => {
    const newUser = Storage.createUser(username.trim(), avatar);
    Storage.setCurrentUser(newUser.name);
    onComplete(newUser);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)', padding: 20 }}>
      <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: 16, fontSize: 13, cursor: 'pointer', marginBottom: 30 }}>← 返回</button>
      
      {step === 1 && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✏️</div>
          <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>你叫什麼名字？</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 24 }}>這個名字會顯示在你的探險紀錄上</p>
          <input type="text" value={username} onChange={(e) => { setUsername(e.target.value); setError(''); }} placeholder="輸入你的名字..." maxLength={10} style={{ width: '100%', maxWidth: 300, padding: '16px 20px', fontSize: 17, textAlign: 'center', border: 'none', borderRadius: 14, backgroundColor: '#fff', color: '#1f2937' }} autoFocus />
          {error && <p style={{ color: '#fecaca', marginTop: 10, fontSize: 13 }}>⚠️ {error}</p>}
          <button onClick={handleNext} style={{ width: '100%', maxWidth: 300, marginTop: 20, padding: '14px 20px', backgroundColor: '#fff', color: '#764ba2', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>下一步 →</button>
        </div>
      )}

      {step === 2 && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>{avatar}</div>
          <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>選擇你的頭像</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 24 }}>{username}，選一個代表你的圖示！</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, maxWidth: 280, margin: '0 auto 24px' }}>
            {avatarOptions.map(a => (
              <button key={a} onClick={() => setAvatar(a)} style={{ width: 56, height: 56, fontSize: 28, backgroundColor: avatar === a ? '#fff' : 'rgba(255,255,255,0.2)', border: avatar === a ? '3px solid #fbbf24' : '3px solid transparent', borderRadius: 14, cursor: 'pointer', transform: avatar === a ? 'scale(1.1)' : 'scale(1)' }}>{a}</button>
            ))}
          </div>
          <button onClick={handleComplete} style={{ width: '100%', maxWidth: 280, padding: '16px 20px', backgroundColor: '#fbbf24', color: '#1f2937', border: 'none', borderRadius: 14, fontSize: 17, fontWeight: 700, cursor: 'pointer' }}>🎉 開始探險！</button>
        </div>
      )}
    </div>
  );
};

// 底部導航
const BottomNav = ({ current, onChange }) => (
  <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '6px 0 14px', backgroundColor: '#fff', borderTop: '1px solid #e5e7eb', zIndex: 100 }}>
    {[
      { id: 'explore', icon: '🗺️', label: '探索' },
      { id: 'collection', icon: '📖', label: '圖鑑' },
      { id: 'leaderboard', icon: '👑', label: '排行榜' },
      { id: 'achievement', icon: '🏆', label: '成就' },
      { id: 'profile', icon: '👤', label: '我的' },
    ].map(item => (
      <button key={item.id} onClick={() => onChange(item.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'none', border: 'none', padding: '4px 10px', color: current === item.id ? '#22c55e' : '#9ca3af', cursor: 'pointer' }}>
        <span style={{ fontSize: 20 }}>{item.icon}</span>
        <span style={{ fontSize: 9, fontWeight: 500 }}>{item.label}</span>
      </button>
    ))}
  </nav>
);

// 首頁
const HomePage = ({ user, onSelectArea }) => (
  <div style={{ padding: 16 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 36 }}>{user.avatar}</span>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>嗨，{user.name}！</h1>
          <p style={{ fontSize: 12, color: '#6b7280' }}>今天想去哪裡探險？</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', padding: '6px 12px', borderRadius: 16 }}>
        <span style={{ fontSize: 12 }}>⭐</span>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>Lv.{user.level}</span>
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div style={{ flex: 1, height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${user.xp % 100}%`, height: '100%', background: 'linear-gradient(90deg, #22c55e, #16a34a)', borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 11, color: '#6b7280' }}>{user.xp % 100}/100 XP</span>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-around', backgroundColor: '#fff', padding: 14, borderRadius: 14, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      {[{ icon: '🏅', value: user.badges, label: '徽章' }, { icon: '📷', value: user.photos || 0, label: '照片' }, { icon: '🌿', value: user.plants, label: '植物' }, { icon: '🔥', value: user.streak, label: '連續' }].map(s => (
        <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span style={{ fontSize: 20 }}>{s.icon}</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#1f2937' }}>{s.value}</span>
          <span style={{ fontSize: 10, color: '#9ca3af' }}>{s.label}</span>
        </div>
      ))}
    </div>
    <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1f2937', marginBottom: 12 }}>選擇探索地區 ({areasData.length}個景點)</h2>
    {areasData.map(area => (
      <div key={area.id} onClick={() => onSelectArea(area.id)} style={{ backgroundColor: '#fff', borderRadius: 16, marginBottom: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', cursor: 'pointer', overflow: 'hidden' }}>
        <div style={{ height: 70, background: `linear-gradient(135deg, ${area.color}, ${area.colorDark})`, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12 }}>
          <span style={{ fontSize: 32 }}>{area.icon}</span>
          <div style={{ color: '#fff', flex: 1 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>{area.name}</h3>
            <p style={{ fontSize: 11, opacity: 0.9 }}>{area.description}</p>
          </div>
        </div>
        <div style={{ padding: 12 }}>
          <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#6b7280', marginBottom: 8 }}>
            <span>📍 {area.location}</span>
            <span>📋 {area.totalMissions} 個任務</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 5, backgroundColor: '#e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${(user.completed?.[area.id] || 0) / area.totalMissions * 100}%`, height: '100%', backgroundColor: area.color }} />
            </div>
            <span style={{ fontSize: 11, color: '#6b7280' }}>{user.completed?.[area.id] || 0}/{area.totalMissions}</span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// 地區頁面
const AreaPage = ({ areaId, user, onBack, onSelectMission }) => {
  const area = areasData.find(a => a.id === areaId);
  const missions = missionsData[areaId] || [];
  const getColor = (t) => ({ plant: '#22c55e', animal: '#f59e0b', science: '#3b82f6', history: '#8b5cf6', art: '#ec4899', culture: '#14b8a6', food: '#ef4444', architecture: '#06b6d4' }[t] || '#666');

  return (
    <div>
      <div style={{ padding: '40px 16px 20px', background: `linear-gradient(135deg, ${area.color}, ${area.colorDark})`, color: '#fff', textAlign: 'center', position: 'relative' }}>
        <button onClick={onBack} style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: 14, fontSize: 12, cursor: 'pointer' }}>← 返回</button>
        <span style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>{area.icon}</span>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{area.name}</h1>
        <p style={{ fontSize: 12, opacity: 0.9 }}>{area.description}</p>
      </div>
      <div style={{ padding: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>探索任務</h2>
        {missions.map(m => {
          const done = user.completedMissions?.includes(m.id);
          const hasPhotos = user.missionPhotos?.[m.id]?.length > 0;
          return (
            <div key={m.id} onClick={() => !done && onSelectMission(m)} style={{ display: 'flex', alignItems: 'center', gap: 10, backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 8, borderLeft: `4px solid ${getColor(m.type)}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', cursor: done ? 'default' : 'pointer', opacity: done ? 0.5 : 1 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: `${getColor(m.type)}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, position: 'relative' }}>
                {m.icon}
                {done && <span style={{ position: 'absolute', bottom: -2, right: -2, width: 16, height: 16, backgroundColor: '#22c55e', color: '#fff', borderRadius: '50%', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>✓</span>}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{m.name}</h3>
                <p style={{ fontSize: 10, color: '#6b7280', marginBottom: 3 }}>📍 {m.location}</p>
                <div style={{ display: 'flex', gap: 8, fontSize: 9, color: '#9ca3af' }}>
                  <span>⏱️ {m.time}分</span>
                  <span>⭐ +{m.xp} XP</span>
                  {hasPhotos && <span style={{ color: '#22c55e' }}>📷 {user.missionPhotos[m.id].length}</span>}
                </div>
              </div>
              <span style={{ fontSize: 18, color: '#d1d5db' }}>›</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 任務頁面
const MissionPage = ({ mission, user, onBack, onComplete, onUpdateUser }) => {
  const [step, setStep] = useState('detail');
  const [answer, setAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [tempPhotos, setTempPhotos] = useState(user.missionPhotos?.[mission.id] || []);
  
  const getColor = (t) => ({ plant: '#22c55e', animal: '#f59e0b', science: '#3b82f6', history: '#8b5cf6', art: '#ec4899', culture: '#14b8a6', food: '#ef4444', architecture: '#06b6d4' }[t] || '#666');

  const handlePhotoUpload = (base64) => {
    const newPhotos = [...tempPhotos, base64];
    setTempPhotos(newPhotos);
    
    const missionPhotos = { ...(user.missionPhotos || {}), [mission.id]: newPhotos };
    const totalPhotos = Object.values(missionPhotos).reduce((sum, arr) => sum + arr.length, 0);
    onUpdateUser({ missionPhotos, photos: totalPhotos });
  };

  const handlePhotoDelete = (index) => {
    const newPhotos = tempPhotos.filter((_, i) => i !== index);
    setTempPhotos(newPhotos);
    
    const missionPhotos = { ...(user.missionPhotos || {}), [mission.id]: newPhotos };
    const totalPhotos = Object.values(missionPhotos).reduce((sum, arr) => sum + arr.length, 0);
    onUpdateUser({ missionPhotos, photos: totalPhotos });
  };

  if (step === 'complete') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{ textAlign: 'center', color: '#fff', width: '100%' }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>🎉</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>任務完成！</h1>
          <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 20 }}>太棒了，你獲得了新知識！</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ textAlign: 'center' }}><span style={{ fontSize: 24, display: 'block' }}>⭐</span><span style={{ fontSize: 14, fontWeight: 700 }}>+{mission.xp} XP</span></div>
            <div style={{ textAlign: 'center' }}><span style={{ fontSize: 24, display: 'block' }}>📖</span><span style={{ fontSize: 14, fontWeight: 700 }}>知識卡片</span></div>
            {tempPhotos.length > 0 && (
              <div style={{ textAlign: 'center' }}><span style={{ fontSize: 24, display: 'block' }}>📷</span><span style={{ fontSize: 14, fontWeight: 700 }}>{tempPhotos.length} 張照片</span></div>
            )}
          </div>
          <div style={{ backgroundColor: '#fff', color: '#1f2937', padding: 16, borderRadius: 16, textAlign: 'left', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{mission.icon} {mission.knowledge.title}</h3>
            {mission.knowledge.scientificName && <p style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic', marginBottom: 10 }}>{mission.knowledge.scientificName}</p>}
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {mission.knowledge.facts.map((f, i) => <li key={i} style={{ fontSize: 12, color: '#4b5563', marginBottom: 4 }}>• {f}</li>)}
            </ul>
          </div>
          {tempPhotos.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, marginBottom: 8, opacity: 0.9 }}>📸 你的探險照片</p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                {tempPhotos.map((photo, i) => (
                  <img key={i} src={photo} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '2px solid #fff' }} />
                ))}
              </div>
            </div>
          )}
          <button onClick={() => onComplete(mission)} style={{ width: '100%', padding: 14, backgroundColor: '#fff', color: '#22c55e', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>繼續探索 →</button>
        </div>
      </div>
    );
  }

  if (step === 'quiz') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f0fdf4', padding: 16 }}>
        <button onClick={() => setStep('detail')} style={{ background: '#e5e7eb', border: 'none', color: '#374151', padding: '8px 14px', borderRadius: 14, fontSize: 12, marginBottom: 20, cursor: 'pointer' }}>← 返回</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>❓</div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1f2937', marginBottom: 20, lineHeight: 1.5 }}>{mission.quiz.question}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {mission.quiz.options.map((opt, i) => {
              let bg = '#fff', border = '#e5e7eb';
              if (showResult) {
                if (i === mission.quiz.correct) { bg = '#dcfce7'; border = '#22c55e'; }
                else if (i === answer) { bg = '#fee2e2'; border = '#ef4444'; }
              } else if (i === answer) { bg = '#f0fdf4'; border = '#22c55e'; }
              return (
                <button key={i} onClick={() => !showResult && setAnswer(i)} disabled={showResult} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', backgroundColor: bg, border: `2px solid ${border}`, borderRadius: 10, textAlign: 'left', cursor: showResult ? 'default' : 'pointer' }}>
                  <span style={{ width: 24, height: 24, backgroundColor: '#f3f4f6', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#6b7280' }}>{String.fromCharCode(65 + i)}</span>
                  <span style={{ flex: 1, fontSize: 13, color: '#1f2937' }}>{opt}</span>
                </button>
              );
            })}
          </div>
          {showResult && (
            <div style={{ backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 14, textAlign: 'left' }}>
              <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{answer === mission.quiz.correct ? '🎉 正確！' : '😅 再想想...'}</p>
              <p style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.5 }}>{mission.quiz.explanation}</p>
            </div>
          )}
          {!showResult && answer !== null && (
            <button onClick={() => { setShowResult(true); if (answer === mission.quiz.correct) setTimeout(() => setStep('complete'), 1500); }} style={{ width: '100%', padding: 12, backgroundColor: '#22c55e', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>確認答案</button>
          )}
          {showResult && answer !== mission.quiz.correct && (
            <button onClick={() => { setAnswer(null); setShowResult(false); }} style={{ width: '100%', padding: 12, backgroundColor: '#6b7280', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>再試一次</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      <div style={{ padding: '40px 16px 20px', background: `linear-gradient(135deg, ${getColor(mission.type)}, ${getColor(mission.type)}cc)`, color: '#fff', textAlign: 'center', position: 'relative' }}>
        <button onClick={onBack} style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: 14, fontSize: 12, cursor: 'pointer' }}>← 返回</button>
        <span style={{ fontSize: 44, display: 'block', marginBottom: 8 }}>{mission.icon}</span>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{mission.name}</h1>
        <p style={{ fontSize: 12, opacity: 0.9 }}>📍 {mission.location}</p>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', padding: 12, backgroundColor: '#f9fafb', borderRadius: 12, marginBottom: 14 }}>
          {[{ icon: '⏱️', value: `${mission.time}分` }, { icon: '⭐', value: `+${mission.xp} XP` }, { icon: '📊', value: '⭐'.repeat(mission.difficulty) }].map(i => (
            <div key={i.icon} style={{ textAlign: 'center' }}><span style={{ fontSize: 16, display: 'block' }}>{i.icon}</span><span style={{ fontSize: 12, fontWeight: 600 }}>{i.value}</span></div>
          ))}
        </div>
        <div style={{ marginBottom: 14 }}>
          <h3 style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>任務說明</h3>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: '#4b5563' }}>{mission.description}</p>
        </div>
        <div style={{ backgroundColor: '#f0fdf4', padding: 12, borderRadius: 12, marginBottom: 14 }}>
          <h3 style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>💡 尋找提示</h3>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {mission.hints.map((h, i) => <li key={i} style={{ fontSize: 12, color: '#166534', marginBottom: 4 }}>{h}</li>)}
          </ul>
        </div>

        {/* 拍照任務區塊 */}
        <PhotoUploader
          mission={mission}
          photos={tempPhotos}
          onUpload={handlePhotoUpload}
          onDelete={handlePhotoDelete}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: 10, backgroundColor: '#f3f4f6', borderRadius: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 14 }}>🛰️</span>
          <span style={{ flex: 1, fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>{mission.coordinates.lat.toFixed(4)}, {mission.coordinates.lng.toFixed(4)}</span>
          <button onClick={() => window.open(`https://www.google.com/maps?q=${mission.coordinates.lat},${mission.coordinates.lng}`, '_blank')} style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>地圖</button>
        </div>
        <button onClick={() => setStep('quiz')} style={{ width: '100%', padding: 14, backgroundColor: '#22c55e', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, boxShadow: '0 4px 12px rgba(34,197,94,0.4)', cursor: 'pointer' }}>🚀 我到達了，開始答題！</button>
      </div>
    </div>
  );
};

// 圖鑑頁面
const CollectionPage = ({ user }) => {
  const [viewingPhotos, setViewingPhotos] = useState(null);
  const all = Object.values(missionsData).flat();
  const collected = all.filter(m => user.completedMissions?.includes(m.id));

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>📖 我的圖鑑</h1>
      <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 16 }}>已收集 {collected.length}/{all.length} 張知識卡片 · 📷 {user.photos || 0} 張照片</p>
      {collected.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 16px' }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>📚</span>
          <p style={{ fontSize: 14, color: '#9ca3af' }}>完成任務來收集知識卡片！</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {collected.map(m => {
            const photos = user.missionPhotos?.[m.id] || [];
            return (
              <div key={m.id} style={{ backgroundColor: '#fff', padding: 12, borderRadius: 12, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: 28, display: 'block', marginBottom: 4 }}>{m.icon}</span>
                <h3 style={{ fontSize: 11, fontWeight: 600, marginBottom: 2 }}>{m.knowledge.title}</h3>
                {m.knowledge.scientificName && <p style={{ fontSize: 8, color: '#9ca3af', fontStyle: 'italic', marginBottom: 4 }}>{m.knowledge.scientificName}</p>}
                {photos.length > 0 && (
                  <button
                    onClick={() => setViewingPhotos(photos)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      width: '100%',
                      padding: '6px 8px',
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #22c55e',
                      borderRadius: 6,
                      color: '#22c55e',
                      fontSize: 10,
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginTop: 4,
                    }}
                  >
                    📷 查看照片 ({photos.length})
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {viewingPhotos && (
        <PhotoViewer photos={viewingPhotos} onClose={() => setViewingPhotos(null)} />
      )}
    </div>
  );
};

// 排行榜
const LeaderboardPage = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [sortBy, setSortBy] = useState('xp');

  useEffect(() => { setUsers(Storage.getUsers()); }, []);

  const sortedUsers = [...users].sort((a, b) => {
    if (sortBy === 'xp') return (b.xp || 0) - (a.xp || 0);
    if (sortBy === 'missions') return (b.completedMissions?.length || 0) - (a.completedMissions?.length || 0);
    if (sortBy === 'photos') return (b.photos || 0) - (a.photos || 0);
    return 0;
  });

  const totalStats = {
    totalUsers: users.length,
    totalMissions: users.reduce((sum, u) => sum + (u.completedMissions?.length || 0), 0),
    totalPhotos: users.reduce((sum, u) => sum + (u.photos || 0), 0),
  };

  const getRankIcon = (i) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`;
  const getRankColor = (i) => i === 0 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : i === 1 ? 'linear-gradient(135deg, #9ca3af, #6b7280)' : i === 2 ? 'linear-gradient(135deg, #cd7f32, #b8860b)' : '#e5e7eb';

  return (
    <div style={{ padding: 16 }}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>👑 探險家排行榜</h1>
        <p style={{ fontSize: 11, color: '#6b7280' }}>看看誰是最厲害的探險家！</p>
      </div>
      <div style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', borderRadius: 14, padding: 14, marginBottom: 16, color: '#fff' }}>
        <h3 style={{ fontSize: 12, fontWeight: 600, marginBottom: 10, opacity: 0.9 }}>🌍 全體探險家成就</h3>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <div style={{ textAlign: 'center' }}><span style={{ fontSize: 22, fontWeight: 800, display: 'block' }}>{totalStats.totalUsers}</span><span style={{ fontSize: 9, opacity: 0.8 }}>探險家</span></div>
          <div style={{ textAlign: 'center' }}><span style={{ fontSize: 22, fontWeight: 800, display: 'block' }}>{totalStats.totalMissions}</span><span style={{ fontSize: 9, opacity: 0.8 }}>任務完成</span></div>
          <div style={{ textAlign: 'center' }}><span style={{ fontSize: 22, fontWeight: 800, display: 'block' }}>{totalStats.totalPhotos}</span><span style={{ fontSize: 9, opacity: 0.8 }}>探險照片</span></div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {[{ id: 'xp', label: '經驗值', icon: '⭐' }, { id: 'missions', label: '任務數', icon: '📋' }, { id: 'photos', label: '照片數', icon: '📷' }].map(o => (
          <button key={o.id} onClick={() => setSortBy(o.id)} style={{ flex: 1, padding: '8px 6px', backgroundColor: sortBy === o.id ? '#22c55e' : '#fff', color: sortBy === o.id ? '#fff' : '#6b7280', border: sortBy === o.id ? 'none' : '1px solid #e5e7eb', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
            <span>{o.icon}</span><span>{o.label}</span>
          </button>
        ))}
      </div>
      {users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 16px' }}><span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>🏆</span><p style={{ fontSize: 14, color: '#9ca3af' }}>還沒有探險家加入！</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sortedUsers.map((user, i) => {
            const isMe = user.name === currentUser.name;
            return (
              <div key={user.name} style={{ display: 'flex', alignItems: 'center', gap: 10, backgroundColor: isMe ? '#f0fdf4' : '#fff', padding: 10, borderRadius: 12, border: isMe ? '2px solid #22c55e' : '1px solid #e5e7eb' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: i < 3 ? getRankColor(i) : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: i < 3 ? 14 : 11, fontWeight: 700, color: i < 3 ? '#fff' : '#6b7280' }}>{getRankIcon(i)}</div>
                <span style={{ fontSize: 24 }}>{user.avatar}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>{user.name}</span>
                    {isMe && <span style={{ fontSize: 8, backgroundColor: '#22c55e', color: '#fff', padding: '1px 5px', borderRadius: 4 }}>我</span>}
                  </div>
                  <span style={{ fontSize: 10, color: '#6b7280' }}>Lv.{user.level || 1} · {user.completedMissions?.length || 0} 任務 · 📷 {user.photos || 0}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#22c55e', display: 'block' }}>
                    {sortBy === 'xp' ? (user.xp || 0) : sortBy === 'missions' ? (user.completedMissions?.length || 0) : (user.photos || 0)}
                  </span>
                  <span style={{ fontSize: 8, color: '#9ca3af' }}>{sortBy === 'xp' ? 'XP' : sortBy === 'missions' ? '任務' : '張'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// 成就
const AchievementPage = ({ user }) => {
  const badges = [
    { name: '初次探險', icon: '🌟', desc: '完成第一個任務', unlocked: user.completedMissions?.length >= 1 },
    { name: '攝影新手', icon: '📷', desc: '上傳第一張照片', unlocked: (user.photos || 0) >= 1 },
    { name: '攝影達人', icon: '📸', desc: '上傳10張照片', unlocked: (user.photos || 0) >= 10 },
    { name: '植物達人', icon: '🌿', desc: '發現3種植物', unlocked: (user.plants || 0) >= 3 },
    { name: '都會公園通', icon: '🌳', desc: '完成都會公園所有任務', unlocked: (user.completed?.metropolitan || 0) >= 5 },
    { name: '糖廠達人', icon: '🏭', desc: '完成橋頭糖廠所有任務', unlocked: (user.completed?.sugar || 0) >= 5 },
    { name: '藝術愛好者', icon: '🎨', desc: '完成駁二所有任務', unlocked: (user.completed?.pier2 || 0) >= 5 },
    { name: '夜市美食家', icon: '🏮', desc: '完成瑞豐夜市所有任務', unlocked: (user.completed?.ruifeng || 0) >= 5 },
    { name: '遊樂園玩家', icon: '🎢', desc: '完成義大遊樂世界所有任務', unlocked: (user.completed?.edatheme || 0) >= 5 },
    { name: '探險大師', icon: '👑', desc: '完成所有25個任務', unlocked: (user.completedMissions?.length || 0) >= 25 },
  ];
  
  const unlockedCount = badges.filter(b => b.unlocked).length;
  
  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>🏆 我的成就</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 16 }}>
        <div style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12, textAlign: 'center' }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: '#22c55e', display: 'block' }}>{user.completedMissions?.length || 0}/25</span>
          <span style={{ fontSize: 11, color: '#6b7280' }}>已完成任務</span>
        </div>
        <div style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12, textAlign: 'center' }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: '#22c55e', display: 'block' }}>{user.photos || 0}</span>
          <span style={{ fontSize: 11, color: '#6b7280' }}>探險照片</span>
        </div>
      </div>
      <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>徽章收藏 ({unlockedCount}/{badges.length})</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {badges.map(b => (
          <div key={b.name} style={{ backgroundColor: '#fff', padding: 12, borderRadius: 12, textAlign: 'center', opacity: b.unlocked ? 1 : 0.4, position: 'relative' }}>
            <span style={{ fontSize: 26, display: 'block', marginBottom: 4 }}>{b.icon}</span>
            <span style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 2 }}>{b.name}</span>
            <span style={{ fontSize: 9, color: '#9ca3af' }}>{b.desc}</span>
            {b.unlocked && <span style={{ position: 'absolute', top: 6, right: 6, backgroundColor: '#dcfce7', color: '#22c55e', fontSize: 8, padding: '2px 5px', borderRadius: 6 }}>✓</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

// 個人頁面
const ProfilePage = ({ user, onLogout, onDelete }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  return (
    <div style={{ padding: 16 }}>
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ width: 80, height: 80, backgroundColor: '#e5e7eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, margin: '0 auto 12px' }}>{user.avatar}</div>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>{user.name}</h1>
        <p style={{ fontSize: 12, color: '#22c55e' }}>Lv.{user.level} 小探險家</p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16 }}>
        {[{ value: user.completedMissions?.length || 0, label: '任務' }, { value: user.xp, label: 'XP' }, { value: user.photos || 0, label: '照片' }, { value: user.badges, label: '徽章' }].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#1f2937', display: 'block' }}>{s.value}</span>
            <span style={{ fontSize: 10, color: '#9ca3af' }}>{s.label}</span>
          </div>
        ))}
      </div>
      <button onClick={onLogout} style={{ width: '100%', padding: 12, backgroundColor: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 8 }}>🚪 切換帳號</button>
      <button onClick={() => setShowConfirm(true)} style={{ width: '100%', padding: 12, backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>🗑️ 刪除帳號</button>
      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: 20, borderRadius: 16, maxWidth: 280, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>⚠️</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>確定要刪除帳號？</h3>
            <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 16 }}>所有探險紀錄和照片將會永久刪除</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowConfirm(false)} style={{ flex: 1, padding: 10, backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>取消</button>
              <button onClick={onDelete} style={{ flex: 1, padding: 10, backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>刪除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 主應用
export default function App() {
  const [appState, setAppState] = useState('loading');
  const [tab, setTab] = useState('explore');
  const [area, setArea] = useState(null);
  const [mission, setMission] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const current = Storage.getCurrentUser();
    if (current) {
      const userData = Storage.getUser(current);
      if (userData) { 
        if (!userData.completed.ruifeng) userData.completed.ruifeng = 0;
        if (!userData.completed.edatheme) userData.completed.edatheme = 0;
        if (!userData.missionPhotos) userData.missionPhotos = {};
        if (!userData.photos) userData.photos = 0;
        setUser(userData); 
        setAppState('main'); 
      }
      else { Storage.setCurrentUser(null); setAppState('welcome'); }
    } else { setAppState('welcome'); }
  }, []);

  const handleLogin = (name) => {
    const userData = Storage.getUser(name);
    if (userData) { 
      if (!userData.completed.ruifeng) userData.completed.ruifeng = 0;
      if (!userData.completed.edatheme) userData.completed.edatheme = 0;
      if (!userData.missionPhotos) userData.missionPhotos = {};
      if (!userData.photos) userData.photos = 0;
      Storage.setCurrentUser(name); 
      setUser(userData); 
      setAppState('main'); 
    }
  };

  const handleRegister = (newUser) => { setUser(newUser); setAppState('main'); };

  const handleLogout = () => {
    Storage.setCurrentUser(null); setUser(null); setTab('explore'); setArea(null); setMission(null); setAppState('welcome');
  };

  const handleDelete = () => {
    if (user) { Storage.deleteUser(user.name); handleLogout(); }
  };

  const handleUpdateUser = (updates) => {
    const newUser = { ...user, ...updates };
    Storage.updateUser(user.name, updates);
    setUser(newUser);
  };

  const handleMissionComplete = (m) => {
    if (!user) return;
    const updates = {
      xp: user.xp + m.xp, 
      level: Math.floor((user.xp + m.xp) / 100) + 1,
      completedMissions: [...(user.completedMissions || []), m.id],
      completed: { ...user.completed, [area]: (user.completed[area] || 0) + 1 },
    };
    if (m.type === 'plant') updates.plants = (user.plants || 0) + 1;
    if (m.type === 'animal') updates.animals = (user.animals || 0) + 1;
    updates.badges = [
      updates.completedMissions.length >= 1,
      (user.photos || 0) >= 1,
      (user.photos || 0) >= 10,
      updates.plants >= 3,
      updates.completed?.metropolitan >= 5,
      updates.completed?.sugar >= 5,
      updates.completed?.pier2 >= 5,
      updates.completed?.ruifeng >= 5,
      updates.completed?.edatheme >= 5,
      updates.completedMissions.length >= 25,
    ].filter(Boolean).length;
    Storage.updateUser(user.name, updates);
    setUser({ ...user, ...updates });
    setMission(null);
  };

  if (appState === 'loading') return <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ textAlign: 'center', color: '#fff' }}><div style={{ fontSize: 56 }}>🌳</div><p style={{ marginTop: 12 }}>載入中...</p></div></div>;
  if (appState === 'welcome') return <WelcomePage onLogin={handleLogin} onRegister={() => setAppState('register')} />;
  if (appState === 'register') return <RegisterPage onBack={() => setAppState('welcome')} onComplete={handleRegister} />;

  const renderContent = () => {
    if (mission) return <MissionPage mission={mission} user={user} onBack={() => setMission(null)} onComplete={handleMissionComplete} onUpdateUser={handleUpdateUser} />;
    if (area) return <AreaPage areaId={area} user={user} onBack={() => setArea(null)} onSelectMission={setMission} />;
    switch (tab) {
      case 'explore': return <HomePage user={user} onSelectArea={setArea} />;
      case 'collection': return <CollectionPage user={user} />;
      case 'leaderboard': return <LeaderboardPage currentUser={user} />;
      case 'achievement': return <AchievementPage user={user} />;
      case 'profile': return <ProfilePage user={user} onLogout={handleLogout} onDelete={handleDelete} />;
      default: return <HomePage user={user} onSelectArea={setArea} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0fdf4', maxWidth: 420, margin: '0 auto', boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}>
      <main style={{ paddingBottom: mission ? 0 : 60, minHeight: '100vh' }}>{renderContent()}</main>
      {!mission && <BottomNav current={tab} onChange={(t) => { setTab(t); setArea(null); }} />}
    </div>
  );
}
