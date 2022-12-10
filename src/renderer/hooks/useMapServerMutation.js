// @ts-check
import ky from 'ky/umd'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// @ts-ignore
const MAP_SERVER_URL = 'http://127.0.0.1:' + window.mapServerPort

export function useMapServerMutation (mutationType, resourcePath) {
  const queryClient = useQueryClient()

  const kyFunction = (path, body) =>
    mutationType === 'post'
      ? ky.post(path, { json: body })
      : mutationType === 'put'
      ? ky.put(path, { json: body })
      : ky.delete(path)

  return useMutation({
    mutationFn: bodyFromMutation =>
      kyFunction(MAP_SERVER_URL + resourcePath, bodyFromMutation),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/${resourcePath.split('/')[1]}`]
      })
    }
  })
}
