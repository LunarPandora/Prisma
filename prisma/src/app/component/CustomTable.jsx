"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSpinner, faSadCry, faCircleExclamation, faEllipsis, faCheck } from '@fortawesome/free-solid-svg-icons'
import { AnimatePresence, motion } from "framer-motion"

import { useEffect, useState, useRef } from "react"
import ContextWindow from "./Context/ContextWindow"
import ContextMenu from "./Context/ContextMenu"

export default function CustomTable({ 
  fetchMethod, 
  columns, 
  isEditable, 
  isRemovable, 
  refreshKey, 
  className, 
  roundedStyle = 'rounded-lg', 
  context = [
    {
      "icon": faCheck,
      "iconColor": "text-gray-700",
      "text": "Options #1",
      "textColor": "text-gray-700",
      "action": () => {}
    },
  ],
  onRowContext,
  onContextRequest,
  ...props
}) {
  const [data, setData] = useState([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [failedLoading, setFailedLoading] = useState(false)

  const buttonRef = useRef(null);

  const openFromButton = (e, row) => {
    const r = e.currentTarget.getBoundingClientRect();

    onContextRequest({
      x: r.left,
      y: r.bottom,
      type: "row",
      data: row,
    });
  };

  async function fetchData(pageNumber = 1) {
    try {
      setLoading(true)

      const res = await fetchMethod(pageNumber)
      const result = await res.data

      setData(result.data ?? [])
      setPage(result.meta?.current_page)
      setLastPage(result.meta?.last_page)

    } catch (err) {
      console.error(err)
      setFailedLoading(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(page)
  }, [page, refreshKey])

  return (
    <div className={`space-y-4 ${className}`}>

      {/* Table */}
      <div className={`overflow-x-auto bg-white shadow ${roundedStyle}`}>
        <table className="w-full text-left">
          <thead className="bg-foreground text-background">
            <tr>
              {columns.map((col, index) => (
                <th key={index} className="p-3">
                  {col.header}
                </th>
              ))}

              {isEditable || isRemovable ? <th className="p-3 w-32">Action</th> : null}
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
                className="will-change-auto"
              >
                <td colSpan={columns.length + (isEditable || isRemovable ? 1 : 0)} className="p-4">
                  <div class="w-full flex flex-col items-center justify-center gap-2 p-8">
                    <FontAwesomeIcon icon={faSpinner} className="text-4xl animate-spin" />
                    Loading...
                  </div>
                </td>
              </motion.tr>
            ) : 
              data.length <= 0 ? 
              (
                <motion.tr
                  className="border-t will-change-auto"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <td colSpan={columns.length + (isEditable || isRemovable ? 1 : 0)}>
                    {failedLoading ?
                      (
                        <div class="w-full flex flex-col items-center justify-center gap-2 p-8">
                          <FontAwesomeIcon icon={faCircleExclamation} className="text-4xl" />
                          Terjadi kesalahan saat sedang mengambil data!
                        </div>
                      )
                    :
                      (
                        <div class="w-full flex flex-col items-center justify-center gap-2 p-8">
                          <FontAwesomeIcon icon={faSadCry} className="text-4xl" />
                          Tidak ditemukan data!
                        </div>
                      )
                    }
                  </td>
                </motion.tr>
              ) : 
              (
                data.map((row, i) => (
                  <motion.tr
                    key={i}
                    className="border-t border-gray-200 will-change-auto hover:bg-gray-200 even:bg-gray-100 transition-colors duration-200 ease-in-out"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.04 }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      onContextRequest({
                        x: e.clientX,
                        y: e.clientY,
                        type: "row",
                        data: row,
                      });
                    }}
                  >
                    {columns.map((col, j) => (
                      <td key={j} className="p-3">
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </td>
                    ))}
                    
                    <td className="p-3 flex items-center gap-2 relative w-fit">
                      <button 
                        className="p-2 rounded-md aspect-square hover:cursor-pointer flex items-center justify-center"
                        ref={buttonRef} 
                        onClick={(e) => openFromButton(e, row)}>
                        <FontAwesomeIcon icon={faEllipsis} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )
            }
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex gap-2 items-center">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span>
          Page {page} of {lastPage}
        </span>

        <button
          disabled={page === lastPage}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}