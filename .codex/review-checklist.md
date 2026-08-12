# Review Checklist

## Requirements
- [ ] 要求とAcceptance Criteriaを満たす
- [ ] 範囲外の挙動を変更していない

## Architecture
- [ ] 業務ロジックがUIから分離されている
- [ ] feature境界とtransaction境界が明確
- [ ] 不要な抽象化がない

## Security
- [ ] 全外部入力をServer側で検証
- [ ] 全mutationで認証を再確認
- [ ] 全公開テーブルでRLSと所有権を強制
- [ ] URLはhttp/httpsのみ許可
- [ ] 秘密情報をClient・ログ・コードへ含めない

## Quality
- [ ] TypeScript strict、理由のないanyなし
- [ ] Loading / Error / Empty stateあり
- [ ] Keyboard / Focus / Contrast / aria-labelを確認
- [ ] lint / typecheck / test / build成功
