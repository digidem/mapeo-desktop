// flow-typed signature: a308ee846065c917580dc7cab3584bb5
// flow-typed version: c6154227d1/clsx_v1.x.x/flow_>=v0.30.x <=v0.103.x

declare module 'clsx' {
  declare type Classes =
    | Array<Classes>
    | { [className: string]: * }
    | string
    | number
    | boolean
    | void
    | null;

  declare module.exports: (...classes: Array<Classes>) => string;
}
