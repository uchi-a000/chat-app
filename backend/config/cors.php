<?php

/**
 * CORS（Cross-Origin Resource Sharing）設定
 *
 * このファイルの目的：
 * フロントエンド（例：React が localhost:3000 で動いている）と
 * バックエンド（Laravel API）が別オリジンで動く場合、
 * ブラウザのセキュリティによりデフォルトでは API リクエストがブロックされます。
 * この設定で「どのオリジンからのリクエストを許可するか」などを指定し、
 * フロントと API が安全に通信できるようにします。
 */
return [

    // この CORS 設定を適用するルートのパターン
    // api/* = すべての API ルート、sanctum/csrf-cookie = CSRF クッキー取得用
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'broadcasting/auth'],

    // 許可する HTTP メソッド（* = GET, POST, PUT, PATCH, DELETE などすべて）
    'allowed_methods' => ['*'],

    // リクエストを許可するオリジン（フロントの URL）
    // ここに書いたオリジンからのみ API にアクセス可能
    'allowed_origins' => [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ],

    // 許可するリクエストヘッダー（* = すべて許可。Authorization なども含む）
    'allowed_headers' => ['*'],

    // クッキー・認証情報（Authorization ヘッダーなど）を送受信する場合は true
    // Laravel Sanctum などでログイン状態を維持するために必要
    'supports_credentials' => true,

];
