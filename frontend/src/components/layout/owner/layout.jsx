import { useState } from 'react'
import Sidebar from './sidebar'
import Navbar from './navbar'

const Layout = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false)
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user')
    const user = storedUser ? JSON.parse(storedUser) : null

    return (
        <div className='min-h-screen bg-background'>
            <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} role={user?.role} />

            <div className='lg:ml-[260px]'>
                <Navbar setIsOpen={setIsOpen} />

                <main className='p-6 sm:p-6 lg:p-8'>
                    {children}
                </main>
            </div>
        </div>
    )
}

export default Layout
