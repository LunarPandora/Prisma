"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSpinner, faSadCry, faCircleExclamation, faEllipsis, faRefresh, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons'
import { AnimatePresence, motion } from "framer-motion"
import { createPortal } from "react-dom"

import { useEffect, useState, useRef, useMemo } from "react"
import ActionButton from "./ActionButton"

function compareValues(a, b) {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1

  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return a === b ? 0 : a ? -1 : 1
  }

  if (typeof a === 'number' && typeof b === 'number') {
    return a - b
  }

  if (typeof a === 'string' && typeof b === 'string') {
    const numA = parseFloat(a)
    const numB = parseFloat(b)
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB
    }
    return a.localeCompare(b, 'id', { numeric: true, sensitivity: 'base' })
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime()
  }

  const strA = String(a)
  const strB = String(b)
  return strA.localeCompare(strB, 'id', { numeric: true, sensitivity: 'base' })
}

function getSortValue(row, key) {
  return row[key]
}

function isColumnSortable(col) {
  if (col.sortable === false) return false
  if (!col.key) return false
  return true
}

export default function CustomTable({
  fetchMethod,
  searchQuery,
  columns,
  refreshKey,
  className,
  roundedStyle = 'rounded-lg',
  onContextRequest,
  onRowClick,
  maxActions = 0,
  rowActions = [],
  onRefresh,
  headerRight,
  hideActions: hideActionsProp,
  rowHighlightKey,
  ...props
}) {
  const [data, setData] = useState([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [failedLoading, setFailedLoading] = useState(false)
  const [refreshTooltip, setRefreshTooltip] = useState(null)

  const [sortKey, setSortKey] = useState(null)
  const [sortDirection, setSortDirection] = useState(null)

  const buttonRef = useRef(null);

  const openFromButton = (e, row) => {
    onContextRequest(e, 'row', row, 'btn');
  };

  async function fetchData(currentPage = 1) {
    try {
        setLoading(true)

        const query = new URLSearchParams(searchQuery || "")
        query.set("page", currentPage)

        const res = await fetchMethod(query.toString())
        const result = res.data

        setData(result.data ?? [])
        setLastPage(result.meta?.last_page ?? 1)

    } catch (err) {
        console.error(err)
        setFailedLoading(true)
    } finally {
        setLoading(false)
    }
}

  useEffect(() => {
    fetchData(page)
  }, [refreshKey, page, searchQuery])

  const handleSort = (col) => {
    if (!isColumnSortable(col)) return

    if (sortKey !== col.key) {
      setSortKey(col.key)
      setSortDirection('asc')
    } else if (sortDirection === 'asc') {
      setSortDirection('desc')
    } else {
      setSortKey(null)
      setSortDirection(null)
    }
  }

  const handleSortKeyDown = (e, col) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSort(col)
    }
  }

  const displayData = useMemo(() => {
    if (!sortKey || !sortDirection) return data

    const sorted = [...data].sort((a, b) => {
      const valA = getSortValue(a, sortKey)
      const valB = getSortValue(b, sortKey)
      return compareValues(valA, valB)
    })

    return sortDirection === 'desc' ? sorted.reverse() : sorted
  }, [data, sortKey, sortDirection])

  const showInline = rowActions.length > 0
  const visibleActions = showInline ? rowActions.filter(a => !a.destructive) : []
  const hideActions = hideActionsProp ?? (rowActions.length === 0 && maxActions === 0)
  const colCount = hideActions ? columns.length : columns.length + 1

  return (
    <div className={`flex flex-col gap-3 ${className}`}>

      {/* Pagination - Top */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Prev
          </button>

          <span className="text-sm text-gray-600 px-2">
            {page} / {lastPage}
          </span>

          <button
            disabled={page === lastPage}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>

        {headerRight && (
          <div>{headerRight}</div>
        )}
      </div>

      {/* Table */}
      <div className={`bg-white border border-gray-200 ${roundedStyle} overflow-hidden`}>
        <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {columns.map((col, index) => {
                  const sortable = isColumnSortable(col)
                  const isActive = sortKey === col.key

                  return (
                    <th
                      key={index}
                      className={`px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap ${
                        sortable
                          ? 'cursor-pointer select-none hover:bg-gray-100 transition-colors'
                          : ''
                      }`}
                      onClick={() => handleSort(col)}
                      onKeyDown={(e) => handleSortKeyDown(e, col)}
                      role={sortable ? 'columnheader' : undefined}
                      tabIndex={sortable ? 0 : undefined}
                      aria-sort={isActive ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col.header}</span>
                        {sortable && (
                          <span className="inline-flex flex-col -space-y-0.5">
                            <FontAwesomeIcon
                              icon={faArrowUp}
                              className={`text-[9px] transition-colors ${
                                isActive && sortDirection === 'asc'
                                  ? 'text-blue-600'
                                  : 'text-gray-300'
                              }`}
                            />
                            <FontAwesomeIcon
                              icon={faArrowDown}
                              className={`text-[9px] transition-colors ${
                                isActive && sortDirection === 'desc'
                                  ? 'text-blue-600'
                                  : 'text-gray-300'
                              }`}
                            />
                          </span>
                        )}
                      </div>
                    </th>
                  )
                })}

                {!hideActions && (
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span>Aksi</span>
                      {onRefresh && (
                        <div className="relative">
                          <button
                            onClick={onRefresh}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect()
                              setRefreshTooltip({ x: rect.left + rect.width / 2, y: rect.top - 8 })
                            }}
                            onMouseLeave={() => setRefreshTooltip(null)}
                            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                          >
                            <FontAwesomeIcon icon={faRefresh} className="text-xs" />
                          </button>
                          {refreshTooltip && createPortal(
                            <div
                              className="fixed z-[9999] bg-gray-900 text-white text-xs rounded-md px-2 py-1 whitespace-nowrap pointer-events-none"
                              style={{ left: refreshTooltip.x, top: refreshTooltip.y, transform: "translate(-50%, -100%)", animation: "fadeIn 0.15s ease-in-out" }}
                            >
                              Refresh Tabel
                            </div>,
                            document.body
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {loading ?
              (
                <motion.tr
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <td colSpan={colCount} className="px-4 py-12">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <FontAwesomeIcon icon={faSpinner} className="text-2xl animate-spin text-gray-400" />
                      <span className="text-sm text-gray-500">Memuat data...</span>
                    </div>
                  </td>
                </motion.tr>
              ) :
                displayData.length <= 0 ?
                (
                  <motion.tr
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <td colSpan={colCount} className="px-4 py-12">
                      {failedLoading ?
                        (
                          <div className="flex flex-col items-center justify-center gap-3">
                            <FontAwesomeIcon icon={faCircleExclamation} className="text-2xl text-red-400" />
                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-700">Gagal memuat data</p>
                              <p className="text-xs text-gray-500 mt-0.5">Terjadi kesalahan saat mengambil data</p>
                            </div>
                          </div>
                        )
                      :
                        (
                          <div className="flex flex-col items-center justify-center gap-3">
                            <FontAwesomeIcon icon={faSadCry} className="text-2xl text-gray-300" />
                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-700">Tidak ada data</p>
                              <p className="text-xs text-gray-500 mt-0.5">Tidak ditemukan data yang sesuai</p>
                            </div>
                          </div>
                        )
                      }
                    </td>
                  </motion.tr>
                ) :
                (
                  displayData.map((row, i) => (
                    <motion.tr
                      key={i}
                      data-highlight={rowHighlightKey ? `row-${row[rowHighlightKey]}` : undefined}
                      className={`
                        border-b border-gray-100 last:border-b-0
                        transition-colors duration-150
                        ${onRowClick ? 'cursor-pointer' : ''}
                        hover:bg-blue-50/50
                      `}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15, delay: i * 0.02 }}
                      onContextMenu={(e) => onContextRequest(e, 'row', row, 'hover')}
                      onClick={() => onRowClick?.(row)}
                      tabIndex={onRowClick ? 0 : undefined}
                      onKeyDown={onRowClick ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onRowClick(row)
                        }
                      } : undefined}
                      role={onRowClick ? 'button' : undefined}
                    >
                      {columns.map((col, j) => (
                        <td key={j} className="px-4 py-3 text-sm text-gray-700 align-top" width={col.width}>
                          {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "-")}
                        </td>
                      ))}

                      {!hideActions && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 flex-nowrap">
                            {showInline && visibleActions
                              .filter(action => {
                                if (typeof action.hidden === "function") {
                                  return !action.hidden(row)
                                }
                                return !action.hidden
                              })
                              .filter(action => {
                                if (typeof action.enabled === "function") {
                                  return action.enabled(row)
                                }
                                return action.enabled !== false
                              })
                              .slice(0, maxActions || undefined)
                              .map((action, idx) => {
                                const responsiveClass = idx === 0
                                  ? ""
                                  : idx === 1
                                  ? "hidden md:inline-flex"
                                  : "hidden lg:inline-flex"
                                return (
                                  <div key={idx} className={responsiveClass}>
                                    <ActionButton
                                      icon={action.icon}
                                      label={action.text}
                                      onClick={() => action.action(row)}
                                      danger={action.danger}
                                    />
                                  </div>
                                )
                              })}
                            <button
                              className="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer shrink-0 md:hidden"
                              ref={buttonRef}
                              onClick={(e) => {
                                e.stopPropagation()
                                openFromButton(e, row)
                              }}>
                              <FontAwesomeIcon icon={faEllipsis} className="text-sm" />
                            </button>
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))
                )
              }
            </tbody>
          </table>
      </div>

      <style>{`
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
