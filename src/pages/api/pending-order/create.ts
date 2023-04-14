import { stringToU8a, u8aToHex } from '@polkadot/util'
import {
  decodeAddress,
  mnemonicToMiniSecret,
  naclBoxPairFromSecret,
  naclSeal,
} from '@polkadot/util-crypto'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { GraphQLClient } from 'graphql-request'
import { NextApiRequest, NextApiResponse } from 'next'
import { xSellerSquid } from 'src/components/domains/dot-seller/config'
import { CREATE_PENDING_ORDER } from 'src/components/domains/dot-seller/seller-queries'

dayjs.extend(utc)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { purchaser, domain, sellerApiAuthTokenManager } = req.body
  const nonce = new Uint8Array(24)
  nonce[0] = 111

  if (req.method !== 'POST') return res.status(404).end()

  try {
    const tokenMessage = dayjs.utc().valueOf().toString()

    const requesterKeypair = naclBoxPairFromSecret(
      mnemonicToMiniSecret(process.env.SELLER_SOONSOCIAL_FE_CLIENT_TOKEN_SIGNER || ''),
    )

    const clientId = process.env.CLIENT_ID as string

    const signedToken = naclSeal(
      stringToU8a(tokenMessage),
      requesterKeypair.secretKey,
      decodeAddress(sellerApiAuthTokenManager),
      nonce,
    )

    const requestHeaders = {
      Authorization: 'Bearer ' + u8aToHex(signedToken.sealed) + 'asdasd',
      'Client-Id': clientId,
    }

    const sellerSquidGraphQlClient = new GraphQLClient(xSellerSquid, {
      headers: requestHeaders
    })

    await sellerSquidGraphQlClient.request(
      CREATE_PENDING_ORDER,
      { domain, account: purchaser },
    )

    res.status(200).send({ success: true })
  } catch (e: any) {
    res.status(e.response.status).send({
      success: false,
      errors: e.response.errors?.[0].message,
    })
  }
}
