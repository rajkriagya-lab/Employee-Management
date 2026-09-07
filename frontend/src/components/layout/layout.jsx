import React from 'react'
import Sidebar from './sidebar'
import Navbar from './navbar'

const layout = ({ children }) => {
    return (
        <div className='min-h-screen bg-background'>
            <Sidebar />

            <div className='lg:ml-[260px]'>
                <Navbar />

                <main className='p-6 sm:p-6 lg:p-8'>
                    {children}
                </main>
            </div>
        </div>
    )
}

export default layout
