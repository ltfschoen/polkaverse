import { CloseOutlined } from '@ant-design/icons'
import clsx from 'clsx'
import Link from 'next/link'
import React, { useState } from 'react'
import { useResponsiveSize } from 'src/components/responsive'
import { isServerSide } from 'src/components/utils/index'
import store from 'store'
import styles from './index.module.sass'

type BuildUrlFnProps = {
  kind: string
  isMobile: boolean
}

type MultiBannerProps = {
  uid: string
  kinds: string[]
  buildUrl: (props: BuildUrlFnProps) => string
  href?: string
  withCloseButtonBackground?: boolean
}

export const MultiBanner = ({
  uid,
  kinds,
  buildUrl,
  href,
  withCloseButtonBackground,
}: MultiBannerProps) => {
  const { isMobile } = useResponsiveSize()

  const bannerFromStorage = store.get(uid)

  const [showBanner, setShowBanner] = useState(
    bannerFromStorage !== undefined ? bannerFromStorage : true,
  )

  if (isServerSide() || !showBanner) return null

  const kindIndex = new Date().getTime() % kinds.length
  const kind = kinds[kindIndex]

  const backgroundImage = buildUrl({ kind, isMobile })

  const closeBanner = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault()
    setShowBanner(false)
    store.set(uid, false)
  }

  const closeButton = (
    <CloseOutlined
      className={clsx(styles.DfCloseButton, withCloseButtonBackground && styles.DfCloseButtonBg)}
      onClick={closeBanner}
    />
  )
  const content = (
    <div className={styles.Banner}>
      <img src={backgroundImage} className={styles.BannerImg} alt='Banner image' />
      {closeButton}
    </div>
  )

  if (!href) return content

  return (
    <Link href={href}>
      <a target='_blank' rel='noreferrer'>
        {content}
      </a>
    </Link>
  )
}

export default MultiBanner
