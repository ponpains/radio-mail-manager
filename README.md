# ラジオメールマネージャー Android版

Web版 ver.23 を単独Androidアプリとして動かすためのAndroid Studioプロジェクトです。

- Androidアプリ版: 1.0.7 / versionCode 8
- Webコア: ver.23
- applicationId: `jp.radiomailmanager.app`
- minSdk: 26 (Android 8.0)
- targetSdk / compileSdk: 36 (Android 16)
- データ保存: WebViewの端末内 localStorage
- 通信権限: なし

## Android版で追加した橋渡し

- 完全バックアップJSON / CSV書き出し: Androidの「保存先を選択」画面へ接続
- JSON復元 / CSV読込: Androidのファイル選択画面へ接続
- 投稿フォームURL / Podcast URL: 既定ブラウザで開く
- メールアドレス: メーラーで開く
- Androidの戻るボタン: 開いているダイアログを優先して閉じる

## 初回ビルド

1. Android Studioでこのフォルダを開く。
2. Gradle Syncが終わるまで待つ。
3. SDK 36が未導入ならAndroid Studioの案内に従ってインストールする。
4. Android端末で「開発者向けオプション > USBデバッグ」を有効にし、USBでPCへ接続する。
5. Android Studio上部で端末を選び、Run ▶ を押す。

## APKを作る

Android Studio: Build > Build App Bundle(s) / APK(s) > Build APK(s)

個人利用用のdebug APKは `app/build/outputs/apk/debug/app-debug.apk` に生成されます。

## Google Play公開用

Google PlayへはAPKではなく、原則として署名済みAndroid App Bundle (.aab) を作成してアップロードします。
Android Studio: Build > Generate Signed App Bundle / APK > Android App Bundle

重要: Google Playへ最初に登録する前ならapplicationIdは変更可能ですが、公開後は同じIDを維持してください。


## ver.19 同期
Web版ver.19の下書き／メモ詳細レイアウト、お気に入り表示、下書きメタ項目非表示をAndroid assetsへ反映済みです。下書きのラジオネーム／コーナー保存値は保持されます。


## Android版 1.0.3 / ver.18
- Android 15/16 のedge-to-edge表示でも、コンテンツがステータスバー・ナビゲーションバーに重ならないよう、ルートViewにsystem bar Insetsを適用。
- Android 13以降の予測型「戻る」ジェスチャーに対応。ダイアログ（追加・詳細・設定など）が開いている場合は、アプリを終了せず最前面のダイアログを閉じる。
- 従来のAndroid戻る操作でも同じ処理を使用。
- アプリアイコンは次のデザイン確定後に差し替え可能。現在のアイコン資産は保持。


## ver.19 / Android 1.0.3
- メール詳細の「本文」横にリアルタイム文字数を表示。
- 設定で一覧の「本文」列を「本文」または「要約」から選択可能。
- 番組タブの入れ替えモードを、文字選択を起こさない直接ドラッグ方式へ修正。
- メモ・下書き・送信済・採用・番組一覧で長押し複数選択に対応。複数選択時は「コピー／お気に入り／削除／解除」を表示し、削除はゴミ箱へ移動。


## ver.20 / Android 1.0.4
- ＋ボタン長押しで「メモ／下書き／送信済」を直接選べるクイック追加。
- メール詳細に「前へ／次へ」を追加。現在のタブ・検索・ソート結果の順序で移動。
- メール一覧の複数選択に「採用／採用解除」を追加。
- 「…」→「分析用に書き出す」を追加。対象（すべて／採用／未採用）、番組、期間を指定してCSV出力可能。
- 今後の分析用に createdAt / sentAt / adoptedAt / bodyLength を内部記録。採用解除時は adoptedAt を空にする。
- ver.19の未テスト修正（詳細文字数、本文/要約切替、番組タブ並べ替え改善、一覧複数選択）をすべて含む。

## ver.21 / Android 1.0.5
- 複数選択メニューを大型化し、最後に選択した項目の近くへ表示。
- Androidの戻るジェスチャーは、複数選択中ならまず選択解除。
- 追加（＋）ボタンのサイズを設定から「小／中／大」で変更可能。従来サイズは「小」。
- Androidホーム画面用「＋ メモ」ウィジェットを追加。タップするとアプリのメモ入力画面を直接開く。

## ver.22 / Android 1.0.6
- 複数選択メニューをver.20とver.21の中間サイズに調整し、画面端からはみ出さない配置へ修正。
- 番組タブ長押しのオプションメニューも画面内へ自動補正。
- メモウィジェットを1×1想定の「＋」ボタンに変更。
- ウィジェットからメモを開いた際、本文入力欄へ自動フォーカスしソフトキーボード表示を要求。


## ver.23 / Android 1.0.7
- 下書きに最終更新日時 `updatedAt` を追加し、一覧で「更新日時」を表示。編集時に自動更新。
- メモ／下書きタブに専用検索欄を追加。
- 自動バックアップを最大5世代、端末内に保持。アプリ起動時に1日1回作成し、一覧から復元可能。手動で世代作成も可能。
- メール追加・編集画面のコーナー欄横に「＋」を追加し、その場で番組のコーナー設定へ登録可能。
- Android版の通常CSV／分析用CSV／完全バックアップを `AndroidBridge.saveTextFile` 経由に統一し、保存先選択画面が確実に開くよう修正。
