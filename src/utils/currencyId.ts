import { Currency, POLIS, Token } from 'hadeswap-beta-sdk'

export function currencyId(currency: Currency): string {
    if (currency === POLIS) return 'ETH'
    if (currency instanceof Token) return currency.address
    throw new Error('invalid currency')
}
