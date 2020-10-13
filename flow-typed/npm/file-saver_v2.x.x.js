// flow-typed signature: cce0a1898febeb00c3bf769da204fc8d
// flow-typed version: c6154227d1/file-saver_v2.x.x/flow_>=v0.75.x <=v0.103.x

declare function saveAs(
  data: Blob | File | string,
  filename?: string,
  options?: {| autoBom: boolean |}
): void;

declare module "file-saver" {
  declare module.exports: {
    [[call]]: typeof saveAs,
    saveAs: typeof saveAs
  };
}
