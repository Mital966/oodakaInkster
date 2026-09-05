import { useEffect, useState } from 'react'

// Generic async data hook. Use with the dataService functions so the UI stays
// decoupled from the data source (JSON today, Supabase in Part 2).
export function useDataQuery(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null })

  useEffect(() => {
    let alive = true
    setState((prev) => ({ ...prev, loading: true, error: null }))
    fetcher()
      .then((data) => alive && setState({ data, loading: false, error: null }))
      .catch((error) => alive && setState({ data: null, loading: false, error }))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}