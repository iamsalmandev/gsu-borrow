import { isAppContextAvailable } from 'components/AppContextProvider'
import { Footer } from 'components/Footer'
import { AppHeader, ConnectPageHeader } from 'components/Header'
import { AppLinkProps } from 'components/Links'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { WithChildren } from 'helpers/types'
import React from 'react'
import { Container, Flex, SxStyleProp } from 'theme-ui'

import { Announcement } from './Announcement'
import { ModalTrezorMetamaskEIP1559 } from './Modal'

interface BasicLayoutProps extends WithChildren {
  header: JSX.Element
  footer?: JSX.Element
  sx?: SxStyleProp
  variant?: string
}

interface WithAnnouncementLayoutProps extends BasicLayoutProps {
  showAnnouncement: boolean
}

export function BasicLayout({ header, footer, children, sx, variant }: BasicLayoutProps) {
  return (
    <Flex
      sx={{
        bg: 'none',
        flexDirection: 'column',
        minHeight: '100%',
        ...sx,
      }}
    >
      {header}
      <Container variant={variant || 'appContainer'} sx={{ flex: 2, mb: 5 }} as="main">
        <Flex sx={{ width: '100%', height: '100%' }}>{children}</Flex>
      </Container>
      {footer}
    </Flex>
  )
}

export function WithAnnouncementLayout({
  header,
  footer,
  children,
  showAnnouncement,
  sx,
  variant,
}: WithAnnouncementLayoutProps) {
  return (
    <Flex
      sx={{
        bg: 'none',
        flexDirection: 'column',
        minHeight: '100%',
        ...sx,
      }}
    >
      {header}
      {showAnnouncement && (
        <Container variant="announcement">
          <Announcement
            text="Welcome to the new Oasis.app. We are thrilled to have you here."
            discordLink="https://discord.gg/oasisapp"
            link="https://blog.ethereum.org/2015/11/15/merkling-in-ethereum/"
            linkText="Check blog post"
          />
        </Container>
      )}
      <Container variant={variant || 'appContainer'} sx={{ flex: 2, mb: 5 }} as="main">
        <Flex sx={{ width: '100%', height: '100%' }}>{children}</Flex>
      </Container>
      {footer}
    </Flex>
  )
}

export function AppLayout({ children }: WithChildren) {
  if (!isAppContextAvailable()) {
    return null
  }

  return (
    <>
      <WithAnnouncementLayout
        sx={{
          zIndex: 2,
          background: `url(${marketingBackgrounds['default']})`,
          backgroundRepeat: `no-repeat`,
          backgroundPosition: 'top center',
          backgroundSize: [undefined, undefined, '100%'],
        }}
        showAnnouncement={false}
        footer={<Footer />}
        header={<AppHeader />}
      >
        {children}
        <ModalTrezorMetamaskEIP1559 />
      </WithAnnouncementLayout>
    </>
  )
}

const marketingBackgrounds = {
  default: staticFilesRuntimeUrl('/static/img/background.png'),
  light: staticFilesRuntimeUrl('/static/img/background.png'),
  lighter: staticFilesRuntimeUrl('/static/img/background.png'),
  none: 'none',
}

export function LandingPageLayout({ children }: WithChildren) {
  if (!isAppContextAvailable()) {
    return null
  }

  return (
    <>
      <WithAnnouncementLayout
        header={<AppHeader />}
        footer={<Footer />}
        showAnnouncement={false}
        variant="landingContainer"
        sx={{
          position: 'relative',
          background: `url(${marketingBackgrounds['default']})`,
          backgroundRepeat: `no-repeat`,
          backgroundPosition: 'top center',
          backgroundSize: [undefined, undefined, '100%'],
        }}
      >
        {children}
      </WithAnnouncementLayout>
    </>
  )
}

export function ProductPagesLayout({ children }: WithChildren) {
  if (!isAppContextAvailable()) {
    return null
  }

  return (
    <>
      <WithAnnouncementLayout
        header={<AppHeader />}
        footer={<Footer />}
        showAnnouncement={false}
        variant="landingContainer"
        sx={{
          position: 'relative',
          background: `url(${marketingBackgrounds['default']})`,
          backgroundRepeat: `no-repeat`,
          backgroundPosition: 'top center',
          backgroundSize: [undefined, undefined, '100%'],
        }}
      >
        {children}
      </WithAnnouncementLayout>
    </>
  )
}

export interface MarketingLayoutProps extends WithChildren {
  variant?: string
  topBackground?: keyof typeof marketingBackgrounds
}

export function MarketingLayout({
  children,
  variant,
  topBackground = 'default',
}: MarketingLayoutProps) {
  if (!isAppContextAvailable()) {
    return null
  }

  return (
    <>
      <BasicLayout
        header={<AppHeader />}
        footer={<Footer />}
        variant={variant || 'marketingContainer'}
        sx={{ position: 'relative', background: `url(${marketingBackgrounds[topBackground]})` }}
      >
        {children}
      </BasicLayout>
    </>
  )
}

export function ConnectPageLayout({ children }: WithChildren & { backLink: AppLinkProps }) {
  if (!isAppContextAvailable()) {
    return null
  }
  return <BasicLayout header={<ConnectPageHeader />}>{children}</BasicLayout>
}
