import { EditOutlined } from '@ant-design/icons'
import CardWithContent, { CardWithContentProps } from 'src/components/utils/cards/CardWithContent'
import { useSendEvent } from 'src/providers/AnalyticContext'
import { useSelectProfile, useSelectSpace } from 'src/rtk/app/hooks'
import { useFetchTotalStake } from 'src/rtk/features/creators/totalStakeHooks'
import { getAmountRange } from 'src/utils/analytics'
import { useMyAddress } from '../auth/MyAccountsContext'
import { editSpaceUrl } from '../urls'
import { ButtonLink } from '../utils/CustomLinks'
import { DfMd } from '../utils/DfMd'
import FollowSpaceButton from '../utils/FollowSpaceButton'
import MyEntityLabel from '../utils/MyEntityLabel'
import { OfficialSpaceStatus, SpaceAvatar, useIsMySpace } from './helpers'
import ViewSpaceLink from './ViewSpaceLink'

export interface SpaceCardProps
  extends Omit<CardWithContentProps, 'avatarProps' | 'title' | 'subtitle' | 'actions'> {
  spaceId: string
}

export default function SpaceCard({ spaceId, ...props }: SpaceCardProps) {
  const spaceData = useSelectSpace(spaceId)
  const myAddress = useMyAddress()
  const myProfile = useSelectProfile(myAddress)
  const isMySpace = useIsMySpace(spaceData?.struct)
  const sendEvent = useSendEvent()
  const { data: totalStake } = useFetchTotalStake(myAddress ?? '')

  return (
    <CardWithContent
      {...props}
      avatar={
        spaceData && (
          <SpaceAvatar
            noMargin
            space={spaceData?.struct}
            size={64}
            avatar={spaceData?.content?.image}
          />
        )
      }
      title={
        spaceData ? (
          <ViewSpaceLink
            containerClassName='w-100'
            className='font-weight-normal VertAlignMiddleChildren'
            title={
              <>
                <span className='UnboundedFont'>{spaceData.content?.name ?? 'Unnamed Space'}</span>
                <OfficialSpaceStatus withoutContainer space={spaceData.struct} />
                <MyEntityLabel isMy={isMySpace} className='ml-2'>
                  {spaceId === myProfile?.id ? 'My profile' : 'My space'}
                </MyEntityLabel>
              </>
            }
            space={spaceData.struct}
          />
        ) : (
          'Unnamed Space'
        )
      }
      subtitle={<DfMd className='ColorCurrentColor FontSmall' source={spaceData?.content?.about} />}
      buttons={
        spaceData && [
          // <StakeButton key={'stake'} spaceStruct={spaceData.struct} />,
          isMySpace ? (
            <ButtonLink
              href={'/[spaceId]/edit'}
              as={editSpaceUrl(spaceData.struct)}
              className='bg-transparent'
            >
              <EditOutlined /> Edit
            </ButtonLink>
          ) : (
            <div
              onClick={() =>
                sendEvent('follow', {
                  spaceId: spaceData.id,
                  eventSource: 'post',
                  amountRange: getAmountRange(totalStake?.amount),
                })
              }
            >
              <FollowSpaceButton space={spaceData.struct} />
            </div>
          ),
        ]
      }
    />
  )
}
