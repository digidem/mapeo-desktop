// @ts-check
import ky from 'ky/umd'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const queryClient = useQueryClient()

// @ts-ignore
const MAP_SERVER_URL = 'http://127.0.0.1:' + window.mapServerPort

export function useMapServerMutation (mutationType, resourcePath, body) {
  const kyFunction = (path, body) =>
    mutationType === 'post'
      ? ky.post(path, { json: body })
      : mutationType === 'put'
      ? ky.put(path, { json: body })
      : ky.delete(path)

  return useMutation({
    mutationFn: () => kyFunction(MAP_SERVER_URL + resourcePath, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [resourcePath] })
  })
}
