export class QueryBuilder {
    constructor() {
        this.reset()
    }

    reset() {
        this.query = {
            search: "",
            filters: {},
            sort: {},
            pagination: {
                page: 1,
                per_page: 10
            }
        }

        return this
    }

    resetFilters() {
        this.query.filters = {}
        return this
    }

    setSearch(value) {
        this.query.search = value
        return this
    }

    addFilter(key, value) {
        if (
            value !== "" &&
            value !== null &&
            value !== undefined
        ) {
            this.query.filters[key] = value
        } else {
            delete this.query.filters[key]
        }

        return this
    }

    removeFilter(key) {
        delete this.query.filters[key]
        return this
    }

    setSort(by, order = "asc") {
        this.query.sort = { by, order }
        return this
    }

    setPage(page) {
        this.query.pagination.page = page
        return this
    }

    setPerPage(perPage) {
        this.query.pagination.per_page = perPage
        return this
    }

    build() {
        return this.query
    }

    toQueryString() {
        const params = new URLSearchParams()

        if (this.query.search) {
            params.append("search", this.query.search)
        }

        Object.entries(this.query.filters).forEach(([key, value]) => {
            params.append(key, value)
        })

        if (this.query.sort.by) {
            params.append("sort_by", this.query.sort.by)
            params.append("sort_order", this.query.sort.order)
        }

        params.append("page", this.query.pagination.page)
        params.append("per_page", this.query.pagination.per_page)

        return params.toString()
    }
}