import { StyleJSON } from '@mapeo/map-server/dist/lib/stylejson'
import { StylesApi,  } from '@mapeo/map-server/dist/api/styles'
import { UseQueryResult } from '@tanstack/react-query'
import { TilesetsApi } from "@mapeo/map-server/dist/api/tilesets";
import { ImportsApi } from "@mapeo/map-server/dist/api/imports";

type Unpacked<T> = T extends (infer U)[]
  ? U
  : T extends (...args: any[]) => infer U
  ? U
  : T extends Promise<infer U>
  ? U
  : T;

type MapServerStyleInfo = Unpacked<ReturnType<StylesApi["listStyles"]>>
type Tileset = Unpacked<ReturnType<TilesetsApi["getTileset"]>>;
type MapServerImport = Unpacked<ReturnType<ImportsApi["getImport"]>>;

export declare function useMapServerQuery(resourcePath: '/styles', enabled?:boolean): UseQueryResult<MapServerStyleInfo[]>
export declare function useMapServerQuery(resourcePath: `/styles/${string}`,enabled?:boolean): UseQueryResult<StyleJSON>
export declare function useMapServerQuery(resourcePath: `/tilesets`, enabled?:boolean): UseQueryResult<Tileset>
export declare function useMapServerQuery(resourcePath: `/imports/${string}`, enabled?:boolean): UseQueryResult<MapServerImport>