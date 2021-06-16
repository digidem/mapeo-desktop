declare module '@react-pdf/renderer' {
  declare type TextPropTypes = {|
    wrap?: boolean,
    render?: (_: {| pageNumber: number, totalPages: number |}) => string,
    style?: any,
    debug?: boolean,
    fixed?: boolean,
    children?: React$Node
  |}
  declare type ViewPropTypes = {|
    wrap?: boolean,
    render?: (_: {| pageNumber: number |}) => string,
    style?: any,
    debug?: boolean,
    fixed?: boolean,
    children?: React$Node
  |}
  declare type ImagePropTypes = {|
    wrap?: boolean,
    src?: string | Promise<{ data: Buffer, format: 'png' | 'jpg' }>,
    style?: any,
    debug?: boolean,
    fixed?: boolean,
    cache?: boolean
  |}
  declare type PagePropTypes = {|
    size?: string | [number, number],
    orientation?: 'landscape' | 'portrait',
    wrap?: boolean,
    style?: any,
    debug?: boolean,
    children: React$Node
  |}
  declare type FontConfig = {|
    fontFamily: string,
    src: string,
    fontStyle: 'normal' | 'italic',
    fontWeight: number
  |}
  declare type FontRegistrationOptions =
    | FontConfig
    | {|
        family: string,
        fonts: Array<$Diff<FontConfig, { fontFamily: * }>>
      |}
  declare module.exports: {
    Document: React$ComponentType<any>,
    Page: React$ComponentType<PagePropTypes>,
    View: React$ComponentType<ViewPropTypes>,
    Text: React$ComponentType<TextPropTypes>,
    Image: React$ComponentType<ImagePropTypes>,
    StyleSheet: {
      create: <T: {}>(T) => T
    },
    Font: {
      register: FontRegistrationOptions => void
    },
    pdf: any => any,
    BlobProvider: React$ComponentType<{|
      document: React$Node,
      children: ({|
        blob: Blob,
        url: string,
        error?: Error,
        loading: boolean
      |}) => React$Node
    |}>
  }
}
