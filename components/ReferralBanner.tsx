import { Icon } from '@makerdao/dai-ui-icons'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import React from 'react'
import { Flex, Image, Text } from 'theme-ui'

import { AppLink } from './Links'
import { Notice } from './Notice'

interface ReferralBannerProps {
  heading: string
  link: string
}
const handleClose = () => null
export function ReferralBanner({ heading, link }: ReferralBannerProps) {
  return (
    <Notice
      close={() => {
        handleClose()
      }}
      sx={{
        marginBottom: 0,
        overflow: 'hidden',
        borderRadius: '50px',
        maxWidth: ['230px', '350px'],
        p: '3px 8px 3px 4px',
        '&:hover': {
          opacity: '80%',
          cursor: 'pointer',
        },
      }}
      withClose={false}
    >
      <AppLink href={link}>
        <Flex
          sx={{
            justifySelf: 'center',
            alignItems: 'center',
            textAlign: 'center',
            flexDirection: 'row',
            justifyContent: ['start', 'space-between', 'space-between', 'space-between'],
            minHeight: '44px',
            '&:hover svg': {
              transform: 'translateX(10px)',
            },
          }}
        >
          <Flex
            sx={{
              background: 'rgb(249,208,220)',
              borderRadius: '50px',
              flexDirection: 'row',
              justifySelf: 'center',
              alignItems: 'center',
              textAlign: 'center',
              minHeight: '42px',
              px: '8px',
              mr: '8px',
            }}
          >
            <Image src={staticFilesRuntimeUrl('/static/icons/favicon-32x32.png')} />
            <Text color="#5a4e3b" mx="4px" sx={{ fontSize: '14px', fontWeight: 'semiBold' }}>
              5%
            </Text>
          </Flex>
          <Flex
            sx={{
              flexDirection: ['column', 'row', 'row', 'row'],
              mr: '7px',
              alignItems: 'flex-start',
            }}
          >
            <Text
              variant="text.paragraph3"
              sx={{ zIndex: 1, fontWeight: 'semiBold', wordBreak: 'normal', fontSize: ["12px", "14px"] }}
            >
              {`${heading.split('.')[0]}.`}
            </Text>
            <Flex>
              <Text
                variant="text.paragraph3"
                sx={{
                  zIndex: 1,
                  fontWeight: 'semiBold',
                  wordBreak: 'normal',
                  fontSize: ["12px", "14px"],
                  whiteSpace: [null, 'pre'],
                }}
              >
                {` ${heading.split('.')[1]}`}
              </Text>
              <Icon
                key="arrow"
                name="arrow_right"
                size="20px"
                sx={{
                  position: 'relative',
                  ml: '4px',
                  transition: '0.2s',
                  color: 'black',
                  pr: 2,
                }}
              />
            </Flex>
          </Flex>
        </Flex>
      </AppLink>
    </Notice>
  )
}
