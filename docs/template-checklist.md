# Template Setup Checklist

このテンプレートから新しい Pi 拡張プロジェクトを作るときに使う。作成方法を選び、共通の設定・確認に進む。

## Start paths

### Primary path: `create-pi-extension` (recommended)

CLI が placeholder 置換・bootstrap doc 削除・`git init` / `bun install` を担当する。手動作業は最小限でよい。

- [ ] `bunx create-pi-extension@latest <package-name>` でプロジェクトを生成する
- [ ] CLI の next steps（`npm run ci` など）に従う
- [ ] 下記 **Recommended flow** の Vault / PRD / Issues フローに入る
- [ ] README / feature list / quick start をプロジェクト向けに更新する
- [ ] `npm run ci` と `npm pack --dry-run` を通す

CLI はローカルファイルの placeholder を置換する。GitHub 上での repo 作成・About・branch protection などは、repo をホストする場合に下記 **Repository** を確認する。

### Secondary path: GitHub Template

自分の fork などをテンプレート元にする場合は、作成前に**元 repo** の **Settings → General → Template repository** を有効にし、`--template` にその repo を指定する。公式テンプレートから作る場合、元 repo の設定変更は不要。

- [ ] `your-org` を自分の GitHub ユーザー名か組織名に置き換え、公開範囲に合ったコマンドを一つ実行する。

  ```bash
  # Public
  gh repo create your-org/my-pi-package --public --template eiei114/pi-extension-template --clone

  # Private
  gh repo create your-org/my-pi-package --private --template eiei114/pi-extension-template --clone
  ```

  元 repo の全ブランチを含めたい場合は `--include-all-branches` を追加する。

- [ ] clone 先で package 向けの標準 README を配置する。macOS/Linux: `cd my-pi-package && cp scaffold/package-readme.md README.md`。Windows PowerShell: `Set-Location my-pi-package; Copy-Item scaffold/package-readme.md README.md -Force`。
- [ ] clone 先で `npm install` を実行する。
- [ ] 下記 **Repository** 以降を確認し、placeholder の置換と [post-generation cleanup](#post-generation-cleanup-delete-or-merge-template-setup-docs) を済ませる。
- [ ] `npm run ci` を実行する。

## Recommended flow

- [ ] Vault project notes を `4_Project/<ProjectName>/` に作る
- [ ] `CONTEXT.md` / `README.md` / `ROADMAP.md` / `Docs/` / `Issues/` / `Progress/` を揃える
- [ ] PRD を `4_Project/<ProjectName>/Docs/` に置く
- [ ] approved issue を `4_Project/<ProjectName>/Issues/` に切る
- [ ] OSS repo 側で実装する
- [ ] `npm run ci` / `npm test` / `npm pack --dry-run` を通す
- [ ] release 後に Vault へ learnings / release notes を戻す

## Repository

- [ ] GitHub repository name を決める
- [ ] GitHub About の Description に Pi package の一行紹介を、Website に npm package URL またはプロジェクトの docs URL を設定する
- [ ] GitHub topics を設定する
  - [ ] `pi`
  - [ ] `pi-package`
  - [ ] `agent-skill`
  - [ ] `typescript`
- [ ] 作成した repo 自体をテンプレートとして再利用する場合だけ、**Settings → General → Template repository** を有効にする
- [ ] 公開 package では、既定ブランチの保護ルールで PR 経由のマージと `CI` workflow のステータスチェックの成功を必須にし、force push を禁止する
- [ ] Repository URL を `package.json` に反映する
- [ ] 生成先 repo では `package.json` / README 内の `OWNER/REPO` を実リポジトリに置き換える

## Package metadata

- [ ] `package.json` の `name` を変更する
- [ ] `description` を書く
- [ ] `author` を入れる
- [ ] `repository.url` を `https://github.com/OWNER/REPO` 形式の実リポジトリ URL に置き換える
- [ ] `bugs.url` を `https://github.com/OWNER/REPO/issues` 形式に置き換える
- [ ] `homepage` を `https://github.com/OWNER/REPO#readme` 形式に置き換える
- [ ] `keywords` を見直す
- [ ] `LICENSE` の年・名前を更新する

## README placeholders

- [ ] `PACKAGE_DISPLAY_NAME` を置き換える
- [ ] `PACKAGE_NAME` を置き換える
- [ ] `OWNER/REPO` を置き換える
- [ ] one-line pitch を書く
- [ ] feature list を書く
- [ ] quick start command を実コマンドにする
- [ ] npm URL を確認する
- [ ] GitHub URL を確認する

## Pi package manifest

- [ ] `pi.extensions` に公開する拡張だけを残す
- [ ] `pi.skills` に公開する skill だけを残す
- [ ] 不要なら `prompts/` を消す
- [ ] 不要なら `themes/` を消す
- [ ] サンプル名を実名に変える

## Documentation

`docs/` は固定6ファイル必須ではない。README を正とし、価値がある doc だけ残す。

### Required root files (public)

- [ ] `README.md` — GitHub/npm の入口。Install / Quick start / Release / Security を含める
- [ ] `LICENSE`
- [ ] `SECURITY.md`
- [ ] `CHANGELOG.md`
- [ ] Release 手順が README と workflow で明確（Trusted Publishing 設定含む）

### Recommended public docs (keep when useful)

- [ ] `docs/examples.md` — 例が README に載り切らないとき
- [ ] `docs/release.md` — Trusted Publishing や release 手順の詳細が README だけでは足りないとき
- [ ] `docs/usage.md` — 使い方が README に載り切らないとき（必要なら新規作成）

### Optional maintainer docs

- [ ] `docs/template-checklist.md` — このファイル。成熟 repo では README からの主ナビにしない。不要なら削除可

### Post-generation cleanup (delete or merge template setup docs)

テンプレート生成直後の bootstrap 用。プロジェクト固有の価値がなければ削除し、必要な内容は README / `docs/release.md` / `docs/examples.md` に統合する。

- [ ] セットアップ後はこのチェックリストを削除するか、プロジェクト固有の GitHub 設定・手順だけ README / Vault に移す
- [ ] GitHub Template からの生成先に `docs/template-sync.md` が残っていれば削除する（上流テンプレート用）
- [ ] `docs/typescript.md` が残っていれば削除するか、TypeScript 方針を README Development に要約する
- [ ] README の Docs 節から、削除したファイルへのリンクを外す
- [ ] `package.json` の `files` から、削除した `docs/` パスを外す（残す doc だけ明示する）

## TypeScript

- [ ] `extensions/index.ts` を実装に合わせて更新する
- [ ] `extensions/hello.ts` が不要なら削除する
- [ ] 共通ロジックを `lib/` に切り出す
- [ ] `strict: true` を維持する
- [ ] custom tool parameters は TypeBox schema で定義する
- [ ] string choices は `StringEnum` helper を使う
- [ ] runtime dependency は `dependencies`、Pi提供packageは `peerDependencies` に置く
- [ ] `package.json.files` に公開対象だけを入れる
- [ ] 詳細はセットアップ中だけ `docs/typescript.md` を参照し、不要なら post-generation cleanup で削除

## CI / Release

- [ ] `npm run ci` が通る
- [ ] `packages/create-pi-extension` で `npm pack --dry-run` が通り、`template/` が含まれる
- [ ] npm Trusted Publishing を **`create-pi-extension`** に設定する（ルート `pi-extension-template` は公開しない）
- [ ] npm Trusted Publisher の workflow filename が `publish.yml` になっている
- [ ] `NPM_TOKEN` を使っていないことを確認する
- [ ] `auto-release.yml` が `main` の version bump から tag/release を作ることを確認する
- [ ] `publish.yml` が `workflow_dispatch` と `release.published` に対応していることを確認する
- [ ] 初回リリースで npm provenance が付いているか確認する

### Workflow handoff guard

- [ ] `.github/workflows/auto-release.yml` exists before first release
- [ ] `.github/workflows/publish.yml` exists before first release
- [ ] `auto-release.yml` has `permissions: actions: write` and `contents: write`
- [ ] `publish.yml` has `permissions: id-token: write` for npm Trusted Publishing
- [ ] `publish.yml` skips already-published versions via the public npm registry API and logs `publish intentionally skipped` on reruns
- [ ] Auto release explicitly hands off to publish: `gh workflow run publish.yml --ref "$TAG" -f ref="$TAG"`, or `publish.yml` has an equivalent `workflow_run` / `repository_dispatch` trigger
- [ ] Do not rely only on `push.tags` or `release.published` when the tag/release is created by `GITHUB_TOKEN`; that can leave npm unchanged after merge

## npm page

初回 publish 後に確認する。

- [ ] npm package URL を GitHub About と README に追加する
- [ ] npm page の description と README が意図どおりに表示されるか確認する
- [ ] provenance が付いているか確認する
- [ ] 不要なファイルが package に含まれていないか確認する（`npm pack --dry-run` で `docs/` の残し方も確認）

## Before first release

- [ ] サンプルコードを実機 Pi でロードする
- [ ] `pi install git:github.com/OWNER/REPO` を試す
- [ ] `pi -e .` を試す
- [ ] README のコマンドがコピペで動くか確認する
- [ ] CHANGELOG に `0.1.0` を書く
