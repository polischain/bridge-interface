import { Currency } from 'hadeswap-beta-sdk'
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Logo from '../assets/images/logo.png'
import { useActiveWeb3React } from '../hooks/useActiveWeb3React'
import { useETHBalances } from '../state/wallet/hooks'
import { ReactComponent as Burger } from '../assets/images/burger.svg'
import { ReactComponent as X } from '../assets/images/x.svg'
import Web3Network from './Web3Network'
import Web3Status from './Web3Status'
import MoreMenu from './Menu'
import { ExternalLink, NavLink } from './Link'
import { Disclosure } from '@headlessui/react'
import { ANALYTICS_URL } from '../constants'
import QuestionHelper from './QuestionHelper'
import { t } from '@lingui/macro'
import LanguageSwitch from './LanguageSwitch'
import { useLingui } from '@lingui/react'

function AppBar(): JSX.Element {
    const { i18n } = useLingui()
    const { account, chainId, library } = useActiveWeb3React()
    const { pathname } = useLocation()

    const [navClassList, setNavClassList] = useState(
        'w-screen bg-transparent gradiant-border-bottom z-10 backdrop-filter backdrop-blur'
    )

    const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']

    useEffect(() => {
        if (pathname === '/trade') {
            setNavClassList('w-screen bg-transparent z-10 backdrop-filter backdrop-blur')
        } else {
            setNavClassList('w-screen bg-transparent gradiant-border-bottom z-10 backdrop-filter backdrop-blur')
        }
    }, [pathname])

    return (
        <header className="flex flex-row flex-nowrap justify-between w-screen">
            <Disclosure as="nav" className={navClassList}>
                {({ open }) => (
                    <>
                        <div className="px-4 py-1.5">
                            <div className="flex items-center justify-between h-16">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <img src={Logo} alt="Polis" className="h-10 w-auto" />
                                    </div>
                                    <div className="hidden sm:block sm:ml-4">
                                        <div className="flex space-x-2">
                                            <NavLink id={`swap-nav-link`} to={'/transfer'}>
                                                {i18n._(t`Bridge`)}
                                            </NavLink>

                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-row items-center justify-center w-full lg:w-auto p-4 fixed left-0 bottom-0 bg-dark-1000 lg:relative lg:p-0 lg:bg-transparent">
                                    <div className="flex items-center justify-between sm:justify-end space-x-2 w-full">
                                        {library && library.provider.isMetaMask && (
                                            <div className="hidden sm:inline-block">
                                                <Web3Network />
                                            </div>
                                        )}

                                        <div className="w-auto flex items-center rounded bg-dark-900 hover:bg-dark-800 p-0.5 whitespace-nowrap text-sm font-bold cursor-pointer select-none pointer-events-auto">
                                            {account && chainId && userEthBalance && (
                                                <>
                                                    <div className="py-2 px-3 text-primary text-bold">
                                                        {userEthBalance?.toSignificant(6)}{' '}
                                                        {/*{Currency.getNativeCurrencySymbol(chainId)}*/}
                                                    </div>
                                                </>
                                            )}
                                            <Web3Status />
                                        </div>
                                        <LanguageSwitch />
                                    </div>
                                </div>
                                <div className="-mr-2 flex sm:hidden">
                                    {/* Mobile menu button */}
                                    <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-primary hover:text-high-emphesis focus:outline-none">
                                        <span className="sr-only">{i18n._(t`Open main menu`)}</span>
                                        {open ? (
                                            <X title="Close" className="block h-6 w-6" aria-hidden="true" />
                                        ) : (
                                            <Burger title="Bridge" className="block h-6 w-6" aria-hidden="true" />
                                        )}
                                    </Disclosure.Button>
                                </div>
                            </div>
                        </div>

                        <Disclosure.Panel className="sm:hidden">
                            <div className="flex flex-col px-4 pt-2 pb-3 space-y-1">
                                {/* Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" */}
                                {/* <a
                                href="#"
                                className="bg-gray-1000 text-white block px-3 py-2 rounded-md text-base font-medium"
                            >
                                Dashboard
                            </a> */}
                                <NavLink id={`swap-nav-link`} to={'/transfer'}>
                                    {i18n._(t`Bridge`)}
                                </NavLink>
                            </div>
                        </Disclosure.Panel>
                    </>
                )}
            </Disclosure>
        </header>
    )
}

export default AppBar
