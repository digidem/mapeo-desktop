import { StyleJSON } from '@mapeo/map-server/dist/lib/stylejson'
import { StylesApi } from '@mapeo/map-server/dist/api/styles'
import { UseQueryResult } from '@tanstack/react-query'

type MapServerStyleInfo = ReturnType<StylesApi["listStyles"]>

export declare function useMapServerQuery(resourcePath: '/styles'): UseQueryResult<MapServerStyleInfo>
export declare function useMapServerQuery(resourcePath: `/styles/${string}`): UseQueryResult<StyleJSON>
