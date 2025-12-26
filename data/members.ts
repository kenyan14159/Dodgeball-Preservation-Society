export interface Member {
  id: string;
  name: string;
  nameRomaji?: string;
  profile: string;
  imageUrl?: string;
  instagramUrl?: string;
  birthday?: string; // YYYY-MM-DD形式
}

export const members: Member[] = [
  {
    id: "1",
    name: "大毛利寛太",
    nameRomaji: "Kanta Oomori",
    profile: "ドッジボール愛護団体の可愛いキャラ代表。料理、勉強、スポーツと、あらゆる分野で才能を発揮するハイスペック男子。その完璧ぶりで数々の女性を虜にしてきた罪深き男である。現在は我々の胃袋を支える料理担当として活躍中。可愛い顔して腕前は一流、まさに「可愛いは正義」を体現する貴重な存在だ。",
    imageUrl: "https://pub-16818221908f443cbb90e24fc96a2791.r2.dev/Dodgeball/Kanta.JPEG",
    instagramUrl: "https://www.instagram.com/kanntamorimori/",
    birthday: "2003-04-13",
  },
  {
    id: "4",
    name: "佐藤匠真",
    nameRomaji: "Takuma Sato",
    profile: "ドッジボール愛護団体随一のシスコン。大沢屈指の大金持ちとして、我々に何度も豪華な開会式を提供してくれる包容力の持ち主。自宅にはBBQ場、大型バスを完備という規格外ぶり。豊橋の大学では特技のギターで女性を落としまくった実績を持つが、本人曰く「お姉ちゃん以外興味ない」とのこと。その一途さ、むしろ清々しい。",
    imageUrl: "https://pub-16818221908f443cbb90e24fc96a2791.r2.dev/Dodgeball/Takuma.JPEG",
    instagramUrl: "https://www.instagram.com/takuma_s.0316/",
    birthday: "2004-03-16",
  },
  {
    id: "5",
    name: "清水大夢",
    nameRomaji: "Hiromu Shimizu",
    profile: "大沢野の異端児。小学・中学時代から学校全体のムードメーカーとして君臨。高校卒業後は地元の営業マンとしてスキルを磨き、今年はなんとオーストラリアへ武者修行に出発。その圧倒的行動力と営業スキルは、我々にとっても必須レベル。彼がいれば場が盛り上がる、そんな男だ。",
    imageUrl: "https://pub-16818221908f443cbb90e24fc96a2791.r2.dev/Dodgeball/Hiromu.JPEG",
    instagramUrl: "https://www.instagram.com/___hiromuuu/",
    birthday: "2003-08-03",
  },
  {
    id: "3",
    name: "中川敷司",
    nameRomaji: "Atsushi Nakagawa",
    profile: "大沢野随一のゲーマー。一時期はドッジボール愛護団体から離脱するも、涙の復帰会見で感動の復活を果たした男。最近では大沢野最強の男・守田に腕相撲で勝つため、大好きなゲームを封印して筋トレに没頭中。2026年1月2日、世紀の腕相撲対決を見逃すな!果たして下剋上は成るのか!?",
    imageUrl: "https://pub-16818221908f443cbb90e24fc96a2791.r2.dev/Dodgeball/Atsushi.JPEG",
    instagramUrl: "https://www.instagram.com/n.atushirx8/",
  },
  {
    id: "10",
    name: "中沢そら",
    nameRomaji: "Sora Nakazawa",
    profile: "大沢野のゴキブリ。学生時代、ゴキブリのような縦横無尽の動きでサッカー部の仲間をサポートし続けた献身的プレイヤー。中学時代には全国大会出場に貢献するなど、その機動力は折り紙付き。この会では「ウケ狙い大会」を考案し、数々の伝説的ネタを生み出してきた張本人。ただし、作成者だからといってネタが面白いとは誰も言っていない…。今年から転職を決意。新しい環境でも、あの「ゴキブリ並みのスピード感」で駆け抜けてくれるはずだ。",
    imageUrl: "https://pub-16818221908f443cbb90e24fc96a2791.r2.dev/Dodgeball/Sora.JPEG",
    instagramUrl: "https://www.instagram.com/soraoooo922/",
    birthday: "2003-09-22",
  },
  {
    id: "9",
    name: "氷見哲太",
    nameRomaji: "Tetta Himi",
    profile: "煽りの天才。誰よりも負けず嫌いで、ボールを持ったら力尽きるまで追いかけ回してくる異常体力の持ち主。数々の問題を起こしてきたが、お得意の忍耐力で試練を乗り越え、大学2年で箱根駅伝6区出場という快挙を達成。煽りスキルと忍耐力、この二刀流が彼の武器だ。",
    imageUrl: "https://pub-16818221908f443cbb90e24fc96a2791.r2.dev/Dodgeball/Tetta.JPEG",
    instagramUrl: "https://www.instagram.com/tetta_himi/",
    birthday: "2004-01-03",
  },
  {
    id: "8",
    name: "二村昇太朗",
    nameRomaji: "Shotaro Futamura",
    profile: "富山を裏切りし男。小学・中学時代はこの会のモブキャラとして裏方を支えていた縁の下の力持ち。高校・大学と県外に進学し、富山の不便さを痛感。そして大学卒業後は東京で就職を決意。「みんなと離れて寂しいです…」という本音がにじむ、実は愛郷心溢れる男である。",
    imageUrl: "https://pub-16818221908f443cbb90e24fc96a2791.r2.dev/Dodgeball/Shotaro.JPEG",
    instagramUrl: "https://www.instagram.com/shotaro.f_04/",
    birthday: "2003-04-09",
  },
  {
    id: "7",
    name: "村上徳都",
    nameRomaji: "Norito Murakami",
    profile: "野球バカの権化。彼の人生=肉、女の子、野球。この三大要素で構成されている。様々なものを犠牲にしながら野球一筋に生きてきた男。超面倒くさがり屋のため、彼の家の前に集合させられてドッジボールをしたのは今となってはいい思い出。ちなみに彼の帰宅時間は1秒である。",
    imageUrl: "https://pub-16818221908f443cbb90e24fc96a2791.r2.dev/Dodgeball/Norito.JPEG",
    instagramUrl: "https://www.instagram.com/mn00813/",
    birthday: "2003-08-13",
  },
  {
    id: "6",
    name: "守田ひろやす",
    nameRomaji: "Hiroyasu Morita",
    profile: "黄色いカバンの伝説。大沢最強の男。小学生時代は喧嘩番長として恐れられていたが、中学生で突如キャラ変してまさかのおとなしキャラに。しかし最強の肩書きは健在で、誰も近寄れない絶対的存在感を放つ。黄色いカバンを持って走ってくる姿は、もはや恐怖。その一言に尽きる。",
    imageUrl: "https://pub-16818221908f443cbb90e24fc96a2791.r2.dev/Dodgeball/Hiroyasu.JPEG",
    instagramUrl: "https://www.instagram.com/m0r1ta06/",
    birthday: "2003-06-10",
  },
];

