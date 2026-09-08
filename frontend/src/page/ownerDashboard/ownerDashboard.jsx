import React,{useEffect, useState} from 'react'
import layout from "../../components/layout/owner/layout";
import Loading from "../../components/layout/loading"

const ownerDashboard = () => {
    const [dashboard, setDashboard] =
    useState(null);

    const [loading, setLoading] =
    useState(true);

    const [error ,setError]= 
    useState("");

    const loadDashboard = async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getOwnerDashboard();

            setDashboard(data);
        } catch (error) {
            console.error(error);

            setError(error.response?.data?.message || "Unable to load dashboard");
        } finally{
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    if(loading) {
        return <Loading />
    }

    if(error) {
        return (
            <layout>
                <div className='rouded-3x1 border border-border200 bg-background-50 p-6 bg-text-700 shadow-sm'>
                    <p className='font-semibold'>Dashboard Unavailable</p>
                    <p className='mt-1 text-sm text-text-600'>{error}</p>
                    <button type='button' onClick={loadDashboard} className='mt-4 rouned-x1 bg-text-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700'>Try again</button>
                </div>
            </layout>
        )
    }
  return (
    <layout>
        
    </layout>
  )
}

export default ownerDashboard
