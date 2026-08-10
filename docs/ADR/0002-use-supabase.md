# ADR 0002: Use Supabase

Status: Accepted

Auth、PostgreSQL、RLSを一体で利用する。Service Role Keyをアプリへ渡さず、verified sessionとRLSを認可境界とする。
