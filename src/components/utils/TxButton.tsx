import { newLogger } from '@subsocial/utils'
import AntdButton from 'antd/lib/button'

import { isClientSide } from '.'
import { useMyAddress } from '../auth/MyAccountsContext'
import SubstrateTxButton, { TxButtonProps } from '../substrate/SubstrateTxButton'
import { useStorybookContext } from './StorybookContext'

const log = newLogger('TxButton')

const mockSendTx = () => {
  const msg = 'Cannot send a Substrate tx in a mock mode (e.g. in Stoorybook)'
  if (isClientSide()) {
    window.alert(`WARN: ${msg}`)
  } else {
    log.warn(msg)
  }
}

function ResolvedTxButton(props: TxButtonProps) {
  const { isStorybook = false } = useStorybookContext()
  const myAddress = useMyAddress()

  return isStorybook ? (
    <AntdButton {...props} onClick={mockSendTx} />
  ) : (
    <SubstrateTxButton {...props} accountId={props.accountId || myAddress} />
  )
}

export default ResolvedTxButton
