import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Redirect, RouteComponentProps } from 'react-router-dom'
import { AppDispatch } from '../../state'
import { ApplicationModal, setOpenModal } from '../../state/application/actions'


// Redirects to swap but only replace the pathname
export function RedirectPathToSwapOnly({ location }: RouteComponentProps) {
    return <Redirect to={{ ...location, pathname: '/swap' }} />
}


export function OpenClaimAddressModalAndRedirectToSwap(props: RouteComponentProps) {
    const dispatch = useDispatch<AppDispatch>()
    useEffect(() => {
        dispatch(setOpenModal(ApplicationModal.ADDRESS_CLAIM))
    }, [dispatch])
    return <RedirectPathToSwapOnly {...props} />
}
