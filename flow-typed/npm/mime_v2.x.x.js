// flow-typed signature: 483ed626d65ef50e57edb6c93c1b5e7d
// flow-typed version: c6154227d1/mime_v2.x.x/flow_>=v0.25.x <=v0.103.x

declare type $npm$mime$TypeMap = {[mime: string]: Array<string>};

declare class $npm$mime$Mime {
  constructor(...typeMap: Array<$npm$mime$TypeMap>): void;

  define(typeMap: $npm$mime$TypeMap, force?: boolean): void;
  getExtension(mime: string): ?string;
  getType(path: string): ?string;
}

declare module 'mime' {
  declare type TypeMap = $npm$mime$TypeMap;
  declare module.exports: $npm$mime$Mime;
}

declare module 'mime/lite' {
  declare type TypeMap = $npm$mime$TypeMap;
  declare module.exports: $npm$mime$Mime;
}

declare module 'mime/Mime' {
  declare type TypeMap = $npm$mime$TypeMap;
  declare module.exports: typeof $npm$mime$Mime;
}
