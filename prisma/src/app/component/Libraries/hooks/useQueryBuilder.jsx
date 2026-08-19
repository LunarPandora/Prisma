"use client"

import { useState } from "react"
import { QueryBuilder } from "../utils/query"

export function useQueryBuilder() {
    const [qb] = useState(() => new QueryBuilder())

    return {
        reset: () => qb.reset(),
        resetFilters: () => qb.resetFilters(),
        setSearch: (v) => qb.setSearch(v),
        addFilter: (k, v) => qb.addFilter(k, v),
        removeFilter: (k) => qb.removeFilter(k),
        setSort: (b, o) => qb.setSort(b, o),
        setPage: (p) => qb.setPage(p),
        setPerPage: (p) => qb.setPerPage(p),
        build: () => qb.build(),
        toQueryString: () => qb.toQueryString()
    }
}