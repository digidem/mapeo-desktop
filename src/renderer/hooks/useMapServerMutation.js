import ky from 'ky/umd'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const MAP_SERVER_URL = 'http://127.0.0.1:' + window.mapServerPort

/**
 * @param {string} resourcePath
 * @param {'post' | 'put' | 'delete'}
 */
export function useMapServerMutation (resourcePath, mutationType) {
  const queryClient = useQueryClient()
  const kyFunction = path =>
    mutationType === 'post'
      ? ky.post(path)
      : mutationType === 'put'
      ? ky.put(path)
      : ky.delete(path)

  return useMutation({
    mutationFn: () => kyFunction(MAP_SERVER_URL + resourcePath),
    onSuccess: queryClient.invalidateQueries({ queryKey: resourcePath })
  })
}
