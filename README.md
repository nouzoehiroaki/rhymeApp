# rhymeApp

## プロジェクト概要

日本語で韻を踏む言葉を AI で生成し、Web アプリ上で表示するアプリ
Vue3 / Nuxt3 を使ってフロントを構築し、OpenAI API をバックエンドで利用

## 進めたいこと

### 以下の構成

1. 入力フォーム（Vue コンポーネント）で言葉を受け取る
2. API 経由で OpenAI に問い合わせ、韻を踏む日本語の候補を生成する
3. レスポンス結果を画面上にリアルタイム表示する
4. 見た目を Vuetify で整える（v-chip, v-card, v-text-field など）
5. Nuxt3 の `server/api/` ディレクトリで API を作る
6. .env に OpenAI の API キーを保存し、安全に読み込む
7. Vercel / Netlify などでデプロイできるように構成する
