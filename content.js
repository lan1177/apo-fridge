/* 《阿婆的冰箱》内容数据
 * 文案与坐标都在这里，和代码分离。
 * 编辑模式（?edit=1）里改文案 / 拖物品 → 一键导出 JSON → 覆盖此文件即"更新到最新版本"。
 * position: { x, y, w } 均为相对舞台(16:9)的百分比；x,y 是中心点，w 是宽度。
 */
window.CONTENT = {
  // 全局文案
  global: {
    title: "阿婆的冰箱",
    systemTip: "帮阿婆收拾冰箱，从点击冰箱里的物品开始",
    grandmaGreeting: "我D宝贝全部系喺度啦，你小心D搞啊。",
    grandmaGreetingNote: "我的宝贝全部在这里啦，你收拾的时候小心点。",
    // 结局兜底诗：首尾写死，中间兜底；接 API 后中段替换
    poemHead: "这个冰箱，现在松动了。",
    poemBody: [
      "你留低嘅，我记得；",
      "你掉咗嘅，我假装唔记得。",
      "陈皮定咸鱼，留嘅都系一段日子。"
    ],
    poemTail: "你说是杂物，我说是——记得回来吃饭。",
    finishThanks: "辛苦晒，帮我执返好晒。呢啲唔係杂物，係屋企嘅味道嚟㗎。",
    finishThanksNote: "辛苦了，帮我都收拾好了。这些不是杂物，是家里的味道。"
  },

  // 21 件物品。带 mvp:true 的是已写完整台词的 6 件；其余为第一版占位，待编辑器细化。
  items: [
    {
      id: "chenpi", icon: "res/obj_orgin_big/chenpi.png",
      name: "一袋黑乎乎的陈皮", category: "药材", mvp: true,
      desc_short: "自己晒了十几年，黑得发亮。",
      story: "呢袋陈皮我晒咗十几年喇，我后生嗰阵一啖啖剥落嚟晒嘅，依家市面边度搵到呀？",
      story_note: "这袋陈皮我晒了十几年了，我年轻时一瓣一瓣剥下来晒的，现在市面哪里找得到？",
      keep: "识货！呢啲先係好嘢。", keep_note: "识货！这些才是好东西。",
      toss: "丢？！你知唔知呢啲拎去卖都几百蚊斤呀！收返！", toss_note: "丢？！你知不知道这些拿去卖都几百块一斤！收回来！",
      poem_keyword: "晒了十几年的陈皮",
      position: { x: 44.77, y: 43.93, w: 6 }
    },
    {
      id: "dongtang", icon: "res/obj_orgin_big/dongtang.png",
      name: "矿泉水瓶装的冻汤", category: "汤料", mvp: true,
      desc_short: "椰子鸡汤煲多了冻起来，瓶身结霜。",
      story: "呢樽？煲滚，好好饮噶",
      story_note: "这瓶？煮开，很好喝的。",
      keep: "啱喇，好嘢点舍得倒。", keep_note: "对了，好东西哪舍得倒。",
      toss: "嘥晒啲汤料啰！椰子同竹丝鸡都唔平㗎！", toss_note: "浪费了那些汤料啦！椰子和竹丝鸡都不便宜的！",
      poem_keyword: "矿泉水瓶里冻着的椰子鸡汤",
      position: { x: 59.84, y: 53.59, w: 7.5 }
    },
    {
      id: "xianyu", icon: "res/obj_orgin_big/xianyu.png",
      name: "马友咸鱼一条", category: "腊味咸货", mvp: true,
      desc_short: "放到不知多久，硬邦邦。",
      story: "呢条马友咸鱼，靓嘢！蒸肉一流。摆耐啲冇相干嘅，咸鱼边会坏！",
      story_note: "这条马友咸鱼，好货！蒸肉一流。放久点没关系的，咸鱼哪会坏。",
      keep: "就系啰，识食喇你。", keep_note: "就是嘛，懂吃了你。",
      toss: "唔识嘢！咸鱼越陈越香架！", toss_note: "不懂啦！咸鱼越陈越香的！",
      poem_keyword: "放到不知多久的马友咸鱼",
      position: { x: 45.74, y: 35.23, w: 7.5 }
    },
    {
      id: "fanqiejiang", icon: "res/obj_orgin_big/fanqiejiang.png",
      name: "一包麦当劳酱料", category: "人情/杂物", mvp: true,
      desc_short: "麦当劳番茄酱，孤零零留在冰箱一角。有效期是……2025年4月？",
      story: "呢包麦当劳茄汁系买嘢送嘅，唔要白唔要。有效期？二零二五年四月啫，睇落都仲精神。",
      story_note: "这包麦当劳番茄酱是买东西送的，不要白不要。有效期？2025年4月而已，看起来还挺精神。",
      keep: "哈哈，慳得一蚊得一蚊。", keep_note: "哈哈，省一块是一块。",
      toss: "一包茄汁都丢，使唔使咁豪呀。", toss_note: "一包番茄酱都丢，用得着这么大方吗。",
      poem_keyword: "冰箱角落那包麦当劳番茄酱",
      position: { x: 49.5, y: 26.7, w: 4 }
    },
    {
      id: "jizhua", icon: "res/obj_orgin_big/jizhua.png",
      name: "冰格最深处的鸡爪", category: "冻肉", mvp: true,
      desc_short: "结满冰霜，忘了何时买。",
      story: "啊……呢袋鸡脚……我谂住留返煲汤……几时买嘅就唔记得喇。",
      story_note: "啊……这袋鸡爪……我想着留着煲汤……什么时候买的就不记得了。",
      keep: "都话有用嘅，迟啲煲个花生鸡脚汤。", keep_note: "都说有用的，过段时间煲个花生鸡爪汤。",
      toss: "……都好嘅，呢袋的确耐咗啲。", toss_note: "……也好，这袋的确放久了点。",
      poem_keyword: "冰格最深处那袋忘了何时买的鸡爪",
      position: { x: 46.26, y: 80.58, w: 6 }
    },
    {
      id: "lachang", icon: "res/obj_orgin_big/lachang.png",
      name: "留给你那份腊肠", category: "人情/留给家人", mvp: true,
      desc_short: "红绳绑着两条，特意留给你。",
      story: "呢两条腊肠系特登留畀你嘅，你细个最钟意食腊肠煲仔饭，记唔记得？",
      story_note: "这两条腊肠是特意留给你的，你小时候最喜欢吃腊肠煲仔饭，记不记得？",
      keep: "嗯，得闲返嚟阿婆煲俾你食。", keep_note: "嗯，有空回来阿婆煲给你吃。",
      toss: "……哦，唔食就算啦。", toss_note: "……哦，不吃就算了。",
      poem_keyword: "特意留给你的那两条腊肠",
      position: { x: 47.91, y: 34.2, w: 5 }
    },

    // —— 以下 15 件为第一版占位台词，待编辑器细化 ——
    {
      id: "pipalu", icon: "res/obj_orgin_big/pipalu.png",
      name: "喝剩半瓶的念慈菴枇杷膏", category: "药/保健品",
      desc_short: "盖口黏黏的，糖浆结晶。",
      story: "咳就食啖，呢啲嘢万能嘅，留返。", story_note: "咳嗽就喝一口，这东西万能的，留着。",
      keep: "啱嘅，看门口嘅嘢。", keep_note: "对的，看门口的东西（备着）。",
      toss: "都仲有得食喎，咳起上嚟你咪知死。", toss_note: "还能喝呢，咳起来你就知道难受了。",
      poem_keyword: "喝剩半瓶的枇杷膏",
      position: { x: 57.05, y: 54.55, w: 5.3 }
    },
    {
      id: "bupin", icon: "res/obj_orgin_big/bupin.png",
      name: "没拆封的补品礼盒", category: "药/保健品",
      desc_short: "邻居送的，放到落灰还没拆。",
      story: "隔篱送嘅，留返过时过节先食，咁贵点舍得拆。", story_note: "邻居送的，留着过年过节才吃，这么贵哪舍得拆。",
      keep: "係要留返，体面嘢。", keep_note: "是要留着，体面东西。",
      toss: "人哋一番心意，丢咗几唔好意思。", toss_note: "人家一番心意，丢了多不好意思。",
      poem_keyword: "没拆封的补品礼盒",
      position: { x: 39.88, y: 44.07, w: 6.5 }
    },
    {
      id: "yaozhu", icon: "res/obj_orgin_big/yaozhu.png",
      name: "旧月饼铁盒里的虫草瑶柱", category: "药材/海味",
      desc_short: "贵料混装一盒，分不清谁是谁。",
      story: "贵嘢梗系收埋好啲，虫草离噶，等有贵吓先攞出嚟。", story_note: "贵东西当然收好点，这是虫草，等有贵客才拿出来。",
      keep: "係咁话，留返压箱底。", keep_note: "就是这样，留着压箱底。",
      toss: "咁贵你话丢就丢？心都痛。", toss_note: "这么贵你说丢就丢？心都疼。",
      poem_keyword: "月饼铁盒里的虫草瑶柱",
      position: { x: 42.56, y: 45.23, w: 4.5 }
    },
    {
      id: "danggui", icon: "res/obj_orgin_big/danggui.png",
      name: "橡皮筋扎着的当归北芪药包", category: "药材",
      desc_short: "一小扎煲汤料。",
      story: "煲乜汤都落D，养生啊嘛，当归药材，屋企梗要有。", story_note: "煲什么汤都放一点，养生嘛，当归药材，家里一定要有。",
      keep: "啱晒，煲汤靠佢哋。", keep_note: "正好，煲汤靠它们。",
      toss: "冇咗佢煲乜都唔够味。", toss_note: "没了它煲什么都不够味。",
      poem_keyword: "扎成一小束的当归北芪",
      position: { x: 38.68, y: 35.11, w: 5.5 }
    },
    {
      id: "yezi", icon: "res/obj_orgin_big/yezi.png",
      name: "保鲜膜裹着的半个椰子", category: "汤料/新鲜",
      desc_short: "斩开没用完，膜裹得严严实实。",
      story: "斩开冇用晒，嘥唔得㗎。", story_note: "斩开没用完，浪费不得。",
      keep: "係啊，留返煲糖水。", keep_note: "是啊，留着煲糖水。",
      toss: "半个椰子都丢，败家。", toss_note: "半个椰子都丢，败家。",
      poem_keyword: "保鲜膜裹着的半个椰子",
      position: { x: 42.37, y: 26.54, w: 6 }
    },
    {
      id: "meicaigan", icon: "res/obj_orgin_big/meicaigan.png",
      name: "自己晒的一袋梅菜干", category: "腊味咸货",
      desc_short: "阳台晒的，带点尘。",
      story: "梅菜扣肉冇梅菜点得？呢袋我自己阳台晒嘅。", story_note: "梅菜扣肉没梅菜怎么行？这袋我自己阳台晒的。",
      keep: "留返，整扣肉一流。", keep_note: "留着，做扣肉一流。",
      toss: "晒咗咁耐你话丢？", toss_note: "晒了这么久你说丢？",
      poem_keyword: "自己晒的一袋梅菜干",
      position: { x: 46.91, y: 25.15, w: 6 }
    },
    {
      id: "furu", icon: "res/obj_orgin_big/furu.png",
      name: "结了层的半罐腐乳", category: "咸货",
      desc_short: "表面结了白膜，阿婆说没坏。",
      story: "送粥一流，结层嘢咋嘛，坏唔到嘅。", story_note: "配粥一流，结层东西而已，坏不了。",
      keep: "係咁话，送白粥神器。", keep_note: "就是这样，配白粥神器。",
      toss: "都仲食得，丢咗嘥嘢。", toss_note: "还能吃，丢了浪费。",
      poem_keyword: "结了层的半罐腐乳",
      position: { x: 54.34, y: 55.38, w: 3.8 }
    },
    {
      id: "huajiao", icon: "res/obj_orgin_big/huajiao.png",
      name: "袋装的几只花胶", category: "干货海味",
      desc_short: "包得像宝贝。",
      story: "呢啲好嘢，等屋企有好事先攞出嚟㗎", story_note: "这些好东西，等家里有好事才拿出来。",
      keep: "梗係留，矜贵嘢。", keep_note: "当然留，珍贵东西。",
      toss: "你舍得？我都唔舍得。", toss_note: "你舍得？我都舍不得。",
      poem_keyword: "包得像宝贝的几只花胶",
      position: { x: 48.42, y: 44.52, w: 5 }
    },
    {
      id: "donggu", icon: "res/obj_orgin_big/donggu.png",
      name: "一袋大粒靓冬菇", category: "干货海味",
      desc_short: "挑大粒的留着。",
      story: "拣大粒嗰啲留返，贵客先舍得用。", story_note: "挑大粒的那些留着，贵客才舍得用。",
      keep: "啱，留返过年蒸鸡。", keep_note: "对，留着过年蒸鸡。",
      toss: "咁靓嘅冬菇都丢？", toss_note: "这么好的冬菇都丢？",
      poem_keyword: "一袋挑大粒的冬菇",
      position: { x: 41.59, y: 34.55, w: 4.5 }
    },
    {
      id: "dongrou", icon: "res/obj_orgin_big/dongrou.png",
      name: "标签脱落、结霜的神秘肉块", category: "冻肉",
      desc_short: "冻成一坨白霜，认不出。",
      story: "……牛排？定系鱼？冻到我都认唔出。", story_note: "……牛排？还是鱼？冻到我都认不出。",
      keep: "留返啦，总之系肉。", keep_note: "留着吧，反正是肉。",
      toss: "……都好，呢嚿真係唔知摆咗几耐。", toss_note: "……也好，这块真不知道放了多久。",
      poem_keyword: "认不出的神秘冻肉块",
      position: { x: 40.41, y: 81.11, w: 6 }
    },
    {
      id: "shaorou", icon: "res/obj_orgin_big/shaorou.png",
      name: "过年剩的盆菜烧肉", category: "冻肉/剩菜",
      desc_short: "密封盒冻着，过年到现在。",
      story: "过年剩落嘅烧肉盆菜，冻住，翻热一样食得，好和味噶。", story_note: "过年剩下的烧肉盆菜，冻着，翻热一样能吃，很有滋味的。",
      keep: "翻热整个粥都得，留。", keep_note: "翻热煮个粥也行，留。",
      toss: "过年好嘢喎，丢咗心痛。", toss_note: "过年好东西呢，丢了心疼。",
      poem_keyword: "过年剩到现在的盆菜烧肉",
      position: { x: 40.95, y: 71.28, w: 7.5 }
    },
    {
      id: "jidan", icon: "res/obj_orgin_big/jidan.png",
      name: "一板鸡蛋", category: "新鲜食材",
      desc_short: "门架上常备，倒是新鲜。",
      story: "蛋啫，使乜港，梗係留，日日都用得到。", story_note: "鸡蛋而已，还用说，当然留，天天都用得上。",
      keep: "实用嘢，唔使谂。", keep_note: "实用东西，不用想。",
      toss: "好哋哋鸡蛋你丢？你癫㗎？", toss_note: "好好的鸡蛋你丢？你疯了？",
      poem_keyword: "门架上那板鸡蛋",
      position: { x: 56.66, y: 25.31, w: 5.5 }
    },
    {
      id: "tuishaotie", icon: "res/obj_orgin_big/tuishaotie.png",
      name: "一盒退烧贴", category: "药/保健品",
      desc_short: "囤着以防万一。",
      story: "呢个牌子嗰退烧贴好好用噶，一用就好啦，囤定啲，以防万一噶。", story_note: "这个牌子的退烧贴很好用，一用就好了，囤着点，以防万一。",
      keep: "看门口嘅嘢，要有。", keep_note: "备着的东西，要有。",
      toss: "万一急起上嚟边度买？", toss_note: "万一急起来上哪买？",
      poem_keyword: "囤着以防万一的退烧贴",
      position: { x: 58.41, y: 34.63, w: 5.5 }
    },
    {
      id: "huanshan", icon: "res/obj_orgin_big/huanshan.png",
      name: "一袋淮山（干）", category: "汤料/药材",
      desc_short: "白色长条干货，煲汤用。",
      story: "淮山可以用离煲嘢", story_note: "淮山可以用来煲东西。",
      keep: "啱，煲汤少唔得。", keep_note: "对，煲汤少不了。",
      toss: "好哋哋干货丢咩呀。", toss_note: "好好的干货丢什么呀。",
      poem_keyword: "一袋晒干的淮山",
      position: { x: 38.02, y: 25.68, w: 6 }
    },
    {
      id: "lianzi", icon: "res/obj_orgin_big/lianzi.png",
      name: "一袋莲子配枸杞", category: "汤料/药材",
      desc_short: "煲糖水、煲汤都用得着。",
      story: "莲子配杞子，清热润燥嘅，煲糖水一流。", story_note: "莲子配枸杞，清热润燥的，煲糖水一流。",
      keep: "留返，煲糖水靠佢。", keep_note: "留着，煲糖水靠它。",
      toss: "咁啱用嘅嘢你丢？", toss_note: "这么好用的东西你丢？",
      poem_keyword: "一袋莲子配枸杞",
      position: { x: 40.01, y: 25.86, w: 6 }
    }
  ]
};
