import React from 'react'

export default function button({ children, ...props }) {
  return (
    <button
      {...props}
      className="w-full bg-btn text-white py-3 rounded-lg cursor-pointer hover:opacity-90"
    >
      {children}
    </button>
  )
}
