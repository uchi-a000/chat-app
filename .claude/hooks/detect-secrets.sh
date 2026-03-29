#!/usr/bin/env bash
# ==============================================================================
# detect-secrets.sh — UserPromptSubmit フック
#
# ユーザーの入力（プロンプト）に機密情報が含まれていないかを
# 正規表現パターンでスキャンし、検知した場合は送信をブロックする。
#
# 仕組み:
#   1. stdin から JSON を受け取り、"prompt" フィールドを抽出
#   2. 定義済みの正規表現パターンと照合（grep -E を使用）
#   3. マッチした場合 → JSON で decision:"block" を出力し exit 2（ブロック）
#      マッチしない場合 → exit 0（通過）
#
# macOS の BSD grep は -P (PCRE) 未対応のため、-E (拡張正規表現) を使用
# ==============================================================================

set -eu

# --- stdin から JSON を読み取り、prompt フィールドを抽出 ---
INPUT=$(cat)
PROMPT=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('prompt',''))" 2>/dev/null || echo "")

# プロンプトが空なら何もせず通過
if [ -z "$PROMPT" ]; then
  exit 0
fi

# --- 検知対象の正規表現パターン一覧 ---
PATTERNS=(
  # AWS アクセスキー（AKIA で始まる20文字）
  'AKIA[0-9A-Z]{16}'
  # AWS シークレットキー（aws_secret_access_key = ...）
  'aws_secret_access_key[[:space:]]*=[[:space:]]*[^[:space:]]+'

  # 各種 API キー・トークン
  'sk-[a-zA-Z0-9]{20,}'                   # OpenAI 等の sk- プレフィックス
  'ghp_[a-zA-Z0-9]{36}'                   # GitHub Personal Access Token
  'gho_[a-zA-Z0-9]{36}'                   # GitHub OAuth Token
  'glpat-[a-zA-Z0-9-]{20,}'               # GitLab Personal Access Token
  'xox[bporas]-[a-zA-Z0-9-]{10,}'         # Slack トークン

  # 秘密鍵（PEM 形式のヘッダー）
  '-----BEGIN[[:space:]]*(RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----'

  # パスワード付き DB 接続文字列（scheme://user:password@host）
  'mysql://[^:]+:[^@]+@'
  'postgres(ql)?://[^:]+:[^@]+@'
  'mongodb(\+srv)?://[^:]+:[^@]+@'

  # .env 形式のシークレット変数（DB_PASSWORD=xxx など）
  '(DB_PASSWORD|API_KEY|API_SECRET|SECRET_KEY|APP_KEY|AUTH_TOKEN|PRIVATE_KEY)[[:space:]]*=[[:space:]]*[^[:space:]]+'

  # Bearer トークン（40文字以上の長いトークン）
  'Bearer[[:space:]]+[a-zA-Z0-9_./-]{40,}'

  # JWT（ドット区切り3パートの Base64 文字列）
  'eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}'
)

# --- 各パターンでプロンプトをスキャン ---
for pattern in "${PATTERNS[@]}"; do
  if echo "$PROMPT" | grep -qEi -- "$pattern" 2>/dev/null; then
    # マッチした場合: ブロック用 JSON を出力して exit 2
    cat <<EOJSON
{"decision":"block","reason":"⚠ 機密情報が含まれている可能性があります。入力から機密情報を除去してください。該当パターン: $pattern"}
EOJSON
    exit 2
  fi
done

# パターンにマッチしなければ通過
exit 0
