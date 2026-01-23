# vt-replace-glob-key-with-hash

vue開発時に import.meta.glob で globのキー（ファイル名）一覧が丸見えなのが気になったので、キーをハッシュ化してファイル構成を少しでも隠すことを目的としています。

globの展開で、`"キーとなるファイル名" => importファイル` となる部分を `"ファイル名のハッシュ値" => importファイル`となるように置換します。

プラグイン未適用のビルド例（import.meta.glob の戻り値）:
```js
// key = ファイルパス
{
    './Pages/Home.vue': () => import('./***.js'),
    './Pages/About.vue': () => import('./***.js'),
}
```
プラグイン適用のビルド例:
```js
// key = ファイルパスのハッシュ値
{
  'a8f3c9e1': () => import('./***.js'),
  'f02bd91a': () => import('./***.js'),
}
```

## Installation

このパッケージはビルド時（Vite プラグイン）に使用するため、製品版バンドルに含める必要はありません。

```bash
npm install --save-dev vt-replace-glob-key-with-hash
```

## viteビルドプラグインに関して
```typescript
import replaceGlobKeyWithHash from "vt-replace-glob-key-with-hash/vite";
```
とインポートし、config.plugins:[] に replaceGlobKeyWithHash( ['**.ts'], {hash:true} ) を指定・追加します。
ファイル名は import.meta.glob を記述しているファイルを指定してください。

ビルド時にハッシュ化を無効化したい場合は オプション `hash` にfalse指定で無効化できます。

## ブラウザ開発側の対応に関して
vue の app.ts などでドキュメントでよくある
```typescript
const pages = import.meta.glob<DefineComponent>( './Pages/**/*.vue', { eager: false } );
const importPage = pages[`./Pages/${name}.vue`];
```
のような記述を
```typescript
import getGlobFile from "vt-replace-glob-key-with-hash";

const pages = import.meta.glob<DefineComponent>( './Pages/**/*.vue', { eager: false } );
const importPage = getGlobFile( pages, './Pages/**/*.vue', {
    key: name,
    hash: !import.meta.env.DEV
});
```
な感じにしてください。

`getGlobFile` は、ハッシュ化されたキー／未ハッシュのキーの両方に対応して、ビルド環境差異を意識せずに指定したファイルを安全にimportするためのヘルパー関数です。

`getGlobFile`の第一引数は `import.meta.glob`の戻り値を、第二引数は import.meta.glob に渡した文字列リテラルをそのまま指定してください。

※ import.meta.globは変数が指定できないので文字列リテラルを使う必要があります。

また `vite dev` では Vite の仕様上ビルドプラグインが適用されず globキーはハッシュ化されませんので、`hash` オプションで `!import.meta.env.DEV` の指定を推奨します。


## 制約・注意点
### viteビルドプラグイン
- `replaceGlobKeyWithHash( targets: string[], options )` の第一引数の対象ファイル名の配列は、厳密なファイル指定ではありません。
chunkに含まれているかどうかで、ここでファイルを指定しなくても別ファイルと同チャンクだと置換対象となります。
- 一部のファイルでの import.meta.glob のハッシュ化を無効化したい場合は、
    ```typescript
    const pages_no_hash = import.meta.glob<DefineComponent>( './Pages/**/*.vue', { eager: false } );
    ```
    のように、変数名に`no_hash`を含めてください。変数名に `no_hash` を含めた場合は、明示的にハッシュ化を無効化する仕様としています。

### ブラウザ側開発
- ファイル・ディレクトリ構成において
    ```typescript
    const pages = import.meta.glob<DefineComponent>( './Pages/**/*.vue', { eager: false } );
    ```
    と `**/*` 部分のファイル名抽出をビルドプラグインで行いますが、そのためには以下のいづれかの条件を満たす必要があります。（上記例としてPages直下の条件を記載します）
    - Pages直下の2つ以上のvueが存在
    - Pages直下に1つのvueとvueを1つ以上含むディレクトリが1つ以上
    - Pages直下にvueを1つ以上含むディレクトリが2つ以上
    この条件を満たさないと、`**/*` のファイル抽出がうまくいきません。ダミーファイルでもよいので条件にマッチするファイルを複数置いてください。
