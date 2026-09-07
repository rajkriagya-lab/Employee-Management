import React from 'react'
import Layout from '../../components/layout/layout'

const ownerDashboard = () => {
    return (
        <Layout>
            <div>
                <h1 className="text-2xl font-semibold text-text">
                    Dashboard
                </h1>

                <p className="mt-1 text-sm text-muted">
                    Here's what's happening today.
                </p>

                {/* Your dashboard components */}
            </div>
        </Layout >
    )
}

export default ownerDashboard
