import { StyleJSON } from '@mapeo/map-server/dist/lib/stylejson'
import { TileJSON } from '@mapeo/map-server/dist/lib/tilejson';
import { UseMutationResult} from '@tanstack/react-query'

// This is the body of the styles `Post` Request:
// https://github.com/digidem/mapeo-map-server/blob/master/API.md#post-styles
type StyleBody = {
    url:string,
    style:StyleJSON,
    id?:string,
    accessToken:string
}

export declare function useMapServerMutation(mutationType:'post', resourcePath:`/tilesets`):UseMutationResult<TileJSON, unknown,TileJSON>

export declare function useMapServerMutation(mutationType:'post', resourcePath:`/tilesets/import`):UseMutationResult<TileJSON, unknown, {filePath:string}>

export declare function useMapServerMutation(mutationType:'put', resourcePath:`/tilesets/${string}`):UseMutationResult<TileJSON, unknown,TileJSON>

export declare function useMapServerMutation(mutationType:'post', resourcePath:`/styles`):UseMutationResult<StyleJSON, unknown,StyleBody>

export declare function useMapServerMutation(mutationType:'delete', resourcePath:`/styles/${string}`):UseMutationResult<204>