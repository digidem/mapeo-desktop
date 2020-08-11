// flow-typed signature: e83cb2a211dff24372ad5e606c84b2cc
// flow-typed version: c6154227d1/mkdirp_v0.5.x/flow_>=v0.25.0 <=v0.103.x

declare module 'mkdirp' {
  declare type Options = number | { mode?: number; fs?: mixed };

  declare type Callback = (err: ?Error, path: ?string) => void;

  declare module.exports: {
    (path: string, options?: Options | Callback, callback?: Callback): void;
    sync(path: string, options?: Options): void;
  };
}
