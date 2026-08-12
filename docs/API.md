# Interface Policy

MVPのWeb UIはServer Components（read）とServer Actions（mutation）を使う。Mobile向けREST APIはMVP外であり、`/api/v1` は作らない。

全Server Actionは以下を行う。

1. `getClaims()` で認証を確認する。
2. FormDataをplain objectへ変換しZodで検証する。
3. `user_id` は入力から受け取らずverified claimから設定する。
4. Supabaseエラーを安全な汎用メッセージへ変換する。
5. 成功後に関連routeをrevalidateする。
