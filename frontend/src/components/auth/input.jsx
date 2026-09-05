import React from 'react'

export default function input({lable, ...props}) {
  return (
    <div className='mb-5'>
      {lable && (
        <lable className="block text-white mb-2">
            {lable}
        </lable>
      )}
      <input
      {...props}
        className='w-full bg-primary text-white rounded-lg p-3 outline-none border border-gray-700 focus:border-btn' 
      />
    </div>
  )
}
