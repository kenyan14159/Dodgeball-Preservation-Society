// アニメーション・タイミング関連の定数
export const ANIMATION_DELAYS = {
  MEMBER_CARD: 100, // メンバーカードのアニメーション遅延（ms）
  HERO_IMAGE: 30, // ヒーロー画像のアニメーション遅延（ms）
  GALLERY_IMAGE: 50, // ギャラリー画像のアニメーション遅延（ms）
} as const;

// タイマー関連の定数
export const TIMERS = {
  IMAGE_SHUFFLE_INTERVAL: 5000, // 画像シャッフルの間隔（ms）
  RESIZE_DEBOUNCE: 200, // リサイズのデバウンス時間（ms）
  LOADING_MIN_DISPLAY: 2000, // ローディング画面の最小表示時間（ms）
  PROGRESS_UPDATE_INTERVAL: 100, // プログレスバーの更新間隔（ms）
} as const;

// スクロール関連の定数
export const SCROLL_THRESHOLDS = {
  HEADER_TRANSPARENT: 50, // ヘッダーの透明度が変わるスクロール位置
  SHOW_SCROLL_TOP: 500, // トップに戻るボタンが表示されるスクロール位置
} as const;

// 画像関連の定数
export const IMAGE_COUNTS = {
  DEFAULT: 20, // デフォルトの画像枚数
  MOBILE_MIN: 16, // モバイルの最小画像枚数
  TABLET_MIN: 12, // タブレットの最小画像枚数
  DESKTOP_MIN: 20, // デスクトップの最小画像枚数
  PRIORITY_COUNT: 4, // 優先読み込みする画像枚数
};

// Intersection Observer関連の定数
export const OBSERVER_CONFIG = {
  THRESHOLD: 0.1,
  ROOT_MARGIN: "50px",
  MEMBER_ROOT_MARGIN: "0px 0px -50px 0px",
} as const;

// プログレスバー関連の定数
export const PROGRESS = {
  MAX_BEFORE_COMPLETE: 90, // 完了前の最大値（%）
  INCREMENT_MAX: 10, // 1回の更新での最大増分（%）
} as const;

// 画像URL関連の定数
export const IMAGE_URLS = {
  LOGO: "https://wprs.my-hobby.space/wp-content/uploads/2025/11/dozzi_love.jpg",
} as const;

